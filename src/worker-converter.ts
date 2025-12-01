/**
 * Worker-based LibreOffice Converter
 * 
 * This converter runs the WASM module in a Worker thread to avoid
 * blocking the main Node.js event loop.
 */

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import {
  ConversionError,
  ConversionErrorCode,
  ConversionOptions,
  ConversionResult,
  FORMAT_MIME_TYPES,
  OUTPUT_FORMAT_TO_LOK,
  FORMAT_FILTER_OPTIONS,
  LibreOfficeWasmOptions,
} from './types.js';

interface WorkerResponse {
  id: string;
  success: boolean;
  error?: string;
  data?: Uint8Array;
}

/**
 * Worker-based LibreOffice Converter
 * Uses a separate thread to avoid blocking the main event loop
 */
export class WorkerConverter {
  private worker: Worker | null = null;
  private pending = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  private options: LibreOfficeWasmOptions;
  private initialized = false;
  private initializing = false;

  constructor(options: LibreOfficeWasmOptions = {}) {
    this.options = {
      wasmPath: './wasm',
      verbose: false,
      ...options,
    };
  }

  /**
   * Initialize the converter
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializing) {
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.initializing = true;

    try {
      // Find the worker script path
      let workerPath: string;
      try {
        const currentDir = dirname(fileURLToPath(import.meta.url));
        workerPath = join(currentDir, 'worker.cjs');
      } catch {
        workerPath = join(__dirname, 'worker.cjs');
      }

      // Create the worker
      this.worker = new Worker(workerPath);

      // Set up message handling
      this.worker.on('message', (response: WorkerResponse | { type: string }) => {
        if ('type' in response && response.type === 'ready') {
          return; // Worker ready signal
        }
        
        const res = response as WorkerResponse;
        const pending = this.pending.get(res.id);
        if (pending) {
          this.pending.delete(res.id);
          if (res.success) {
            pending.resolve(res.data);
          } else {
            pending.reject(new ConversionError(
              ConversionErrorCode.CONVERSION_FAILED,
              res.error || 'Unknown worker error'
            ));
          }
        }
      });

      this.worker.on('error', (error) => {
        // Reject all pending operations
        for (const [, pending] of this.pending) {
          pending.reject(error);
        }
        this.pending.clear();
      });

      // Wait for ready signal
      await new Promise<void>((resolve) => {
        const handler = (msg: any) => {
          if (msg.type === 'ready') {
            this.worker?.off('message', handler);
            resolve();
          }
        };
        this.worker?.on('message', handler);
      });

      // Initialize the WASM module in the worker
      await this.sendMessage('init', {
        wasmPath: this.options.wasmPath,
        verbose: this.options.verbose,
      });

      this.initialized = true;
      this.options.onReady?.();
    } catch (error) {
      const convError = error instanceof ConversionError
        ? error
        : new ConversionError(
            ConversionErrorCode.WASM_NOT_INITIALIZED,
            `Failed to initialize worker: ${error}`
          );
      this.options.onError?.(convError);
      throw convError;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Send a message to the worker and wait for response
   */
  private sendMessage(type: string, payload?: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new ConversionError(
          ConversionErrorCode.WASM_NOT_INITIALIZED,
          'Worker not initialized'
        ));
        return;
      }

      const id = randomUUID();
      this.pending.set(id, { resolve, reject });

      this.worker.postMessage({ type, id, payload });

      // Timeout after 5 minutes
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new ConversionError(
            ConversionErrorCode.CONVERSION_FAILED,
            'Worker operation timeout'
          ));
        }
      }, 300000);
    });
  }

  /**
   * Convert a document
   */
  async convert(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions,
    filename = 'document'
  ): Promise<ConversionResult> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const startTime = Date.now();
    const inputData = this.normalizeInput(input);

    if (inputData.length === 0) {
      throw new ConversionError(
        ConversionErrorCode.INVALID_INPUT,
        'Empty document provided'
      );
    }

    const inputExt = options.inputFormat || this.getExtensionFromFilename(filename) || 'docx';
    const outputFormat = options.outputFormat;

    const inputPath = `/tmp/input/doc.${inputExt}`;
    const outputPath = `/tmp/output/doc.${outputFormat}`;

    // Build filter options
    let filterOptions = FORMAT_FILTER_OPTIONS[outputFormat] || '';
    if (outputFormat === 'pdf' && options.pdf) {
      const pdfOpts: string[] = [];
      if (options.pdf.pdfaLevel) {
        const levelMap: Record<string, number> = {
          'PDF/A-1b': 1,
          'PDF/A-2b': 2,
          'PDF/A-3b': 3,
        };
        pdfOpts.push(`SelectPdfVersion=${levelMap[options.pdf.pdfaLevel] || 0}`);
      }
      if (options.pdf.quality !== undefined) {
        pdfOpts.push(`Quality=${options.pdf.quality}`);
      }
      if (pdfOpts.length > 0) {
        filterOptions = pdfOpts.join(',');
      }
    }

    const result = await this.sendMessage('convert', {
      inputData,
      inputPath,
      outputPath,
      outputFormat: OUTPUT_FORMAT_TO_LOK[outputFormat],
      filterOptions,
    });

    const baseName = this.getBasename(filename);
    const outputFilename = `${baseName}.${outputFormat}`;

    return {
      data: new Uint8Array(result),
      mimeType: FORMAT_MIME_TYPES[outputFormat],
      filename: outputFilename,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Destroy the converter and terminate the worker
   */
  async destroy(): Promise<void> {
    if (this.worker) {
      try {
        await this.sendMessage('destroy');
      } catch {
        // Ignore errors during cleanup
      }
      await this.worker.terminate();
      this.worker = null;
    }
    this.initialized = false;
    this.pending.clear();
  }

  /**
   * Check if the converter is ready
   */
  isReady(): boolean {
    return this.initialized && this.worker !== null;
  }

  private normalizeInput(input: Uint8Array | ArrayBuffer | Buffer): Uint8Array {
    if (input instanceof Uint8Array) {
      return input;
    }
    if (input instanceof ArrayBuffer) {
      return new Uint8Array(input);
    }
    return new Uint8Array(input);
  }

  private getExtensionFromFilename(filename: string): string | null {
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts.pop()?.toLowerCase() || null;
    }
    return null;
  }

  private getBasename(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot > 0) {
      return filename.substring(0, lastDot);
    }
    return filename;
  }
}

/**
 * Create and initialize a worker-based converter
 */
export async function createWorkerConverter(
  options: LibreOfficeWasmOptions = {}
): Promise<WorkerConverter> {
  const converter = new WorkerConverter(options);
  await converter.initialize();
  return converter;
}


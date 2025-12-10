/**
 * Worker-based LibreOffice Converter
 * 
 * This converter runs the WASM module in a Worker thread to avoid
 * blocking the main Node.js event loop.
 */

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import {
  ConversionError,
  ConversionErrorCode,
  ConversionOptions,
  ConversionResult,
  FORMAT_MIME_TYPES,
  LibreOfficeWasmOptions,
  LOKDocumentType,
  OutputFormat,
} from './types.js';

// Re-export types used by consumers
export type { LOKDocumentType, OutputFormat };

/** Options for rendering page previews */
export interface RenderOptions {
  /** Width of rendered image in pixels */
  width?: number;
  /** Height of rendered image in pixels (0 = auto based on aspect ratio) */
  height?: number;
  /** Specific page indices to render (0-based). If empty, renders all pages */
  pageIndices?: number[];
}

interface WorkerResponse {
  id: string;
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface PagePreview {
  page: number;
  data: Uint8Array;
  width: number;
  height: number;
}

export interface DocumentInfo {
  documentType: LOKDocumentType;
  documentTypeName: string;
  validOutputFormats: OutputFormat[];
  pageCount: number;
}

/** Editor session returned from openDocument */
export interface EditorSession {
  sessionId: string;
  documentType: string;
  pageCount: number;
}

/** Result from an editor operation */
export interface EditorOperationResult<T = unknown> {
  success: boolean;
  verified?: boolean;
  data?: T;
  error?: string;
  suggestion?: string;
}

/**
 * Worker-based LibreOffice Converter
 * Uses a separate thread to avoid blocking the main event loop
 */
export class WorkerConverter {
  private worker: Worker | null = null;
  private pending = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void; timeout: NodeJS.Timeout }>();
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

      if (this.options.workerPath) {
        // Use explicit worker path if provided
        workerPath = resolve(this.options.workerPath);
      } else {
        // Auto-detect worker path
        try {
          const currentDir = dirname(fileURLToPath(import.meta.url));
          workerPath = join(currentDir, 'node.worker.cjs');
        } catch {
          workerPath = join(__dirname, 'node.worker.cjs');
        }

        // If worker doesn't exist at computed path, try dist/ relative to cwd
        // (handles vitest running source files directly)
        if (!existsSync(workerPath)) {
          const distWorkerPath = resolve(process.cwd(), 'dist', 'node.worker.cjs');
          if (existsSync(distWorkerPath)) {
            workerPath = distWorkerPath;
          }
        }
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
          // Clear the timeout to prevent it from keeping the process alive
          clearTimeout(pending.timeout);
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
        // Reject all pending operations and clear their timeouts
        for (const [, pending] of this.pending) {
          clearTimeout(pending.timeout);
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

      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        const pending = this.pending.get(id);
        if (pending) {
          this.pending.delete(id);
          pending.reject(new ConversionError(
            ConversionErrorCode.CONVERSION_FAILED,
            'Worker operation timeout'
          ));
        }
      }, 300000);

      this.pending.set(id, { resolve, reject, timeout });
      this.worker.postMessage({ type, id, payload });
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

    const inputFormat = options.inputFormat || this.getExtensionFromFilename(filename) || 'docx';
    const outputFormat = options.outputFormat;

    const result = await this.sendMessage('convert', {
      inputData,
      inputFormat,
      outputFormat,
      filename,
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
   * Get the number of pages in a document
   */
  async getPageCount(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string
  ): Promise<number> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.sendMessage('getPageCount', { inputData, inputFormat });
  }

  /**
   * Get document information including type and valid output formats
   */
  async getDocumentInfo(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string
  ): Promise<DocumentInfo> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.sendMessage('getDocumentInfo', { inputData, inputFormat });
  }

  /**
   * Render a single page as an image
   */
  async renderPage(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string,
    pageIndex: number,
    width: number,
    height = 0
  ): Promise<PagePreview> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    const result = await this.sendMessage('renderPage', {
      inputData,
      inputFormat,
      pageIndex,
      width,
      height,
    });

    return {
      page: pageIndex,
      data: new Uint8Array(result.data),
      width: result.width,
      height: result.height,
    };
  }

  /**
   * Render multiple page previews
   */
  async renderPagePreviews(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string,
    options: RenderOptions = {}
  ): Promise<PagePreview[]> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    const result = await this.sendMessage('renderPagePreviews', {
      inputData,
      inputFormat,
      width: options.width || 800,
      height: options.height || 0,
      pageIndices: options.pageIndices,
    });

    return result.map((preview: any) => ({
      page: preview.page,
      data: new Uint8Array(preview.data),
      width: preview.width,
      height: preview.height,
    }));
  }

  /**
   * Extract text content from a document
   */
  async getDocumentText(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string
  ): Promise<string | null> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.sendMessage('getDocumentText', { inputData, inputFormat });
  }

  /**
   * Get page/slide names from a document
   */
  async getPageNames(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string
  ): Promise<string[]> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.sendMessage('getPageNames', { inputData, inputFormat });
  }

  // ============================================
  // Editor Operations
  // ============================================

  /**
   * Open a document for editing
   * Returns a session ID that can be used for subsequent editor operations
   */
  async openDocument(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string
  ): Promise<EditorSession> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.sendMessage('openDocument', { inputData, inputFormat });
  }

  /**
   * Execute an editor operation on an open document session
   * @param sessionId - The session ID from openDocument
   * @param method - The editor method to call (e.g., 'insertParagraph', 'getStructure')
   * @param args - Arguments to pass to the method
   */
  async editorOperation<T = unknown>(
    sessionId: string,
    method: string,
    ...args: unknown[]
  ): Promise<EditorOperationResult<T>> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    return this.sendMessage('editorOperation', { sessionId, method, args });
  }

  /**
   * Close an editor session and get the modified document
   * @param sessionId - The session ID from openDocument
   * @returns The modified document data, or undefined if save failed
   */
  async closeDocument(sessionId: string): Promise<Uint8Array | undefined> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const result = await this.sendMessage('closeDocument', { sessionId });
    return result ? new Uint8Array(result) : undefined;
  }

  /**
   * Destroy the converter and terminate the worker
   */
  async destroy(): Promise<void> {
    // Clear all pending timeouts first to allow process to exit
    for (const [, pending] of this.pending) {
      clearTimeout(pending.timeout);
    }

    if (this.worker) {
      try {
        await this.sendMessage('destroy');
      } catch {
        // Ignore errors during cleanup
      }

      // Clear any new timeouts from the destroy message
      for (const [, pending] of this.pending) {
        clearTimeout(pending.timeout);
      }

      // Remove all event listeners to prevent memory leaks
      this.worker.removeAllListeners();

      // Terminate the worker thread
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


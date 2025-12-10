/**
 * Forked Process LibreOffice Converter
 *
 * Runs the WASM module in a completely separate Node.js process.
 * Includes retry logic for handling transient WASM memory errors.
 */

import { fork, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
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

interface WorkerMessage {
  type: 'ready' | 'error' | 'response';
  id?: string;
  success?: boolean;
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

interface SubprocessConverterOptions extends LibreOfficeWasmOptions {
  /** Max retries for initialization (default: 3) */
  maxInitRetries?: number;
  /** Max retries for conversion (default: 2) */
  maxConversionRetries?: number;
  /** Whether to restart subprocess on memory errors (default: true) */
  restartOnMemoryError?: boolean;
}

export class SubprocessConverter {
  private child: ChildProcess | null = null;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private options: SubprocessConverterOptions;
  private initialized = false;
  private initializing = false;
  private workerPath: string = '';

  constructor(options: SubprocessConverterOptions = {}) {
    this.options = {
      wasmPath: './wasm',
      verbose: false,
      maxInitRetries: 3,
      maxConversionRetries: 2,
      restartOnMemoryError: true,
      ...options
    };
  }

  private isMemoryError(error: string | Error): boolean {
    const msg = error instanceof Error ? error.message : error;
    return msg.includes('memory access out of bounds') ||
           msg.includes('unreachable') ||
           msg.includes('table index is out of bounds') ||
           msg.includes('null function');
  }

  private async spawnWorker(): Promise<void> {
    // Determine worker path
    if (!this.workerPath) {
      try {
        const currentDir = dirname(fileURLToPath(import.meta.url));
        // Check if running from src (development/test) or dist (production)
        if (currentDir.endsWith('/src') || currentDir.endsWith('\\src')) {
          // Running from source - worker is in dist/
          this.workerPath = join(currentDir, '..', 'dist', 'subprocess.worker.cjs');
        } else {
          // Running from dist
          this.workerPath = join(currentDir, 'subprocess.worker.cjs');
        }
      } catch {
        this.workerPath = join(__dirname, 'subprocess.worker.cjs');
      }
    }

    const wasmPath = resolve(this.options.wasmPath || './wasm');

    this.child = fork(this.workerPath, [], {
      env: { ...process.env, WASM_PATH: wasmPath, VERBOSE: String(this.options.verbose || false) },
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    this.child.stdout?.on('data', (d: Buffer) => { if (this.options.verbose) process.stdout.write(d); });
    this.child.stderr?.on('data', (d: Buffer) => { if (this.options.verbose) process.stderr.write(d); });

    this.child.on('message', (msg: WorkerMessage) => {
      if (msg.type === 'response' && msg.id) {
        const p = this.pending.get(msg.id);
        if (p) {
          this.pending.delete(msg.id);
          msg.success ? p.resolve(msg.data) : p.reject(new ConversionError(ConversionErrorCode.CONVERSION_FAILED, msg.error || 'Error'));
        }
      }
    });

    this.child.on('error', (e) => {
      for (const p of this.pending.values()) p.reject(e);
      this.pending.clear();
    });

    this.child.on('exit', (code) => {
      if (code !== 0) {
        for (const p of this.pending.values()) p.reject(new Error(`Exit ${code}`));
        this.pending.clear();
      }
      this.child = null;
      this.initialized = false;
    });

    // Wait for ready signal (subprocess started)
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Subprocess start timeout')), 30000);
      const h = (msg: WorkerMessage) => {
        if (msg.type === 'ready') { clearTimeout(t); this.child?.off('message', h); resolve(); }
        else if (msg.type === 'error') { clearTimeout(t); this.child?.off('message', h); reject(new Error(msg.error)); }
      };
      this.child?.on('message', h);
    });

    // Now send init message to start WASM loading
    await this.send('init', undefined, 180000); // 3 minute timeout for WASM init
  }

  private async killWorker(): Promise<void> {
    if (this.child) {
      try { this.child.kill('SIGKILL'); } catch {}
      this.child = null;
    }
    this.initialized = false;
    this.pending.clear();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing) {
      while (this.initializing) await new Promise(r => setTimeout(r, 100));
      return;
    }
    this.initializing = true;

    const maxRetries = this.options.maxInitRetries || 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.killWorker();
        await this.spawnWorker();
        this.initialized = true;
        this.initializing = false;
        this.options.onReady?.();
        return;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (this.options.verbose) {
          console.error(`[SubprocessConverter] Init attempt ${attempt}/${maxRetries} failed:`, lastError.message);
        }
        await this.killWorker();

        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 500 * attempt));
        }
      }
    }

    this.initializing = false;
    const err = new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, `Init failed after ${maxRetries} attempts: ${lastError?.message}`);
    this.options.onError?.(err);
    throw err;
  }

  private send(type: string, payload?: unknown, timeout: number = 300000): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.child) { reject(new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'No process')); return; }
      const id = randomUUID();
      this.pending.set(id, { resolve, reject });
      this.child.send({ type, id, payload });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new ConversionError(ConversionErrorCode.CONVERSION_FAILED, 'Timeout'));
        }
      }, timeout);
    });
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

  async convert(input: Uint8Array | ArrayBuffer | Buffer, options: ConversionOptions, filename = 'document'): Promise<ConversionResult> {
    if (!this.initialized || !this.child) throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');

    const start = Date.now();
    const data = this.normalizeInput(input);
    if (data.length === 0) throw new ConversionError(ConversionErrorCode.INVALID_INPUT, 'Empty');

    const ext = options.inputFormat || (filename.includes('.') ? filename.slice(filename.lastIndexOf('.') + 1).toLowerCase() : 'docx');
    let filter = FORMAT_FILTER_OPTIONS[options.outputFormat] || '';
    if (options.outputFormat === 'pdf' && options.pdf) {
      const o: string[] = [];
      if (options.pdf.pdfaLevel) o.push(`SelectPdfVersion=${{ 'PDF/A-1b': 1, 'PDF/A-2b': 2, 'PDF/A-3b': 3 }[options.pdf.pdfaLevel] || 0}`);
      if (options.pdf.quality !== undefined) o.push(`Quality=${options.pdf.quality}`);
      if (o.length) filter = o.join(',');
    }

    const maxRetries = this.options.maxConversionRetries || 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const r = await this.send('convert', {
          inputData: Array.from(data),
          inputExt: ext,
          outputFormat: OUTPUT_FORMAT_TO_LOK[options.outputFormat],
          filterOptions: filter
        }) as number[];

        const base = filename.includes('.') ? filename.slice(0, filename.lastIndexOf('.')) : filename;
        return {
          data: new Uint8Array(r),
          mimeType: FORMAT_MIME_TYPES[options.outputFormat],
          filename: `${base}.${options.outputFormat}`,
          duration: Date.now() - start
        };
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));

        if (this.options.verbose) {
          console.error(`[SubprocessConverter] Conversion attempt ${attempt}/${maxRetries} failed:`, lastError.message);
        }

        // If it's a memory error and we should restart, do so
        if (this.isMemoryError(lastError) && this.options.restartOnMemoryError && attempt < maxRetries) {
          if (this.options.verbose) {
            console.error('[SubprocessConverter] Memory error detected, restarting subprocess...');
          }
          await this.killWorker();
          await this.spawnWorker();
          this.initialized = true;
        } else if (attempt < maxRetries) {
          // Small delay before retry
          await new Promise(r => setTimeout(r, 100));
        }
      }
    }

    throw lastError || new ConversionError(ConversionErrorCode.CONVERSION_FAILED, 'Conversion failed');
  }

  /**
   * Get the number of pages in a document
   */
  async getPageCount(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string
  ): Promise<number> {
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.send('getPageCount', {
      inputData: Array.from(inputData),
      inputFormat
    }) as Promise<number>;
  }

  /**
   * Get document information including type and valid output formats
   */
  async getDocumentInfo(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string
  ): Promise<DocumentInfo> {
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.send('getDocumentInfo', {
      inputData: Array.from(inputData),
      inputFormat
    }) as Promise<DocumentInfo>;
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
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    const result = await this.send('renderPage', {
      inputData: Array.from(inputData),
      inputFormat,
      pageIndex,
      width,
      height,
    }) as { data: number[]; width: number; height: number };

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
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    const result = await this.send('renderPagePreviews', {
      inputData: Array.from(inputData),
      inputFormat,
      width: options.width || 800,
      height: options.height || 0,
      pageIndices: options.pageIndices,
    }) as Array<{ page: number; data: number[]; width: number; height: number }>;

    return result.map((preview) => ({
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
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.send('getDocumentText', {
      inputData: Array.from(inputData),
      inputFormat
    }) as Promise<string | null>;
  }

  /**
   * Get page/slide names from a document
   */
  async getPageNames(
    input: Uint8Array | ArrayBuffer | Buffer,
    inputFormat: string
  ): Promise<string[]> {
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.send('getPageNames', {
      inputData: Array.from(inputData),
      inputFormat
    }) as Promise<string[]>;
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
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const inputData = this.normalizeInput(input);
    return this.send('openDocument', {
      inputData: Array.from(inputData),
      inputFormat
    }) as Promise<EditorSession>;
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
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    return this.send('editorOperation', { sessionId, method, args }) as Promise<EditorOperationResult<T>>;
  }

  /**
   * Close an editor session and get the modified document
   * @param sessionId - The session ID from openDocument
   * @returns The modified document data, or undefined if save failed
   */
  async closeDocument(sessionId: string): Promise<Uint8Array | undefined> {
    if (!this.initialized || !this.child) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized. Call initialize() first.'
      );
    }

    const result = await this.send('closeDocument', { sessionId }) as number[] | undefined;
    return result ? new Uint8Array(result) : undefined;
  }

  async destroy(): Promise<void> {
    if (this.child) {
      try { await this.send('destroy'); } catch {}
      this.child.kill();
      this.child = null;
    }
    this.initialized = false;
    this.pending.clear();
  }

  isReady(): boolean { return this.initialized && this.child !== null; }
}

export async function createSubprocessConverter(options: SubprocessConverterOptions = {}): Promise<SubprocessConverter> {
  const c = new SubprocessConverter(options);
  await c.initialize();
  return c;
}

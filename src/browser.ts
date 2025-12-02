/**
 * LibreOffice WASM Document Converter - Browser Module
 *
 * Browser-optimized module with utilities for file handling,
 * drag-and-drop, and downloads.
 *
 * @packageDocumentation
 */

export type {
  ConversionOptions,
  ConversionResult,
  ImageOptions,
  InputFormat,
  LibreOfficeWasmOptions,
  OutputFormat,
  PdfOptions,
  ProgressInfo,
  EmscriptenModule,
  EmscriptenFS,
} from './types.js';

export {
  ConversionError,
  ConversionErrorCode,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  EXTENSION_TO_FORMAT,
} from './types.js';

import {
  ConversionError,
  ConversionErrorCode,
  ConversionOptions,
  ConversionResult,
  EmscriptenModule,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  FORMAT_FILTER_OPTIONS,
  OUTPUT_FORMAT_TO_LOK,
  LibreOfficeWasmOptions,
  OutputFormat,
  ProgressInfo,
} from './types.js';

import { LOKBindings } from './lok-bindings.js';

/**
 * Browser-only LibreOffice WASM Converter
 */
export class BrowserConverter {
  private module: EmscriptenModule | null = null;
  private _lokInstance: number = 0;
  private lokBindings: LOKBindings | null = null;
  private initialized = false;
  private initializing = false;
  private options: LibreOfficeWasmOptions;

  constructor(options: LibreOfficeWasmOptions = {}) {
    this.options = {
      wasmPath: './wasm',
      verbose: false,
      ...options,
    };
  }

  /**
   * Initialize the LibreOffice WASM module
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.initializing) {
      while (this.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.initializing = true;
    this.emitProgress('loading', 0, 'Loading LibreOffice WASM...');

    try {
      this.module = await this.loadModule();
      this.emitProgress('initializing', 50, 'Initializing...');
      this.setupFileSystem();
      await this.initLOK();
      this.initialized = true;
      this.emitProgress('complete', 100, 'Ready');
      this.options.onReady?.();
    } catch (error) {
      const err = error instanceof ConversionError ? error :
        new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, String(error));
      this.options.onError?.(err);
      throw err;
    } finally {
      this.initializing = false;
    }
  }

  private async loadModule(): Promise<EmscriptenModule> {
    const wasmPath = this.options.wasmPath || './wasm';
    const moduleUrl = `${wasmPath}/soffice.js`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;

    // Create a promise that resolves when the module is ready
    return new Promise((resolve, reject) => {
      // Pre-configure the global Module object before loading the script
      // soffice.js checks for existing Module and merges with it
      win.Module = {
        locateFile: (path: string) => {
          if (path.endsWith('.wasm')) return `${wasmPath}/soffice.wasm`;
          if (path.endsWith('.data')) return `${wasmPath}/soffice.data`;
          if (path.endsWith('.metadata')) return `${wasmPath}/soffice.data.js.metadata`;
          if (path.endsWith('.worker.js')) return `${wasmPath}/soffice.worker.js`;
          return `${wasmPath}/${path}`;
        },
        print: this.options.verbose ? console.log : () => {},
        printErr: this.options.verbose ? console.error : () => {},
        onRuntimeInitialized: () => {
          if (this.options.verbose) console.log('[Browser] WASM runtime initialized');
          resolve(win.Module as EmscriptenModule);
        },
        onAbort: (what: string) => {
          reject(new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, `WASM abort: ${what}`));
        },
      };

      // Load the script
      const script = document.createElement('script');
      script.src = moduleUrl;
      script.onerror = () => reject(new Error(`Failed to load ${moduleUrl}`));
      document.head.appendChild(script);

      // Timeout after 60 seconds
      setTimeout(() => {
        reject(new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'WASM load timeout'));
      }, 60000);
    });
  }

  private setupFileSystem(): void {
    if (!this.module?.FS) throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'No FS');
    const fs = this.module.FS;
    try { fs.mkdir('/tmp'); } catch { /* exists */ }
    try { fs.mkdir('/tmp/input'); } catch { /* exists */ }
    try { fs.mkdir('/tmp/output'); } catch { /* exists */ }
  }

  private async initLOK(): Promise<void> {
    if (!this.module) throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'No module');

    // Create LOKBindings and initialize
    this.lokBindings = new LOKBindings(this.module, this.options.verbose);
    this.lokBindings.initialize('/instdir/program');

    // Store the LOK instance pointer for backwards compatibility
    this._lokInstance = (this.lokBindings as any).lokPtr || 1;
  }

  /**
   * Convert a document
   */
  async convert(
    input: Uint8Array | ArrayBuffer,
    options: ConversionOptions,
    filename = 'document'
  ): Promise<ConversionResult> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const startTime = Date.now();
    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);

    if (inputData.length === 0) {
      throw new ConversionError(ConversionErrorCode.INVALID_INPUT, 'Empty document');
    }

    const ext = this.getExt(filename) || options.inputFormat || 'docx';
    const outputExt = options.outputFormat;

    if (!FORMAT_FILTERS[outputExt]) {
      throw new ConversionError(ConversionErrorCode.UNSUPPORTED_FORMAT, `Unsupported: ${outputExt}`);
    }

    const inPath = `/tmp/input/doc.${ext}`;
    const outPath = `/tmp/output/doc.${outputExt}`;

    let docPtr = 0;

    try {
      // Write input file to virtual filesystem
      this.module.FS.writeFile(inPath, inputData);
      this.emitProgress('converting', 30, 'Loading document...');

      // Load document with LOK
      if (options.password) {
        docPtr = this.lokBindings.documentLoadWithOptions(inPath, `,Password=${options.password}`);
      } else {
        docPtr = this.lokBindings.documentLoad(inPath);
      }

      if (docPtr === 0) {
        const error = this.lokBindings.getError();
        throw new ConversionError(ConversionErrorCode.LOAD_FAILED, error || 'Failed to load document');
      }

      this.emitProgress('converting', 50, 'Converting...');

      // Get LOK format string and filter options
      const lokFormat = OUTPUT_FORMAT_TO_LOK[outputExt];
      let filterOptions = FORMAT_FILTER_OPTIONS[outputExt] || '';

      // Add PDF-specific options
      if (outputExt === 'pdf' && options.pdf) {
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

      this.emitProgress('converting', 70, 'Saving...');

      // Save document in target format
      this.lokBindings.documentSaveAs(docPtr, outPath, lokFormat, filterOptions);

      this.emitProgress('converting', 90, 'Reading output...');

      // Read the converted output
      const result = this.module.FS.readFile(outPath) as Uint8Array;

      if (result.length === 0) {
        throw new ConversionError(ConversionErrorCode.CONVERSION_FAILED, 'Empty output');
      }

      const baseName = filename.includes('.') ? filename.substring(0, filename.lastIndexOf('.')) : filename;

      this.emitProgress('complete', 100, 'Done');

      return {
        data: result,
        mimeType: FORMAT_MIME_TYPES[outputExt],
        filename: `${baseName}.${outputExt}`,
        duration: Date.now() - startTime,
      };
    } finally {
      // Cleanup document
      if (docPtr !== 0) {
        try {
          this.lokBindings.documentDestroy(docPtr);
        } catch { /* ignore */ }
      }
      // Cleanup temp files
      try { this.module.FS.unlink(inPath); } catch { /* ignore */ }
      try { this.module.FS.unlink(outPath); } catch { /* ignore */ }
    }
  }

  /**
   * Convert a File object
   */
  async convertFile(file: File, options: ConversionOptions): Promise<ConversionResult> {
    const buffer = await file.arrayBuffer();
    return this.convert(new Uint8Array(buffer), options, file.name);
  }

  /**
   * Convert from a URL
   */
  async convertFromUrl(url: string, options: ConversionOptions): Promise<ConversionResult> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    const filename = url.split('/').pop() || 'document';
    return this.convert(new Uint8Array(buffer), options, filename);
  }

  /**
   * Download converted document
   */
  download(result: ConversionResult, filename?: string): void {
    // Copy to ensure we have a standard ArrayBuffer
    const buffer = new Uint8Array(result.data).buffer as ArrayBuffer;
    const blob = new Blob([buffer], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || result.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Create Blob URL
   */
  createBlobUrl(result: ConversionResult): string {
    const buffer = new Uint8Array(result.data).buffer as ArrayBuffer;
    const blob = new Blob([buffer], { type: result.mimeType });
    return URL.createObjectURL(blob);
  }

  /**
   * Preview in new tab
   */
  preview(result: ConversionResult): Window | null {
    return window.open(this.createBlobUrl(result), '_blank');
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    if (this.lokBindings) {
      try {
        this.lokBindings.destroy();
      } catch { /* ignore */ }
      this.lokBindings = null;
    }
    this.module = null;
    this._lokInstance = 0;
    this.initialized = false;
  }

  isReady(): boolean {
    return this.initialized && this._lokInstance >= 0;
  }

  static getSupportedOutputFormats(): OutputFormat[] {
    return Object.keys(FORMAT_FILTERS) as OutputFormat[];
  }

  private getExt(filename: string): string | null {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || null : null;
  }

  private emitProgress(phase: ProgressInfo['phase'], percent: number, message: string): void {
    this.options.onProgress?.({ phase, percent, message });
  }
}

/**
 * Worker-based LibreOffice WASM Converter
 *
 * Runs WASM module in a Web Worker to avoid blocking the main thread.
 * Provides the same API as BrowserConverter.
 */
export class WorkerBrowserConverter {
  private worker: Worker | null = null;
  private initialized = false;
  private initializing = false;
  private messageId = 0;
  private pendingRequests = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  private options: LibreOfficeWasmOptions;

  constructor(options: LibreOfficeWasmOptions = {}) {
    this.options = {
      wasmPath: './wasm',
      workerPath: './dist/browser-worker.global.js',
      verbose: false,
      ...options,
    };
  }

  /**
   * Initialize the worker and LibreOffice WASM module
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.initializing) {
      while (this.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.initializing = true;
    this.emitProgress('loading', 0, 'Starting worker...');

    try {
      // Create the worker (classic worker, not module)
      const workerPath = this.options.workerPath || './dist/browser-worker.js';
      this.worker = new Worker(workerPath);

      // Set up message handling
      this.worker.onmessage = (event) => this.handleWorkerMessage(event);
      this.worker.onerror = (error) => {
        console.error('[WorkerConverter] Worker error:', error);
        this.options.onError?.(new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, error.message));
      };

      // Wait for worker to load
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Worker load timeout')), 10000);
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'loaded') {
            clearTimeout(timeout);
            this.worker?.removeEventListener('message', handler);
            resolve();
          }
        };
        this.worker!.addEventListener('message', handler);
      });

      // Initialize WASM in worker
      await this.sendMessage('init', {
        wasmPath: this.options.wasmPath,
        verbose: this.options.verbose,
      });

      this.initialized = true;
      this.emitProgress('complete', 100, 'Ready');
      this.options.onReady?.();
    } catch (error) {
      const err = error instanceof ConversionError ? error :
        new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, String(error));
      this.options.onError?.(err);
      throw err;
    } finally {
      this.initializing = false;
    }
  }

  private handleWorkerMessage(event: MessageEvent) {
    const msg = event.data;

    if (msg.type === 'progress') {
      this.emitProgress('converting', msg.progress.percent, msg.progress.message);
      return;
    }

    const pending = this.pendingRequests.get(msg.id);
    if (!pending) return;

    this.pendingRequests.delete(msg.id);

    if (msg.type === 'error') {
      pending.reject(new ConversionError(ConversionErrorCode.CONVERSION_FAILED, msg.error));
    } else if (msg.type === 'result') {
      pending.resolve(msg.data);
    } else if (msg.type === 'ready') {
      pending.resolve(undefined);
    } else if (msg.type === 'pageCount') {
      pending.resolve(msg.pageCount);
    } else if (msg.type === 'previews') {
      pending.resolve(msg.previews);
    } else if (msg.type === 'documentInfo') {
      pending.resolve(msg.documentInfo);
    }
  }

  private sendMessage(type: string, data: Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const id = ++this.messageId;
      this.pendingRequests.set(id, { resolve, reject });

      const message = { type, id, ...data };

      // If sending input data, transfer it
      if (data.inputData instanceof Uint8Array) {
        this.worker.postMessage(message, [(data.inputData as Uint8Array).buffer]);
      } else {
        this.worker.postMessage(message);
      }
    });
  }

  /**
   * Convert a document
   */
  async convert(
    input: Uint8Array | ArrayBuffer,
    options: ConversionOptions,
    filename = 'document'
  ): Promise<ConversionResult> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const startTime = Date.now();
    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);

    if (inputData.length === 0) {
      throw new ConversionError(ConversionErrorCode.INVALID_INPUT, 'Empty document');
    }

    const ext = this.getExt(filename) || options.inputFormat || 'docx';
    const outputExt = options.outputFormat;

    if (!FORMAT_FILTERS[outputExt]) {
      throw new ConversionError(ConversionErrorCode.UNSUPPORTED_FORMAT, `Unsupported: ${outputExt}`);
    }

    // Build filter options
    let filterOptions = '';
    if (outputExt === 'pdf' && options.pdf) {
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
      filterOptions = pdfOpts.join(',');
    }

    const result = await this.sendMessage('convert', {
      inputData,
      inputExt: ext,
      outputFormat: outputExt,
      filterOptions,
      password: options.password,
    }) as Uint8Array;

    const baseName = filename.includes('.') ? filename.substring(0, filename.lastIndexOf('.')) : filename;

    return {
      data: result,
      mimeType: FORMAT_MIME_TYPES[outputExt],
      filename: `${baseName}.${outputExt}`,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Convert a File object
   */
  async convertFile(file: File, options: ConversionOptions): Promise<ConversionResult> {
    const buffer = await file.arrayBuffer();
    return this.convert(new Uint8Array(buffer), options, file.name);
  }

  /**
   * Convert from a URL
   */
  async convertFromUrl(url: string, options: ConversionOptions): Promise<ConversionResult> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    const filename = url.split('/').pop() || 'document';
    return this.convert(new Uint8Array(buffer), options, filename);
  }

  /**
   * Download converted document
   */
  download(result: ConversionResult, filename?: string): void {
    const buffer = new Uint8Array(result.data).buffer as ArrayBuffer;
    const blob = new Blob([buffer], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || result.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Create Blob URL
   */
  createBlobUrl(result: ConversionResult): string {
    const buffer = new Uint8Array(result.data).buffer as ArrayBuffer;
    const blob = new Blob([buffer], { type: result.mimeType });
    return URL.createObjectURL(blob);
  }

  /**
   * Preview in new tab
   */
  preview(result: ConversionResult): Window | null {
    return window.open(this.createBlobUrl(result), '_blank');
  }

  /**
   * Get the number of pages/slides in a document
   */
  async getPageCount(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>
  ): Promise<number> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('getPageCount', {
      inputData,
      inputExt: ext,
    });

    return result as number;
  }

  /**
   * Render page previews as RGBA image data
   * @param input Document data
   * @param options Must include inputFormat
   * @param maxWidth Maximum width for rendered pages (height scales proportionally)
   * @returns Array of page previews with RGBA data
   */
  async renderPreviews(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>,
    maxWidth = 256
  ): Promise<Array<{ page: number; data: Uint8Array; width: number; height: number }>> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('renderPreviews', {
      inputData,
      inputExt: ext,
      maxWidth,
    });

    return result as Array<{ page: number; data: Uint8Array; width: number; height: number }>;
  }

  /**
   * Get document info including type and valid output formats
   * This dynamically queries LibreOffice to determine what conversions are supported
   * @param input Document data
   * @param options Must include inputFormat
   * @returns Document info with type, name, valid outputs, and page count
   */
  async getDocumentInfo(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>
  ): Promise<{
    documentType: number;
    documentTypeName: string;
    validOutputFormats: string[];
    pageCount: number;
  }> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('getDocumentInfo', {
      inputData,
      inputExt: ext,
    });

    return result as {
      documentType: number;
      documentTypeName: string;
      validOutputFormats: string[];
      pageCount: number;
    };
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    if (this.worker) {
      try {
        await this.sendMessage('destroy');
      } catch { /* ignore */ }
      this.worker.terminate();
      this.worker = null;
    }
    this.initialized = false;
    this.pendingRequests.clear();
  }

  isReady(): boolean {
    return this.initialized && this.worker !== null;
  }

  static getSupportedOutputFormats(): OutputFormat[] {
    return Object.keys(FORMAT_FILTERS) as OutputFormat[];
  }

  private getExt(filename: string): string | null {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || null : null;
  }

  private emitProgress(phase: ProgressInfo['phase'], percent: number, message: string): void {
    this.options.onProgress?.({ phase, percent, message });
  }
}

/**
 * Create drop zone for file conversion
 */
export function createDropZone(
  element: HTMLElement | string,
  options: {
    outputFormat: OutputFormat;
    wasmPath?: string;
    onConvert?: (result: ConversionResult) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: { percent: number; message: string }) => void;
    autoDownload?: boolean;
  }
): { destroy: () => void } {
  const el = typeof element === 'string' ? document.querySelector<HTMLElement>(element) : element;
  if (!el) throw new Error('Element not found');

  let converter: BrowserConverter | null = null;

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    el.classList.remove('dragover');
    const files = e.dataTransfer?.files;
    if (!files?.length) return;

    try {
      if (!converter) {
        converter = new BrowserConverter({
          wasmPath: options.wasmPath || '/wasm',
          onProgress: options.onProgress ? (p) => options.onProgress!({ percent: p.percent, message: p.message }) : undefined,
        });
        await converter.initialize();
      }

      for (const file of Array.from(files)) {
        const result = await converter.convertFile(file, { outputFormat: options.outputFormat });
        options.onConvert?.(result);
        if (options.autoDownload !== false) converter.download(result);
      }
    } catch (err) {
      options.onError?.(err as Error);
    }
  };

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); el.classList.add('dragover'); };
  const handleDragLeave = (e: DragEvent) => { e.preventDefault(); el.classList.remove('dragover'); };

  el.addEventListener('drop', handleDrop);
  el.addEventListener('dragover', handleDragOver);
  el.addEventListener('dragleave', handleDragLeave);

  return {
    destroy: () => {
      el.removeEventListener('drop', handleDrop);
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('dragleave', handleDragLeave);
      converter?.destroy();
    },
  };
}

/**
 * Quick convert with auto-download
 */
export async function quickConvert(
  file: File,
  outputFormat: OutputFormat,
  options: { wasmPath?: string; download?: boolean } = {}
): Promise<ConversionResult> {
  const converter = new BrowserConverter({ wasmPath: options.wasmPath || '/wasm' });
  try {
    await converter.initialize();
    const result = await converter.convertFile(file, { outputFormat });
    if (options.download !== false) converter.download(result);
    return result;
  } finally {
    await converter.destroy();
  }
}

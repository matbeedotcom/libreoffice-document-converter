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
  BrowserWasmPaths,
  BrowserConverterOptions,
  WorkerBrowserConverterOptions,
  OutputFormat,
  PdfOptions,
  ProgressInfo,
  WasmLoadPhase,
  WasmLoadProgress,
  EmscriptenModule,
  EmscriptenFS,
} from './types.js';

export {
  ConversionError,
  ConversionErrorCode,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  EXTENSION_TO_FORMAT,
  createWasmPaths,
} from './types.js';

// Export editor API
export {
  createEditor,
  isWriterEditor,
  isCalcEditor,
  isImpressEditor,
  isDrawEditor,
  OfficeEditor,
  WriterEditor,
  CalcEditor,
  ImpressEditor,
  DrawEditor,
} from './editor/index.js';

export type {
  OperationResult,
  OpenDocumentOptions,
  DocumentStructure,
  WriterStructure,
  CalcStructure,
  ImpressStructure,
  DrawStructure,
} from './editor/types.js';

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
  BrowserConverterOptions,
  WorkerBrowserConverterOptions,
  BrowserWasmPaths,
  OutputFormat,
  ProgressInfo,
} from './types.js';

import { LOKBindings } from './lok-bindings.js';
import { createEditor, OfficeEditor } from './editor/index.js';
import type { OpenDocumentOptions } from './editor/types.js';

/**
 * Browser-only LibreOffice WASM Converter
 */
export class BrowserConverter {
  private module: EmscriptenModule | null = null;
  private _lokInstance: number = 0;
  private lokBindings: LOKBindings | null = null;
  private initialized = false;
  private initializing = false;
  private options: BrowserConverterOptions;

  constructor(options: BrowserConverterOptions) {
    this.options = {
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
    const { sofficeJs, sofficeWasm, sofficeData, sofficeWorkerJs } = this.options;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;

    // Create a promise that resolves when the module is ready
    return new Promise((resolve, reject) => {
      // Pre-configure the global Module object before loading the script
      // soffice.js checks for existing Module and merges with it
      win.Module = {
        locateFile: (path: string) => {
          if (path.endsWith('.wasm')) return sofficeWasm;
          if (path.endsWith('.data')) return sofficeData;
          if (path.endsWith('.worker.js') || path.endsWith('.worker.cjs')) return sofficeWorkerJs;
          // Fallback: derive from sofficeJs path for any other files
          const baseUrl = sofficeJs.substring(0, sofficeJs.lastIndexOf('/') + 1);
          return `${baseUrl}${path}`;
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
      script.src = sofficeJs;
      script.onerror = () => reject(new Error(`Failed to load ${sofficeJs}`));
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
   * Open a document for editing without converting
   * Returns an editor instance for the document type (WriterEditor, CalcEditor, etc.)
   *
   * @example
   * ```typescript
   * const editor = await converter.openDocument(fileData, 'document.docx');
   * if (isWriterEditor(editor)) {
   *   const structure = editor.getStructure();
   *   editor.insertParagraph('Hello World');
   *   await editor.saveAs('/tmp/output.docx', 'docx');
   * }
   * editor.close();
   * ```
   */
  async openDocument(
    input: Uint8Array | ArrayBuffer,
    filename: string,
    options?: OpenDocumentOptions
  ): Promise<OfficeEditor> {
    if (!this.initialized || !this.lokBindings || !this.module) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
    const ext = this.getExt(filename) || 'docx';
    const inPath = `/tmp/input/edit_${Date.now()}.${ext}`;

    // Write input file to virtual filesystem
    this.module.FS.writeFile(inPath, inputData);

    // Load document with LOK
    let docPtr: number;
    if (options?.password) {
      docPtr = this.lokBindings.documentLoadWithOptions(inPath, `,Password=${options.password}`);
    } else {
      docPtr = this.lokBindings.documentLoad(inPath);
    }

    if (docPtr === 0) {
      const error = this.lokBindings.getError();
      throw new ConversionError(ConversionErrorCode.LOAD_FAILED, error || 'Failed to load document');
    }

    // Create and return the appropriate editor
    const editor = createEditor(this.lokBindings, docPtr, options);
    editor.setInputPath(inPath);

    return editor;
  }

  /**
   * Get the LOK bindings for low-level operations
   * Useful for accessing methods not exposed through the editor API
   */
  getLokBindings(): LOKBindings {
    if (!this.lokBindings) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }
    return this.lokBindings;
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
  private options: WorkerBrowserConverterOptions;

  constructor(options: WorkerBrowserConverterOptions) {
    this.options = {
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
      this.worker = new Worker(this.options.browserWorkerJs);

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

      // Initialize WASM in worker with explicit paths
      await this.sendMessage('init', {
        sofficeJs: this.options.sofficeJs,
        sofficeWasm: this.options.sofficeWasm,
        sofficeData: this.options.sofficeData,
        sofficeWorkerJs: this.options.sofficeWorkerJs,
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
    } else if (msg.type === 'singlePagePreview') {
      pending.resolve(msg.preview);
    } else if (msg.type === 'documentInfo') {
      pending.resolve(msg.documentInfo);
    } else if (msg.type === 'lokInfo') {
      pending.resolve(msg.lokInfo);
    } else if (msg.type === 'editResult') {
      pending.resolve(msg.editResult);
    } else if (msg.type === 'pageRectangles') {
      pending.resolve(msg.pageRectangles);
    } else if (msg.type === 'testLokOperations') {
      pending.resolve(msg.testLokOperationsResult);
    } else if (msg.type === 'editorSession') {
      pending.resolve(msg.editorSession);
    } else if (msg.type === 'editorOperationResult') {
      pending.resolve(msg.editorOperationResult);
    } else if (msg.type === 'documentClosed') {
      pending.resolve(msg.data);
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

      // If sending input data, copy it first to avoid detaching the caller's buffer
      // This allows the same buffer to be used for multiple API calls
      if (data.inputData instanceof Uint8Array) {
        const copy = new Uint8Array(data.inputData.length);
        copy.set(data.inputData);
        const message = { type, id, ...data, inputData: copy };
        this.worker.postMessage(message, [copy.buffer]);
      } else {
        const message = { type, id, ...data };
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

    // Check if result is a ZIP file (multi-page image export)
    // ZIP files start with PK (0x50, 0x4B)
    const isZip = result.length >= 2 && result[0] === 0x50 && result[1] === 0x4B;
    const IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'svg'];
    const isImageFormat = IMAGE_FORMATS.includes(outputExt.toLowerCase());

    if (isZip && isImageFormat) {
      // Multi-page image export returns a ZIP
      return {
        data: result,
        mimeType: 'application/zip',
        filename: `${baseName}_pages.zip`,
        duration: Date.now() - startTime,
      };
    }

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
   * Render a single page preview - useful for lazy loading pages one at a time
   * @param input Document data
   * @param options Must include inputFormat
   * @param pageIndex Zero-based page index to render
   * @param maxWidth Maximum width for rendered page (height scales proportionally)
   * @returns Single page preview with RGBA data
   */
  async renderSinglePage(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>,
    pageIndex: number,
    maxWidth = 256
  ): Promise<{ page: number; data: Uint8Array; width: number; height: number }> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('renderSinglePage', {
      inputData,
      inputExt: ext,
      pageIndex,
      maxWidth,
    });

    return result as { page: number; data: Uint8Array; width: number; height: number };
  }

  /**
   * Render a single page preview using conversion (PDF->PNG)
   * This is a fallback for Chrome/Edge where paintTile hangs for Drawing documents
   * @param input Document data
   * @param options Must include inputFormat
   * @param pageIndex Zero-based page index to render
   * @param maxWidth Maximum width for rendered page
   * @returns Single page preview with PNG data (not RGBA)
   */
  async renderPageViaConvert(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>,
    pageIndex: number,
    maxWidth = 256
  ): Promise<{ page: number; data: Uint8Array; width: number; height: number; isPng: boolean }> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'pdf';

    const result = await this.sendMessage('renderPageViaConvert', {
      inputData,
      inputExt: ext,
      pageIndex,
      maxWidth,
    });

    return result as { page: number; data: Uint8Array; width: number; height: number; isPng: boolean };
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
   * Get low-level LOK information about a document
   * Includes bounding boxes, text content, positions, and edit mode
   * @param input Document data
   * @param options Must include inputFormat
   * @returns LOK info with rectangles, sizes, text, and positions
   */
  async getLokInfo(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>
  ): Promise<{
    pageRectangles: string | null;
    documentSize: { width: number; height: number };
    partInfo: {
      visible: string;
      selected: string;
      masterPageCount?: string;
      mode: string;
    } | null;
    a11yFocusedParagraph: {
      content: string;
      position: string;
      start: string;
      end: string;
    } | null;
    a11yCaretPosition: number;
    editMode: number;
    allText: string | null;
  }> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('getLokInfo', {
      inputData,
      inputExt: ext,
    });

    return result as {
      pageRectangles: string | null;
      documentSize: { width: number; height: number };
      partInfo: {
        visible: string;
        selected: string;
        masterPageCount?: string;
        mode: string;
      } | null;
      a11yFocusedParagraph: {
        content: string;
        position: string;
        start: string;
        end: string;
      } | null;
      a11yCaretPosition: number;
      editMode: number;
      allText: string | null;
    };
  }

  /**
   * Render all page rectangles as individual screenshots
   * Returns each page's bounding box (in twips) with rendered RGBA image data
   * @param input Document data
   * @param options Must include inputFormat
   * @param maxWidth Maximum width for rendered pages (height scales proportionally)
   * @returns Array of page rectangles with their rendered images
   */
  async renderPageRectangles(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>,
    maxWidth = 256
  ): Promise<Array<{
    index: number;
    x: number;      // X position in twips
    y: number;      // Y position in twips
    width: number;  // Width in twips
    height: number; // Height in twips
    imageData: Uint8Array;  // RGBA pixel data
    imageWidth: number;     // Rendered width in pixels
    imageHeight: number;    // Rendered height in pixels
  }>> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('renderPageRectangles', {
      inputData,
      inputExt: ext,
      maxWidth,
    });

    return result as Array<{
      index: number;
      x: number;
      y: number;
      width: number;
      height: number;
      imageData: Uint8Array;
      imageWidth: number;
      imageHeight: number;
    }>;
  }

  /**
   * Edit text in a document - find/replace or insert text
   * @param input Document data
   * @param options Must include inputFormat
   * @param editOptions Either findText+replaceText or insertText
   * @returns Edit result with success status and optionally the modified document
   */
  async editText(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>,
    editOptions: {
      findText?: string;
      replaceText?: string;
      insertText?: string;
    }
  ): Promise<{
    success: boolean;
    editMode: number;
    message: string;
    modifiedDocument?: Uint8Array;
  }> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('editText', {
      inputData,
      inputExt: ext,
      findText: editOptions.findText,
      replaceText: editOptions.replaceText,
      insertText: editOptions.insertText,
    });

    return result as {
      success: boolean;
      editMode: number;
      message: string;
      modifiedDocument?: Uint8Array;
    };
  }

  /**
   * Test various LOK operations on a document
   * Tests: SelectAll, getTextSelection, getSelectionType, resetSelection,
   *        Delete, Undo, Redo, Bold, Italic, setTextSelection, save
   * @param input Document data
   * @param options Must include inputFormat
   * @returns Test results for each operation
   */
  async testLokOperations(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>
  ): Promise<{
    operations: Array<{
      operation: string;
      success: boolean;
      result?: unknown;
      error?: string;
    }>;
    summary: string;
  }> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('testLokOperations', {
      inputData,
      inputExt: ext,
    });

    return result as {
      operations: Array<{
        operation: string;
        success: boolean;
        result?: unknown;
        error?: string;
      }>;
      summary: string;
    };
  }

  /**
   * Open a document for editing and return a proxy editor
   *
   * @param input Document data as Uint8Array or ArrayBuffer
   * @param options Must include inputFormat
   * @returns BrowserEditorProxy for interacting with the document
   *
   * @example
   * ```typescript
   * const editor = await converter.openDocument(docxData, { inputFormat: 'docx' });
   * console.log(editor.documentType); // 'writer'
   *
   * // Get formatting at cursor
   * const format = await editor.getFormat();
   * console.log(format); // { bold: true, italic: false, ... }
   *
   * // Apply formatting
   * await editor.selectAll();
   * await editor.formatText({ bold: true });
   *
   * // Save and close
   * const savedDoc = await editor.save();
   * await editor.close();
   * ```
   */
  async openDocument(
    input: Uint8Array | ArrayBuffer,
    options: Pick<ConversionOptions, 'inputFormat'>
  ): Promise<BrowserEditorProxy> {
    if (!this.initialized || !this.worker) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);
    const ext = options.inputFormat || 'docx';

    const result = await this.sendMessage('openDocument', {
      inputData,
      inputExt: ext,
    }) as { sessionId: string; documentType: 'writer' | 'calc' | 'impress' | 'draw'; pageCount: number };

    return new BrowserEditorProxy(this, result.sessionId, result.documentType, result.pageCount);
  }

  /**
   * Internal method to send editor operation to worker
   * @internal
   */
  async _sendEditorOperation(
    sessionId: string,
    method: string,
    args: unknown[] = []
  ): Promise<{ success: boolean; verified?: boolean; data?: unknown; error?: string; suggestion?: string }> {
    const result = await this.sendMessage('editorOperation', {
      sessionId,
      editorMethod: method,
      editorArgs: args,
    });
    return result as { success: boolean; verified?: boolean; data?: unknown; error?: string; suggestion?: string };
  }

  /**
   * Internal method to close an editor session
   * @internal
   */
  async _closeDocument(sessionId: string): Promise<Uint8Array | undefined> {
    const result = await this.sendMessage('closeDocument', { sessionId });
    return result as Uint8Array | undefined;
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
 * Result type for editor operations via the browser proxy
 */
export interface EditorOperationResult {
  success: boolean;
  verified?: boolean;
  data?: unknown;
  error?: string;
  suggestion?: string;
}

/**
 * Proxy class for editing documents in the browser via Web Worker
 *
 * This class provides a clean API that mirrors the server-side editor classes
 * but communicates through the worker message protocol.
 */
export class BrowserEditorProxy {
  private converter: WorkerBrowserConverter;
  private _sessionId: string;
  private _documentType: 'writer' | 'calc' | 'impress' | 'draw';
  private _pageCount: number;
  private _closed = false;

  constructor(
    converter: WorkerBrowserConverter,
    sessionId: string,
    documentType: 'writer' | 'calc' | 'impress' | 'draw',
    pageCount: number
  ) {
    this.converter = converter;
    this._sessionId = sessionId;
    this._documentType = documentType;
    this._pageCount = pageCount;
  }

  /** Get the session ID */
  get sessionId(): string { return this._sessionId; }

  /** Get the document type (writer, calc, impress, draw) */
  get documentType(): 'writer' | 'calc' | 'impress' | 'draw' { return this._documentType; }

  /** Get the page count */
  get pageCount(): number { return this._pageCount; }

  /** Check if the document is still open */
  get isOpen(): boolean { return !this._closed; }

  // ============================================
  // Common Editor Methods
  // ============================================

  /** Get document structure */
  async getStructure(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'getStructure');
  }

  /** Undo last operation */
  async undo(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'undo');
  }

  /** Redo last undone operation */
  async redo(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'redo');
  }

  /** Find text in document */
  async find(text: string, options?: { caseSensitive?: boolean; wholeWord?: boolean }): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'find', [text, options]);
  }

  /** Find and replace all occurrences */
  async findAndReplaceAll(find: string, replace: string, options?: { caseSensitive?: boolean; wholeWord?: boolean }): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'findAndReplaceAll', [find, replace, options]);
  }

  /** Get current selection */
  async getSelection(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'getSelection');
  }

  /** Clear current selection */
  async clearSelection(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'clearSelection');
  }

  /** Get STATE_CHANGED events as a map */
  async getStateChanges(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'getStateChanges');
  }

  /** Flush callbacks and poll state changes */
  async flushAndPollState(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'flushAndPollState');
  }

  // ============================================
  // Writer-specific Methods
  // ============================================

  /**
   * Get text formatting at current cursor/selection position
   * Uses callback mechanism to retrieve STATE_CHANGED events
   * @returns TextFormat with bold, italic, underline, fontSize, fontName
   */
  async getFormat(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'getFormat');
  }

  /** Get raw formatting state from callbacks */
  async getSelectionFormat(): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'getSelectionFormat');
  }

  /** Get a specific paragraph by index */
  async getParagraph(index: number): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'getParagraph', [index]);
  }

  /** Get multiple paragraphs */
  async getParagraphs(start: number, count: number): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'getParagraphs', [start, count]);
  }

  /** Insert a new paragraph */
  async insertParagraph(text: string, options?: { afterIndex?: number; style?: string }): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'insertParagraph', [text, options]);
  }

  /** Replace a paragraph */
  async replaceParagraph(index: number, text: string): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'replaceParagraph', [index, text]);
  }

  /** Delete a paragraph */
  async deleteParagraph(index: number): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'deleteParagraph', [index]);
  }

  /** Format text in a range */
  async formatText(range: { start: { paragraph: number; character: number }; end: { paragraph: number; character: number } }, format: { bold?: boolean; italic?: boolean; underline?: boolean; fontSize?: number; fontName?: string }): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'formatText', [range, format]);
  }

  /** Replace text in document */
  async replaceText(find: string, replace: string, options?: { paragraph?: number; all?: boolean }): Promise<EditorOperationResult> {
    this.assertOpen();
    return this.converter._sendEditorOperation(this._sessionId, 'replaceText', [find, replace, options]);
  }

  // ============================================
  // Lifecycle Methods
  // ============================================

  /**
   * Save and close the document, returning the modified data
   * @returns The modified document as Uint8Array
   */
  async close(): Promise<Uint8Array | undefined> {
    this.assertOpen();
    this._closed = true;
    return this.converter._closeDocument(this._sessionId);
  }

  private assertOpen(): void {
    if (this._closed) {
      throw new Error('Document session is closed');
    }
  }
}

/**
 * Create drop zone for file conversion
 */
export function createDropZone(
  element: HTMLElement | string,
  options: BrowserWasmPaths & {
    outputFormat: OutputFormat;
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
          sofficeJs: options.sofficeJs,
          sofficeWasm: options.sofficeWasm,
          sofficeData: options.sofficeData,
          sofficeWorkerJs: options.sofficeWorkerJs,
          onProgress: options.onProgress ? (p: ProgressInfo) => options.onProgress!({ percent: p.percent, message: p.message }) : undefined,
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
  options: BrowserWasmPaths & { download?: boolean }
): Promise<ConversionResult> {
  const converter = new BrowserConverter({
    sofficeJs: options.sofficeJs,
    sofficeWasm: options.sofficeWasm,
    sofficeData: options.sofficeData,
    sofficeWorkerJs: options.sofficeWorkerJs,
  });
  try {
    await converter.initialize();
    const result = await converter.convertFile(file, { outputFormat });
    if (options.download !== false) converter.download(result);
    return result;
  } finally {
    await converter.destroy();
  }
}

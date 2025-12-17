/**
 * LibreOffice WASM Document Converter - Browser Version
 *
 * This is the browser-specific version that doesn't include Node.js dependencies.
 * For Node.js usage, use converter-node.ts instead (imported via /server entry point).
 */

import {
  ConversionError,
  ConversionErrorCode,
  ConversionOptions,
  ConversionResult,
  DocumentInfo,
  EditorOperationResult,
  EditorSession,
  EmscriptenModule,
  EXTENSION_TO_FORMAT,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  FORMAT_FILTER_OPTIONS,
  FullQualityPagePreview,
  FullQualityRenderOptions,
  ILibreOfficeConverter,
  InputFormatOptions,
  LibreOfficeWasmOptions,
  LOKDocumentType,
  OUTPUT_FORMAT_TO_LOK,
  OutputFormat,
  PagePreview,
  ProgressInfo,
  RenderOptions,
  isConversionValid,
  getConversionErrorMessage,
  getValidOutputFormats,
  InputFormat,
  getOutputFormatsForDocType,
} from './types.js';
import { LOKBindings } from './lok-bindings.js';

// Declare the module factory type
type ModuleFactory = (config: Partial<EmscriptenModule>) => Promise<EmscriptenModule>;

/** Emscripten worker interface */
interface EmscriptenWorker {
  terminate?: () => void;
}

/** Emscripten PThread interface for pthread cleanup */
interface EmscriptenPThread {
  terminateAllThreads?: () => void;
  runningWorkers?: EmscriptenWorker[];
  unusedWorkers?: EmscriptenWorker[];
}

/** Emscripten module with PThread support */
interface EmscriptenModuleWithPThread extends EmscriptenModule {
  PThread?: EmscriptenPThread;
}


/**
 * LibreOffice WASM Document Converter
 *
 * A headless document conversion toolkit that uses LibreOffice
 * compiled to WebAssembly for browser and Node.js environments.
 */
export class LibreOfficeConverter implements ILibreOfficeConverter {
  private module: EmscriptenModule | null = null;
  private lokBindings: LOKBindings | null = null;
  private initialized = false;
  private initializing = false;
  private options: LibreOfficeWasmOptions;
  private corrupted = false;
  private fsTracked = false;

  constructor(options: LibreOfficeWasmOptions = {}) {
    console.log("LibreOfficeConverter", "constructor options", options);
    this.options = {
      wasmPath: './wasm',
      verbose: false,
      ...options,
    };
  }

  /**
   * Check if an error indicates LOK corruption requiring reinitialization
   */
  private isCorruptionError(error: Error | string): boolean {
    const msg = error instanceof Error ? error.message : error;
    return msg.includes('memory access out of bounds') ||
           msg.includes('ComponentContext is not avail') ||
           msg.includes('unreachable') ||
           msg.includes('table index is out of bounds') ||
           msg.includes('null function');
  }

  /**
   * Force reinitialization of the converter (for recovery from errors)
   */
  async reinitialize(): Promise<void> {
    if (this.options.verbose) {
      console.log('[LibreOfficeConverter] Reinitializing due to corruption...');
    }

    // Clean up existing state
    if (this.lokBindings) {
      try {
        this.lokBindings.destroy();
      } catch {
        // Ignore errors during cleanup
      }
      this.lokBindings = null;
    }
    this.module = null;
    this.initialized = false;
    this.corrupted = false;

    // Reinitialize
    await this.initialize();
  }

  /**
   * Initialize with a pre-loaded Emscripten module
   * This is useful for environments like Web Workers that have their own
   * WASM loading mechanism (e.g., importScripts with progress tracking)
   */
  async initializeWithModule(module: EmscriptenModule): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializing) {
      while (this.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.initializing = true;

    try {
      this.module = module;

      // Set up filesystem
      this.setupFileSystem();

      // Initialize LibreOfficeKit
      this.initializeLibreOfficeKit();

      this.initialized = true;
      this.options.onReady?.();
    } catch (error) {
      console.error('[LibreOfficeConverter] Initialization error:', error);
      const convError =
        error instanceof ConversionError
          ? error
          : new ConversionError(
              ConversionErrorCode.WASM_NOT_INITIALIZED,
              `Failed to initialize with module: ${String(error)}`
            );
      this.options.onError?.(convError);
      throw convError;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Initialize the LibreOffice WASM module
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializing) {
      while (this.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.initializing = true;
    this.emitProgress('loading', 0, 'Loading LibreOffice WASM module...');

    try {
      // Load WASM module (progress 0-45% handled by loader)
      this.module = await this.loadModule();
      
      this.emitProgress('initializing', 50, 'Setting up virtual filesystem...');

      // Create directories in virtual filesystem
      this.setupFileSystem();
      
      this.emitProgress('initializing', 60, 'Initializing LibreOfficeKit...');

      // Initialize LibreOfficeKit
      this.initializeLibreOfficeKit();

      this.emitProgress('initializing', 90, 'LibreOfficeKit ready');

      this.initialized = true;
      this.emitProgress('complete', 100, 'LibreOffice ready');
      this.options.onReady?.();
    } catch (error) {
      console.error('[LibreOfficeConverter] Initialization error:', error);
      const convError =
        error instanceof ConversionError
          ? error
          : new ConversionError(
              ConversionErrorCode.WASM_NOT_INITIALIZED,
              `Failed to initialize WASM module: ${String(error)}`
            );
      this.options.onError?.(convError);
      throw convError;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Load the Emscripten WASM module (browser only)
   */
  private async loadModule(): Promise<EmscriptenModule> {
    const wasmPath = this.options.wasmPath || './wasm';
    const moduleUrl = `${wasmPath}/soffice.js`;

    const config: Partial<EmscriptenModule> = {
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return `${wasmPath}/soffice.wasm`;
        }
        if (path.endsWith('.data')) {
          return `${wasmPath}/soffice.data`;
        }
        return `${wasmPath}/${path}`;
      },
      print: this.options.verbose ? console.log : () => {},
      printErr: this.options.verbose ? console.error : () => {},
    };

    // Create a script element to load the module
    const script = document.createElement('script');
    script.src = moduleUrl;

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${moduleUrl}`));
      document.head.appendChild(script);
    });

    // The module factory should now be available globally
    const createModule = (window as Window & { createSofficeModule?: ModuleFactory }).createSofficeModule;

    if (!createModule) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'WASM module factory not found. Make sure soffice.js is loaded.'
      );
    }

    return new Promise((resolve, reject) => {
      const moduleWithCallback: Partial<EmscriptenModule> = {
        ...config,
        onRuntimeInitialized: () => {
          resolve(moduleWithCallback as EmscriptenModule);
        },
      };

      createModule(moduleWithCallback).catch(reject);
    });
  }

  /**
   * Set up the virtual filesystem
   */
  private setupFileSystem(): void {
    if (!this.module?.FS) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Filesystem not available'
      );
    }

    const fs = this.module.FS;

    const tryMkdir = (path: string) => {
      try {
        fs.mkdir(path);
      } catch {
        // Directory may already exist
      }
    };

    tryMkdir('/tmp');
    tryMkdir('/tmp/input');
    tryMkdir('/tmp/output');
  }

  /**
   * Initialize LibreOfficeKit
   */
  private initializeLibreOfficeKit(): void {
    if (!this.module) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Module not loaded'
      );
    }

    // Debug filesystem contents before LOK init
    if (this.options.verbose && this.module.FS) {
      const fs = this.module.FS as typeof this.module.FS & {
        trackingDelegate?: Record<string, unknown>;
        open: (...args: unknown[]) => unknown;
      };

      if (!this.fsTracked) {
        this.fsTracked = true;

        if (!fs.trackingDelegate) {
          fs.trackingDelegate = {
            onOpen: (path: string) => {
              console.log('[FS OPEN]', path);
            },
            onOpenFile: (path: string) => {
              console.log('[FS OPEN FILE]', path);
            },
          };
        }

        if (typeof fs.open === 'function') {
          const originalOpen = fs.open.bind(fs);
          fs.open = ((path: string, flags?: unknown, mode?: unknown) => {
            console.log('[FS OPEN CALL]', path);
            try {
              return originalOpen(path, flags as never, mode as never);
            } catch (err) {
              const error = err as { code?: string; message?: string };
              if (error?.code === 'ENOENT') {
                console.log('[FS ENOENT]', path);
              }
              throw err;
            }
          }) as typeof fs.open;
        }
      }

      const logDir = (label: string, path: string) => {
        try {
          console.log(`[FS] ${label}:`, fs.readdir(path));
        } catch (e) {
          console.log(`[FS] ${label}: ERROR -`, (e as Error).message);
        }
      };

      logDir('ROOT', '/');
      logDir('PROGRAM DIR', '/instdir/program');
      logDir('SHARE DIR', '/instdir/share');
      logDir('REGISTRY DIR', '/instdir/share/registry');
      logDir('FILTER DIR', '/instdir/share/filter');
      logDir('CONFIG DIR', '/instdir/share/config/soffice.cfg');
      logDir('CONFIG FILTER', '/instdir/share/config/soffice.cfg/filter');
      logDir('IMPRESS MODULES', '/instdir/share/config/soffice.cfg/modules/simpress');
    }

    // Create LOK bindings wrapper
    this.lokBindings = new LOKBindings(this.module, this.options.verbose);

    try {
      // Create user profile directory if specified (for serverless environments)
      if (this.options.userProfilePath && this.module.FS) {
        try {
          this.module.FS.mkdir(this.options.userProfilePath);
        } catch {
          // Directory may already exist
        }
        // LibreOffice expects a 'user' subdirectory for config writes
        try {
          this.module.FS.mkdir(`${this.options.userProfilePath}/user`);
        } catch {
          // Directory may already exist
        }
      }

      // Initialize LibreOfficeKit through the bindings
      this.lokBindings.initialize('/instdir/program', this.options.userProfilePath);

      if (this.options.verbose) {
        const versionInfo = this.lokBindings.getVersionInfo();
        if (versionInfo) {
          console.log('[LOK] Version:', versionInfo);
        }
      }
    } catch (error) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        `Failed to initialize LibreOfficeKit: ${String(error)}`
      );
    }
  }

  /**
   * Convert a document to a different format
   */
  async convert(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions,
    filename = 'document'
  ): Promise<ConversionResult> {
    // Check if we need to reinitialize due to previous corruption
    if (this.corrupted) {
      await this.reinitialize();
    }

    if (!this.initialized || !this.module) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'LibreOffice WASM not initialized. Call initialize() first.'
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
    const outputExt = options.outputFormat;

    if (!FORMAT_FILTERS[outputExt]) {
      throw new ConversionError(
        ConversionErrorCode.UNSUPPORTED_FORMAT,
        `Unsupported output format: ${outputExt}`
      );
    }

    // Validate that this conversion path is supported
    if (!isConversionValid(inputExt, outputExt)) {
      throw new ConversionError(
        ConversionErrorCode.UNSUPPORTED_FORMAT,
        getConversionErrorMessage(inputExt, outputExt)
      );
    }

    const inputPath = `/tmp/input/doc.${inputExt}`;
    const outputPath = `/tmp/output/doc.${outputExt}`;

    // Set up abort API if available and timeout is specified
    if (this.lokBindings?.hasAbortSupport()) {
      // Reset abort state before starting the operation
      this.lokBindings.resetAbort();

      // Set timeout if specified
      if (options.timeout && options.timeout > 0) {
        this.lokBindings.setOperationTimeout(options.timeout);
        if (this.options.verbose) {
          console.log(`[LibreOfficeConverter] Set operation timeout to ${options.timeout}ms`);
        }
      } else {
        // Clear any previous timeout
        this.lokBindings.setOperationTimeout(0);
      }
    }

    try {
      this.emitProgress('converting', 10, 'Writing input document...');

      // Write input file to virtual filesystem
      this.module.FS.writeFile(inputPath, inputData);

      this.emitProgress('converting', 30, 'Converting document...');

      // Perform conversion
      const result = await this.performConversion(inputPath, outputPath, options);

      // Check if operation was aborted or timed out
      this.checkAbortState();

      this.emitProgress('complete', 100, 'Conversion complete');

      const baseName = this.getBasename(filename);
      const outputFilename = `${baseName}.${outputExt}`;

      return {
        data: result,
        mimeType: FORMAT_MIME_TYPES[outputExt],
        filename: outputFilename,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      // Check if this was an abort/timeout
      if (this.lokBindings?.hasAbortSupport()) {
        const state = this.lokBindings.getOperationState();
        if (state === 'aborted') {
          throw new ConversionError(
            ConversionErrorCode.OPERATION_ABORTED,
            'Conversion was aborted'
          );
        }
        if (state === 'timed_out') {
          throw new ConversionError(
            ConversionErrorCode.OPERATION_TIMED_OUT,
            `Conversion timed out after ${options.timeout}ms`
          );
        }
      }

      // Check if this error indicates corruption
      if (error instanceof Error && this.isCorruptionError(error)) {
        this.corrupted = true;
        if (this.options.verbose) {
          console.log('[LibreOfficeConverter] Corruption detected, will reinitialize on next convert');
        }
      }
      throw error;
    } finally {
      // Cleanup temporary files
      try {
        this.module?.FS.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        this.module?.FS.unlink(outputPath);
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Check if the operation was aborted or timed out and throw appropriate error
   */
  private checkAbortState(): void {
    if (!this.lokBindings?.hasAbortSupport()) {
      return;
    }

    const state = this.lokBindings.getOperationState();
    if (state === 'aborted') {
      throw new ConversionError(
        ConversionErrorCode.OPERATION_ABORTED,
        'Operation was aborted'
      );
    }
    if (state === 'timed_out') {
      throw new ConversionError(
        ConversionErrorCode.OPERATION_TIMED_OUT,
        'Operation timed out'
      );
    }
  }

  /**
   * Perform the actual conversion using LibreOfficeKit
   */
  private async performConversion(
    inputPath: string,
    outputPath: string,
    options: ConversionOptions
  ): Promise<Uint8Array> {
    if (!this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Module not loaded'
      );
    }

    this.emitProgress('converting', 40, 'Loading document...');

    let docPtr = 0;

    try {
      // Build load options (e.g., for password-protected documents)
      const loadOptions = options.password 
        ? `,Password=${options.password}` 
        : '';

      // Debug: verify file exists before LOK load
      if (this.options.verbose) {
        try {
          const stat = this.module.FS.stat(inputPath);
          console.log('[Convert] File exists before LOK load:', inputPath, 'size:', stat.size);
        } catch (e) {
          console.log('[Convert] File NOT found before LOK load:', inputPath, (e as Error).message);
        }
      }

      // Load the document using LibreOfficeKit
      if (loadOptions) {
        docPtr = this.lokBindings.documentLoadWithOptions(inputPath, loadOptions);
      } else {
        docPtr = this.lokBindings.documentLoad(inputPath);
      }

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      this.emitProgress('converting', 60, 'Converting format...');

      // Determine the output format string for LOK
      const lokFormat = OUTPUT_FORMAT_TO_LOK[options.outputFormat];
      
      // Get filter options for the format
      let filterOptions = FORMAT_FILTER_OPTIONS[options.outputFormat] || '';
      
      // Add PDF-specific options if applicable
      if (options.outputFormat === 'pdf' && options.pdf) {
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

      // Add page selection for image exports (png, jpg, svg)
      if (['png', 'jpg', 'svg'].includes(options.outputFormat) && options.image?.pageIndex !== undefined) {
        // PageRange is 1-indexed
        const pageNum = options.image.pageIndex + 1;
        if (filterOptions) {
          filterOptions += `;PageRange=${pageNum}-${pageNum}`;
        } else {
          filterOptions = `PageRange=${pageNum}-${pageNum}`;
        }
      }

      this.emitProgress('converting', 70, 'Saving document...');

      // Save the document in the new format
      this.lokBindings.documentSaveAs(docPtr, outputPath, lokFormat, filterOptions);

      this.emitProgress('converting', 90, 'Reading output...');

      // Read the converted output file
      try {
        const outputData = this.module.FS.readFile(outputPath) as Uint8Array;
        
        if (outputData.length === 0) {
          throw new ConversionError(
            ConversionErrorCode.CONVERSION_FAILED,
            'Conversion produced empty output'
          );
        }
        
        return outputData;
      } catch (fsError) {
        throw new ConversionError(
          ConversionErrorCode.CONVERSION_FAILED,
          `Failed to read converted file: ${String(fsError)}`
        );
      }
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }
      throw new ConversionError(
        ConversionErrorCode.CONVERSION_FAILED,
        `Conversion failed: ${String(error)}`
      );
    } finally {
      // Always clean up the document
      if (docPtr !== 0 && this.lokBindings) {
        try {
          this.lokBindings.documentDestroy(docPtr);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  /**
   * Render page previews (thumbnails) for a document
   * @param input Document data
   * @param options Options with inputFormat
   * @param renderOptions Render settings (width, height, pageIndices)
   * @returns Array of page preview data with RGBA pixels
   */
  async renderPagePreviews(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: InputFormatOptions,
    renderOptions: RenderOptions = {}
  ): Promise<PagePreview[]> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = (options.inputFormat || 'docx').toLowerCase();
    const width = renderOptions.width ?? 256;
    const height = renderOptions.height ?? 0;
    const pageIndices = renderOptions.pageIndices ?? [];

    // Write input file to virtual FS
    const inputPath = `/tmp/preview/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      // Create directory
      try {
        fs.mkdir('/tmp/preview');
      } catch {
        // Directory might exist
      }

      // Write file
      fs.writeFile(inputPath, data);

      // Load document
      const docPtr = this.lokBindings.documentLoad(inputPath);
      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document for preview'
        );
      }

      try {
        // Get number of pages/parts
        const numParts = this.lokBindings.documentGetParts(docPtr);
        if (this.options.verbose) {
          console.log(`[Preview] Document has ${numParts} pages/parts`);
        }

        // Determine which pages to render
        const pagesToRender =
          pageIndices.length > 0
            ? pageIndices.filter((i) => i >= 0 && i < numParts)
            : Array.from({ length: numParts }, (_, i) => i);

        const results: PagePreview[] = [];

        // Render each page (editMode defaults to false for clean presentation rendering)
        const editMode = renderOptions.editMode ?? false;
        for (const pageIndex of pagesToRender) {
          if (this.options.verbose) {
            console.log(`[Preview] Rendering page ${pageIndex + 1}/${numParts}`);
          }

          const preview = this.lokBindings.renderPage(docPtr, pageIndex, width, height, editMode);
          results.push({
            page: pageIndex,
            data: preview.data,
            width: preview.width,
            height: preview.height,
          });
        }

        return results;
      } finally {
        // Clean up document
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      // Clean up input file
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/preview');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Render a page at full quality (native resolution based on DPI)
   * @param input Document data
   * @param options Options with inputFormat
   * @param pageIndex Zero-based page index to render
   * @param renderOptions DPI and max dimension settings
   * @returns Full quality page preview with RGBA data and DPI info
   */
  async renderPageFullQuality(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: InputFormatOptions,
    pageIndex: number,
    renderOptions: FullQualityRenderOptions = {}
  ): Promise<FullQualityPagePreview> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = (options.inputFormat || 'docx').toLowerCase();
    const dpi = renderOptions.dpi ?? 150;
    const maxDimension = renderOptions.maxDimension;

    // Write input file to virtual FS
    const inputPath = `/tmp/fullquality/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      // Create directory
      try {
        fs.mkdir('/tmp/fullquality');
      } catch {
        // Directory might exist
      }

      // Write file
      fs.writeFile(inputPath, data);

      // Load document
      const docPtr = this.lokBindings.documentLoad(inputPath);
      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document for full quality render'
        );
      }

      try {
        // Validate page index
        const numParts = this.lokBindings.documentGetParts(docPtr);
        if (pageIndex < 0 || pageIndex >= numParts) {
          throw new ConversionError(
            ConversionErrorCode.CONVERSION_FAILED,
            `Page index ${pageIndex} out of range (0-${numParts - 1})`
          );
        }

        if (this.options.verbose) {
          console.log(`[FullQuality] Rendering page ${pageIndex + 1}/${numParts} at ${dpi} DPI`);
        }

        // Render at full quality (editMode defaults to false for clean presentation rendering)
        const editMode = renderOptions.editMode ?? false;
        const preview = this.lokBindings.renderPageFullQuality(docPtr, pageIndex, dpi, maxDimension, editMode);

        return {
          page: pageIndex,
          data: preview.data,
          width: preview.width,
          height: preview.height,
          dpi: preview.dpi,
        };
      } finally {
        // Clean up document
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      // Clean up input file
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/fullquality');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Get the number of pages/parts in a document
   */
  async getPageCount(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: InputFormatOptions
  ): Promise<number> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = (options.inputFormat || 'docx').toLowerCase();

    const inputPath = `/tmp/pagecount/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      try {
        fs.mkdir('/tmp/pagecount');
      } catch {
        // Directory might exist
      }

      fs.writeFile(inputPath, data);
      const docPtr = this.lokBindings.documentLoad(inputPath);

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      try {
        return this.lokBindings.documentGetParts(docPtr);
      } finally {
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/pagecount');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Get valid output formats for a document by loading it and checking its type
   * This is more accurate than static validation as it uses LibreOffice's actual document type detection
   * @param input Document data
   * @param options Options with inputFormat
   * @returns Object with document type and valid output formats
   */
  async getDocumentInfo(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: InputFormatOptions
  ): Promise<DocumentInfo> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = (options.inputFormat || 'docx').toLowerCase();

    const inputPath = `/tmp/docinfo/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      try {
        fs.mkdir('/tmp/docinfo');
      } catch {
        // Directory might exist
      }

      fs.writeFile(inputPath, data);
      const docPtr = this.lokBindings.documentLoad(inputPath);

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      try {
        const docType = this.lokBindings.documentGetDocumentType(docPtr) as LOKDocumentType;
        const pageCount = this.lokBindings.documentGetParts(docPtr);
        const validOutputFormats = getOutputFormatsForDocType(docType);

        const docTypeNames: Record<LOKDocumentType, string> = {
          [LOKDocumentType.TEXT]: 'Text Document',
          [LOKDocumentType.SPREADSHEET]: 'Spreadsheet',
          [LOKDocumentType.PRESENTATION]: 'Presentation',
          [LOKDocumentType.DRAWING]: 'Drawing',
          [LOKDocumentType.OTHER]: 'Other',
        };

        return {
          documentType: docType,
          documentTypeName: docTypeNames[docType] || 'Unknown',
          validOutputFormats,
          pageCount,
        };
      } finally {
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/docinfo');
      } catch {
        // Ignore
      }
    }
  }

  // ============================================================
  // Document Inspection Methods
  // ============================================================

  /**
   * Get all text content from a document
   * @param input Document data
   * @param options Conversion options with inputFormat
   * @returns All text content from the document
   */
  async getDocumentText(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions
  ): Promise<string | null> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = options.inputFormat?.toLowerCase();

    if (!inputFormat) {
      throw new ConversionError(
        ConversionErrorCode.INVALID_INPUT,
        'Input format is required'
      );
    }

    const inputPath = `/tmp/inspect/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      try {
        fs.mkdir('/tmp/inspect');
      } catch {
        // Directory might exist
      }

      fs.writeFile(inputPath, data);
      const docPtr = this.lokBindings.documentLoad(inputPath);

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      try {
        return this.lokBindings.getAllText(docPtr);
      } finally {
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/inspect');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Get page/slide names from a document
   * @param input Document data
   * @param options Conversion options with inputFormat
   * @returns Array of page/slide names
   */
  async getPageNames(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions
  ): Promise<string[]> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = options.inputFormat?.toLowerCase();

    if (!inputFormat) {
      throw new ConversionError(
        ConversionErrorCode.INVALID_INPUT,
        'Input format is required'
      );
    }

    const inputPath = `/tmp/names/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      try {
        fs.mkdir('/tmp/names');
      } catch {
        // Directory might exist
      }

      fs.writeFile(inputPath, data);
      const docPtr = this.lokBindings.documentLoad(inputPath);

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      try {
        const numParts = this.lokBindings.documentGetParts(docPtr);
        const names: string[] = [];
        
        for (let i = 0; i < numParts; i++) {
          const name = this.lokBindings.getPartName(docPtr, i);
          names.push(name || `Page ${i + 1}`);
        }
        
        return names;
      } finally {
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/names');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Get page bounding rectangles from a document
   * @param input Document data
   * @param options Conversion options with inputFormat
   * @returns Array of page rectangles in twips
   */
  async getPageRectangles(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions
  ): Promise<Array<{ x: number; y: number; width: number; height: number }>> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = options.inputFormat?.toLowerCase();

    if (!inputFormat) {
      throw new ConversionError(
        ConversionErrorCode.INVALID_INPUT,
        'Input format is required'
      );
    }

    const inputPath = `/tmp/rects/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      try {
        fs.mkdir('/tmp/rects');
      } catch {
        // Directory might exist
      }

      fs.writeFile(inputPath, data);
      const docPtr = this.lokBindings.documentLoad(inputPath);

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      try {
        const rectsStr = this.lokBindings.getPartPageRectangles(docPtr);
        return this.lokBindings.parsePageRectangles(rectsStr || '');
      } finally {
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/rects');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Get spreadsheet data area (last used row/column)
   * @param input Document data
   * @param options Conversion options with inputFormat
   * @param sheetIndex Sheet index (0-based)
   * @returns Object with col and row counts
   */
  async getSpreadsheetDataArea(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions,
    sheetIndex: number = 0
  ): Promise<{ col: number; row: number }> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = options.inputFormat?.toLowerCase();

    if (!inputFormat) {
      throw new ConversionError(
        ConversionErrorCode.INVALID_INPUT,
        'Input format is required'
      );
    }

    const inputPath = `/tmp/dataarea/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      try {
        fs.mkdir('/tmp/dataarea');
      } catch {
        // Directory might exist
      }

      fs.writeFile(inputPath, data);
      const docPtr = this.lokBindings.documentLoad(inputPath);

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      try {
        return this.lokBindings.getDataArea(docPtr, sheetIndex);
      } finally {
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/dataarea');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Execute a UNO command on a document
   * @param input Document data
   * @param options Conversion options with inputFormat
   * @param command UNO command (e.g., '.uno:SelectAll')
   * @param args JSON arguments string
   * @returns Command result (if any)
   */
  async executeUnoCommand(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions,
    command: string,
    args: string = '{}'
  ): Promise<void> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = options.inputFormat?.toLowerCase();

    if (!inputFormat) {
      throw new ConversionError(
        ConversionErrorCode.INVALID_INPUT,
        'Input format is required'
      );
    }

    const inputPath = `/tmp/uno/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      try {
        fs.mkdir('/tmp/uno');
      } catch {
        // Directory might exist
      }

      fs.writeFile(inputPath, data);
      const docPtr = this.lokBindings.documentLoad(inputPath);

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      try {
        this.lokBindings.postUnoCommand(docPtr, command, args);
      } finally {
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/uno');
      } catch {
        // Ignore
      }
    }
  }

  // ============================================
  // ILibreOfficeConverter Interface Methods
  // ============================================

  /**
   * Render a single page as an image
   * @param input Document data
   * @param options Options with inputFormat
   * @param pageIndex Zero-based page index to render
   * @param width Target width for rendered page
   * @param height Optional target height (0 = auto based on aspect ratio)
   * @returns Page preview with RGBA data
   */
  async renderPage(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: InputFormatOptions,
    pageIndex: number,
    width: number,
    height = 0
  ): Promise<PagePreview> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Converter not initialized'
      );
    }

    const data = this.normalizeInput(input);
    const inputFormat = (options.inputFormat || 'docx').toLowerCase();

    const inputPath = `/tmp/renderpage/doc.${inputFormat}`;
    const fs = this.module.FS;

    try {
      try {
        fs.mkdir('/tmp/renderpage');
      } catch {
        // Directory might exist
      }

      fs.writeFile(inputPath, data);
      const docPtr = this.lokBindings.documentLoad(inputPath);

      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document'
        );
      }

      try {
        const preview = this.lokBindings.renderPage(docPtr, pageIndex, width, height);
        return {
          page: pageIndex,
          data: preview.data,
          width: preview.width,
          height: preview.height,
        };
      } finally {
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        fs.rmdir('/tmp/renderpage');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Open a document for editing
   * Note: This low-level converter does not support persistent editor sessions.
   * Use WorkerConverter or WorkerBrowserConverter for editor operations.
   * @throws ConversionError Always throws - editor sessions not supported
   */
  openDocument(
    _input: Uint8Array | ArrayBuffer,
    _options: InputFormatOptions
  ): Promise<EditorSession> {
    return Promise.reject(new ConversionError(
      ConversionErrorCode.CONVERSION_FAILED,
      'Editor sessions not supported by LibreOfficeConverter. Use WorkerConverter or WorkerBrowserConverter.'
    ));
  }

  /**
   * Execute an editor operation on an open document
   * Note: This low-level converter does not support editor operations.
   * @throws ConversionError Always throws - editor operations not supported
   */
  editorOperation<T = unknown>(
    _sessionId: string,
    _method: string,
    _args?: unknown[]
  ): Promise<EditorOperationResult<T>> {
    return Promise.reject(new ConversionError(
      ConversionErrorCode.CONVERSION_FAILED,
      'Editor operations not supported by LibreOfficeConverter. Use WorkerConverter or WorkerBrowserConverter.'
    ));
  }

  /**
   * Close an editor session
   * Note: This low-level converter does not support editor sessions.
   * @throws ConversionError Always throws - editor sessions not supported
   */
  closeDocument(_sessionId: string): Promise<Uint8Array | undefined> {
    return Promise.reject(new ConversionError(
      ConversionErrorCode.CONVERSION_FAILED,
      'Editor sessions not supported by LibreOfficeConverter. Use WorkerConverter or WorkerBrowserConverter.'
    ));
  }

  /**
   * Get LOK bindings for advanced operations
   * Use with caution - this exposes low-level API
   * @returns LOK bindings instance or null
   */
  getLokBindings(): typeof this.lokBindings {
    return this.lokBindings;
  }

  // ============================================
  // Abort API Methods
  // ============================================

  /**
   * Abort the currently running operation.
   * Call this from another thread/worker to cancel a long-running operation.
   * The operation will throw an error when it detects the abort.
   *
   * @example
   * ```typescript
   * // From another thread/worker:
   * converter.abortOperation();
   * ```
   */
  abortOperation(): void {
    if (!this.lokBindings) {
      if (this.options.verbose) {
        console.log('[LibreOfficeConverter] abortOperation: not initialized');
      }
      return;
    }
    this.lokBindings.abortOperation();
  }

  /**
   * Set a timeout for operations in milliseconds.
   * Must be called before starting an operation.
   * After the timeout, the operation will be automatically aborted.
   *
   * @param timeoutMs Timeout in milliseconds (0 = no timeout)
   *
   * @example
   * ```typescript
   * // Set a 30-second timeout
   * converter.setOperationTimeout(30000);
   *
   * // Reset abort state before starting
   * converter.resetAbort();
   *
   * // Now run the conversion - will abort if it takes > 30s
   * await converter.convert(input, options);
   * ```
   */
  setOperationTimeout(timeoutMs: number): void {
    if (!this.lokBindings) {
      if (this.options.verbose) {
        console.log('[LibreOfficeConverter] setOperationTimeout: not initialized');
      }
      return;
    }
    this.lokBindings.setOperationTimeout(timeoutMs);
  }

  /**
   * Get the current operation state.
   *
   * @returns One of: 'idle', 'running', 'aborted', 'timed_out', 'completed', 'error', or 'unknown'
   *
   * @example
   * ```typescript
   * const state = converter.getOperationState();
   * if (state === 'aborted') {
   *   console.log('Operation was cancelled');
   * } else if (state === 'timed_out') {
   *   console.log('Operation timed out');
   * }
   * ```
   */
  getOperationState(): string {
    if (!this.lokBindings) {
      return 'unknown';
    }
    return this.lokBindings.getOperationState();
  }

  /**
   * Reset the abort state before starting a new operation.
   * Must be called before each operation to clear any previous abort/timeout state.
   *
   * @example
   * ```typescript
   * // Reset before each conversion
   * converter.resetAbort();
   * await converter.convert(input, options);
   * ```
   */
  resetAbort(): void {
    if (!this.lokBindings) {
      if (this.options.verbose) {
        console.log('[LibreOfficeConverter] resetAbort: not initialized');
      }
      return;
    }
    this.lokBindings.resetAbort();
  }

  /**
   * Check if the abort API is available.
   * The abort API requires the WASM module to be built with abort support.
   *
   * @returns true if abort methods are available
   */
  hasAbortSupport(): boolean {
    if (!this.lokBindings) {
      return false;
    }
    return this.lokBindings.hasAbortSupport();
  }

  /**
   * Destroy the LibreOffice instance and free resources
   */
  destroy(): Promise<void> {
    if (this.lokBindings) {
      try {
        this.lokBindings.destroy();
      } catch {
        // Ignore cleanup errors
      }
      this.lokBindings = null;
    }

    // Terminate Emscripten pthread workers
    if (this.module) {
      try {
        const mod = this.module as EmscriptenModuleWithPThread;

        // Try to terminate all pthread workers
        if (mod.PThread?.terminateAllThreads) {
          mod.PThread.terminateAllThreads();
        }

        // Terminate any running workers
        if (mod.PThread?.runningWorkers) {
          for (const worker of mod.PThread.runningWorkers) {
            if (worker?.terminate) {
              worker.terminate();
            }
          }
          mod.PThread.runningWorkers = [];
        }

        // Also check unusedWorkers
        if (mod.PThread?.unusedWorkers) {
          for (const worker of mod.PThread.unusedWorkers) {
            if (worker?.terminate) {
              worker.terminate();
            }
          }
          mod.PThread.unusedWorkers = [];
        }
      } catch {
        // Ignore pthread cleanup errors
      }
    }

    this.module = null;
    this.initialized = false;
    return Promise.resolve();
  }

  /**
   * Check if the converter is ready
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Get the Emscripten module for advanced operations
   * This is useful for direct filesystem or module access
   */
  getModule(): EmscriptenModule | null {
    return this.module;
  }

  /**
   * Get supported input formats
   */
  static getSupportedInputFormats(): string[] {
    return Object.keys(EXTENSION_TO_FORMAT);
  }

  /**
   * Get supported output formats
   */
  static getSupportedOutputFormats(): OutputFormat[] {
    return Object.keys(FORMAT_FILTERS) as OutputFormat[];
  }

  /**
   * Get valid output formats for a given input format
   * @param inputFormat The input document format (e.g., 'pdf', 'docx', 'xlsx')
   * @returns Array of valid output formats for this input
   */
  static getValidOutputFormats(inputFormat: string): OutputFormat[] {
    return getValidOutputFormats(inputFormat as InputFormat);
  }

  /**
   * Check if a conversion from input format to output format is supported
   * @param inputFormat The input document format
   * @param outputFormat The desired output format
   * @returns true if the conversion is supported
   */
  static isConversionSupported(inputFormat: string, outputFormat: string): boolean {
    return isConversionValid(inputFormat, outputFormat);
  }

  // ============================================================
  // Private helper methods
  // ============================================================

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

  private emitProgress(
    phase: ProgressInfo['phase'],
    percent: number,
    message: string
  ): void {
    this.options.onProgress?.({ phase, percent, message });
  }
}

export async function createMainThreadConverter(options: LibreOfficeWasmOptions = {}): Promise<LibreOfficeConverter> {
  const c = new LibreOfficeConverter(options);
  await c.initialize();
  return c;
}

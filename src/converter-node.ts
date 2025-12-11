/**
 * LibreOffice WASM Document Converter - Node.js Version
 *
 * This is the Node.js-specific version that requires wasmLoader to be provided.
 * For browser usage, use converter.ts instead.
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

/** Emscripten worker with Node.js-specific methods */
interface EmscriptenWorker {
  unref?: () => void;
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

/** Node.js process handle */
interface ProcessHandle {
  unref?: () => void;
  constructor?: { name?: string };
  remoteAddress?: string;
}

/** Node.js process with internal methods */
interface ProcessWithHandles {
  _getActiveHandles?: () => ProcessHandle[];
}

/**
 * LibreOffice WASM Document Converter - Node.js Version
 *
 * A headless document conversion toolkit that uses LibreOffice
 * compiled to WebAssembly. This version is optimized for Node.js
 * with static imports that work with ESM bundlers.
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
   * Load the Emscripten WASM module (Node.js only)
   * Requires wasmLoader option to be provided for bundler compatibility
   */
  private async loadModule(): Promise<EmscriptenModule> {
    console.log('[LibreOfficeConverter] Loading WASM module...');

    // wasmLoader must be provided - no dynamic require
    if (!this.options.wasmLoader) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'wasmLoader option is required. Import the loader and pass it:\n' +
        '  import wasmLoader from "@matbee/libreoffice-converter/wasm/loader.cjs";\n' +
        '  new LibreOfficeConverter({ wasmLoader })'
      );
    }

    // Build loader config
    const config = {
      verbose: this.options.verbose,
      print: this.options.verbose ? console.log : () => {},
      printErr: this.options.verbose ? console.error : () => {},
      onProgress: (_phase: string, percent: number, message: string) => {
        // Map loader progress to our progress phases
        this.emitProgress('loading', percent, message);
      },
    };

    return await this.options.wasmLoader.createModule(config);
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

    const emFs = this.module.FS;

    const tryMkdir = (dirPath: string) => {
      try {
        emFs.mkdir(dirPath);
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
      const emFs = this.module.FS as typeof this.module.FS & {
        trackingDelegate?: Record<string, unknown>;
        open: (...args: unknown[]) => unknown;
      };

      if (!this.fsTracked) {
        this.fsTracked = true;

        if (!emFs.trackingDelegate) {
          emFs.trackingDelegate = {
            onOpen: (filePath: string) => {
              console.log('[FS OPEN]', filePath);
            },
            onOpenFile: (filePath: string) => {
              console.log('[FS OPEN FILE]', filePath);
            },
          };
        }

        if (typeof emFs.open === 'function') {
          const originalOpen = emFs.open.bind(emFs);
          emFs.open = ((filePath: string, flags?: unknown, mode?: unknown) => {
            console.log('[FS OPEN CALL]', filePath);
            try {
              return originalOpen(filePath, flags as never, mode as never);
            } catch (err) {
              const error = err as { code?: string; message?: string };
              if (error?.code === 'ENOENT') {
                console.log('[FS ENOENT]', filePath);
              }
              throw err;
            }
          }) as typeof emFs.open;
        }
      }

      const logDir = (label: string, dirPath: string) => {
        try {
          console.log(`[FS] ${label}:`, emFs.readdir(dirPath));
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
      // Initialize LibreOfficeKit through the bindings
      this.lokBindings.initialize('/instdir/program');

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

    try {
      this.emitProgress('converting', 10, 'Writing input document...');

      // Write input file to virtual filesystem
      this.module.FS.writeFile(inputPath, inputData);

      this.emitProgress('converting', 30, 'Converting document...');

      // Perform conversion
      const result = await this.performConversion(inputPath, outputPath, options);

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

    const inputPath = `/tmp/preview/doc.${inputFormat}`;
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/preview');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);

      const docPtr = this.lokBindings.documentLoad(inputPath);
      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document for preview'
        );
      }

      try {
        const numParts = this.lokBindings.documentGetParts(docPtr);
        if (this.options.verbose) {
          console.log(`[Preview] Document has ${numParts} pages/parts`);
        }

        const pagesToRender =
          pageIndices.length > 0
            ? pageIndices.filter((i) => i >= 0 && i < numParts)
            : Array.from({ length: numParts }, (_, i) => i);

        const results: PagePreview[] = [];
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
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/preview');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Render a page at full quality (native resolution based on DPI)
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

    const inputPath = `/tmp/fullquality/doc.${inputFormat}`;
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/fullquality');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);

      const docPtr = this.lokBindings.documentLoad(inputPath);
      if (docPtr === 0) {
        throw new ConversionError(
          ConversionErrorCode.LOAD_FAILED,
          'Failed to load document for full quality render'
        );
      }

      try {
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
        this.lokBindings.documentDestroy(docPtr);
      }
    } finally {
      try {
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/fullquality');
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
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/pagecount');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);
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
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/pagecount');
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Get valid output formats for a document by loading it and checking its type
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
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/docinfo');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);
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
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/docinfo');
      } catch {
        // Ignore
      }
    }
  }

  // ============================================
  // Document Inspection Methods
  // ============================================

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
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/inspect');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);
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
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/inspect');
      } catch {
        // Ignore
      }
    }
  }

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
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/names');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);
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
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/names');
      } catch {
        // Ignore
      }
    }
  }

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
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/rects');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);
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
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/rects');
      } catch {
        // Ignore
      }
    }
  }

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
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/dataarea');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);
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
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/dataarea');
      } catch {
        // Ignore
      }
    }
  }

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
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/uno');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);
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
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/uno');
      } catch {
        // Ignore
      }
    }
  }

  // ============================================
  // ILibreOfficeConverter Interface Methods
  // ============================================

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
    const emFs = this.module.FS;

    try {
      try {
        emFs.mkdir('/tmp/renderpage');
      } catch {
        // Directory might exist
      }

      emFs.writeFile(inputPath, data);
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
        emFs.unlink(inputPath);
      } catch {
        // Ignore
      }
      try {
        emFs.rmdir('/tmp/renderpage');
      } catch {
        // Ignore
      }
    }
  }

  openDocument(
    _input: Uint8Array | ArrayBuffer,
    _options: InputFormatOptions
  ): Promise<EditorSession> {
    return Promise.reject(new ConversionError(
      ConversionErrorCode.CONVERSION_FAILED,
      'Editor sessions not supported by LibreOfficeConverter. Use WorkerConverter or WorkerBrowserConverter.'
    ));
  }

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

  closeDocument(_sessionId: string): Promise<Uint8Array | undefined> {
    return Promise.reject(new ConversionError(
      ConversionErrorCode.CONVERSION_FAILED,
      'Editor sessions not supported by LibreOfficeConverter. Use WorkerConverter or WorkerBrowserConverter.'
    ));
  }

  getLokBindings(): typeof this.lokBindings {
    return this.lokBindings;
  }

  destroy(): Promise<void> {
    if (this.lokBindings) {
      try {
        this.lokBindings.destroy();
      } catch {
        // Ignore cleanup errors
      }
      this.lokBindings = null;
    }

    // Terminate Emscripten pthread workers to allow process to exit
    if (this.module) {
      try {
        const mod = this.module as EmscriptenModuleWithPThread;

        if (mod.PThread?.terminateAllThreads) {
          mod.PThread.terminateAllThreads();
        }

        if (mod.PThread?.runningWorkers) {
          for (const worker of mod.PThread.runningWorkers) {
            if (worker?.unref) {
              worker.unref();
            }
            if (worker?.terminate) {
              worker.terminate();
            }
          }
          mod.PThread.runningWorkers = [];
        }

        if (mod.PThread?.unusedWorkers) {
          for (const worker of mod.PThread.unusedWorkers) {
            if (worker?.unref) {
              worker.unref();
            }
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

    // In Node.js, unref any remaining handles to allow process exit
    if (typeof process !== 'undefined') {
      try {
        const proc = process as unknown as ProcessWithHandles;
        if (proc._getActiveHandles) {
          const handles = proc._getActiveHandles();
          for (const handle of handles) {
            if (handle?.unref) {
              const name = handle.constructor?.name ?? '';
              if (name === 'MessagePort' || (name === 'Socket' && !handle.remoteAddress)) {
                handle.unref();
              }
            }
          }
        }
      } catch {
        // Ignore
      }
    }

    this.module = null;
    this.initialized = false;
    return Promise.resolve();
  }

  isReady(): boolean {
    return this.initialized;
  }

  getModule(): EmscriptenModule | null {
    return this.module;
  }

  static getSupportedInputFormats(): string[] {
    return Object.keys(EXTENSION_TO_FORMAT);
  }

  static getSupportedOutputFormats(): OutputFormat[] {
    return Object.keys(FORMAT_FILTERS) as OutputFormat[];
  }

  static getValidOutputFormats(inputFormat: string): OutputFormat[] {
    return getValidOutputFormats(inputFormat as InputFormat);
  }

  static isConversionSupported(inputFormat: string, outputFormat: string): boolean {
    return isConversionValid(inputFormat, outputFormat);
  }

  // ============================================
  // Private helper methods
  // ============================================

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

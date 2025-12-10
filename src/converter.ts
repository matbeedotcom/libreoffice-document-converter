/**
 * LibreOffice WASM Document Converter
 * Core conversion functionality using LibreOfficeKit via WASM
 */

import {
  ConversionError,
  ConversionErrorCode,
  ConversionOptions,
  ConversionResult,
  EmscriptenModule,
  EXTENSION_TO_FORMAT,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  FORMAT_FILTER_OPTIONS,
  LibreOfficeWasmOptions,
  OUTPUT_FORMAT_TO_LOK,
  OutputFormat,
  ProgressInfo,
  isConversionValid,
  getConversionErrorMessage,
  getValidOutputFormats,
  InputFormat,
  LOKDocumentType,
  getOutputFormatsForDocType,
} from './types.js';
import { LOKBindings } from './lok-bindings.js';

// Declare the module factory type
type ModuleFactory = (config: Partial<EmscriptenModule>) => Promise<EmscriptenModule>;

// Check if running in Node.js
const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

// Node.js modules - loaded dynamically when needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pathModule: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let urlModule: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fsModule: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let moduleModule: any = null;
let nodeModulesLoaded = false;

// Load Node.js modules dynamically (works in both ESM and CJS)
async function ensureNodeModules(): Promise<boolean> {
  if (nodeModulesLoaded) return pathModule !== null;
  if (!isNode) return false;

  try {
    // Dynamic imports work in both ESM and CJS Node.js
    pathModule = await import('path');
    urlModule = await import('url');
    fsModule = await import('fs');
    moduleModule = await import('module');
    nodeModulesLoaded = true;
    return true;
  } catch {
    nodeModulesLoaded = true;
    return false;
  }
}

/**
 * LibreOffice WASM Document Converter
 *
 * A headless document conversion toolkit that uses LibreOffice
 * compiled to WebAssembly for browser and Node.js environments.
 */
export class LibreOfficeConverter {
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
      await this.initializeLibreOfficeKit();

      this.initialized = true;
      this.options.onReady?.();
    } catch (error) {
      console.error('[LibreOfficeConverter] Initialization error:', error);
      const convError =
        error instanceof ConversionError
          ? error
          : new ConversionError(
              ConversionErrorCode.WASM_NOT_INITIALIZED,
              `Failed to initialize with module: ${error}`
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
      await this.initializeLibreOfficeKit();
      
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
              `Failed to initialize WASM module: ${error}`
            );
      this.options.onError?.(convError);
      throw convError;
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Load the Emscripten WASM module
   */
  private async loadModule(): Promise<EmscriptenModule> {
    const wasmPath = this.options.wasmPath || './wasm';
    console.log('[LibreOfficeConverter] Loading WASM module from:', wasmPath);
    if (isNode) {
      return this.loadNodeModule(wasmPath);
    } else {
      return this.loadBrowserModule(wasmPath);
    }
  }

  /**
   * Load module in Node.js environment
   */
  private async loadNodeModule(wasmPath: string): Promise<EmscriptenModule> {
    // Load Node.js modules dynamically
    await ensureNodeModules();

    // Ensure Node.js modules are available
    if (!pathModule || !urlModule || !fsModule || !moduleModule) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        'Node.js modules not available. This method should only be called in Node.js environment.'
      );
    }

    // Resolve absolute path
    let absolutePath = wasmPath;
    if (!pathModule.isAbsolute(wasmPath)) {
      let currentDir: string;
      try {
        // ESM
        currentDir = pathModule.dirname(urlModule.fileURLToPath(import.meta.url));
      } catch {
        // CJS fallback
        currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
      }
      absolutePath = pathModule.resolve(currentDir, '..', wasmPath);
    }

    // Check for loader.cjs and soffice.cjs
    const loaderPath = pathModule.join(absolutePath, 'loader.cjs');
    const modulePath = pathModule.join(absolutePath, 'soffice.cjs');

    if (!fsModule.existsSync(modulePath)) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        `WASM module not found at: ${modulePath}. Build LibreOffice WASM first.`
      );
    }

    if (!fsModule.existsSync(loaderPath)) {
      throw new ConversionError(
        ConversionErrorCode.WASM_NOT_INITIALIZED,
        `WASM loader not found at: ${loaderPath}. Ensure wasm/loader.cjs exists.`
      );
    }

    // Use createRequire to load CommonJS module from ESM context
    const requireFn = moduleModule.createRequire(import.meta.url);

    // Load the loader module
    const loader = requireFn(pathModule.resolve(loaderPath));

    // Use the loader's createModule function with progress callback
    const config = {
      verbose: this.options.verbose,
      print: this.options.verbose ? console.log : () => {},
      printErr: this.options.verbose ? console.error : () => {},
      onProgress: (_phase: string, percent: number, message: string) => {
        // Map loader progress to our progress phases
        this.emitProgress('loading', percent, message);
      },
    };

    return await loader.createModule(config);
  }

  /**
   * Load module in browser environment
   */
  private async loadBrowserModule(wasmPath: string): Promise<EmscriptenModule> {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createModule = (window as any).createSofficeModule as ModuleFactory | undefined;

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
  private async initializeLibreOfficeKit(): Promise<void> {
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
        `Failed to initialize LibreOfficeKit: ${error}`
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
          `Failed to read converted file: ${fsError}`
        );
      }
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }
      throw new ConversionError(
        ConversionErrorCode.CONVERSION_FAILED,
        `Conversion failed: ${error}`
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
   * @param options Conversion options (inputFormat required)
   * @param width Preview width in pixels (default: 256)
   * @param height Preview height in pixels (0 = auto based on aspect ratio)
   * @param pageIndices Specific page indices to render (empty = all pages)
   * @returns Array of page preview data with RGBA pixels
   */
  async renderPagePreviews(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions,
    width: number = 256,
    height: number = 0,
    pageIndices: number[] = []
  ): Promise<Array<{ page: number; data: Uint8Array; width: number; height: number }>> {
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
        'Input format is required for page preview'
      );
    }

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

        const results: Array<{
          page: number;
          data: Uint8Array;
          width: number;
          height: number;
        }> = [];

        // Render each page
        for (const pageIndex of pagesToRender) {
          if (this.options.verbose) {
            console.log(`[Preview] Rendering page ${pageIndex + 1}/${numParts}`);
          }

          const preview = this.lokBindings.renderPage(docPtr, pageIndex, width, height);
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
   * Get the number of pages/parts in a document
   */
  async getPageCount(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions
  ): Promise<number> {
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
   * @param options Conversion options with inputFormat
   * @returns Object with document type and valid output formats
   */
  async getDocumentInfo(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions
  ): Promise<{
    documentType: LOKDocumentType;
    documentTypeName: string;
    validOutputFormats: OutputFormat[];
    pageCount: number;
  }> {
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

  /**
   * Get LOK bindings for advanced operations
   * Use with caution - this exposes low-level API
   * @returns LOK bindings instance or null
   */
  getLokBindings(): typeof this.lokBindings {
    return this.lokBindings;
  }

  /**
   * Destroy the LibreOffice instance and free resources
   */
  async destroy(): Promise<void> {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = this.module as any;

        // Try to terminate all pthread workers
        if (mod.PThread?.terminateAllThreads) {
          mod.PThread.terminateAllThreads();
        }

        // Unref any running workers to allow process to exit
        if (mod.PThread?.runningWorkers) {
          for (const worker of mod.PThread.runningWorkers) {
            if (worker && typeof worker.unref === 'function') {
              worker.unref();
            }
            if (worker && typeof worker.terminate === 'function') {
              worker.terminate();
            }
          }
          mod.PThread.runningWorkers = [];
        }

        // Also check unusedWorkers
        if (mod.PThread?.unusedWorkers) {
          for (const worker of mod.PThread.unusedWorkers) {
            if (worker && typeof worker.unref === 'function') {
              worker.unref();
            }
            if (worker && typeof worker.terminate === 'function') {
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
    if (isNode && typeof process !== 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proc = process as any;
        if (typeof proc._getActiveHandles === 'function') {
          const handles = proc._getActiveHandles();
          for (const handle of handles) {
            // Only unref handles that look like worker-related (MessagePort, internal sockets)
            if (handle && typeof handle.unref === 'function') {
              const name = handle.constructor?.name || '';
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

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
} from './types.js';
import { LOKBindings } from './lok-bindings.js';

// Declare the module factory type
type ModuleFactory = (config: Partial<EmscriptenModule>) => Promise<EmscriptenModule>;

// Check if running in Node.js
const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

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
    // Dynamic imports for Node.js only
    const pathModule = await import('path');
    const { fileURLToPath } = await import('url');
    const fsModule = await import('fs');
    const { createRequire } = await import('module');

    // Resolve absolute path
    let absolutePath = wasmPath;
    if (!pathModule.isAbsolute(wasmPath)) {
      let currentDir: string;
      try {
        // ESM
        currentDir = pathModule.dirname(fileURLToPath(import.meta.url));
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
    const require = createRequire(import.meta.url);
    
    // Load the loader module
    const loader = require(pathModule.resolve(loaderPath));

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

/**
 * LibreOffice WASM Document Conversion Types
 * Headless document format conversion toolkit
 */

/**
 * Supported input document formats
 */
export type InputFormat =
  // Microsoft Office formats
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  // OpenDocument formats
  | 'odt'
  | 'ods'
  | 'odp'
  | 'odg'
  | 'odf'
  // Other formats
  | 'rtf'
  | 'txt'
  | 'html'
  | 'htm'
  | 'csv'
  | 'xml'
  | 'epub'
  | 'pdf';

/**
 * Supported output document formats
 */
export type OutputFormat =
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'odt'
  | 'rtf'
  | 'txt'
  | 'html'
  | 'xlsx'
  | 'xls'
  | 'ods'
  | 'csv'
  | 'pptx'
  | 'ppt'
  | 'odp'
  | 'png'
  | 'jpg'
  | 'svg';

/**
 * Document conversion options
 */
export interface ConversionOptions {
  /**
   * Output format for the conversion
   */
  outputFormat: OutputFormat;

  /**
   * Input format hint (auto-detected if not provided)
   */
  inputFormat?: InputFormat;

  /**
   * PDF-specific options
   */
  pdf?: PdfOptions;

  /**
   * Image output options (for png, jpg, svg)
   */
  image?: ImageOptions;

  /**
   * Password for encrypted documents
   */
  password?: string;
}

/**
 * PDF-specific conversion options
 */
export interface PdfOptions {
  /**
   * PDF/A conformance level
   */
  pdfaLevel?: 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';

  /**
   * PDF quality (0-100, affects image compression)
   * @default 90
   */
  quality?: number;
}

/**
 * Image output options
 */
export interface ImageOptions {
  /**
   * Image width in pixels
   */
  width?: number;

  /**
   * Image height in pixels
   */
  height?: number;

  /**
   * DPI for rendering
   * @default 150
   */
  dpi?: number;

  /**
   * Page index to export (0-based). Only exports this single page.
   * If not specified, exports the first page (page 0).
   * Cannot be used together with `pages`.
   */
  pageIndex?: number;

  /**
   * Array of page indices to export (0-based).
   * If specified, returns an array of results (one per page).
   * Cannot be used together with `pageIndex`.
   */
  pages?: number[];
}

/**
 * Result of a document conversion
 */
export interface ConversionResult {
  /**
   * The converted document data
   */
  data: Uint8Array;

  /**
   * MIME type of the output
   */
  mimeType: string;

  /**
   * Suggested filename with new extension
   */
  filename: string;

  /**
   * Conversion duration in milliseconds
   */
  duration: number;
}

/**
 * WASM loader module interface
 * This is the interface for the loader.cjs module that creates the Emscripten module
 */
export interface WasmLoaderModule {
  createModule: (config: Record<string, unknown>) => Promise<EmscriptenModule>;
}

/**
 * LibreOffice WASM module initialization options (Node.js)
 */
export interface LibreOfficeWasmOptions {
  /**
   * Path to WASM files directory
   * @default './wasm'
   */
  wasmPath?: string;

  /**
   * Path to the worker script (for WorkerConverter)
   * When not specified, auto-detected based on module location
   */
  workerPath?: string;

  /**
   * Pre-loaded WASM loader module
   * When provided, bypasses dynamic require of loader.cjs
   * This is useful for bundlers like Turbopack that can't handle dynamic requires
   *
   * @example
   * ```typescript
   * // In your code, import the loader statically
   * import * as wasmLoader from '@matbee/libreoffice-converter/wasm/loader.cjs';
   *
   * const converter = new LibreOfficeConverter({
   *   wasmPath: './wasm',
   *   wasmLoader,
   * });
   * ```
   */
  wasmLoader?: WasmLoaderModule;

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;

  /**
   * Called when WASM module is ready
   */
  onReady?: () => void;

  /**
   * Called on initialization error
   */
  onError?: (error: Error) => void;

  /**
   * Called with progress updates during initialization
   */
  onProgress?: (progress: ProgressInfo) => void;
}

/**
 * Explicit paths to WASM files (Browser)
 * All paths are required when specified explicitly
 */
export interface BrowserWasmPaths {
  /** URL to soffice.js - the main Emscripten loader script */
  sofficeJs: string;
  /** URL to soffice.wasm - the WebAssembly binary (~112MB) */
  sofficeWasm: string;
  /** URL to soffice.data - the virtual filesystem image (~80MB) */
  sofficeData: string;
  /** URL to soffice.worker.js - the Emscripten pthread worker */
  sofficeWorkerJs: string;
}

/**
 * Browser converter initialization options
 * All WASM paths are optional and default to /wasm/ via createWasmPaths()
 */
export interface BrowserConverterOptions {
  /** URL to soffice.js - defaults to /wasm/soffice.js */
  sofficeJs?: string;
  /** URL to soffice.wasm - defaults to /wasm/soffice.wasm */
  sofficeWasm?: string;
  /** URL to soffice.data - defaults to /wasm/soffice.data */
  sofficeData?: string;
  /** URL to soffice.worker.js - defaults to /wasm/soffice.worker.js */
  sofficeWorkerJs?: string;

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;

  /**
   * Called when WASM module is ready
   */
  onReady?: () => void;

  /**
   * Called on initialization error
   */
  onError?: (error: Error) => void;

  /**
   * Called with progress updates during initialization
   */
  onProgress?: (progress: WasmLoadProgress) => void;
}

/**
 * Worker browser converter initialization options
 * All WASM paths are optional and default to /wasm/ via createWasmPaths()
 */
export interface WorkerBrowserConverterOptions extends BrowserConverterOptions {
  /** URL to browser.worker.js - defaults to /dist/browser.worker.global.js */
  browserWorkerJs?: string;
}

/**
 * Internal type for BrowserConverterOptions after defaults are applied
 * All WASM paths are guaranteed to be defined
 */
export type ResolvedBrowserConverterOptions = BrowserConverterOptions & BrowserWasmPaths;

/**
 * Internal type for WorkerBrowserConverterOptions after defaults are applied
 * All WASM paths and browserWorkerJs are guaranteed to be defined
 */
export type ResolvedWorkerBrowserConverterOptions = WorkerBrowserConverterOptions & BrowserWasmPaths & {
  browserWorkerJs: string;
};

/**
 * Default URL for WASM files - relative path for same-origin hosting
 * Users typically serve WASM files from their own server at /wasm/
 */
export const DEFAULT_WASM_BASE_URL = '/wasm/';

/**
 * Create WASM file paths from a base URL
 * Convenience helper for users who keep all WASM files in one directory
 *
 * Note: WASM files are shipped as .gz compressed files by default.
 * Your server must serve these with Content-Encoding: gzip header,
 * or configure your CDN to handle gzip decompression transparently.
 *
 * @param baseUrl - Base URL ending with '/' (e.g., '/wasm/', 'https://cdn.example.com/wasm/')
 *                  Defaults to '/wasm/' for same-origin hosting
 * @returns Object with all WASM file paths (pointing to .gz files)
 *
 * @example
 * ```typescript
 * // Use default /wasm/ path (same-origin)
 * const converter = new WorkerBrowserConverter({
 *   ...createWasmPaths(),
 *   browserWorkerJs: '/dist/browser.worker.js',
 * });
 *
 * // Or use your own CDN
 * const converter = new WorkerBrowserConverter({
 *   ...createWasmPaths('https://cdn.example.com/wasm/'),
 *   browserWorkerJs: '/dist/browser.worker.js',
 * });
 * ```
 */
export function createWasmPaths(baseUrl: string = DEFAULT_WASM_BASE_URL): BrowserWasmPaths {
  // Ensure baseUrl ends with /
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return {
    sofficeJs: `${base}soffice.js`,
    sofficeWasm: `${base}soffice.wasm.gz`,
    sofficeData: `${base}soffice.data.gz`,
    sofficeWorkerJs: `${base}soffice.worker.js`,
  };
}

/**
 * Loading phases for WASM initialization
 * Used to track detailed progress during the ~80 second browser startup
 */
export type WasmLoadPhase =
  | 'download-wasm'    // Downloading soffice.wasm (~142MB)
  | 'download-data'    // Downloading soffice.data (~96MB)
  | 'compile'          // WebAssembly compilation
  | 'filesystem'       // Emscripten filesystem setup
  | 'lok-init'         // LibreOfficeKit initialization
  | 'ready' | 'starting' | 'loading' | 'initializing' | 'converting' | 'complete';           // Complete

/**
 * Extended progress information with download details
 * Backward compatible - existing code using percent/message continues to work
 */
export interface WasmLoadProgress {
  /** Overall progress 0-100 */
  percent: number;
  /** Human-readable status message */
  message: string;
  /** Current loading phase */
  phase: WasmLoadPhase;
  /** Bytes downloaded (present during download phases) */
  bytesLoaded?: number;
  /** Total bytes to download (present during download phases) */
  bytesTotal?: number;
}

/**
 * Progress information
 * @deprecated Use WasmLoadProgress for richer progress data
 */
export interface ProgressInfo {
  phase: 'loading' | 'initializing' | 'converting' | 'complete';
  percent: number;
  message: string;
}

/**
 * Error codes for conversion failures
 */
export enum ConversionErrorCode {
  UNKNOWN = 'UNKNOWN',
  INVALID_INPUT = 'INVALID_INPUT',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  CORRUPTED_DOCUMENT = 'CORRUPTED_DOCUMENT',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  WASM_NOT_INITIALIZED = 'WASM_NOT_INITIALIZED',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  LOAD_FAILED = 'LOAD_FAILED',
}

/**
 * Custom error class for conversion errors
 */
export class ConversionError extends Error {
  public readonly code: ConversionErrorCode;
  public readonly details?: string;

  constructor(code: ConversionErrorCode, message: string, details?: string) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Emscripten Module interface
 */
export interface EmscriptenModule {
  // Core Emscripten functions
  ccall: (
    name: string,
    returnType: string | null,
    argTypes: string[],
    args: unknown[]
  ) => unknown;
  cwrap: (
    name: string,
    returnType: string | null,
    argTypes: string[]
  ) => (...args: unknown[]) => unknown;

  // Memory management
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;

  // File system
  FS: EmscriptenFS;

  // Lifecycle
  onRuntimeInitialized?: () => void;
  calledRun?: boolean;

  // LibreOfficeKit hooks (exported C functions)
  _lok_preinit?: (path: number, args: number) => number;
  _lok_preinit_2?: (path: number, args: number, callback: number) => number;
  _libreofficekit_hook?: (path: number) => number;
  _libreofficekit_hook_2?: (path: number, userProfile: number) => number;
  _main?: (argc: number, argv: number) => number;

  // WebAssembly function table for indirect calls
  wasmTable?: WebAssembly.Table;

  // Module locator
  locateFile?: (path: string) => string;
  print?: (text: string) => void;
  printErr?: (text: string) => void;

  // Runtime ready promise (some builds)
  ready?: Promise<EmscriptenModule>;
}

/**
 * Emscripten virtual filesystem
 */
export interface EmscriptenFS {
  mkdir: (path: string) => void;
  writeFile: (path: string, data: Uint8Array | string, opts?: { encoding?: string }) => void;
  readFile: (path: string, opts?: { encoding?: string }) => Uint8Array | string;
  unlink: (path: string) => void;
  readdir: (path: string) => string[];
  stat: (path: string) => { size: number; isDirectory: () => boolean };
  rmdir: (path: string) => void;
  rename: (oldPath: string, newPath: string) => void;
  open: (path: string, flags: unknown, mode?: unknown) => unknown;
}

/**
 * Filter name mapping for LibreOffice export
 * Note: For image exports, use getFilterForDocType() instead as filters are document-type specific
 */
export const FORMAT_FILTERS: Record<OutputFormat, string> = {
  pdf: 'writer_pdf_Export',
  docx: 'MS Word 2007 XML',
  doc: 'MS Word 97',
  odt: 'writer8',
  rtf: 'Rich Text Format',
  txt: 'Text',
  html: 'HTML (StarWriter)',
  xlsx: 'Calc MS Excel 2007 XML',
  xls: 'MS Excel 97',
  ods: 'calc8',
  csv: 'Text - txt - csv (StarCalc)',
  pptx: 'Impress MS PowerPoint 2007 XML',
  ppt: 'MS PowerPoint 97',
  odp: 'impress8',
  png: 'writer_png_Export',
  jpg: 'writer_jpg_Export',
  svg: 'writer_svg_Export',
};

/**
 * LibreOfficeKit document types (from LibreOfficeKitEnums.h)
 */
export enum LOKDocumentType {
  TEXT = 0,
  SPREADSHEET = 1,
  PRESENTATION = 2,
  DRAWING = 3,
  OTHER = 4,
}

/**
 * Document-type-specific filters for image and PDF exports
 * Each document type (Writer, Calc, Impress, Draw) has its own export filters
 */
export const DOC_TYPE_FILTERS: Record<LOKDocumentType, Partial<Record<OutputFormat, string>>> = {
  [LOKDocumentType.TEXT]: {
    pdf: 'writer_pdf_Export',
    png: 'writer_png_Export',
    jpg: 'writer_jpg_Export',
    svg: 'writer_svg_Export',
    html: 'HTML (StarWriter)',
  },
  [LOKDocumentType.SPREADSHEET]: {
    pdf: 'calc_pdf_Export',
    png: 'calc_png_Export',
    jpg: 'calc_jpg_Export',
    svg: 'calc_svg_Export',
    html: 'HTML (StarCalc)',
  },
  [LOKDocumentType.PRESENTATION]: {
    pdf: 'impress_pdf_Export',
    png: 'impress_png_Export',
    jpg: 'impress_jpg_Export',
    svg: 'impress_svg_Export',
    html: 'impress_html_Export',
  },
  [LOKDocumentType.DRAWING]: {
    pdf: 'draw_pdf_Export',
    png: 'draw_png_Export',
    jpg: 'draw_jpg_Export',
    svg: 'draw_svg_Export',
    html: 'draw_html_Export',
  },
  [LOKDocumentType.OTHER]: {
    pdf: 'writer_pdf_Export',
    png: 'writer_png_Export',
    jpg: 'writer_jpg_Export',
    svg: 'writer_svg_Export',
  },
};

/**
 * Get the correct export filter for a given output format and document type
 * @param outputFormat The desired output format
 * @param docType The LibreOfficeKit document type (use documentGetDocumentType())
 * @returns The filter name to use for saveAs
 */
export function getFilterForDocType(outputFormat: OutputFormat, docType: LOKDocumentType | number): string {
  // Check if there's a document-type-specific filter
  const docTypeFilters = DOC_TYPE_FILTERS[docType as LOKDocumentType];
  if (docTypeFilters && docTypeFilters[outputFormat]) {
    return docTypeFilters[outputFormat];
  }
  
  // Fall back to the default filter
  return FORMAT_FILTERS[outputFormat];
}

/**
 * MIME types for output formats
 */
export const FORMAT_MIME_TYPES: Record<OutputFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  txt: 'text/plain',
  html: 'text/html',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation',
  png: 'image/png',
  jpg: 'image/jpeg',
  svg: 'image/svg+xml',
};

/**
 * File extension to format mapping
 */
export const EXTENSION_TO_FORMAT: Record<string, InputFormat> = {
  doc: 'doc',
  docx: 'docx',
  xls: 'xls',
  xlsx: 'xlsx',
  ppt: 'ppt',
  pptx: 'pptx',
  odt: 'odt',
  ods: 'ods',
  odp: 'odp',
  odg: 'odg',
  odf: 'odf',
  rtf: 'rtf',
  txt: 'txt',
  html: 'html',
  htm: 'html',
  csv: 'csv',
  xml: 'xml',
  epub: 'epub',
  pdf: 'pdf',
};

/**
 * Map LOK document type to valid output formats
 * This is based on LibreOffice's actual extension maps in desktop/source/lib/init.cxx
 * 
 * IMPORTANT: These are the formats that LibreOffice's saveAs() actually supports.
 * The extension maps in init.cxx determine what filters are available per document type.
 * 
 * Writer (TEXT): doc, docx, odt, pdf, rtf, txt, html, png, epub
 * Calc (SPREADSHEET): csv, ods, pdf, xls, xlsx, html, png
 * Impress (PRESENTATION): odp, pdf, ppt, pptx, svg, html, png
 * Draw (DRAWING): odg, pdf, svg, html, png
 * 
 * NOTE: jpg is NOT in any extension map! Only png is supported for image export.
 * NOTE: svg is only supported for Impress and Draw, not Writer or Calc.
 */
export const LOK_DOCTYPE_OUTPUT_FORMATS: Record<LOKDocumentType, OutputFormat[]> = {
  [LOKDocumentType.TEXT]: ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'png'],
  [LOKDocumentType.SPREADSHEET]: ['pdf', 'xlsx', 'xls', 'ods', 'csv', 'html', 'png'],
  [LOKDocumentType.PRESENTATION]: ['pdf', 'pptx', 'ppt', 'odp', 'png', 'svg', 'html'],
  [LOKDocumentType.DRAWING]: ['pdf', 'png', 'svg', 'html'],
  [LOKDocumentType.OTHER]: ['pdf'],
};

/**
 * Get valid output formats for a LOK document type
 * Use this after loading a document to get accurate conversion options
 * @param docType The LOK document type (from documentGetDocumentType)
 * @returns Array of valid output formats
 */
export function getOutputFormatsForDocType(docType: LOKDocumentType | number): OutputFormat[] {
  return LOK_DOCTYPE_OUTPUT_FORMATS[docType as LOKDocumentType] || ['pdf'];
}

/**
 * Map output format to LOK format string
 * These are the format names used by LibreOfficeKit's saveAs
 */
export const OUTPUT_FORMAT_TO_LOK: Record<OutputFormat, string> = {
  pdf: 'pdf',
  docx: 'docx',
  doc: 'doc',
  odt: 'odt',
  rtf: 'rtf',
  txt: 'txt',
  html: 'html',
  xlsx: 'xlsx',
  xls: 'xls',
  ods: 'ods',
  csv: 'csv',
  pptx: 'pptx',
  ppt: 'ppt',
  odp: 'odp',
  png: 'png',
  jpg: 'jpg',
  svg: 'svg',
};

/**
 * Filter options for specific format conversions
 * These are passed to LibreOfficeKit's saveAs as the filterOptions parameter
 */
export const FORMAT_FILTER_OPTIONS: Partial<Record<OutputFormat, string>> = {
  // PDF options can include things like:
  // - SelectPdfVersion (0=PDF 1.4, 1=PDF/A-1, 2=PDF/A-2, 3=PDF/A-3)
  // - UseLosslessCompression
  // - Quality
  pdf: '',
  // CSV can specify separator, encoding, etc.
  csv: '44,34,76,1,,0,false,true,false,false,false,-1',
  // Text encoding
  txt: 'UTF8',
};

/**
 * Document type categories for determining valid conversions
 */
export type DocumentCategory = 'text' | 'spreadsheet' | 'presentation' | 'drawing' | 'other';

/**
 * Map input formats to their document category
 * This determines which output formats are valid
 */
export const INPUT_FORMAT_CATEGORY: Record<InputFormat, DocumentCategory> = {
  // Text/Writer documents
  doc: 'text',
  docx: 'text',
  odt: 'text',
  rtf: 'text',
  txt: 'text',
  html: 'text',
  htm: 'text',
  epub: 'text',
  xml: 'text',
  // Spreadsheet/Calc documents
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  ods: 'spreadsheet',
  csv: 'spreadsheet',
  // Presentation/Impress documents
  ppt: 'presentation',
  pptx: 'presentation',
  odp: 'presentation',
  // Drawing/Draw documents (PDF imports as Draw)
  odg: 'drawing',
  odf: 'drawing',
  pdf: 'drawing', // PDFs are imported as Draw documents
};

/**
 * Valid output formats for each document category
 * Based on LibreOffice's actual filter capabilities
 */
export const CATEGORY_OUTPUT_FORMATS: Record<DocumentCategory, OutputFormat[]> = {
  // Writer documents can export to (based on aWriterExtensionMap in init.cxx):
  // NOTE: jpg and svg are NOT supported for Writer - only png for images
  text: ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'png'],
  // Calc documents can export to (based on aCalcExtensionMap in init.cxx):
  // NOTE: jpg and svg are NOT supported for Calc - only png for images
  spreadsheet: ['pdf', 'xlsx', 'xls', 'ods', 'csv', 'html', 'png'],
  // Impress documents can export to (based on aImpressExtensionMap in init.cxx):
  // NOTE: jpg is NOT supported - only png and svg for images
  presentation: ['pdf', 'pptx', 'ppt', 'odp', 'png', 'svg', 'html'],
  // Draw documents (including imported PDFs) can export to (based on aDrawExtensionMap in init.cxx):
  // NOTE: jpg is NOT supported - only png and svg for images
  drawing: ['pdf', 'png', 'svg', 'html'],
  // Other/unknown - try PDF only
  other: ['pdf'],
};

/**
 * Get valid output formats for a given input format
 * @param inputFormat The input document format
 * @returns Array of valid output formats
 */
export function getValidOutputFormats(inputFormat: InputFormat | string): OutputFormat[] {
  const format = inputFormat.toLowerCase() as InputFormat;
  const category = INPUT_FORMAT_CATEGORY[format];
  
  if (!category) {
    // Unknown format - allow PDF as a safe default
    return ['pdf'];
  }
  
  return CATEGORY_OUTPUT_FORMATS[category];
}

/**
 * Check if a conversion from input format to output format is valid
 * @param inputFormat The input document format
 * @param outputFormat The desired output format
 * @returns true if the conversion is supported
 */
export function isConversionValid(
  inputFormat: InputFormat | string,
  outputFormat: OutputFormat | string
): boolean {
  const validOutputs = getValidOutputFormats(inputFormat);
  return validOutputs.includes(outputFormat.toLowerCase() as OutputFormat);
}

/**
 * Get a human-readable error message for invalid conversions
 * @param inputFormat The input document format
 * @param outputFormat The desired output format
 * @returns Error message explaining why the conversion is not supported
 */
export function getConversionErrorMessage(
  inputFormat: InputFormat | string,
  outputFormat: OutputFormat | string
): string {
  const input = inputFormat.toLowerCase();
  const output = outputFormat.toLowerCase();
  const validOutputs = getValidOutputFormats(input as InputFormat);
  
  const category = INPUT_FORMAT_CATEGORY[input as InputFormat] || 'unknown';
  
  let reason = '';
  if (category === 'drawing' && ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(output)) {
    reason = `PDF files are imported as Draw documents and cannot be exported to Office formats. `;
  } else if (category === 'spreadsheet' && ['docx', 'doc', 'pptx', 'ppt'].includes(output)) {
    reason = `Spreadsheet documents cannot be converted to word processing or presentation formats. `;
  } else if (category === 'presentation' && ['docx', 'doc', 'xlsx', 'xls'].includes(output)) {
    reason = `Presentation documents cannot be converted to word processing or spreadsheet formats. `;
  } else if (category === 'text' && ['xlsx', 'xls', 'pptx', 'ppt'].includes(output)) {
    reason = `Text documents cannot be converted to spreadsheet or presentation formats. `;
  }
  
  return `Cannot convert ${input.toUpperCase()} to ${output.toUpperCase()}. ${reason}Valid output formats for ${input.toUpperCase()}: ${validOutputs.join(', ')}`;
}

// ============================================
// Shared Converter Interface
// ============================================

/**
 * Page preview data returned by renderPage/renderPagePreviews
 */
export interface PagePreview {
  page: number;
  data: Uint8Array;
  width: number;
  height: number;
}

/**
 * Document information returned by getDocumentInfo
 */
export interface DocumentInfo {
  documentType: LOKDocumentType | number;
  documentTypeName: string;
  validOutputFormats: OutputFormat[];
  pageCount: number;
}

/**
 * Options for rendering page previews
 */
export interface RenderOptions {
  /** Width of rendered image in pixels */
  width?: number;
  /** Height of rendered image in pixels (0 = auto based on aspect ratio) */
  height?: number;
  /** Specific page indices to render (0-based). If empty, renders all pages */
  pageIndices?: number[];
  /**
   * Render in edit mode (shows text input boxes, cursors, etc.)
   * Default is false - presentations render in view/read mode for clean output
   */
  editMode?: boolean;
}

/**
 * Options for full quality page rendering
 */
export interface FullQualityRenderOptions {
  /** DPI for rendering (default 150, use 300 for print quality) */
  dpi?: number;
  /** Maximum dimension (width or height) to prevent memory issues */
  maxDimension?: number;
  /**
   * Render in edit mode (shows text input boxes, cursors, etc.)
   * Default is false - presentations render in view/read mode for clean output
   */
  editMode?: boolean;
}

/**
 * Full quality page preview with DPI information
 */
export interface FullQualityPagePreview extends PagePreview {
  /** Effective DPI (may differ from requested if capped) */
  dpi: number;
}

/**
 * Editor session returned from openDocument
 */
export interface EditorSession {
  sessionId: string;
  documentType: string;
  pageCount: number;
}

/**
 * Result from editor operations
 */
export interface EditorOperationResult<T = unknown> {
  success: boolean;
  verified?: boolean;
  data?: T;
  error?: string;
  suggestion?: string;
}

/**
 * Options containing input format for document operations.
 */
export type InputFormatOptions = Pick<ConversionOptions, 'inputFormat'>;

/**
 * Common interface for all LibreOffice converter implementations.
 * Ensures consistent API across different threading models (main thread, workers, child processes).
 *
 * All methods returning Promise are async in the interface to allow implementations
 * flexibility in whether they need actual async operations.
 */
export interface ILibreOfficeConverter {
  // ============================================
  // Lifecycle
  // ============================================

  /** Initialize the converter. Must be called before any other operations. */
  initialize(): Promise<void>;

  /** Destroy the converter and release all resources. */
  destroy(): Promise<void>;

  /** Check if the converter is ready for operations. */
  isReady(): boolean;

  // ============================================
  // Core Conversion
  // ============================================

  /** Convert a document to a different format. */
  convert(
    input: Uint8Array | ArrayBuffer,
    options: ConversionOptions,
    filename?: string
  ): Promise<ConversionResult>;

  // ============================================
  // Document Inspection
  // ============================================

  /** Get the number of pages in a document. */
  getPageCount(
    input: Uint8Array | ArrayBuffer,
    options: InputFormatOptions
  ): Promise<number>;

  /** Get document information including type and valid output formats. */
  getDocumentInfo(
    input: Uint8Array | ArrayBuffer,
    options: InputFormatOptions
  ): Promise<DocumentInfo>;

  // ============================================
  // Page Rendering
  // ============================================

  /** Render a single page as an image. */
  renderPage(
    input: Uint8Array | ArrayBuffer,
    options: InputFormatOptions,
    pageIndex: number,
    width: number,
    height?: number
  ): Promise<PagePreview>;

  /** Render multiple pages as images. */
  renderPagePreviews(
    input: Uint8Array | ArrayBuffer,
    options: InputFormatOptions,
    renderOptions?: RenderOptions
  ): Promise<PagePreview[]>;

  /**
   * Render a page at full quality (native resolution based on DPI).
   * Unlike renderPage which scales to a fixed width, this renders at the
   * document's native resolution converted to pixels at the specified DPI.
   */
  renderPageFullQuality(
    input: Uint8Array | ArrayBuffer,
    options: InputFormatOptions,
    pageIndex: number,
    renderOptions?: FullQualityRenderOptions
  ): Promise<FullQualityPagePreview>;

  // ============================================
  // Editor Operations
  // ============================================

  /** Open a document for editing and return a session. */
  openDocument(
    input: Uint8Array | ArrayBuffer,
    options: InputFormatOptions
  ): Promise<EditorSession>;

  /** Execute an editor operation on an open document. */
  editorOperation<T = unknown>(
    sessionId: string,
    method: string,
    args?: unknown[]
  ): Promise<EditorOperationResult<T>>;

  /** Close an editor session and optionally get the modified document. */
  closeDocument(sessionId: string): Promise<Uint8Array | undefined>;
}

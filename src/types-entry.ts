/**
 * LibreOffice WASM Document Converter - Types Only
 *
 * This entry point exports only types, no runtime code.
 * Safe to import from client components without pulling in Node.js dependencies.
 *
 * @example
 * ```typescript
 * // In client components (React, Vue, etc.)
 * import type { ConversionOptions, OutputFormat } from '@matbee/libreoffice-converter/types';
 * ```
 *
 * @packageDocumentation
 */

// ============================================
// Core conversion types
// ============================================

export type {
  InputFormat,
  OutputFormat,
  ConversionOptions,
  ConversionResult,
  PdfOptions,
  ImageOptions,
  ProgressInfo,
  WasmLoadPhase,
  WasmLoadProgress,
  DocumentCategory,
} from './types.js';

// ============================================
// Configuration types
// ============================================

export type {
  LibreOfficeWasmOptions,
  BrowserWasmPaths,
  BrowserConverterOptions,
  WorkerBrowserConverterOptions,
} from './types.js';

// ============================================
// Emscripten module types (for advanced usage)
// ============================================

export type {
  EmscriptenModule,
  EmscriptenFS,
} from './types.js';

// ============================================
// Converter interface types
// ============================================

export type {
  ILibreOfficeConverter,
  InputFormatOptions,
  PagePreview,
  FullQualityPagePreview,
  RenderOptions,
  FullQualityRenderOptions,
  DocumentInfo,
  EditorSession,
  EditorOperationResult,
} from './types.js';

// ============================================
// Error types and codes
// ============================================

export {
  ConversionError,
  ConversionErrorCode,
} from './types.js';

// ============================================
// Format constants (runtime values, but small)
// ============================================

export {
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  EXTENSION_TO_FORMAT,
  INPUT_FORMAT_CATEGORY,
  CATEGORY_OUTPUT_FORMATS,
  LOKDocumentType,
  LOK_DOCTYPE_OUTPUT_FORMATS,
} from './types.js';

// ============================================
// Validation helpers (pure functions, no deps)
// ============================================

export {
  getValidOutputFormats,
  isConversionValid,
  getConversionErrorMessage,
  getOutputFormatsForDocType,
  createWasmPaths,
  DEFAULT_WASM_BASE_URL,
} from './types.js';

// ============================================
// Editor types
// ============================================

export type {
  // Operation result types
  OperationResult,
  TruncationInfo,
  OpenDocumentOptions,
  // Writer types
  TextPosition,
  TextRange,
  TextFormat,
  Paragraph,
  WriterStructure,
  // Calc types
  CellRef,
  RangeRef,
  ColRef,
  SheetRef,
  CellValue,
  CellData,
  CellFormat,
  SheetInfo,
  CalcStructure,
  // Impress types
  SlideLayout,
  TextFrame,
  SlideData,
  SlideInfo,
  ImpressStructure,
  // Draw types
  ShapeType,
  ShapeData,
  PageData,
  PageInfo,
  DrawStructure,
  // Common types
  Rectangle,
  Size,
  Position,
  DocumentMetadata,
  DocumentStructure,
  DocumentType,
  SelectionRange,
  FindOptions,
} from './editor/types.js';

// LLM tool types (from tools.ts, not types.ts)
export type {
  ToolDefinition,
  CommonToolName,
  WriterToolName,
  CalcToolName,
  ImpressToolName,
  DrawToolName,
  DocumentToolName,
  AllToolName,
  ToolParameters,
} from './editor/tools.js';

// ============================================
// Image utility types
// ============================================

export type { ImageEncodeOptions } from './image-utils.js';

/**
 * Image format options for exportAsImage
 */
export type ImageFormat = 'png' | 'jpg' | 'svg';

/**
 * LibreOffice WASM Document Converter - Server/Node.js Entry Point
 *
 * This entry point exports all Node.js-specific converters and utilities.
 * Use this for server-side code (API routes, server components, etc.)
 *
 * @example
 * ```typescript
 * // In Next.js API routes or server components
 * import { WorkerConverter, createWorkerConverter } from '@matbee/libreoffice-converter/server';
 *
 * const converter = await createWorkerConverter({ wasmPath: './wasm' });
 * const result = await converter.convert(docxBuffer, { outputFormat: 'pdf' });
 * ```
 *
 * @packageDocumentation
 */

// ============================================
// Converter Classes (Node.js only)
// ============================================

export { LibreOfficeConverter } from './converter-node.js';
export { WorkerConverter, createWorkerConverter } from './node.worker-converter.js';
export { SubprocessConverter, createSubprocessConverter } from './subprocess.worker-converter.js';

// ============================================
// Image encoding utilities
// ============================================

export {
  encodeImage,
  rgbaToPng,
  rgbaToJpeg,
  rgbaToWebp,
  isSharpAvailable,
  getSharp,
} from './image-utils.js';
export type { ImageEncodeOptions } from './image-utils.js';

// ============================================
// Convenience functions
// ============================================

import { LibreOfficeConverter } from './converter-node.js';
import { createSubprocessConverter } from './subprocess.worker-converter.js';
import type { ConversionOptions, ConversionResult, LibreOfficeWasmOptions } from './types.js';

/**
 * Create a configured LibreOffice converter instance
 */
export async function createConverter(
  options?: LibreOfficeWasmOptions
): Promise<LibreOfficeConverter> {
  const converter = new LibreOfficeConverter(options);
  await converter.initialize();
  return converter;
}

/**
 * Quick conversion utility - creates converter, converts, then destroys
 * Uses SubprocessConverter for clean process exit (no hanging pthread workers)
 */
export async function convertDocument(
  input: Uint8Array | ArrayBuffer | Buffer,
  options: ConversionOptions,
  converterOptions?: LibreOfficeWasmOptions
): Promise<ConversionResult> {
  const converter = await createSubprocessConverter(converterOptions);
  try {
    return await converter.convert(input, options);
  } finally {
    await converter.destroy();
  }
}

// ============================================
// Types (re-exported for convenience)
// ============================================

export type {
  ConversionOptions,
  ConversionResult,
  ImageOptions,
  InputFormat,
  LibreOfficeWasmOptions,
  OutputFormat,
  PdfOptions,
  ProgressInfo,
  DocumentCategory,
  WasmLoadPhase,
  WasmLoadProgress,
  ILibreOfficeConverter,
  InputFormatOptions,
  PagePreview,
  FullQualityPagePreview,
  RenderOptions,
  FullQualityRenderOptions,
  DocumentInfo,
  EditorSession,
  EditorOperationResult,
  EmscriptenModule,
  EmscriptenFS,
  WasmLoaderModule,
  // Abort API
  OperationState,
} from './types.js';

export {
  ConversionError,
  ConversionErrorCode,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  EXTENSION_TO_FORMAT,
  getValidOutputFormats,
  isConversionValid,
  getConversionErrorMessage,
  INPUT_FORMAT_CATEGORY,
  CATEGORY_OUTPUT_FORMATS,
  LOKDocumentType,
  LOK_DOCTYPE_OUTPUT_FORMATS,
  getOutputFormatsForDocType,
  createWasmPaths,
  DEFAULT_WASM_BASE_URL,
  // Abort API
  OPERATION_STATE,
} from './types.js';

// ============================================
// LOK constants for advanced usage
// ============================================

export {
  LOK_MOUSEEVENT_BUTTONDOWN,
  LOK_MOUSEEVENT_BUTTONUP,
  LOK_MOUSEEVENT_MOVE,
  LOK_KEYEVENT_KEYINPUT,
  LOK_KEYEVENT_KEYUP,
  LOK_SELTYPE_NONE,
  LOK_SELTYPE_TEXT,
  LOK_SELTYPE_CELL,
  LOK_SETTEXTSELECTION_START,
  LOK_SETTEXTSELECTION_END,
  LOK_SETTEXTSELECTION_RESET,
  LOK_DOCTYPE_TEXT,
  LOK_DOCTYPE_SPREADSHEET,
  LOK_DOCTYPE_PRESENTATION,
  LOK_DOCTYPE_DRAWING,
  LOK_DOCTYPE_OTHER,
} from './lok-bindings.js';

// ============================================
// Editor API
// ============================================

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
  allTools,
  toolsByName,
  commonTools,
  writerTools,
  calcTools,
  impressTools,
  drawTools,
  documentTools,
  getToolsForDocumentType,
  toOpenAIFunction,
  toAnthropicTool,
  getOpenAIFunctions,
  getAnthropicTools,
} from './editor/index.js';

export type {
  OperationResult,
  TruncationInfo,
  OpenDocumentOptions,
  TextPosition,
  TextRange,
  TextFormat,
  Paragraph,
  WriterStructure,
  CellRef,
  RangeRef,
  ColRef,
  SheetRef,
  CellValue,
  CellData,
  CellFormat,
  SheetInfo,
  CalcStructure,
  SlideLayout,
  TextFrame,
  SlideData,
  SlideInfo,
  ImpressStructure,
  ShapeType,
  ShapeData,
  PageData,
  PageInfo,
  DrawStructure,
  Rectangle,
  Size,
  Position,
  DocumentMetadata,
  DocumentStructure,
  DocumentType,
  SelectionRange,
  FindOptions,
  ToolDefinition,
  CommonToolName,
  WriterToolName,
  CalcToolName,
  ImpressToolName,
  DrawToolName,
  DocumentToolName,
  AllToolName,
  ToolParameters,
} from './editor/index.js';

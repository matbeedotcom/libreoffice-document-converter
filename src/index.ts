/**
 * LibreOffice WASM Document Converter
 *
 * A headless document conversion toolkit that uses LibreOffice
 * compiled to WebAssembly. Supports conversion between various
 * document formats without any UI dependencies.
 *
 * @packageDocumentation
 */

export { LibreOfficeConverter } from './converter.js';
export { WorkerConverter, createWorkerConverter } from './worker-converter.js';
export { SubprocessConverter, createSubprocessConverter } from './subprocess-converter.js';

// Image encoding utilities (uses sharp when available, falls back to pure JS)
export {
  encodeImage,
  rgbaToPng,
  rgbaToJpeg,
  rgbaToWebp,
  isSharpAvailable,
  getSharp,
} from './image-utils.js';
export type { ImageEncodeOptions } from './image-utils.js';

export type {
  ConversionOptions,
  ConversionResult,
  ImageOptions,
  InputFormat,
  LibreOfficeWasmOptions,
  OutputFormat,
  PdfOptions,
  ProgressInfo,
} from './types.js';

export {
  ConversionError,
  ConversionErrorCode,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  EXTENSION_TO_FORMAT,
  // Conversion validation helpers
  getValidOutputFormats,
  isConversionValid,
  getConversionErrorMessage,
  INPUT_FORMAT_CATEGORY,
  CATEGORY_OUTPUT_FORMATS,
  // Dynamic document type helpers (use after loading document)
  LOKDocumentType,
  LOK_DOCTYPE_OUTPUT_FORMATS,
  getOutputFormatsForDocType,
  // Browser WASM path helpers (also useful for understanding paths)
  createWasmPaths,
  DEFAULT_WASM_BASE_URL,
} from './types.js';

export type { DocumentCategory, WasmLoadPhase, WasmLoadProgress } from './types.js';

// Export LOK constants for advanced usage
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

import { LibreOfficeConverter } from './converter.js';
import type { ConversionOptions, ConversionResult, LibreOfficeWasmOptions } from './types.js';

/**
 * Create a configured LibreOffice converter instance
 *
 * @example
 * ```typescript
 * import { createConverter } from '@matbee/libreoffice-converter';
 *
 * const converter = await createConverter({
 *   wasmPath: './wasm',
 *   verbose: true,
 * });
 *
 * const pdfData = await converter.convert(docxBuffer, {
 *   outputFormat: 'pdf',
 * });
 * ```
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
 *
 * @example
 * ```typescript
 * import { convertDocument } from '@matbee/libreoffice-converter';
 *
 * const pdfData = await convertDocument(docxBuffer, {
 *   outputFormat: 'pdf',
 *   pdf: { pdfaLevel: 'PDF/A-2b' }
 * });
 * ```
 */
export async function convertDocument(
  input: Uint8Array | ArrayBuffer | Buffer,
  options: ConversionOptions,
  converterOptions?: LibreOfficeWasmOptions
): Promise<ConversionResult> {
  const converter = await createConverter(converterOptions);
  try {
    return await converter.convert(input, options);
  } finally {
    await converter.destroy();
  }
}

/**
 * Check if a format is supported for input
 */
export function isInputFormatSupported(format: string): boolean {
  return LibreOfficeConverter.getSupportedInputFormats().includes(format.toLowerCase());
}

/**
 * Check if a format is supported for output
 */
export function isOutputFormatSupported(format: string): boolean {
  return LibreOfficeConverter.getSupportedOutputFormats().includes(format.toLowerCase() as OutputFormat);
}

/**
 * Check if a specific conversion path is supported
 * @param inputFormat The input document format (e.g., 'pdf', 'docx')
 * @param outputFormat The desired output format (e.g., 'pdf', 'docx')
 * @returns true if the conversion is supported
 * 
 * @example
 * ```typescript
 * import { isConversionSupported } from '@matbee/libreoffice-converter';
 * 
 * isConversionSupported('docx', 'pdf');  // true
 * isConversionSupported('pdf', 'docx');  // false - PDFs can't be converted to DOCX
 * isConversionSupported('xlsx', 'csv');  // true
 * ```
 */
export function isConversionSupported(inputFormat: string, outputFormat: string): boolean {
  return LibreOfficeConverter.isConversionSupported(inputFormat, outputFormat);
}

/**
 * Get valid output formats for a given input format
 * @param inputFormat The input document format
 * @returns Array of valid output formats
 * 
 * @example
 * ```typescript
 * import { getValidOutputFormatsFor } from '@matbee/libreoffice-converter';
 * 
 * getValidOutputFormatsFor('docx');  // ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'png', 'jpg', 'svg']
 * getValidOutputFormatsFor('pdf');   // ['pdf', 'png', 'jpg', 'svg', 'html']
 * getValidOutputFormatsFor('xlsx');  // ['pdf', 'xlsx', 'xls', 'ods', 'csv', 'html', 'png', 'jpg', 'svg']
 * ```
 */
export function getValidOutputFormatsFor(inputFormat: string): OutputFormat[] {
  return LibreOfficeConverter.getValidOutputFormats(inputFormat);
}

// Re-export OutputFormat type for the isOutputFormatSupported function
import type { OutputFormat } from './types.js';

// ============================================
// Editor API (LLM-friendly document editing)
// ============================================

export {
  // Factory and type guards
  createEditor,
  isWriterEditor,
  isCalcEditor,
  isImpressEditor,
  isDrawEditor,
  // Editor classes
  OfficeEditor,
  WriterEditor,
  CalcEditor,
  ImpressEditor,
  DrawEditor,
} from './editor/index.js';

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
} from './editor/index.js';

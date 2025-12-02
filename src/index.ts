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
} from './types.js';

export type { DocumentCategory } from './types.js';

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
 * import { createConverter } from '@libreoffice-wasm/converter';
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
 * import { convertDocument } from '@libreoffice-wasm/converter';
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
 * import { isConversionSupported } from '@libreoffice-wasm/converter';
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
 * import { getValidOutputFormatsFor } from '@libreoffice-wasm/converter';
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

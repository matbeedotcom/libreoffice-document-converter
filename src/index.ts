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
} from './types.js';

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

// Re-export OutputFormat type for the isOutputFormatSupported function
import type { OutputFormat } from './types.js';

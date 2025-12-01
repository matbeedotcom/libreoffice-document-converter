# API Reference

Complete API reference for the LibreOffice WASM Document Converter.

## Table of Contents

- [Node.js API](#nodejs-api)
  - [createConverter](#createconverteroptions)
  - [convertDocument](#convertdocumentinput-options-converteroptions)
  - [LibreOfficeConverter](#libreofficeconverter)
- [Browser API](#browser-api)
  - [BrowserConverter](#browserconverter)
  - [createDropZone](#createdropzoneelement-options)
  - [quickConvert](#quickconvertfile-outputformat-options)
- [Types](#types)
- [Error Handling](#error-handling)
- [Constants](#constants)

---

## Node.js API

### `createConverter(options?)`

Creates and initializes a converter instance. This is the recommended way to create a converter.

```typescript
function createConverter(options?: LibreOfficeWasmOptions): Promise<LibreOfficeConverter>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `LibreOfficeWasmOptions` | Optional configuration |

**Returns:** `Promise<LibreOfficeConverter>`

**Example:**

```typescript
import { createConverter } from '@libreoffice-wasm/converter';

const converter = await createConverter({
  wasmPath: './wasm',
  verbose: true,
  onProgress: (info) => {
    console.log(`[${info.phase}] ${info.percent}% - ${info.message}`);
  },
});
```

---

### `convertDocument(input, options, converterOptions?)`

One-shot conversion utility. Creates a converter, performs the conversion, then destroys it. Useful for single conversions.

```typescript
function convertDocument(
  input: Uint8Array | ArrayBuffer | Buffer,
  options: ConversionOptions,
  converterOptions?: LibreOfficeWasmOptions
): Promise<ConversionResult>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `Uint8Array \| ArrayBuffer \| Buffer` | Document data |
| `options` | `ConversionOptions` | Conversion options |
| `converterOptions` | `LibreOfficeWasmOptions` | Optional converter config |

**Returns:** `Promise<ConversionResult>`

**Example:**

```typescript
import { convertDocument } from '@libreoffice-wasm/converter';
import fs from 'fs';

const docx = fs.readFileSync('document.docx');
const result = await convertDocument(
  docx,
  { outputFormat: 'pdf' },
  { wasmPath: './wasm' }
);

fs.writeFileSync('document.pdf', result.data);
```

---

### `LibreOfficeConverter`

The main converter class. Use `createConverter()` to create instances.

#### Constructor

```typescript
constructor(options?: LibreOfficeWasmOptions)
```

#### Methods

##### `initialize()`

Initialize the WASM module. Called automatically by `createConverter()`.

```typescript
async initialize(): Promise<void>
```

**Example:**

```typescript
const converter = new LibreOfficeConverter({ wasmPath: './wasm' });
await converter.initialize();
```

##### `convert(input, options, filename?)`

Convert a document to a different format.

```typescript
async convert(
  input: Uint8Array | ArrayBuffer | Buffer,
  options: ConversionOptions,
  filename?: string
): Promise<ConversionResult>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `Uint8Array \| ArrayBuffer \| Buffer` | Input document data |
| `options` | `ConversionOptions` | Conversion options |
| `filename` | `string` | Optional filename for format detection |

**Returns:** `Promise<ConversionResult>`

**Example:**

```typescript
const result = await converter.convert(
  documentBuffer,
  {
    outputFormat: 'pdf',
    inputFormat: 'docx',
    pdf: {
      pdfaLevel: 'PDF/A-2b',
      quality: 90,
    },
  },
  'report.docx'
);
```

##### `destroy()`

Release resources. Call when done with the converter.

```typescript
async destroy(): Promise<void>
```

##### `isReady()`

Check if the converter is initialized.

```typescript
isReady(): boolean
```

##### Static: `getSupportedInputFormats()`

Get list of supported input formats.

```typescript
static getSupportedInputFormats(): string[]
```

**Returns:** `['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'odg', 'odf', 'rtf', 'txt', 'html', 'htm', 'csv', 'xml', 'epub', 'pdf']`

##### Static: `getSupportedOutputFormats()`

Get list of supported output formats.

```typescript
static getSupportedOutputFormats(): OutputFormat[]
```

**Returns:** `['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'xlsx', 'xls', 'ods', 'csv', 'pptx', 'ppt', 'odp', 'png', 'jpg', 'svg']`

---

## Browser API

Import from the browser module:

```typescript
import { BrowserConverter, createDropZone, quickConvert } from '@libreoffice-wasm/converter/browser';
```

---

### `BrowserConverter`

Browser-optimized converter with file handling utilities.

#### Constructor

```typescript
constructor(options?: LibreOfficeWasmOptions)
```

#### Methods

##### `initialize()`

Initialize the WASM module.

```typescript
async initialize(): Promise<void>
```

##### `convert(input, options, filename?)`

Convert a document.

```typescript
async convert(
  input: Uint8Array | ArrayBuffer,
  options: ConversionOptions,
  filename?: string
): Promise<ConversionResult>
```

##### `convertFile(file, options)`

Convert a File object (from file input or drag-and-drop).

```typescript
async convertFile(file: File, options: ConversionOptions): Promise<ConversionResult>
```

**Example:**

```typescript
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await converter.convertFile(file, { outputFormat: 'pdf' });
  converter.download(result);
});
```

##### `convertFromUrl(url, options)`

Fetch and convert a document from a URL.

```typescript
async convertFromUrl(url: string, options: ConversionOptions): Promise<ConversionResult>
```

**Example:**

```typescript
const result = await converter.convertFromUrl(
  'https://example.com/document.docx',
  { outputFormat: 'pdf' }
);
```

##### `download(result, filename?)`

Trigger browser download of the converted document.

```typescript
download(result: ConversionResult, filename?: string): void
```

**Example:**

```typescript
converter.download(result);  // Uses result.filename
converter.download(result, 'custom-name.pdf');
```

##### `createBlobUrl(result)`

Create a Blob URL for the converted document.

```typescript
createBlobUrl(result: ConversionResult): string
```

**Example:**

```typescript
const url = converter.createBlobUrl(result);
const iframe = document.createElement('iframe');
iframe.src = url;
document.body.appendChild(iframe);

// Clean up when done
URL.revokeObjectURL(url);
```

##### `preview(result)`

Open the converted document in a new browser tab.

```typescript
preview(result: ConversionResult): Window | null
```

**Example:**

```typescript
converter.preview(result);  // Opens PDF in new tab
```

##### `destroy()`

Release resources.

```typescript
async destroy(): Promise<void>
```

##### `isReady()`

Check if converter is initialized.

```typescript
isReady(): boolean
```

---

### `createDropZone(element, options)`

Create a drag-and-drop zone for file conversion.

```typescript
function createDropZone(
  element: HTMLElement | string,
  options: {
    outputFormat: OutputFormat;
    wasmPath?: string;
    onConvert?: (result: ConversionResult) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: { percent: number; message: string }) => void;
    autoDownload?: boolean;
  }
): { destroy: () => void }
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `element` | `HTMLElement \| string` | Element or CSS selector |
| `options.outputFormat` | `OutputFormat` | Output format |
| `options.wasmPath` | `string` | Path to WASM files (default: '/wasm') |
| `options.onConvert` | `(result) => void` | Called after successful conversion |
| `options.onError` | `(error) => void` | Called on error |
| `options.onProgress` | `(progress) => void` | Progress callback |
| `options.autoDownload` | `boolean` | Auto-download after conversion (default: true) |

**Returns:** `{ destroy: () => void }`

**Example:**

```html
<div id="drop-zone" class="drop-zone">
  Drop files here to convert to PDF
</div>

<style>
.drop-zone {
  border: 2px dashed #ccc;
  padding: 40px;
  text-align: center;
}
.drop-zone.dragover {
  border-color: #007bff;
  background: #e7f3ff;
}
</style>

<script type="module">
import { createDropZone } from '@libreoffice-wasm/converter/browser';

const dropZone = createDropZone('#drop-zone', {
  outputFormat: 'pdf',
  wasmPath: '/wasm',
  autoDownload: true,
  onProgress: (info) => {
    console.log(`${info.percent}% - ${info.message}`);
  },
  onConvert: (result) => {
    console.log('Converted:', result.filename);
  },
  onError: (err) => {
    alert('Error: ' + err.message);
  },
});

// Clean up when done
// dropZone.destroy();
</script>
```

---

### `quickConvert(file, outputFormat, options?)`

Quick one-shot conversion with optional auto-download.

```typescript
async function quickConvert(
  file: File,
  outputFormat: OutputFormat,
  options?: {
    wasmPath?: string;
    download?: boolean;
  }
): Promise<ConversionResult>
```

**Example:**

```typescript
import { quickConvert } from '@libreoffice-wasm/converter/browser';

const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  await quickConvert(file, 'pdf', { download: true });
});
```

---

## Types

### `LibreOfficeWasmOptions`

Options for initializing the converter.

```typescript
interface LibreOfficeWasmOptions {
  /**
   * Path to WASM files directory
   * @default './wasm'
   */
  wasmPath?: string;

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
```

### `ConversionOptions`

Options for document conversion.

```typescript
interface ConversionOptions {
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
```

### `ConversionResult`

Result of a document conversion.

```typescript
interface ConversionResult {
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
```

### `PdfOptions`

PDF-specific conversion options.

```typescript
interface PdfOptions {
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
```

### `ImageOptions`

Image output options.

```typescript
interface ImageOptions {
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
}
```

### `ProgressInfo`

Progress information during initialization or conversion.

```typescript
interface ProgressInfo {
  phase: 'loading' | 'initializing' | 'converting' | 'complete';
  percent: number;
  message: string;
}
```

### `InputFormat`

Supported input formats.

```typescript
type InputFormat =
  | 'doc' | 'docx'
  | 'xls' | 'xlsx'
  | 'ppt' | 'pptx'
  | 'odt' | 'ods' | 'odp' | 'odg' | 'odf'
  | 'rtf' | 'txt' | 'html' | 'htm' | 'csv' | 'xml' | 'epub' | 'pdf';
```

### `OutputFormat`

Supported output formats.

```typescript
type OutputFormat =
  | 'pdf'
  | 'docx' | 'doc' | 'odt' | 'rtf' | 'txt' | 'html'
  | 'xlsx' | 'xls' | 'ods' | 'csv'
  | 'pptx' | 'ppt' | 'odp'
  | 'png' | 'jpg' | 'svg';
```

---

## Error Handling

### `ConversionError`

Custom error class with error codes.

```typescript
class ConversionError extends Error {
  code: ConversionErrorCode;
  details?: string;
}
```

### `ConversionErrorCode`

Error codes for conversion failures.

```typescript
enum ConversionErrorCode {
  UNKNOWN = 'UNKNOWN',
  INVALID_INPUT = 'INVALID_INPUT',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  CORRUPTED_DOCUMENT = 'CORRUPTED_DOCUMENT',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  WASM_NOT_INITIALIZED = 'WASM_NOT_INITIALIZED',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  LOAD_FAILED = 'LOAD_FAILED',
}
```

**Example:**

```typescript
import { createConverter, ConversionError, ConversionErrorCode } from '@libreoffice-wasm/converter';

try {
  const result = await converter.convert(input, { outputFormat: 'pdf' });
} catch (err) {
  if (err instanceof ConversionError) {
    switch (err.code) {
      case ConversionErrorCode.INVALID_INPUT:
        console.error('Invalid input document');
        break;
      case ConversionErrorCode.UNSUPPORTED_FORMAT:
        console.error('Format not supported');
        break;
      case ConversionErrorCode.PASSWORD_REQUIRED:
        console.error('Document is password protected');
        break;
      default:
        console.error('Conversion failed:', err.message);
    }
  }
}
```

---

## Constants

### `FORMAT_FILTERS`

LibreOffice filter names for each output format.

```typescript
const FORMAT_FILTERS: Record<OutputFormat, string> = {
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
```

### `FORMAT_MIME_TYPES`

MIME types for each output format.

```typescript
const FORMAT_MIME_TYPES: Record<OutputFormat, string> = {
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
```

### `EXTENSION_TO_FORMAT`

Map file extensions to input format types.

```typescript
const EXTENSION_TO_FORMAT: Record<string, InputFormat> = {
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
```

---

## Helper Functions

### `isInputFormatSupported(format)`

Check if a format is supported for input.

```typescript
function isInputFormatSupported(format: string): boolean
```

### `isOutputFormatSupported(format)`

Check if a format is supported for output.

```typescript
function isOutputFormatSupported(format: string): boolean
```

**Example:**

```typescript
import { isInputFormatSupported, isOutputFormatSupported } from '@libreoffice-wasm/converter';

if (isInputFormatSupported('docx')) {
  console.log('DOCX input supported');
}

if (isOutputFormatSupported('pdf')) {
  console.log('PDF output supported');
}
```


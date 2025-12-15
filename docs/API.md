# API Reference

Complete API reference for the LibreOffice WASM Document Converter.

## Table of Contents

- [Node.js API](#nodejs-api)
  - [One-Shot Functions](#one-shot-functions)
  - [Converter Classes](#converter-classes)
  - [Converter Comparison](#converter-comparison)
  - [Format Validation](#format-validation)
- [Browser API](#browser-api)
  - [WorkerBrowserConverter](#workerbrowserconverter)
  - [BrowserConverter](#browserconverter)
  - [WASM Paths Configuration](#wasm-paths-configuration)
  - [WASM Loading Progress](#wasm-loading-progress)
- [Document Inspection & Rendering](#document-inspection--rendering)
- [Document Editing API](#document-editing-api)
- [Image Encoding](#image-encoding)
- [Types](#types)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)
- [Building from Source](#building-from-source)

---

## Node.js API

### One-Shot Functions

#### `convertDocument(input, options, converterOptions?)`

One-shot conversion utility. Creates a converter, performs the conversion, then destroys it.

```typescript
import { convertDocument } from '@matbee/libreoffice-converter';

const result = await convertDocument(
  docxBuffer,
  { outputFormat: 'pdf' },
  { wasmPath: './wasm' }
);
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `Uint8Array \| ArrayBuffer \| Buffer` | Document data |
| `options` | `ConversionOptions` | Conversion options |
| `converterOptions` | `LibreOfficeWasmOptions` | Optional converter config |

**Returns:** `Promise<ConversionResult>`

---

#### `exportAsImage(input, format?, imageOptions?, converterOptions?)`

One-shot image export utility. Creates a converter, exports to image, then destroys it.

```typescript
import { exportAsImage } from '@matbee/libreoffice-converter';

// Export DOCX to PNG
const pngData = await exportAsImage(docxBuffer, 'png');

// Export with options
const highResPng = await exportAsImage(docxBuffer, 'png', {
  dpi: 300,
  width: 1920
});

// Export presentation to SVG
const svgData = await exportAsImage(pptxBuffer, 'svg');
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `input` | `Uint8Array \| ArrayBuffer \| Buffer` | - | Document data |
| `format` | `'png' \| 'jpg' \| 'svg'` | `'png'` | Output image format |
| `imageOptions` | `ImageOptions` | - | Image rendering options |
| `converterOptions` | `LibreOfficeWasmOptions` | - | Optional converter config |

**Returns:** `Promise<ConversionResult>`

---

### Converter Classes

#### `createConverter(options?)`

Creates and initializes a main-thread converter instance.

```typescript
import { createConverter } from '@matbee/libreoffice-converter';

const converter = await createConverter({
  wasmPath: './wasm',
  verbose: false,
  onProgress: (info) => console.log(info.message),
  onReady: () => console.log('Ready!'),
  onError: (err) => console.error(err),
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wasmPath` | `string` | `'./wasm'` | Path to WASM files directory |
| `verbose` | `boolean` | `false` | Enable debug logging |
| `onProgress` | `(info: ProgressInfo) => void` | - | Progress callback |
| `onReady` | `() => void` | - | Called when initialization completes |
| `onError` | `(error: Error) => void` | - | Error callback |

---

#### `createWorkerConverter(options?)`

Creates a converter that runs in a worker thread. **Recommended for servers** as it doesn't block the main thread.

```typescript
import { createWorkerConverter } from '@matbee/libreoffice-converter';

const converter = await createWorkerConverter({
  wasmPath: './wasm',
  verbose: false,
});

// Same API as LibreOfficeConverter
const result = await converter.convert(docxBuffer, { outputFormat: 'pdf' });
await converter.destroy();
```

---

#### `createSubprocessConverter(options?)`

Creates a converter that runs in a separate Node.js process. **Recommended for serverless environments** like Vercel, AWS Lambda, etc. Provides memory isolation and better timeout handling.

```typescript
import { createSubprocessConverter } from '@matbee/libreoffice-converter';

const converter = await createSubprocessConverter({
  wasmPath: './wasm',
  userProfilePath: '/tmp/libreoffice-user',  // Required for serverless
  prewarm: true,    // Pre-warm font cache during init (recommended for serverless)
  verbose: false,
});

// Same API as other converters
const result = await converter.convert(docxBuffer, { outputFormat: 'pdf' });
await converter.destroy();
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wasmPath` | `string` | `'./wasm'` | Path to WASM files directory |
| `userProfilePath` | `string` | - | Writable path for LibreOffice config (use `/tmp` on serverless) |
| `prewarm` | `boolean` | `false` | Pre-warm font cache during init (avoids 30s delay on first conversion) |
| `skipPreload` | `boolean` | `false` | Skip LibreOffice preload for faster init |
| `conversionTimeout` | `number` | `60000` | Timeout in ms for conversions (subprocess killed on timeout) |
| `maxInitRetries` | `number` | `3` | Retries for initialization failures |
| `maxConversionRetries` | `number` | `2` | Retries for conversion failures |
| `restartOnMemoryError` | `boolean` | `true` | Auto-restart subprocess on WASM memory errors |
| `verbose` | `boolean` | `false` | Enable debug logging |

**Additional Methods:**

```typescript
// Manual pre-warm (if not using prewarm option)
await converter.prewarm();

// Check if ready
converter.isReady(); // boolean
```

---

### Converter Comparison

| Converter | Thread | Memory | Use Case |
|-----------|--------|--------|----------|
| `createConverter()` | Main | Shared | Simple scripts |
| `createWorkerConverter()` | Worker | Shared | **Servers (recommended)** |
| `createSubprocessConverter()` | Process | Isolated | **Serverless (Vercel, Lambda)** |

---

### Converter Instance Methods

#### `converter.convert(input, options, filename?)`

Convert a document to a different format.

```typescript
const result = await converter.convert(
  inputBuffer,
  {
    outputFormat: 'pdf',
    inputFormat: 'docx',  // Optional, auto-detected from filename
    password: 'secret',   // For encrypted documents
    pdf: {
      pdfaLevel: 'PDF/A-2b',
      quality: 90,
    },
  },
  'document.docx'  // Optional filename for format detection
);
```

**Returns:** `Promise<ConversionResult>`

```typescript
interface ConversionResult {
  data: Uint8Array;      // Converted document bytes
  mimeType: string;      // MIME type of output
  filename: string;      // Suggested output filename
  duration: number;      // Conversion time in ms
}
```

#### `converter.destroy()`

Clean up resources. Call when done converting.

```typescript
await converter.destroy();
```

---

### Format Validation

#### `isConversionSupported(inputFormat, outputFormat)`

Check if a specific conversion path is supported.

```typescript
import { isConversionSupported } from '@matbee/libreoffice-converter';

isConversionSupported('docx', 'pdf');   // true
isConversionSupported('pdf', 'docx');   // false - PDFs can't be converted to DOCX
isConversionSupported('xlsx', 'csv');   // true
isConversionSupported('pptx', 'xlsx');  // false - can't convert presentations to spreadsheets
```

#### `getValidOutputFormatsFor(inputFormat)`

Get valid output formats for a given input format.

```typescript
import { getValidOutputFormatsFor } from '@matbee/libreoffice-converter';

getValidOutputFormatsFor('docx');
// ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'png']

getValidOutputFormatsFor('xlsx');
// ['pdf', 'xlsx', 'xls', 'ods', 'csv', 'html', 'png']

getValidOutputFormatsFor('pdf');
// ['pdf', 'png', 'svg', 'html'] (PDFs are imported as Draw documents)
```

#### `isInputFormatSupported(format)` / `isOutputFormatSupported(format)`

Check if a format is supported.

```typescript
import { isInputFormatSupported, isOutputFormatSupported } from '@matbee/libreoffice-converter';

isInputFormatSupported('docx');  // true
isOutputFormatSupported('pdf');  // true
```

#### `LibreOfficeConverter.getSupportedInputFormats()` / `getSupportedOutputFormats()`

Get lists of all supported formats.

```typescript
import { LibreOfficeConverter } from '@matbee/libreoffice-converter';

const inputFormats = LibreOfficeConverter.getSupportedInputFormats();
// ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', ...]

const outputFormats = LibreOfficeConverter.getSupportedOutputFormats();
// ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'xlsx', ...]
```

---

## Supported Formats

### Input Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| Microsoft Word | `.doc`, `.docx` | Word 97-2003 and modern |
| Microsoft Excel | `.xls`, `.xlsx` | Excel 97-2003 and modern |
| Microsoft PowerPoint | `.ppt`, `.pptx` | PowerPoint 97-2003 and modern |
| OpenDocument Text | `.odt` | LibreOffice Writer |
| OpenDocument Spreadsheet | `.ods` | LibreOffice Calc |
| OpenDocument Presentation | `.odp` | LibreOffice Impress |
| Rich Text Format | `.rtf` | Cross-platform text |
| Plain Text | `.txt` | UTF-8 text |
| HTML | `.html`, `.htm` | Web pages |
| CSV | `.csv` | Comma-separated values |
| PDF | `.pdf` | For editing (limited) |
| EPUB | `.epub` | E-books |

### Output Formats

| Format | Extension | MIME Type |
|--------|-----------|-----------|
| PDF | `.pdf` | `application/pdf` |
| DOCX | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| DOC | `.doc` | `application/msword` |
| ODT | `.odt` | `application/vnd.oasis.opendocument.text` |
| RTF | `.rtf` | `application/rtf` |
| TXT | `.txt` | `text/plain` |
| HTML | `.html` | `text/html` |
| XLSX | `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| XLS | `.xls` | `application/vnd.ms-excel` |
| ODS | `.ods` | `application/vnd.oasis.opendocument.spreadsheet` |
| CSV | `.csv` | `text/csv` |
| PPTX | `.pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| PPT | `.ppt` | `application/vnd.ms-powerpoint` |
| ODP | `.odp` | `application/vnd.oasis.opendocument.presentation` |
| PNG | `.png` | `image/png` |
| JPG | `.jpg` | `image/jpeg` |
| SVG | `.svg` | `image/svg+xml` |

---

## Browser API

### WorkerBrowserConverter

Runs LibreOffice in a Web Worker, keeping the main thread responsive. **Recommended for browsers.**

```javascript
import { WorkerBrowserConverter, createWasmPaths } from '@matbee/libreoffice-converter/browser';

const converter = new WorkerBrowserConverter({
  ...createWasmPaths(), // Defaults to /wasm/
  browserWorkerJs: '/dist/browser.worker.js',
  onProgress: (info) => {
    progressBar.style.width = `${info.percent}%`;
    statusText.textContent = info.message;
  },
});

await converter.initialize();

// Convert a File object
const file = document.querySelector('input[type="file"]').files[0];
const arrayBuffer = await file.arrayBuffer();
const result = await converter.convert(new Uint8Array(arrayBuffer), {
  outputFormat: 'pdf',
}, file.name);

// Download the result
const blob = new Blob([result.data], { type: result.mimeType });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = result.filename;
a.click();
```

### BrowserConverter

Main thread converter (blocks UI during conversion):

```javascript
import { BrowserConverter, createWasmPaths } from '@matbee/libreoffice-converter/browser';

const converter = new BrowserConverter({
  ...createWasmPaths(),
  onProgress: (info) => console.log(`${info.percent}%: ${info.message}`),
});

await converter.initialize();
const result = await converter.convert(fileData, { outputFormat: 'pdf' }, 'doc.docx');
```

### WASM Paths Configuration

```javascript
import { createWasmPaths, DEFAULT_WASM_BASE_URL } from '@matbee/libreoffice-converter/browser';

// Use default /wasm/ path (same-origin)
const paths = createWasmPaths();
// Returns:
// {
//   sofficeJs: '/wasm/soffice.js',
//   sofficeWasm: '/wasm/soffice.wasm',
//   sofficeData: '/wasm/soffice.data',
//   sofficeWorkerJs: '/wasm/soffice.worker.js',
// }

// Or use your own CDN
const paths = createWasmPaths('https://cdn.example.com/wasm/');

// Or specify each path manually
const converter = new WorkerBrowserConverter({
  sofficeJs: 'https://cdn.example.com/wasm/soffice.js',
  sofficeWasm: 'https://cdn.example.com/wasm/soffice.wasm',
  sofficeData: 'https://cdn.example.com/wasm/soffice.data',
  sofficeWorkerJs: 'https://cdn.example.com/wasm/soffice.worker.js',
  browserWorkerJs: '/workers/browser.worker.js',
});
```

### Required HTTP Headers

SharedArrayBuffer requires specific CORS headers on your server:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### WASM Loading Progress

```typescript
const converter = new WorkerBrowserConverter({
  ...createWasmPaths('/wasm/'),
  browserWorkerJs: '/dist/browser.worker.js',
  onProgress: (progress) => {
    console.log(`Phase: ${progress.phase}`);
    console.log(`Progress: ${progress.percent}%`);
    console.log(`Message: ${progress.message}`);

    // During download phases, bytes info is available
    if (progress.bytesLoaded !== undefined) {
      const mb = (progress.bytesLoaded / 1024 / 1024).toFixed(1);
      const totalMb = (progress.bytesTotal! / 1024 / 1024).toFixed(1);
      console.log(`Downloaded: ${mb} MB / ${totalMb} MB`);
    }
  },
});
```

#### WasmLoadProgress Interface

```typescript
interface WasmLoadProgress {
  percent: number;           // Overall progress 0-100
  message: string;           // Human-readable status message
  phase: WasmLoadPhase;      // Current loading phase
  bytesLoaded?: number;      // Bytes downloaded (during download phases)
  bytesTotal?: number;       // Total bytes to download
}

type WasmLoadPhase =
  | 'download-wasm'    // Downloading soffice.wasm (~142MB)
  | 'download-data'    // Downloading soffice.data (~96MB)
  | 'compile'          // WebAssembly compilation
  | 'filesystem'       // Emscripten filesystem setup
  | 'lok-init'         // LibreOfficeKit initialization
  | 'ready';           // Complete
```

#### Progress Phases

| Phase | Weight | Description |
|-------|--------|-------------|
| `download-wasm` | 30% | Downloading soffice.wasm (~142MB) |
| `download-data` | 20% | Downloading soffice.data (~96MB) |
| `compile` | 10% | WebAssembly compilation |
| `filesystem` | 5% | Virtual filesystem setup |
| `lok-init` | 35% | LibreOffice initialization |

---

## Document Inspection & Rendering

All converters provide APIs for inspecting documents and rendering page previews.

### `converter.getDocumentInfo(input, inputFormat)`

Get document metadata including type, page count, and valid output formats.

```typescript
const docInfo = await converter.getDocumentInfo(fileBuffer, 'docx');
console.log(docInfo);
// {
//   documentType: 0,           // 0=TEXT, 1=SPREADSHEET, 2=PRESENTATION, 3=DRAWING
//   documentTypeName: 'Text Document',
//   validOutputFormats: ['pdf', 'docx', 'odt', 'html', 'txt', 'png'],
//   pageCount: 5
// }
```

### `converter.getPageCount(input, inputFormat)`

Get just the page count for a document.

```typescript
const pageCount = await converter.getPageCount(docxBuffer, 'docx');
```

### `converter.renderPage(input, inputFormat, pageIndex, width, height?)`

Render a single page as raw RGBA pixel data.

```typescript
const preview = await converter.renderPage(pptxBuffer, 'pptx', 0, 800);
// preview.data is a Uint8Array containing raw RGBA pixel data
console.log(`Rendered: ${preview.width}x${preview.height} pixels`);
```

**Returns:** `Promise<PagePreview>`

```typescript
interface PagePreview {
  page: number;      // Page index
  data: Uint8Array;  // Raw RGBA pixel data
  width: number;     // Actual rendered width
  height: number;    // Actual rendered height
}
```

### `converter.renderPagePreviews(input, inputFormat, options?)`

Render multiple pages as thumbnails.

```typescript
// Render all pages at 400px width
const previews = await converter.renderPagePreviews(pptxBuffer, 'pptx', {
  width: 400,
});

// Render only specific pages
const selectedPreviews = await converter.renderPagePreviews(pptxBuffer, 'pptx', {
  width: 800,
  pageIndices: [0, 2, 4],  // Only pages 1, 3, and 5
});
```

### `converter.getDocumentText(input, inputFormat)`

Extract all text content from a document.

```typescript
const text = await converter.getDocumentText(docxBuffer, 'docx');
```

### `converter.getPageNames(input, inputFormat)`

Get slide names (for presentations) or sheet names (for spreadsheets).

```typescript
const slideNames = await converter.getPageNames(pptxBuffer, 'pptx');
// ['Introduction', 'Overview', 'Conclusion']

const sheetNames = await converter.getPageNames(xlsxBuffer, 'xlsx');
// ['Sheet1', 'Data', 'Summary']
```

---

## Document Editing API

### `converter.openDocument(input, inputFormat)`

Open a document for editing.

```typescript
const session = await converter.openDocument(docxBuffer, 'docx');
// {
//   sessionId: 'edit_session_0_1234567890',
//   documentType: 'writer',  // 'writer', 'calc', or 'impress'
//   pageCount: 5
// }
```

### `converter.editorOperation(sessionId, method, ...args)`

Execute an editing operation on an open document.

```typescript
// Get document structure
const structure = await converter.editorOperation(session.sessionId, 'getStructure');

// Get document type
const docType = await converter.editorOperation(session.sessionId, 'getDocumentType');

// Insert text (Writer documents)
await converter.editorOperation(session.sessionId, 'insertText', 'Hello, World!');

// Set cell value (Calc documents)
await converter.editorOperation(session.sessionId, 'setCellValue', 'A1', 42);
```

### `converter.closeDocument(sessionId)`

Close an editing session and get the modified document.

```typescript
const modifiedData = await converter.closeDocument(session.sessionId);
if (modifiedData) {
  fs.writeFileSync('modified.docx', modifiedData);
}
```

---

## Image Encoding

The `renderPage` and `renderPagePreviews` methods return raw RGBA pixel data. Use the built-in image encoding utilities to convert to PNG, JPEG, or WebP.

### Installation

The image utilities use [sharp](https://sharp.pixelplumbing.com/) when available. Sharp is an **optional** peer dependency - if not installed, a pure JavaScript PNG fallback is used.

```bash
# Optional: Install sharp for faster encoding and JPEG/WebP support
npm install sharp
```

### `rgbaToPng(rgbaData, width, height)`

Convert raw RGBA pixel data to PNG format.

```typescript
import { createWorkerConverter, rgbaToPng } from '@matbee/libreoffice-converter';

const converter = await createWorkerConverter({ wasmPath: './wasm' });
const preview = await converter.renderPage(docBuffer, 'docx', 0, 800);

const pngBuffer = await rgbaToPng(preview.data, preview.width, preview.height);
fs.writeFileSync('page.png', pngBuffer);
```

### `encodeImage(rgbaData, width, height, options)`

Encode to any supported format with options.

```typescript
import { encodeImage } from '@matbee/libreoffice-converter';

// PNG with custom compression
const png = await encodeImage(preview.data, preview.width, preview.height, {
  format: 'png',
  compressionLevel: 9,  // 0-9, default 6
});

// JPEG (requires sharp)
const jpeg = await encodeImage(preview.data, preview.width, preview.height, {
  format: 'jpeg',
  quality: 85,  // 1-100, default 90
});

// WebP (requires sharp)
const webp = await encodeImage(preview.data, preview.width, preview.height, {
  format: 'webp',
  quality: 80,
});
```

### `isSharpAvailable()`

Check if sharp is installed for advanced encoding options.

```typescript
import { isSharpAvailable } from '@matbee/libreoffice-converter';

if (await isSharpAvailable()) {
  console.log('Using sharp for fast image encoding');
} else {
  console.log('Using pure JS fallback (PNG only)');
}
```

### Convenience Functions

```typescript
import { rgbaToPng, rgbaToJpeg, rgbaToWebp } from '@matbee/libreoffice-converter';

const png = await rgbaToPng(data, width, height);              // Works without sharp
const jpeg = await rgbaToJpeg(data, width, height, 90);        // Requires sharp
const webp = await rgbaToWebp(data, width, height, 80);        // Requires sharp
```

---

## Types

### `LibreOfficeWasmOptions`

```typescript
interface LibreOfficeWasmOptions {
  wasmPath?: string;                          // Path to WASM files (default: './wasm')
  verbose?: boolean;                          // Enable debug logging (default: false)
  onReady?: () => void;                       // Called when ready
  onError?: (error: Error) => void;           // Called on error
  onProgress?: (progress: ProgressInfo) => void;  // Progress callback
}
```

### `ConversionOptions`

```typescript
interface ConversionOptions {
  outputFormat: OutputFormat;    // Required: output format
  inputFormat?: InputFormat;     // Optional: input format hint
  pdf?: PdfOptions;              // PDF-specific options
  image?: ImageOptions;          // Image output options
  password?: string;             // For encrypted documents
}
```

### `ConversionResult`

```typescript
interface ConversionResult {
  data: Uint8Array;    // Converted document bytes
  mimeType: string;    // MIME type of output
  filename: string;    // Suggested output filename
  duration: number;    // Conversion time in ms
}
```

### `PdfOptions`

```typescript
interface PdfOptions {
  pdfaLevel?: 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';  // PDF/A conformance
  quality?: number;  // 0-100, affects image compression (default: 90)
}
```

### `ImageOptions`

```typescript
interface ImageOptions {
  width?: number;   // Image width in pixels
  height?: number;  // Image height in pixels
  dpi?: number;     // DPI for rendering (default: 150)
}
```

### Format Types

```typescript
type InputFormat =
  | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx'
  | 'odt' | 'ods' | 'odp' | 'odg' | 'odf'
  | 'rtf' | 'txt' | 'html' | 'htm' | 'csv' | 'xml' | 'epub' | 'pdf';

type OutputFormat =
  | 'pdf' | 'docx' | 'doc' | 'odt' | 'rtf' | 'txt' | 'html'
  | 'xlsx' | 'xls' | 'ods' | 'csv'
  | 'pptx' | 'ppt' | 'odp'
  | 'png' | 'jpg' | 'svg';
```

---

## Configuration

### PDF Options

```typescript
const result = await converter.convert(input, {
  outputFormat: 'pdf',
  pdf: {
    pdfaLevel: 'PDF/A-2b',  // 'PDF/A-1b', 'PDF/A-2b', 'PDF/A-3b'
    quality: 90,
  },
});
```

### Image Options

```typescript
const result = await converter.convert(input, {
  outputFormat: 'png',
  image: {
    width: 1920,
    height: 1080,
    dpi: 150,
  },
});
```

### Password-Protected Documents

```typescript
const result = await converter.convert(encryptedDoc, {
  outputFormat: 'pdf',
  password: 'document-password',
});
```

---

## Error Handling

### `ConversionError`

```typescript
class ConversionError extends Error {
  code: ConversionErrorCode;
  details?: string;
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `WASM_NOT_INITIALIZED` | Module not loaded or initialized |
| `INVALID_INPUT` | Empty or invalid input document |
| `UNSUPPORTED_FORMAT` | Format not supported |
| `CORRUPTED_DOCUMENT` | Cannot parse input document |
| `PASSWORD_REQUIRED` | Document is encrypted |
| `CONVERSION_FAILED` | Generic conversion error |
| `LOAD_FAILED` | Could not load document |

### Example

```typescript
import { ConversionError, ConversionErrorCode } from '@matbee/libreoffice-converter';

try {
  const result = await converter.convert(input, { outputFormat: 'pdf' });
} catch (err) {
  if (err instanceof ConversionError) {
    switch (err.code) {
      case ConversionErrorCode.INVALID_INPUT:
        console.error('Invalid input document');
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

## Troubleshooting

### "WASM module not found"

Ensure the `wasm/` directory contains all required files:
- `soffice.wasm`
- `soffice.cjs`
- `soffice.data`
- `soffice.worker.cjs`
- `loader.cjs`

### "SharedArrayBuffer is not defined" (Browser)

SharedArrayBuffer requires specific headers. Add to your server:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Browser initialization seems slow

Browser initialization includes downloading ~240MB of WASM files. This is network-dependent.
- WASM files are cached by the browser after first load
- Conversions take 1-5 seconds depending on document size
- Reuse the converter instance for multiple conversions
- For servers (Node.js), initialization is much faster (~1-2s) since files load from disk

### Memory issues

The WASM module uses ~1GB RAM. For memory-constrained environments:
- Use `converter.destroy()` after batch conversions
- Avoid parallel conversions

### Reduce transfer size

Compress WASM files for 79% smaller downloads:

```bash
# Brotli (best - 40MB total)
brotli -9 wasm/soffice.wasm -o wasm/soffice.wasm.br
brotli -9 wasm/soffice.data -o wasm/soffice.data.br

# Gzip (63MB total)
gzip -9 -k wasm/soffice.wasm
gzip -9 -k wasm/soffice.data
```

### Process Doesn't Exit (Node.js)

The WASM module uses pthread workers that keep the Node.js process alive:

```javascript
// Option 1: Explicitly exit when done
await converter.destroy();
process.exit(0);

// Option 2: For servers, the process stays alive anyway (this is fine)

// Option 3: Use setTimeout with unref() for scripts
const timer = setTimeout(() => {}, 0);
timer.unref();
```

### Debug Mode

```javascript
const converter = await createConverter({
  wasmPath: './wasm',
  verbose: true,  // Shows LibreOffice internal logs
});
```

---

## Performance

### Benchmarks

**Node.js (filesystem-based):**

| Operation | Time |
|-----------|------|
| First initialization | ~1s |
| DOCX → PDF | ~100ms (first), ~35ms (subsequent) |
| XLSX → PDF | ~65ms (first), ~35ms (subsequent) |
| PPTX → PDF | ~290ms (first), ~250ms (subsequent) |

**Browser (Chromium, local server):**

| Operation | Time |
|-----------|------|
| WASM download (~240MB) | 5-30s (depends on network) |
| LibreOfficeKit initialization | ~2.5s |
| DOCX → PDF | ~95ms |
| XLSX → PDF | ~85ms |
| PPTX → PDF | ~305ms |

### Optimization Tips

1. **Reuse converter instances** - Initialization cost is paid only once
2. **Pre-initialize** - Start loading during idle time or page load
3. **Server keep-warm** - In production, keep converter processes alive
4. **Use Web Workers** - Keep UI responsive (browser)
5. **Enable Brotli compression** - Reduces transfer size by 79% (192MB → 40MB)
6. **Cache WASM files** - Browser caches files after first load

---

## Building from Source

### Prerequisites

- Ubuntu 22.04+ / Debian 12+ (or compatible)
- 16GB+ RAM (32GB recommended)
- 50GB+ disk space
- 8+ CPU cores (32 recommended)
- Build time: 1-4 hours

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    build-essential git cmake ninja-build \
    python3 python3-pip python3-dev \
    autoconf automake bison ccache flex gawk gettext \
    libarchive-dev libcups2-dev libcurl4-openssl-dev \
    libfontconfig1-dev libfreetype6-dev libglib2.0-dev \
    libharfbuzz-dev libicu-dev libjpeg-dev liblcms2-dev \
    libpng-dev libssl-dev libtool libxml2-dev libxslt1-dev \
    pkg-config uuid-dev xsltproc zip unzip wget curl \
    ca-certificates xz-utils gperf nasm
```

### Build Steps

```bash
git clone https://github.com/matbeedotcom/libreoffice-document-converter.git
cd libreoffice-document-converter

# Run the build script (takes 1-4 hours)
BUILD_JOBS=32 ./build/build-wasm.sh
```

### Build Options

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `BUILD_JOBS` | `$(nproc)` | Number of parallel compile jobs |
| `BUILD_DIR` | `~/libreoffice-wasm-build` | Build directory |
| `OUTPUT_DIR` | `./wasm` | Output directory for WASM files |
| `LIBREOFFICE_VERSION` | `libreoffice-24-8` | LibreOffice Git branch |
| `EMSDK_VERSION` | `3.1.51` | Emscripten SDK version |

### Build Output

| File | Size (Raw) | Size (Brotli) | Description |
|------|------------|---------------|-------------|
| `soffice.wasm` | 112 MB | 24.8 MB | Main WebAssembly binary |
| `soffice.data` | 80 MB | 15.2 MB | Filesystem image (fonts, configs) |
| `soffice.cjs` | 230 KB | - | JavaScript loader |
| `soffice.worker.cjs` | 4 KB | - | Web Worker script |
| `loader.cjs` | 8 KB | - | Node.js module loader |
| **Total** | **192 MB** | **40 MB** | With Brotli compression |

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
  // ... etc
};
```

### `FORMAT_MIME_TYPES`

MIME types for each output format.

```typescript
const FORMAT_MIME_TYPES: Record<OutputFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // ... etc
};
```

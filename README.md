# LibreOffice WASM Document Converter

A headless document conversion toolkit that uses LibreOffice compiled to WebAssembly. Convert documents between various formats (DOCX, PDF, ODT, XLSX, etc.) directly in Node.js or the browser without any native dependencies.

## Features

- 🚀 **Pure WebAssembly** - No native LibreOffice installation required
- 📄 **Wide Format Support** - Convert between 15+ document formats
- 🌐 **Cross-Platform** - Works in Node.js and browsers
- 📦 **Zero Dependencies** - Self-contained WASM module
- 🔒 **Secure** - Documents never leave your environment
- ⚡ **Fast Conversions** - 1-5 seconds per document after initialization

> **Note:** First browser initialization includes downloading ~240MB of WASM files. After that, conversions are fast. Reuse the converter instance for best performance.

## Quick Start

### Installation

```bash
npm install @libreoffice-wasm/converter
```

### Basic Usage (Node.js)

```javascript
import { createConverter } from '@libreoffice-wasm/converter';
import fs from 'fs';

// Initialize the converter (blocks main thread)
const converter = await createConverter({
  wasmPath: './node_modules/@libreoffice-wasm/converter/wasm',
  verbose: true,
  onProgress: (info) => console.log(`[${info.phase}] ${info.percent}%`),
});

// Read a document
const docxBuffer = fs.readFileSync('document.docx');

// Convert to PDF
const result = await converter.convert(docxBuffer, {
  outputFormat: 'pdf',
}, 'document.docx');

// Save the result
fs.writeFileSync('document.pdf', result.data);
console.log(`Converted in ${result.duration}ms`);

// Clean up
await converter.destroy();
```

### Non-Blocking Conversion (Recommended for Servers)

```javascript
import { createWorkerConverter } from '@libreoffice-wasm/converter';

// Runs in a worker thread - doesn't block the main thread
const converter = await createWorkerConverter({
  wasmPath: './wasm',
});

const result = await converter.convert(docxBuffer, { outputFormat: 'pdf' });
await converter.destroy();
```

### One-Shot Conversion

```javascript
import { convertDocument } from '@libreoffice-wasm/converter';

// Creates converter, converts, then destroys - best for single conversions
const result = await convertDocument(
  docxBuffer,
  { outputFormat: 'pdf' },
  { wasmPath: './wasm' }
);
```

## Table of Contents

- [System Requirements](#system-requirements)
- [Building from Source](#building-from-source)
- [Project Setup](#project-setup)
- [API Reference](#api-reference)
  - [Node.js Converters](#converter-comparison)
  - [Conversion Validation](#isconversionsupportedinputformat-outputformat)
- [Supported Formats](#supported-formats)
- [Browser Usage](#browser-usage)
- [WASM Loading Progress](#wasm-loading-progress)
- [Document Inspection & Rendering API](#document-inspection--rendering-api)
- [Document Editing API](#document-editing-api)
- [Browser Document Preview API](#browser-document-preview-api)
- [Configuration](#configuration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## System Requirements

### Using Pre-built WASM (Recommended)

- Node.js 18.0.0 or later
- ~150MB disk space for WASM files

### Building from Source

- Ubuntu 22.04+ / Debian 12+ (or compatible)
- 16GB+ RAM (32GB recommended)
- 50GB+ disk space
- 8+ CPU cores (32 recommended)
- Build time: 1-4 hours

---

## Building from Source

If you need to build the LibreOffice WASM module yourself:

### Prerequisites

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
# Clone this repository
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
| `SKIP_DEPS` | `0` | Skip dependency installation |
| `CLEAN_BUILD` | `0` | Clean before building |

```

### Build Output

After building, the `wasm/` directory contains:

| File | Size (Raw) | Size (Brotli) | Description |
|------|------------|---------------|-------------|
| `soffice.wasm` | 112 MB | 24.8 MB | Main WebAssembly binary |
| `soffice.data` | 80 MB | 15.2 MB | Filesystem image (fonts, configs) |
| `soffice.cjs` | 230 KB | - | JavaScript loader |
| `soffice.worker.cjs` | 4 KB | - | Web Worker script |
| `loader.cjs` | 8 KB | - | Node.js module loader |
| **Total** | **192 MB** | **40 MB** | With Brotli compression |


## Project Setup

### Development Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Development mode with auto-reload
npm run dev
```

### NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run build:wasm` | Build LibreOffice WASM |
| `npm test` | Run tests |
| `npm run dev` | Development server with watch |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint code linting |

---

## API Reference

### `createConverter(options?)`

Creates and initializes a converter instance.

```typescript
import { createConverter } from '@libreoffice-wasm/converter';

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

### `converter.convert(input, options, filename?)`

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

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `Uint8Array \| ArrayBuffer \| Buffer` | Input document data |
| `options` | `ConversionOptions` | Conversion options |
| `filename` | `string` | Optional filename for format detection |

**Returns:** `Promise<ConversionResult>`

```typescript
interface ConversionResult {
  data: Uint8Array;      // Converted document bytes
  mimeType: string;      // MIME type of output
  filename: string;      // Suggested output filename
  duration: number;      // Conversion time in ms
}
```

### `converter.destroy()`

Clean up resources. Call when done converting.

```typescript
await converter.destroy();
```

### `convertDocument(input, options, converterOptions?)`

One-shot conversion utility. Creates converter, converts, then destroys.

```typescript
import { convertDocument } from '@libreoffice-wasm/converter';

const result = await convertDocument(
  inputBuffer,
  { outputFormat: 'pdf' },
  { wasmPath: './wasm' }
);
```

### `createWorkerConverter(options?)`

Creates a converter that runs in a worker thread. **Recommended for servers** as it doesn't block the main thread.

```typescript
import { createWorkerConverter } from '@libreoffice-wasm/converter';

const converter = await createWorkerConverter({
  wasmPath: './wasm',
  verbose: false,
});

// Same API as LibreOfficeConverter
const result = await converter.convert(docxBuffer, { outputFormat: 'pdf' });
await converter.destroy();
```

### `createSubprocessConverter(options?)`

Creates a converter that runs in a separate child process. Best for **memory isolation** and automatic recovery from crashes.

```typescript
import { createSubprocessConverter } from '@libreoffice-wasm/converter';

const converter = await createSubprocessConverter({
  wasmPath: './wasm',
});

const result = await converter.convert(xlsxBuffer, { outputFormat: 'pdf' }, 'report.xlsx');
await converter.destroy();
```

### Converter Comparison

| Converter | Thread | Memory | Use Case |
|-----------|--------|--------|----------|
| `createConverter()` | Main | Shared | Simple scripts |
| `createWorkerConverter()` | Worker | Shared | **Servers (recommended)** |
| `createSubprocessConverter()` | Process | Isolated | High reliability, memory-constrained |

### `LibreOfficeConverter.getSupportedInputFormats()`

Get list of supported input formats.

```typescript
import { LibreOfficeConverter } from '@libreoffice-wasm/converter';

const formats = LibreOfficeConverter.getSupportedInputFormats();
// ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', ...]
```

### `LibreOfficeConverter.getSupportedOutputFormats()`

Get list of supported output formats.

```typescript
const formats = LibreOfficeConverter.getSupportedOutputFormats();
// ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'xlsx', ...]
```

### `isConversionSupported(inputFormat, outputFormat)`

Check if a specific conversion path is supported.

```typescript
import { isConversionSupported } from '@libreoffice-wasm/converter';

isConversionSupported('docx', 'pdf');   // true
isConversionSupported('pdf', 'docx');   // false - PDFs can't be converted to DOCX
isConversionSupported('xlsx', 'csv');   // true
isConversionSupported('pptx', 'xlsx');  // false - can't convert presentations to spreadsheets
```

### `getValidOutputFormatsFor(inputFormat)`

Get valid output formats for a given input format.

```typescript
import { getValidOutputFormatsFor } from '@libreoffice-wasm/converter';

getValidOutputFormatsFor('docx');
// ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'png']

getValidOutputFormatsFor('xlsx');
// ['pdf', 'xlsx', 'xls', 'ods', 'csv', 'html', 'png']

getValidOutputFormatsFor('pdf');
// ['pdf', 'png', 'svg', 'html'] (PDFs are imported as Draw documents)
```

### Conversion Validation Example

```typescript
import {
  isConversionSupported,
  getValidOutputFormatsFor,
  getConversionErrorMessage,
} from '@libreoffice-wasm/converter';

function validateConversion(inputFile: string, outputFormat: string) {
  const ext = inputFile.split('.').pop()?.toLowerCase();

  if (!isConversionSupported(ext, outputFormat)) {
    throw new Error(getConversionErrorMessage(ext, outputFormat));
    // "Cannot convert PDF to DOCX. PDF files are imported as Draw documents
    //  and cannot be exported to Office formats. Valid output formats for PDF:
    //  pdf, png, svg, html"
  }
}
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

## Browser Usage

### Import

```html
<script type="module">
import {
  WorkerBrowserConverter,
  BrowserConverter,
  createWasmPaths
} from '@libreoffice-wasm/converter/browser';
</script>
```

### Basic Browser Usage (Web Worker - Recommended)

The `WorkerBrowserConverter` runs LibreOffice in a Web Worker, keeping the main thread responsive:

```javascript
import { WorkerBrowserConverter, createWasmPaths } from '@libreoffice-wasm/converter/browser';

// Create converter - serves WASM from /wasm/ by default
const converter = new WorkerBrowserConverter({
  ...createWasmPaths(), // Defaults to /wasm/
  browserWorkerJs: '/dist/browser-worker.js',
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

### Main Thread Converter (Alternative)

For simpler setups without a worker (blocks UI during conversion):

```javascript
import { BrowserConverter, createWasmPaths } from '@libreoffice-wasm/converter/browser';

const converter = new BrowserConverter({
  ...createWasmPaths(), // Defaults to /wasm/
  onProgress: (info) => console.log(`${info.percent}%: ${info.message}`),
});

await converter.initialize();
const result = await converter.convert(fileData, { outputFormat: 'pdf' }, 'doc.docx');
```

### Required WASM Paths

The browser converter requires paths to WASM files. Use `createWasmPaths()` which defaults to `/wasm/`:

```javascript
import { createWasmPaths, DEFAULT_WASM_BASE_URL } from '@libreoffice-wasm/converter/browser';

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
  browserWorkerJs: '/workers/browser-worker.js',
});
```

> **Note:** For production, consider hosting WASM files on your own CDN for better reliability and caching.

### Required HTTP Headers

SharedArrayBuffer requires specific CORS headers on your server:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

---

## WASM Loading Progress

The browser converter provides detailed progress tracking during WASM initialization. The progress system tracks download bytes, compilation phases, and LibreOffice initialization.

### Progress Callback

```typescript
import { WorkerBrowserConverter, createWasmPaths } from '@libreoffice-wasm/converter/browser';

const converter = new WorkerBrowserConverter({
  ...createWasmPaths('/wasm/'),
  browserWorkerJs: '/dist/browser-worker.js',
  onProgress: (progress) => {
    // progress is a WasmLoadProgress object
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

### WasmLoadProgress Interface

```typescript
interface WasmLoadProgress {
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

type WasmLoadPhase =
  | 'download-wasm'    // Downloading soffice.wasm (~142MB)
  | 'download-data'    // Downloading soffice.data (~96MB)
  | 'compile'          // WebAssembly compilation
  | 'filesystem'       // Emscripten filesystem setup
  | 'lok-init'         // LibreOfficeKit initialization
  | 'ready';           // Complete
```

### Progress Phases

| Phase | Weight | Description |
|-------|--------|-------------|
| `download-wasm` | 30% | Downloading soffice.wasm (~142MB) |
| `download-data` | 20% | Downloading soffice.data (~96MB) |
| `compile` | 10% | WebAssembly compilation |
| `filesystem` | 5% | Virtual filesystem setup |
| `lok-init` | 35% | LibreOffice initialization |

### Example: Progress Bar UI

```html
<div id="progress-container">
  <div id="progress-bar" style="width: 0%"></div>
</div>
<div id="progress-text">Initializing...</div>
<div id="progress-bytes"></div>

<script type="module">
import { WorkerBrowserConverter, createWasmPaths } from '/dist/browser.js';

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressBytes = document.getElementById('progress-bytes');

const converter = new WorkerBrowserConverter({
  ...createWasmPaths('/wasm/'),
  browserWorkerJs: '/dist/browser-worker.js',
  onProgress: (progress) => {
    progressBar.style.width = `${progress.percent}%`;
    progressText.textContent = progress.message;

    if (progress.bytesLoaded !== undefined && progress.bytesTotal) {
      const loaded = (progress.bytesLoaded / 1024 / 1024).toFixed(1);
      const total = (progress.bytesTotal / 1024 / 1024).toFixed(1);
      progressBytes.textContent = `${loaded} MB / ${total} MB`;
    } else {
      progressBytes.textContent = '';
    }
  },
});

await converter.initialize();
progressText.textContent = 'Ready!';
</script>
```

---

## Document Inspection & Rendering API

All converters (Node.js and Browser) provide APIs for inspecting documents and rendering page previews without full conversion. This is useful for building document viewers, thumbnail galleries, and editors.

### `converter.getDocumentInfo(input, inputFormat)`

Get document metadata including type, page count, and valid output formats.

```typescript
// Node.js
import { createWorkerConverter } from '@libreoffice-wasm/converter';

const converter = await createWorkerConverter({ wasmPath: './wasm' });

const docInfo = await converter.getDocumentInfo(fileBuffer, 'docx');
console.log(docInfo);
// {
//   documentType: 0,           // 0=TEXT, 1=SPREADSHEET, 2=PRESENTATION, 3=DRAWING
//   documentTypeName: 'Text Document',
//   validOutputFormats: ['pdf', 'docx', 'odt', 'html', 'txt', 'png'],
//   pageCount: 5
// }
```

**Returns:** `Promise<DocumentInfo>`

```typescript
interface DocumentInfo {
  documentType: number;           // LOK document type enum
  documentTypeName: string;       // Human-readable type name
  validOutputFormats: string[];   // Formats this document can be converted to
  pageCount: number;              // Number of pages/slides/sheets
}
```

### `converter.getPageCount(input, inputFormat)`

Get just the page count for a document.

```typescript
const pageCount = await converter.getPageCount(docxBuffer, 'docx');
console.log(`Document has ${pageCount} pages`);
```

**Returns:** `Promise<number>`

### `converter.renderPage(input, inputFormat, pageIndex, width, height?)`

Render a single page as a PNG image.

```typescript
// Render first page at 800px width (height auto-calculated to maintain aspect ratio)
const preview = await converter.renderPage(pptxBuffer, 'pptx', 0, 800);

// preview.data is a Uint8Array containing raw RGBA pixel data
console.log(`Rendered: ${preview.width}x${preview.height} pixels`);

// Save as PNG (Node.js)
import { createCanvas } from 'canvas';
const canvas = createCanvas(preview.width, preview.height);
const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(preview.width, preview.height);
imageData.data.set(preview.data);
ctx.putImageData(imageData, 0, 0);
fs.writeFileSync('page-0.png', canvas.toBuffer('image/png'));
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `Uint8Array \| Buffer` | Document data |
| `inputFormat` | `string` | Input format (e.g., 'docx', 'pptx') |
| `pageIndex` | `number` | 0-based page index |
| `width` | `number` | Target width in pixels |
| `height` | `number` | Optional target height (0 = auto based on aspect ratio) |

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

console.log(`Rendered ${previews.length} pages`);
previews.forEach(p => console.log(`Page ${p.page}: ${p.width}x${p.height}`));

// Render only specific pages
const selectedPreviews = await converter.renderPagePreviews(pptxBuffer, 'pptx', {
  width: 800,
  pageIndices: [0, 2, 4],  // Only pages 1, 3, and 5
});
```

**Options:**

```typescript
interface RenderOptions {
  /** Width of rendered image in pixels (default: 800) */
  width?: number;
  /** Height of rendered image in pixels (0 = auto based on aspect ratio) */
  height?: number;
  /** Specific page indices to render (0-based). If empty, renders all pages */
  pageIndices?: number[];
}
```

**Returns:** `Promise<PagePreview[]>`

### `converter.getDocumentText(input, inputFormat)`

Extract all text content from a document.

```typescript
const text = await converter.getDocumentText(docxBuffer, 'docx');
if (text) {
  console.log('Document text:', text);
} else {
  console.log('No text content found');
}
```

**Returns:** `Promise<string | null>`

### `converter.getPageNames(input, inputFormat)`

Get slide names (for presentations) or sheet names (for spreadsheets).

```typescript
// For presentations - get slide names
const slideNames = await converter.getPageNames(pptxBuffer, 'pptx');
console.log('Slides:', slideNames);
// ['Introduction', 'Overview', 'Conclusion']

// For spreadsheets - get sheet names
const sheetNames = await converter.getPageNames(xlsxBuffer, 'xlsx');
console.log('Sheets:', sheetNames);
// ['Sheet1', 'Data', 'Summary']
```

**Returns:** `Promise<string[]>`

### Document Types

| Type | Value | Description |
|------|-------|-------------|
| TEXT | 0 | Writer documents (doc, docx, odt, rtf, txt) |
| SPREADSHEET | 1 | Calc documents (xls, xlsx, ods, csv) |
| PRESENTATION | 2 | Impress documents (ppt, pptx, odp) |
| DRAWING | 3 | Draw documents (odg, pdf) |

---

## Document Editing API

The converters support opening documents for editing, making modifications, and saving the results.

### `converter.openDocument(input, inputFormat)`

Open a document for editing. Returns a session that can be used for subsequent operations.

```typescript
const session = await converter.openDocument(docxBuffer, 'docx');
console.log(session);
// {
//   sessionId: 'edit_session_0_1234567890',
//   documentType: 'writer',  // 'writer', 'calc', or 'impress'
//   pageCount: 5
// }
```

**Returns:** `Promise<EditorSession>`

```typescript
interface EditorSession {
  sessionId: string;      // Unique session ID for this document
  documentType: string;   // 'writer', 'calc', or 'impress'
  pageCount: number;      // Number of pages/slides/sheets
}
```

### `converter.editorOperation(sessionId, method, ...args)`

Execute an editing operation on an open document.

```typescript
// Get document structure
const structure = await converter.editorOperation(session.sessionId, 'getStructure');
console.log(structure.data);

// Get document type
const docType = await converter.editorOperation(session.sessionId, 'getDocumentType');
console.log(docType.data);  // 'writer', 'calc', or 'impress'

// Insert text (Writer documents)
const result = await converter.editorOperation(
  session.sessionId,
  'insertText',
  'Hello, World!'
);

// Set cell value (Calc documents)
const cellResult = await converter.editorOperation(
  session.sessionId,
  'setCellValue',
  'A1',
  42
);
```

**Returns:** `Promise<EditorOperationResult<T>>`

```typescript
interface EditorOperationResult<T = unknown> {
  success: boolean;      // Whether the operation succeeded
  verified?: boolean;    // Whether the result was verified
  data?: T;              // Operation result data
  error?: string;        // Error message if failed
  suggestion?: string;   // Suggested fix if failed
}
```

### `converter.closeDocument(sessionId)`

Close an editing session and get the modified document.

```typescript
// Close and get modified document
const modifiedData = await converter.closeDocument(session.sessionId);

if (modifiedData) {
  fs.writeFileSync('modified.docx', modifiedData);
  console.log('Document saved!');
} else {
  console.log('No changes or save failed');
}
```

**Returns:** `Promise<Uint8Array | undefined>`

### Complete Editing Example

```typescript
import { createWorkerConverter } from '@libreoffice-wasm/converter';
import fs from 'fs';

const converter = await createWorkerConverter({ wasmPath: './wasm' });

// Read document
const docx = fs.readFileSync('template.docx');

// Open for editing
const session = await converter.openDocument(docx, 'docx');
console.log(`Opened ${session.documentType} document with ${session.pageCount} pages`);

// Get current structure
const structure = await converter.editorOperation(session.sessionId, 'getStructure');
console.log('Structure:', structure.data);

// Make modifications...
// (specific operations depend on document type)

// Close and save
const modified = await converter.closeDocument(session.sessionId);
if (modified) {
  fs.writeFileSync('output.docx', modified);
}

await converter.destroy();
```

---

## Browser Document Preview API

The browser converter provides additional convenience methods for rendering.

### Get Document Info (Browser)

```typescript
import { WorkerBrowserConverter, createWasmPaths } from '@libreoffice-wasm/converter/browser';

const converter = new WorkerBrowserConverter({
  ...createWasmPaths('/wasm/'),
  browserWorkerJs: '/dist/browser-worker.js',
});
await converter.initialize();

const docInfo = await converter.getDocumentInfo(fileBuffer, 'document.docx');
```

### Get LibreOffice Info

```typescript
const lokInfo = await converter.getLokInfo();
console.log(lokInfo);
// {
//   version: "24.8.0.0.alpha0...",
//   buildInfo: "..."
// }
```

### Example: Document Thumbnail Gallery

```typescript
import { WorkerBrowserConverter, createWasmPaths } from '@libreoffice-wasm/converter/browser';

const converter = new WorkerBrowserConverter({
  ...createWasmPaths('/wasm/'),
  browserWorkerJs: '/dist/browser-worker.js',
});
await converter.initialize();

async function renderThumbnails(fileBuffer: Uint8Array, filename: string) {
  const docInfo = await converter.getDocumentInfo(fileBuffer, filename);
  const thumbnails: string[] = [];

  for (let i = 0; i < docInfo.pageCount; i++) {
    const pageData = await converter.renderSinglePage(fileBuffer, filename, {
      pageIndex: i,
      dpi: 72,  // Low DPI for thumbnails
    });

    const blob = new Blob([pageData], { type: 'image/png' });
    thumbnails.push(URL.createObjectURL(blob));
  }

  return thumbnails;
}
```

---

## Configuration

### PDF Options

```typescript
const result = await converter.convert(input, {
  outputFormat: 'pdf',
  pdf: {
    // PDF/A compliance level
    pdfaLevel: 'PDF/A-2b',  // 'PDF/A-1b', 'PDF/A-2b', 'PDF/A-3b'
    
    // Image quality (0-100)
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

## Examples

### Convert DOCX to PDF

```javascript
import { createConverter } from '@libreoffice-wasm/converter';
import fs from 'fs';

const converter = await createConverter({ wasmPath: './wasm' });

const docx = fs.readFileSync('report.docx');
const pdf = await converter.convert(docx, { outputFormat: 'pdf' });

fs.writeFileSync('report.pdf', pdf.data);
await converter.destroy();
```

### Batch Conversion

```javascript
import { createConverter } from '@libreoffice-wasm/converter';
import fs from 'fs';
import path from 'path';

const converter = await createConverter({ wasmPath: './wasm' });

const files = fs.readdirSync('./documents')
  .filter(f => f.endsWith('.docx'));

for (const file of files) {
  const input = fs.readFileSync(path.join('./documents', file));
  const result = await converter.convert(input, { outputFormat: 'pdf' }, file);
  fs.writeFileSync(
    path.join('./output', result.filename),
    result.data
  );
  console.log(`Converted: ${file} -> ${result.filename}`);
}

await converter.destroy();
```

### Express.js Server

```javascript
import express from 'express';
import multer from 'multer';
import { createWorkerConverter, isConversionSupported } from '@libreoffice-wasm/converter';

const app = express();
const upload = multer();
let converter;

// Initialize on startup (use worker converter for non-blocking)
(async () => {
  converter = await createWorkerConverter({ wasmPath: './wasm' });
  console.log('Converter ready');
})();

app.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const inputFormat = req.file.originalname.split('.').pop()?.toLowerCase();
    const outputFormat = req.body.format || 'pdf';

    // Validate conversion before attempting
    if (!isConversionSupported(inputFormat, outputFormat)) {
      return res.status(400).json({
        error: `Cannot convert ${inputFormat} to ${outputFormat}`,
      });
    }

    const result = await converter.convert(
      req.file.buffer,
      { outputFormat },
      req.file.originalname
    );

    res.set('Content-Type', result.mimeType);
    res.set('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(Buffer.from(result.data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### React Component

```tsx
import { useState, useEffect, useRef } from 'react';
import { WorkerBrowserConverter, createWasmPaths } from '@libreoffice-wasm/converter/browser';

function DocumentConverter() {
  const converterRef = useRef<WorkerBrowserConverter | null>(null);
  const [status, setStatus] = useState('Loading...');
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const converter = new WorkerBrowserConverter({
        ...createWasmPaths('/wasm/'),
        browserWorkerJs: '/dist/browser-worker.js',
        onProgress: (info) => {
          setProgress(info.percent);
          setStatus(info.message);
        },
      });
      await converter.initialize();
      converterRef.current = converter;
      setReady(true);
      setStatus('Ready');
    };
    init();

    return () => {
      converterRef.current?.destroy();
    };
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !converterRef.current) return;

    setStatus('Converting...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await converterRef.current.convert(
        new Uint8Array(arrayBuffer),
        { outputFormat: 'pdf' },
        file.name
      );

      // Download the result
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);

      setStatus('Done!');
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div>
      <h2>Document Converter</h2>
      <p>Status: {status}</p>
      <progress value={progress} max={100} />
      <input
        type="file"
        onChange={handleFile}
        accept=".doc,.docx,.odt,.rtf,.xls,.xlsx,.ppt,.pptx"
        disabled={!ready}
      />
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

#### "WASM module not found"

Ensure the `wasm/` directory contains all required files:
- `soffice.wasm`
- `soffice.cjs`
- `soffice.data`
- `soffice.worker.cjs`
- `loader.cjs`

#### "SharedArrayBuffer is not defined" (Browser)

SharedArrayBuffer requires specific headers. Add to your server:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

#### Browser initialization seems slow

Browser initialization includes downloading ~240MB of WASM files. This is network-dependent.
The cost is paid **only once** per converter instance. After initialization:
- WASM files are cached by the browser
- Conversions take 1-5 seconds depending on document size
- Reuse the converter instance for multiple conversions
- For servers (Node.js), initialization is much faster (~1-2s) since files load from disk

#### Memory issues

The WASM module uses ~1GB RAM (set by TOTAL_MEMORY). For memory-constrained environments:
- Use `converter.destroy()` after batch conversions
- Avoid parallel conversions
- Consider running conversions in a subprocess

#### Reduce transfer size

Compress WASM files for 79% smaller downloads:

```bash
# Brotli (best - 40MB total)
brotli -9 wasm/soffice.wasm -o wasm/soffice.wasm.br
brotli -9 wasm/soffice.data -o wasm/soffice.data.br

# Gzip (63MB total)
gzip -9 -k wasm/soffice.wasm
gzip -9 -k wasm/soffice.data
```

Configure your server to serve pre-compressed files with correct headers.

#### Build fails with "out of memory"

Reduce parallel jobs:
```bash
BUILD_JOBS=4 ./build/build-wasm.sh
```

### Process Doesn't Exit (Node.js)

The WASM module uses pthread workers that keep the Node.js process alive. Solutions:

```javascript
// Option 1: Explicitly exit when done
await converter.destroy();
process.exit(0);

// Option 2: For servers, the process stays alive anyway (this is fine)
// The workers will be reused for subsequent conversions

// Option 3: Use setTimeout with unref() for scripts
const timer = setTimeout(() => {}, 0);
timer.unref();
```

### Debug Mode

Enable verbose logging:

```javascript
const converter = await createConverter({
  wasmPath: './wasm',
  verbose: true,  // Shows LibreOffice internal logs
});
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

> **Note:** Browser initialization time depends heavily on network speed for the initial WASM download. The ~240MB of WASM files are cached after first load. Node.js loads from filesystem so initialization is much faster.
>
> Benchmarks measured on Node.js v22 / Chromium with 20KB DOCX, 5KB XLSX, and 937KB PPTX test files.

### Optimization Tips

1. **Reuse converter instances** - Initialization cost is paid only once
2. **Pre-initialize** - Start loading during idle time or page load
3. **Server keep-warm** - In production, keep converter processes alive
4. **Use Web Workers** - Keep UI responsive (browser)
5. **Enable Brotli compression** - Reduces transfer size by 79% (192MB → 40MB)
6. **Cache WASM files** - Browser caches files after first load

---

## License

This project is licensed under the Mozilla Public License 2.0 (MPL-2.0), the same license as LibreOffice.

### Dependencies

- [LibreOffice](https://www.libreoffice.org/) - MPL-2.0
- [Emscripten](https://emscripten.org/) - MIT

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Development

```bash
# Clone and setup
git clone https://github.com/matbeedotcom/libreoffice-document-converter.git
cd libreoffice-document-converter
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint:fix
```

---

## Support

- [GitHub Issues](https://github.com/matbeedotcom/libreoffice-document-converter/issues)
- [Documentation](https://github.com/matbeedotcom/libreoffice-document-converter#readme)

# LibreOffice WASM Document Converter

A headless document conversion toolkit that uses LibreOffice compiled to WebAssembly. Convert documents between various formats (DOCX, PDF, ODT, XLSX, etc.) directly in Node.js or the browser without any native dependencies.

## Features

- 🚀 **Pure WebAssembly** - No native LibreOffice installation required
- 📄 **Wide Format Support** - Convert between 15+ document formats
- 🌐 **Cross-Platform** - Works in Node.js and browsers
- 📦 **Zero Dependencies** - Self-contained WASM module
- 🔒 **Secure** - Documents never leave your environment
- ⚡ **Fast** - ~270ms typical conversion time

## Quick Start

### Installation

```bash
npm install @libreoffice-wasm/converter
```

### Basic Usage (Node.js)

```javascript
import { createConverter } from '@libreoffice-wasm/converter';
import fs from 'fs';

// Initialize the converter
const converter = await createConverter({
  wasmPath: './node_modules/@libreoffice-wasm/converter/wasm',
  verbose: true,
});

// Read a document
const docxBuffer = fs.readFileSync('document.docx');

// Convert to PDF
const result = await converter.convert(docxBuffer, {
  outputFormat: 'pdf',
});

// Save the result
fs.writeFileSync('document.pdf', result.data);
console.log(`Converted in ${result.duration}ms`);

// Clean up
await converter.destroy();
```

### One-Shot Conversion

```javascript
import { convertDocument } from '@libreoffice-wasm/converter';

const pdfData = await convertDocument(
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
- [Supported Formats](#supported-formats)
- [Browser Usage](#browser-usage)
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
git clone https://github.com/your-repo/node-libreoffice-wasm.git
cd node-libreoffice-wasm

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

### Build Output

After building, the `wasm/` directory contains:

| File | Size | Description |
|------|------|-------------|
| `soffice.wasm` | ~110MB | Main WebAssembly binary |
| `soffice.cjs` | ~230KB | JavaScript loader |
| `soffice.data` | ~80MB | Filesystem image (fonts, configs) |
| `soffice.worker.cjs` | ~4KB | Web Worker script |
| `loader.cjs` | ~2KB | Node.js module loader |

---

## Project Setup

### Directory Structure

```
node-libreoffice-v2/
├── build/              # Build scripts and configs
│   ├── build-wasm.sh   # Main build script
│   ├── autogen.input   # LibreOffice configure options
│   └── patches/        # Source patches
├── dist/               # Compiled TypeScript (after npm run build)
├── examples/           # Usage examples
├── src/                # TypeScript source
│   ├── index.ts        # Main API exports
│   ├── converter.ts    # Core converter class
│   ├── browser.ts      # Browser-specific module
│   ├── lok-bindings.ts # LibreOfficeKit bindings
│   └── types.ts        # TypeScript types
├── tests/              # Test files
├── wasm/               # WASM binary files
│   ├── soffice.wasm
│   ├── soffice.cjs
│   ├── soffice.data
│   ├── soffice.worker.cjs
│   └── loader.cjs
└── package.json
```

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
import { BrowserConverter, quickConvert } from '@libreoffice-wasm/converter/browser';
</script>
```

Or via CDN:

```html
<script type="module">
import { BrowserConverter } from 'https://cdn.jsdelivr.net/npm/@libreoffice-wasm/converter/dist/browser.js';
</script>
```

### Basic Browser Usage

```javascript
import { BrowserConverter } from '@libreoffice-wasm/converter/browser';

const converter = new BrowserConverter({
  wasmPath: '/wasm',
  onProgress: (info) => {
    progressBar.style.width = `${info.percent}%`;
    statusText.textContent = info.message;
  },
});

await converter.initialize();

// Convert a File object
const result = await converter.convertFile(file, { outputFormat: 'pdf' });

// Auto-download
converter.download(result);

// Or preview in new tab
converter.preview(result);

// Or get blob URL
const url = converter.createBlobUrl(result);
```

### Drag and Drop

```javascript
import { createDropZone } from '@libreoffice-wasm/converter/browser';

const dropZone = createDropZone('#drop-area', {
  outputFormat: 'pdf',
  wasmPath: '/wasm',
  autoDownload: true,
  onProgress: (info) => console.log(info.message),
  onConvert: (result) => console.log('Converted:', result.filename),
  onError: (err) => alert(err.message),
});

// Clean up when done
dropZone.destroy();
```

### Quick Convert

```javascript
import { quickConvert } from '@libreoffice-wasm/converter/browser';

// From file input
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await quickConvert(file, 'pdf', { download: true });
});
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
import { createConverter } from '@libreoffice-wasm/converter';

const app = express();
const upload = multer();
let converter;

// Initialize on startup
(async () => {
  converter = await createConverter({ wasmPath: './wasm' });
  console.log('Converter ready');
})();

app.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const result = await converter.convert(
      req.file.buffer,
      { outputFormat: req.body.format || 'pdf' },
      req.file.originalname
    );
    
    res.set('Content-Type', result.mimeType);
    res.set('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(Buffer.from(result.data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000);
```

### React Component

```jsx
import { useState, useEffect, useRef } from 'react';
import { BrowserConverter } from '@libreoffice-wasm/converter/browser';

function DocumentConverter() {
  const [converter, setConverter] = useState(null);
  const [status, setStatus] = useState('Loading...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const init = async () => {
      const conv = new BrowserConverter({
        wasmPath: '/wasm',
        onProgress: (info) => {
          setProgress(info.percent);
          setStatus(info.message);
        },
      });
      await conv.initialize();
      setConverter(conv);
      setStatus('Ready');
    };
    init();
    
    return () => converter?.destroy();
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !converter) return;

    setStatus('Converting...');
    try {
      const result = await converter.convertFile(file, { outputFormat: 'pdf' });
      converter.download(result);
      setStatus('Done!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Document Converter</h2>
      <p>Status: {status}</p>
      <progress value={progress} max={100} />
      <input type="file" onChange={handleFile} accept=".doc,.docx,.odt,.rtf" />
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

#### Conversion takes too long

First conversion includes initialization (~30s). Subsequent conversions are fast (~270ms).
Reuse the converter instance for multiple conversions.

#### Memory issues

The WASM module uses ~500MB RAM. For memory-constrained environments:
- Use `converter.destroy()` after batch conversions
- Avoid parallel conversions

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

| Operation | Time |
|-----------|------|
| First initialization | ~30s |
| Subsequent init (cached) | ~5s |
| DOCX → PDF (1 page) | ~270ms |
| XLSX → PDF (100 rows) | ~350ms |
| PPTX → PDF (10 slides) | ~800ms |

### Optimization Tips

1. **Reuse converter instances** - Initialization is expensive
2. **Pre-initialize** - Start loading before user needs it
3. **Use Web Workers** - Keep UI responsive (browser)
4. **Enable caching** - Browser caches WASM files
5. **Compress WASM** - Serve with gzip (~40% smaller)

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
git clone https://github.com/your-repo/node-libreoffice-wasm.git
cd node-libreoffice-wasm
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

- [GitHub Issues](https://github.com/your-repo/node-libreoffice-wasm/issues)
- [Documentation](https://github.com/your-repo/node-libreoffice-wasm/wiki)

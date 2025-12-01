# LibreOffice WASM Document Converter

A headless LibreOffice build compiled to WebAssembly for document conversion. **No UI support** - purely an API toolkit for converting documents between formats.

## Features

- 🚀 **Pure WASM** - Runs in browsers and Node.js
- 📄 **Format Conversion** - Convert between 20+ document formats
- 🔒 **Headless** - No UI dependencies, just API
- ⚡ **Fast** - Native LibreOffice conversion engine
- 📦 **TypeScript** - Full type definitions included

## Supported Formats

### Input Formats
- **Microsoft Office**: DOC, DOCX, XLS, XLSX, PPT, PPTX
- **OpenDocument**: ODT, ODS, ODP, ODG, ODF
- **Other**: RTF, TXT, HTML, CSV, XML, EPUB, PDF

### Output Formats
- **PDF**: PDF, PDF/A-1b, PDF/A-2b, PDF/A-3b
- **Documents**: DOCX, DOC, ODT, RTF, TXT, HTML
- **Spreadsheets**: XLSX, XLS, ODS, CSV
- **Presentations**: PPTX, PPT, ODP
- **Images**: PNG, JPG, SVG

## Installation

```bash
npm install @libreoffice-wasm/converter
```

## Quick Start

### Node.js

```typescript
import { createConverter } from '@libreoffice-wasm/converter';
import { readFile, writeFile } from 'fs/promises';

// Create and initialize converter
const converter = await createConverter({
  wasmPath: './node_modules/@libreoffice-wasm/converter/wasm',
});

// Read input document
const docx = await readFile('document.docx');

// Convert to PDF
const result = await converter.convert(docx, {
  outputFormat: 'pdf',
  pdf: {
    pdfaLevel: 'PDF/A-2b',
    embedFonts: true,
  },
});

// Write output
await writeFile('document.pdf', result.data);

// Cleanup
await converter.destroy();
```

### Browser

```typescript
import { BrowserConverter } from '@libreoffice-wasm/converter/browser';

const converter = new BrowserConverter({
  wasmPath: '/wasm', // Path to WASM files on your server
});

await converter.initialize();

// Convert a File object
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await converter.convertFile(file, {
  outputFormat: 'pdf',
});

// Download the result
converter.download(result);
```

### Quick Conversion (One-liner)

```typescript
import { convertDocument } from '@libreoffice-wasm/converter';

const pdfData = await convertDocument(docxBuffer, {
  outputFormat: 'pdf',
});
```

## API Reference

### `LibreOfficeConverter`

Main converter class for document conversion operations.

```typescript
const converter = new LibreOfficeConverter(options?: LibreOfficeWasmOptions);
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wasmPath` | `string` | `'./wasm'` | Path to WASM files directory |
| `memoryLimit` | `number` | `1GB` | Memory limit in bytes |
| `timeout` | `number` | `300000` | Operation timeout in ms |
| `verbose` | `boolean` | `false` | Enable verbose logging |
| `onProgress` | `function` | - | Progress callback |
| `onReady` | `function` | - | Ready callback |
| `onError` | `function` | - | Error callback |

#### Methods

##### `initialize(): Promise<void>`
Initialize the WASM module. Must be called before conversion.

##### `convert(input, options, filename?): Promise<ConversionResult>`
Convert a document to a different format.

```typescript
const result = await converter.convert(buffer, {
  outputFormat: 'pdf',
  pdf: {
    pdfaLevel: 'PDF/A-2b',
    embedFonts: true,
    quality: 90,
  },
});
```

##### `getMetadata(input, filename?): Promise<DocumentMetadata>`
Extract metadata from a document without conversion.

##### `convertBatch(documents): Promise<ConversionResult[]>`
Convert multiple documents sequentially.

##### `destroy(): Promise<void>`
Clean up resources.

##### `isReady(): boolean`
Check if converter is initialized.

### `ConversionOptions`

```typescript
interface ConversionOptions {
  outputFormat: OutputFormat;
  inputFormat?: InputFormat;
  pdf?: PdfOptions;
  image?: ImageOptions;
  pageRange?: string;      // e.g., "1-5", "1,3,5"
  password?: string;       // For encrypted documents
  enableMacros?: boolean;  // Default: false
}
```

### `PdfOptions`

```typescript
interface PdfOptions {
  pdfaLevel?: 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';
  embedFonts?: boolean;
  quality?: number;        // 0-100
  taggedPdf?: boolean;
  exportFormFields?: boolean;
  initialView?: 'default' | 'outline' | 'thumbnails';
  watermark?: string;
}
```

### `ImageOptions`

```typescript
interface ImageOptions {
  width?: number;          // Pixels
  height?: number;         // Pixels
  dpi?: number;            // Default: 150
  quality?: number;        // 0-100 (JPEG only)
  backgroundColor?: string; // e.g., "#ffffff"
}
```

### `ConversionResult`

```typescript
interface ConversionResult {
  data: Uint8Array;        // Converted document
  mimeType: string;        // Output MIME type
  filename: string;        // Suggested filename
  duration: number;        // Conversion time (ms)
  pageCount?: number;      // Page count if applicable
}
```

## Building LibreOffice WASM

The WASM build requires Docker and significant time/resources (~2-4 hours on a modern machine).

### Prerequisites

- Docker
- 16GB+ RAM recommended
- 50GB+ disk space

### Build Steps

```bash
# Clone this repository
git clone https://github.com/your-repo/libreoffice-wasm.git
cd libreoffice-wasm

# Build the Docker image (contains Emscripten + LibreOffice source)
npm run build:docker

# Run the WASM build
npm run build:wasm

# Or do both in one command
npm run build:wasm:full
```

The built WASM files will be in the `./wasm` directory:
- `soffice.wasm` - Main WebAssembly binary
- `soffice.js` - Emscripten glue code
- `soffice.data` - Preloaded data files

### Build Configuration

The build is configured for headless operation with these key options:

```
--disable-gui
--enable-headless
--host=wasm32-local-emscripten
--with-wasm-module=writer
--with-package-format=emscripten
```

See `build/autogen.input` for full configuration.

## Development Server

A development server is included for testing:

```bash
# Start development server
npm run dev

# Or production build
npm run build
npm start
```

Then open http://localhost:3000 for a demo interface.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Demo web interface |
| `/status` | GET | API status and supported formats |
| `/convert` | POST | Convert document (multipart/form-data) |

### Convert Endpoint

```bash
curl -X POST http://localhost:3000/convert \
  -F "file=@document.docx" \
  -F "outputFormat=pdf" \
  -o output.pdf
```

## Project Structure

```
libreoffice-wasm/
├── build/
│   ├── autogen.input      # LibreOffice build configuration
│   └── build-wasm.sh      # Build script
├── src/
│   ├── browser.ts         # Browser-specific module
│   ├── converter.ts       # Core converter implementation
│   ├── index.ts           # Main exports
│   ├── server.ts          # Development server
│   └── types.ts           # TypeScript definitions
├── wasm/                   # Built WASM files (after build)
├── Dockerfile             # Docker build environment
├── package.json
├── tsconfig.json
└── README.md
```

## Known Limitations

1. **Build Time**: LibreOffice WASM build takes 2-4 hours
2. **Binary Size**: WASM binary is ~50-100MB
3. **Memory**: Requires ~512MB-1GB RAM per instance
4. **Single-threaded**: WASM execution is single-threaded
5. **Browser Support**: Requires modern browser with WASM support

## Troubleshooting

### "WASM module not found"

Build the WASM files first:

```bash
npm run build:wasm:full
```

### "Out of memory" during build

Increase Docker memory limit:

```bash
docker run --memory=16g ...
```

### Conversion timeout

Increase timeout in options:

```typescript
const converter = new LibreOfficeConverter({
  timeout: 600000, // 10 minutes
});
```

## License

This project is licensed under the MPL-2.0 license to match LibreOffice's license.

LibreOffice is a trademark of The Document Foundation.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## Acknowledgments

- [LibreOffice](https://www.libreoffice.org/) - The Document Foundation
- [Emscripten](https://emscripten.org/) - WebAssembly compiler toolchain
- [The Document Foundation Wiki](https://wiki.documentfoundation.org/Development/WASM) - WASM development documentation


# LibreOffice WASM Document Converter

Convert documents between formats (DOCX, PDF, XLSX, PPTX, etc.) in Node.js or browsers using LibreOffice compiled to WebAssembly. No native dependencies required.

## Features

- **Pure WebAssembly** - No native LibreOffice installation required
- **Wide Format Support** - Convert between 15+ document formats
- **Cross-Platform** - Works in Node.js and browsers
- **Fast** - ~35ms per conversion after initialization

## Installation

```bash
npm install @matbee/libreoffice-converter
```

## Quick Start

### One-Shot Conversion (Simplest)

```javascript
import { convertDocument } from '@matbee/libreoffice-converter';
import fs from 'fs';

const docx = fs.readFileSync('document.docx');
const result = await convertDocument(docx, { outputFormat: 'pdf' });
fs.writeFileSync('document.pdf', result.data);
```

### Export as Image

```javascript
import { exportAsImage } from '@matbee/libreoffice-converter';
import fs from 'fs';

// Export document to PNG
const png = await exportAsImage(fs.readFileSync('document.docx'), 'png');
fs.writeFileSync('document.png', png.data);

// With options
const highRes = await exportAsImage(docxBuffer, 'png', { dpi: 300, width: 1920 });
```

### Server Usage (Recommended)

For servers, use the worker converter to avoid blocking the main thread:

```javascript
import { createWorkerConverter } from '@matbee/libreoffice-converter';

const converter = await createWorkerConverter({ wasmPath: './wasm' });

// Reuse for multiple conversions
const pdf = await converter.convert(docxBuffer, { outputFormat: 'pdf' });
const csv = await converter.convert(xlsxBuffer, { outputFormat: 'csv' });

await converter.destroy(); // Clean up when done
```

## Supported Formats

**Input:** doc, docx, xls, xlsx, ppt, pptx, odt, ods, odp, rtf, txt, html, csv, pdf, epub

**Output:** pdf, docx, doc, odt, rtf, txt, html, xlsx, xls, ods, csv, pptx, ppt, odp, png, jpg, svg

## Browser Usage

```javascript
import { WorkerBrowserConverter, createWasmPaths } from '@matbee/libreoffice-converter/browser';

const converter = new WorkerBrowserConverter({
  ...createWasmPaths('/wasm/'),
  browserWorkerJs: '/dist/browser.worker.js',
  onProgress: (info) => console.log(`${info.percent}%: ${info.message}`),
});

await converter.initialize();

const result = await converter.convert(fileData, { outputFormat: 'pdf' }, 'doc.docx');

// Download result
const blob = new Blob([result.data], { type: result.mimeType });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = result.filename;
a.click();
```

**Required HTTP headers** for SharedArrayBuffer:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Documentation

- **[API Reference](docs/API.md)** - Complete API documentation, types, configuration options
- **[Examples](docs/EXAMPLES.md)** - Express server, React component, batch conversion, and more

## System Requirements

- Node.js 18.0.0+
- ~150MB disk space for WASM files
- Browser: ~240MB initial download (cached after first load)

## License

MPL-2.0 (same as LibreOffice)

## Contributing

```bash
git clone https://github.com/matbeedotcom/libreoffice-document-converter.git
cd libreoffice-document-converter
npm install
npm run build
npm test
```

See [docs/API.md#building-from-source](docs/API.md#building-from-source) for building the WASM module.

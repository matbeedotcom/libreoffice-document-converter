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

## Demo
https://convertmydocuments.com

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

// Export single page (0-indexed)
const [cover] = await exportAsImage(docxBuffer, 0, 'png');
fs.writeFileSync('cover.png', cover.data);

// Export multiple pages
const slides = await exportAsImage(pptxBuffer, [0, 1, 2], 'png');
slides.forEach((img, i) => fs.writeFileSync(`slide-${i}.png`, img.data));

// Export with options
const highRes = await exportAsImage(pptxBuffer, [0, 1, 2], 'png', { dpi: 300, width: 1920 });
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

## Font Support

The WASM build includes Latin, Arabic, Hebrew, and other common fonts. For CJK (Chinese, Japanese, Korean), Indic, and other scripts, you can inject additional fonts at runtime.

### Using System Fonts (Node.js)

```javascript
const converter = await createSubprocessConverter({ includeSystemFonts: true });
```

### Using @fontsource Packages

Install fonts from npm, then load them:

```bash
npm install @fontsource/noto-sans-jp @fontsource/noto-sans-kr
```

```javascript
import { loadFontsFromPackages, createSubprocessConverter } from '@matbee/libreoffice-converter';

const fonts = await loadFontsFromPackages([
  '@fontsource/noto-sans-jp',
  '@fontsource/noto-sans-kr',
]);
const converter = await createSubprocessConverter({ fonts });
```

### Using Prebuilt Font Bundles

Download regional font bundles from [GitHub Releases](https://github.com/matbeedotcom/libreoffice-document-converter/releases):

| Bundle | Scripts | Size |
|--------|---------|------|
| `fonts-core.zip` | Latin, Cyrillic, Greek | ~6 MB |
| `fonts-cjk.zip` | Chinese, Japanese, Korean | ~250 MB |
| `fonts-arabic.zip` | Arabic, Hebrew | ~1.3 MB |
| `fonts-indic.zip` | Devanagari, Bengali, Tamil, Telugu, etc. | ~4.5 MB |
| `fonts-southeast-asian.zip` | Thai, Myanmar, Khmer, Lao | ~1.4 MB |
| `fonts-african.zip` | Ethiopic | ~835 KB |
| `fonts-all.zip` | All of the above | ~264 MB |

```javascript
import { loadFontsFromZip, createSubprocessConverter } from '@matbee/libreoffice-converter';

const fonts = await loadFontsFromZip('./fonts/fonts-cjk.zip');
const converter = await createSubprocessConverter({ fonts });
```

### Custom Font Files

```javascript
import { loadFontsFromDirectory, createSubprocessConverter } from '@matbee/libreoffice-converter';

const fonts = await loadFontsFromDirectory('./my-fonts/');
const converter = await createSubprocessConverter({ fonts });
```

### Browser Font Loading

```javascript
import { loadFontsFromUrl, WorkerBrowserConverter } from '@matbee/libreoffice-converter/browser';

const fonts = await loadFontsFromUrl('/assets/fonts-cjk.zip');
const converter = new WorkerBrowserConverter({ ...wasmPaths, fonts });
await converter.initialize();
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

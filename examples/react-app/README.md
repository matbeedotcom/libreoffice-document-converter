# React Document Converter Example

This example demonstrates how to use `@matbee/libreoffice-converter` in a React application.

## Setup

```bash
# From this directory
npm install

# Copy WASM files to public directory (one-time setup)
mkdir -p public/wasm public/dist
cp ../../wasm/soffice.* public/wasm/
cp ../../wasm/loader.cjs public/wasm/
cp ../../dist/browser.worker.global.js public/dist/

# Start development server
npm run dev
```

## Features

- Drag-and-drop file upload
- Multiple output format support
- Page preview rendering with lazy loading
- Progress tracking
- Responsive design

## Using the Package

```tsx
import { WorkerBrowserConverter } from '@matbee/libreoffice-converter/browser';

const converter = new WorkerBrowserConverter({
  wasmPath: '/wasm',
  workerPath: '/dist/browser.worker.global.js',
});

await converter.initialize();
const result = await converter.convertFile(file, { outputFormat: 'pdf' });
converter.download(result);
```

## React Hook Pattern

```tsx
import { useRef, useCallback, useEffect } from 'react';
import { WorkerBrowserConverter } from '@matbee/libreoffice-converter/browser';

function useConverter() {
  const converterRef = useRef<WorkerBrowserConverter | null>(null);

  const getConverter = useCallback(async () => {
    if (converterRef.current?.isReady()) {
      return converterRef.current;
    }

    const converter = new WorkerBrowserConverter({
      wasmPath: '/wasm',
      workerPath: '/dist/browser.worker.global.js',
    });

    await converter.initialize();
    converterRef.current = converter;
    return converter;
  }, []);

  useEffect(() => {
    return () => {
      converterRef.current?.destroy();
    };
  }, []);

  return getConverter;
}
```

## Important Notes

1. **CORS Headers Required**: Your server must send these headers for SharedArrayBuffer:
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Embedder-Policy: require-corp`

   The Vite config in this example already includes these headers.

2. **WASM Files**: Copy the `wasm/` folder to your public directory.

3. **Worker Path**: The browser worker needs to be accessible from your public directory.

4. **Large File Sizes**: The WASM files are ~250MB total. Consider:
   - Using a CDN for production
   - Lazy loading the converter only when needed
   - Showing loading progress during initialization (~10-60s first load)

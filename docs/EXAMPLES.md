# Examples

Collection of example code for common use cases.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Batch Conversion](#batch-conversion)
- [Web Server](#web-server)
- [React Integration](#react-integration)
- [Vue.js Integration](#vuejs-integration)
- [Electron App](#electron-app)
- [Worker Threads](#worker-threads)
- [Streaming Large Files](#streaming-large-files)

---

## Basic Usage

### Convert DOCX to PDF

```javascript
import { createConverter } from '@libreoffice-wasm/converter';
import fs from 'fs';

async function convertToPdf() {
  // Initialize converter
  const converter = await createConverter({
    wasmPath: './wasm',
  });

  // Read input file
  const docx = fs.readFileSync('input.docx');

  // Convert to PDF
  const result = await converter.convert(docx, {
    outputFormat: 'pdf',
  });

  // Save result
  fs.writeFileSync('output.pdf', result.data);
  console.log(`Converted in ${result.duration}ms`);

  // Clean up
  await converter.destroy();
}

convertToPdf();
```

### Convert with PDF/A Compliance

```javascript
const result = await converter.convert(docx, {
  outputFormat: 'pdf',
  pdf: {
    pdfaLevel: 'PDF/A-2b',  // Archival format
    quality: 90,
  },
});
```

### Convert Password-Protected Document

```javascript
const result = await converter.convert(encryptedDoc, {
  outputFormat: 'pdf',
  password: 'document-password',
});
```

### Convert Spreadsheet to CSV

```javascript
const xlsx = fs.readFileSync('data.xlsx');
const result = await converter.convert(xlsx, {
  outputFormat: 'csv',
  inputFormat: 'xlsx',
});

fs.writeFileSync('data.csv', result.data);
```

---

## Batch Conversion

### Convert All Documents in Directory

```javascript
import { createConverter } from '@libreoffice-wasm/converter';
import fs from 'fs';
import path from 'path';

async function batchConvert(inputDir, outputDir, outputFormat = 'pdf') {
  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Initialize converter once (reuse for all files)
  const converter = await createConverter({
    wasmPath: './wasm',
    verbose: false,
  });

  // Get all documents
  const files = fs.readdirSync(inputDir).filter((f) =>
    /\.(docx?|xlsx?|pptx?|odt|ods|odp|rtf)$/i.test(f)
  );

  console.log(`Converting ${files.length} files...`);
  const startTime = Date.now();

  for (const file of files) {
    try {
      const inputPath = path.join(inputDir, file);
      const input = fs.readFileSync(inputPath);

      const result = await converter.convert(
        input,
        { outputFormat },
        file
      );

      const outputPath = path.join(outputDir, result.filename);
      fs.writeFileSync(outputPath, result.data);

      console.log(`✓ ${file} -> ${result.filename} (${result.duration}ms)`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }

  const totalTime = Date.now() - startTime;
  console.log(`\nCompleted in ${(totalTime / 1000).toFixed(1)}s`);

  await converter.destroy();
}

batchConvert('./documents', './converted-pdfs', 'pdf');
```

### Parallel Batch Conversion with Limits

```javascript
import { createConverter } from '@libreoffice-wasm/converter';
import fs from 'fs/promises';
import path from 'path';

async function parallelConvert(inputDir, outputDir, concurrency = 3) {
  const files = await fs.readdir(inputDir);
  const docFiles = files.filter((f) =>
    /\.(docx?|xlsx?|pptx?)$/i.test(f)
  );

  // Create a pool of converters
  const converters = await Promise.all(
    Array(concurrency)
      .fill()
      .map(() => createConverter({ wasmPath: './wasm' }))
  );

  let index = 0;

  async function processFile(converter) {
    while (index < docFiles.length) {
      const file = docFiles[index++];
      const inputPath = path.join(inputDir, file);

      try {
        const input = await fs.readFile(inputPath);
        const result = await converter.convert(input, { outputFormat: 'pdf' }, file);
        await fs.writeFile(path.join(outputDir, result.filename), result.data);
        console.log(`✓ ${file}`);
      } catch (err) {
        console.error(`✗ ${file}: ${err.message}`);
      }
    }
  }

  // Start all workers
  await Promise.all(converters.map(processFile));

  // Clean up
  await Promise.all(converters.map((c) => c.destroy()));
}

parallelConvert('./docs', './pdfs', 4);
```

---

## Web Server

### Express.js API

```javascript
import express from 'express';
import multer from 'multer';
import { createConverter } from '@libreoffice-wasm/converter';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

let converter;

// Initialize on startup
async function initConverter() {
  converter = await createConverter({
    wasmPath: './wasm',
    verbose: process.env.NODE_ENV === 'development',
  });
  console.log('Document converter ready');
}

// Conversion endpoint
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const format = req.body.format || 'pdf';
    
    const result = await converter.convert(
      req.file.buffer,
      { outputFormat: format },
      req.file.originalname
    );

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'X-Conversion-Time': result.duration.toString(),
    });

    res.send(Buffer.from(result.data));
  } catch (err) {
    console.error('Conversion error:', err);
    res.status(500).json({
      error: err.message,
      code: err.code,
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    converterReady: converter?.isReady() || false,
  });
});

// Start server
initConverter().then(() => {
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
```

### Fastify API

```javascript
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { createConverter } from '@libreoffice-wasm/converter';

const fastify = Fastify({ logger: true });
fastify.register(multipart);

let converter;

fastify.post('/convert', async (request, reply) => {
  const data = await request.file();
  const buffer = await data.toBuffer();
  const format = data.fields.format?.value || 'pdf';

  const result = await converter.convert(
    buffer,
    { outputFormat: format },
    data.filename
  );

  reply
    .header('Content-Type', result.mimeType)
    .header('Content-Disposition', `attachment; filename="${result.filename}"`)
    .send(Buffer.from(result.data));
});

async function start() {
  converter = await createConverter({ wasmPath: './wasm' });
  await fastify.listen({ port: 3000 });
}

start();
```

---

## React Integration

### Document Converter Component

```jsx
import { useState, useEffect, useCallback } from 'react';
import { BrowserConverter } from '@libreoffice-wasm/converter/browser';

export function DocumentConverter() {
  const [converter, setConverter] = useState(null);
  const [status, setStatus] = useState('Loading converter...');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize converter on mount
  useEffect(() => {
    let conv;

    async function init() {
      conv = new BrowserConverter({
        wasmPath: '/wasm',
        onProgress: (info) => {
          setProgress(info.percent);
          setStatus(info.message);
        },
      });

      await conv.initialize();
      setConverter(conv);
      setStatus('Ready! Drop a file to convert.');
    }

    init().catch((err) => setStatus(`Error: ${err.message}`));

    return () => conv?.destroy();
  }, []);

  // Handle file conversion
  const handleFile = useCallback(
    async (file) => {
      if (!converter) return;

      setStatus(`Converting ${file.name}...`);

      try {
        const result = await converter.convertFile(file, {
          outputFormat: 'pdf',
        });

        converter.download(result);
        setStatus(`Converted! Downloaded ${result.filename}`);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      }
    },
    [converter]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="converter">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>{status}</p>
        <progress value={progress} max={100} />
        <input
          type="file"
          onChange={handleFileInput}
          accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf"
        />
      </div>

      <style jsx>{`
        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          transition: all 0.2s;
        }
        .drop-zone.dragging {
          border-color: #007bff;
          background: #e7f3ff;
        }
        progress {
          width: 100%;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
}
```

### Using Context for Shared Converter

```jsx
// ConverterContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { BrowserConverter } from '@libreoffice-wasm/converter/browser';

const ConverterContext = createContext(null);

export function ConverterProvider({ children }) {
  const [converter, setConverter] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const conv = new BrowserConverter({ wasmPath: '/wasm' });
    conv.initialize().then(() => {
      setConverter(conv);
      setIsReady(true);
    });

    return () => conv.destroy();
  }, []);

  return (
    <ConverterContext.Provider value={{ converter, isReady }}>
      {children}
    </ConverterContext.Provider>
  );
}

export function useConverter() {
  return useContext(ConverterContext);
}

// Usage
function ConvertButton({ file }) {
  const { converter, isReady } = useConverter();

  const handleClick = async () => {
    if (!isReady || !file) return;
    const result = await converter.convertFile(file, { outputFormat: 'pdf' });
    converter.download(result);
  };

  return (
    <button onClick={handleClick} disabled={!isReady}>
      {isReady ? 'Convert to PDF' : 'Loading...'}
    </button>
  );
}
```

---

## Vue.js Integration

### Composable Hook

```javascript
// useConverter.js
import { ref, onMounted, onUnmounted } from 'vue';
import { BrowserConverter } from '@libreoffice-wasm/converter/browser';

export function useConverter() {
  const converter = ref(null);
  const isReady = ref(false);
  const status = ref('Loading...');
  const progress = ref(0);

  onMounted(async () => {
    const conv = new BrowserConverter({
      wasmPath: '/wasm',
      onProgress: (info) => {
        progress.value = info.percent;
        status.value = info.message;
      },
    });

    await conv.initialize();
    converter.value = conv;
    isReady.value = true;
    status.value = 'Ready';
  });

  onUnmounted(() => {
    converter.value?.destroy();
  });

  async function convertFile(file, options = { outputFormat: 'pdf' }) {
    if (!converter.value) throw new Error('Converter not ready');
    return converter.value.convertFile(file, options);
  }

  function download(result, filename) {
    converter.value?.download(result, filename);
  }

  return {
    converter,
    isReady,
    status,
    progress,
    convertFile,
    download,
  };
}
```

### Component

```vue
<template>
  <div class="converter">
    <h2>Document Converter</h2>
    <p>{{ status }}</p>
    <progress :value="progress" max="100" />
    
    <div
      class="drop-zone"
      :class="{ dragging }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="handleDrop"
    >
      <p>Drop files here or</p>
      <input type="file" @change="handleFile" :disabled="!isReady" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useConverter } from './useConverter';

const { isReady, status, progress, convertFile, download } = useConverter();
const dragging = ref(false);

async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const result = await convertFile(file);
  download(result);
}

function handleDrop(e) {
  dragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) {
    convertFile(file).then(download);
  }
}
</script>
```

---

## Electron App

### Main Process

```javascript
// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Handle conversion in main process
let converter;

ipcMain.handle('init-converter', async () => {
  const { createConverter } = await import('@libreoffice-wasm/converter');
  converter = await createConverter({
    wasmPath: path.join(__dirname, 'wasm'),
  });
  return true;
});

ipcMain.handle('convert', async (event, { buffer, options, filename }) => {
  const result = await converter.convert(
    new Uint8Array(buffer),
    options,
    filename
  );
  return {
    data: Array.from(result.data),
    mimeType: result.mimeType,
    filename: result.filename,
    duration: result.duration,
  };
});
```

### Preload Script

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('converter', {
  init: () => ipcRenderer.invoke('init-converter'),
  convert: (buffer, options, filename) =>
    ipcRenderer.invoke('convert', { buffer, options, filename }),
});
```

### Renderer

```javascript
// renderer.js
document.getElementById('convertBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();

  const result = await window.converter.convert(
    buffer,
    { outputFormat: 'pdf' },
    file.name
  );

  // Create download
  const blob = new Blob([new Uint8Array(result.data)], {
    type: result.mimeType,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  a.click();
});

// Initialize on load
window.converter.init().then(() => {
  document.getElementById('status').textContent = 'Ready';
});
```

---

## Worker Threads

### Using Worker Threads for Background Conversion

```javascript
// worker.js
const { parentPort, workerData } = require('worker_threads');
const { createConverter } = require('@libreoffice-wasm/converter');

let converter;

async function init() {
  converter = await createConverter({
    wasmPath: workerData.wasmPath,
  });
  parentPort.postMessage({ type: 'ready' });
}

parentPort.on('message', async (msg) => {
  if (msg.type === 'convert') {
    try {
      const result = await converter.convert(
        new Uint8Array(msg.buffer),
        msg.options,
        msg.filename
      );
      
      parentPort.postMessage({
        type: 'result',
        id: msg.id,
        result: {
          data: Array.from(result.data),
          mimeType: result.mimeType,
          filename: result.filename,
          duration: result.duration,
        },
      });
    } catch (err) {
      parentPort.postMessage({
        type: 'error',
        id: msg.id,
        error: err.message,
      });
    }
  }
});

init();
```

### Main Thread

```javascript
// main.js
const { Worker } = require('worker_threads');
const path = require('path');

class ConverterPool {
  constructor(poolSize = 4) {
    this.workers = [];
    this.queue = [];
    this.ready = [];
    
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker('./worker.js', {
        workerData: { wasmPath: path.join(__dirname, 'wasm') },
      });
      
      worker.on('message', (msg) => {
        if (msg.type === 'ready') {
          this.ready.push(worker);
          this.processQueue();
        } else if (msg.type === 'result' || msg.type === 'error') {
          const task = this.queue.find((t) => t.id === msg.id);
          if (task) {
            if (msg.type === 'result') {
              task.resolve({
                ...msg.result,
                data: new Uint8Array(msg.result.data),
              });
            } else {
              task.reject(new Error(msg.error));
            }
            this.queue = this.queue.filter((t) => t.id !== msg.id);
          }
          this.ready.push(worker);
          this.processQueue();
        }
      });
      
      this.workers.push(worker);
    }
  }

  async convert(buffer, options, filename) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      this.queue.push({ id, buffer, options, filename, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    while (this.ready.length > 0 && this.queue.length > 0) {
      const worker = this.ready.pop();
      const task = this.queue.find((t) => !t.started);
      if (task) {
        task.started = true;
        worker.postMessage({
          type: 'convert',
          id: task.id,
          buffer: Array.from(task.buffer),
          options: task.options,
          filename: task.filename,
        });
      } else {
        this.ready.push(worker);
        break;
      }
    }
  }

  async destroy() {
    await Promise.all(this.workers.map((w) => w.terminate()));
  }
}

// Usage
const pool = new ConverterPool(4);

const result = await pool.convert(
  fs.readFileSync('document.docx'),
  { outputFormat: 'pdf' },
  'document.docx'
);

fs.writeFileSync('document.pdf', result.data);
```

---

## Streaming Large Files

### Memory-Efficient Conversion

For very large files, use streams to reduce memory usage:

```javascript
import { createConverter } from '@libreoffice-wasm/converter';
import fs from 'fs';
import { pipeline } from 'stream/promises';

async function convertLargeFile(inputPath, outputPath) {
  const converter = await createConverter({ wasmPath: './wasm' });

  // Read in chunks to reduce peak memory
  const stats = fs.statSync(inputPath);
  const chunkSize = 64 * 1024 * 1024; // 64MB chunks
  
  if (stats.size > chunkSize) {
    console.log('Large file detected, using buffered reading');
  }

  // Read entire file (required for conversion)
  const input = fs.readFileSync(inputPath);
  
  const result = await converter.convert(
    input,
    { outputFormat: 'pdf' },
    inputPath.split('/').pop()
  );

  // Write output
  fs.writeFileSync(outputPath, result.data);
  
  // Explicit cleanup
  await converter.destroy();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  return result;
}

// Run with: node --expose-gc script.js
convertLargeFile('large-document.docx', 'output.pdf');
```

### Express with Streaming Response

```javascript
import express from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import { createConverter } from '@libreoffice-wasm/converter';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

let converter;

app.post('/convert-stream', upload.single('file'), async (req, res) => {
  const result = await converter.convert(
    req.file.buffer,
    { outputFormat: 'pdf' },
    req.file.originalname
  );

  // Stream the response
  res.set({
    'Content-Type': result.mimeType,
    'Content-Disposition': `attachment; filename="${result.filename}"`,
    'Content-Length': result.data.length,
  });

  // Convert Uint8Array to stream
  const stream = Readable.from(Buffer.from(result.data));
  stream.pipe(res);
});

// Initialize
createConverter({ wasmPath: './wasm' }).then((c) => {
  converter = c;
  app.listen(3000);
});
```


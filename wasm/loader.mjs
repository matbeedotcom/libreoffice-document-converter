/**
 * Node.js WASM Loader for LibreOffice (ES6 Module)
 * 
 * This ESM wrapper provides the necessary polyfills and setup
 * for loading the Emscripten-generated LibreOffice WASM module in Node.js.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Worker as NodeWorker } from 'worker_threads';
import zlib from 'zlib';
import createSofficeModule from './soffice.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wasmDir = __dirname;

/**
 * Check if data starts with gzip magic bytes (0x1f 0x8b)
 */
export function isGzipped(data) {
  return data && data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
}

/**
 * Decompress data if it's gzipped, otherwise return as-is
 */
export function decompressIfGzipped(data) {
  if (isGzipped(data)) {
    return zlib.gunzipSync(data);
  }
  return data;
}

// Custom Worker wrapper that resolves paths to absolute paths in wasmDir
class WasmWorker extends NodeWorker {
  constructor(filename, options) {
    let resolvedPath = filename;
    if (!path.isAbsolute(filename)) {
      resolvedPath = path.join(wasmDir, path.basename(filename));
    }
    super(resolvedPath, options);
  }
}

// Make Worker globally available for Emscripten pthreads
globalThis.Worker = WasmWorker;

// Cache for compiled WASM module
let cachedWasmBinary = null;

// Progress tracking
let currentProgressCallback = null;
let lastProgress = 0;

function emitProgress(phase, percent, message) {
  if (currentProgressCallback) {
    const adjustedPercent = Math.max(lastProgress, percent);
    lastProgress = adjustedPercent;
    currentProgressCallback(phase, adjustedPercent, message);
  }
}

// XMLHttpRequest polyfill for Node.js
class NodeXMLHttpRequest {
  constructor() {
    this.readyState = 0;
    this.status = 0;
    this.statusText = '';
    this.responseType = '';
    this.response = null;
    this.responseText = '';
    this.onreadystatechange = null;
    this.onload = null;
    this.onerror = null;
    this.onprogress = null;
    this._url = '';
  }

  open(method, url) {
    this._url = url;
    this.readyState = 1;
  }

  overrideMimeType() {}
  setRequestHeader() {}

  send() {
    const filename = path.basename(this._url);

    try {
      if (filename === 'soffice.data' || filename === 'soffice.data.gz') {
        emitProgress('loading_data', 20, 'Loading LibreOffice filesystem image...');
      }

      let filePath = this._url;
      if (!fs.existsSync(filePath) && !filePath.endsWith('.gz')) {
        const gzPath = filePath + '.gz';
        if (fs.existsSync(gzPath)) {
          filePath = gzPath;
        }
      }

      let data = fs.readFileSync(filePath);

      if (isGzipped(data)) {
        emitProgress('loading_data', 25, 'Decompressing filesystem image...');
        data = decompressIfGzipped(data);
      }

      this.status = 200;
      this.statusText = 'OK';
      this.readyState = 4;

      if (this.responseType === 'arraybuffer') {
        this.response = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      } else {
        this.responseText = data.toString('utf8');
        this.response = this.responseText;
      }

      if (filename === 'soffice.data' || filename === 'soffice.data.gz') {
        emitProgress('loading_data', 38, `Loaded ${(data.length / 1024 / 1024).toFixed(0)}MB filesystem`);
      }

      if (this.onreadystatechange) this.onreadystatechange();
      if (this.onload) this.onload();
    } catch (err) {
      this.status = 404;
      this.statusText = 'Not Found';
      this.readyState = 4;
      if (this.onreadystatechange) this.onreadystatechange();
      if (this.onerror) this.onerror(err);
    }
  }
}

globalThis.XMLHttpRequest = NodeXMLHttpRequest;

/**
 * Create and initialize the LibreOffice WASM module
 */
export async function createModule(config = {}) {
  lastProgress = 0;
  currentProgressCallback = config.onProgress || null;
  
  emitProgress('starting', 0, 'Starting LibreOffice WASM...');
  
  // Load WASM binary
  let wasmBinary = config.wasmBinary;
  if (!wasmBinary) {
    if (cachedWasmBinary) {
      emitProgress('loading_wasm', 12, 'Using cached WebAssembly binary');
      wasmBinary = cachedWasmBinary;
    } else {
      emitProgress('loading_wasm', 2, 'Loading WebAssembly binary...');

      const wasmGzPath = path.join(wasmDir, 'soffice.wasm.gz');
      const wasmPath = path.join(wasmDir, 'soffice.wasm');

      let wasmData;
      if (fs.existsSync(wasmGzPath)) {
        emitProgress('loading_wasm', 5, 'Decompressing WebAssembly binary...');
        wasmData = decompressIfGzipped(fs.readFileSync(wasmGzPath));
      } else {
        wasmData = decompressIfGzipped(fs.readFileSync(wasmPath));
      }

      wasmBinary = wasmData.buffer.slice(wasmData.byteOffset, wasmData.byteOffset + wasmData.byteLength);
      cachedWasmBinary = wasmBinary;

      emitProgress('loading_wasm', 12, `Loaded ${(wasmData.length / 1024 / 1024).toFixed(0)}MB WebAssembly binary`);
    }
  }
  
  emitProgress('compiling', 14, 'Compiling WebAssembly module...');
  
  const moduleConfig = {
    wasmBinary,
    
    locateFile: (filename) => {
      const resolved = path.join(wasmDir, filename);
      if (!fs.existsSync(resolved)) {
        const gzResolved = resolved + '.gz';
        if (fs.existsSync(gzResolved)) {
          if (config.verbose) {
            console.log('[WASM] locateFile:', filename, '->', gzResolved, '(compressed)');
          }
          return gzResolved;
        }
      }
      if (config.verbose) {
        console.log('[WASM] locateFile:', filename, '->', resolved);
      }
      return resolved;
    },
    
    onRuntimeInitialized: () => {
      emitProgress('runtime_ready', 45, 'WebAssembly runtime initialized');
      if (config.verbose) {
        console.log('[WASM] Runtime initialized');
      }
      currentProgressCallback = null;
      if (config.onRuntimeInitialized) {
        config.onRuntimeInitialized();
      }
    },
    
    print: config.print || (() => {}),
    printErr: config.printErr || (() => {}),
    
    ...Object.fromEntries(
      Object.entries(config).filter(([k]) => 
        !['onProgress', 'onRuntimeInitialized', 'print', 'printErr', 'verbose', 'wasmBinary'].includes(k)
      )
    ),
  };

  const module = await createSofficeModule(moduleConfig);
  return module;
}

/**
 * Pre-load the WASM binary into memory
 */
export function preloadWasmBinary() {
  if (cachedWasmBinary) {
    return cachedWasmBinary;
  }

  const wasmGzPath = path.join(wasmDir, 'soffice.wasm.gz');
  const wasmPath = path.join(wasmDir, 'soffice.wasm');

  let wasmData;
  if (fs.existsSync(wasmGzPath)) {
    wasmData = decompressIfGzipped(fs.readFileSync(wasmGzPath));
  } else {
    wasmData = decompressIfGzipped(fs.readFileSync(wasmPath));
  }

  cachedWasmBinary = wasmData.buffer.slice(wasmData.byteOffset, wasmData.byteOffset + wasmData.byteLength);
  return cachedWasmBinary;
}

/**
 * Pre-compile the WASM module
 */
let cachedWasmModule = null;
export async function precompileWasm() {
  if (cachedWasmModule) {
    return cachedWasmModule;
  }
  
  const binary = preloadWasmBinary();
  cachedWasmModule = await WebAssembly.compile(binary);
  return cachedWasmModule;
}

/**
 * Check if WASM binary is already cached
 */
export function isCached() {
  return !!cachedWasmBinary;
}

/**
 * Clear cached data
 */
export function clearCache() {
  cachedWasmBinary = null;
  cachedWasmModule = null;
}

/**
 * Get file sizes for progress estimation
 */
export function getFileSizes() {
  const wasmGzPath = path.join(wasmDir, 'soffice.wasm.gz');
  const wasmPath = path.join(wasmDir, 'soffice.wasm');
  const dataGzPath = path.join(wasmDir, 'soffice.data.gz');
  const dataPath = path.join(wasmDir, 'soffice.data');

  const wasmFile = fs.existsSync(wasmGzPath) ? wasmGzPath : wasmPath;
  const dataFile = fs.existsSync(dataGzPath) ? dataGzPath : dataPath;

  return {
    wasm: fs.existsSync(wasmFile) ? fs.statSync(wasmFile).size : 0,
    data: fs.existsSync(dataFile) ? fs.statSync(dataFile).size : 0,
    compressed: fs.existsSync(wasmGzPath) || fs.existsSync(dataGzPath),
    get total() { return this.wasm + this.data; },
  };
}

export { wasmDir };

// Default export for compatibility
export default {
  createModule,
  preloadWasmBinary,
  precompileWasm,
  isCached,
  clearCache,
  getFileSizes,
  wasmDir,
  isGzipped,
  decompressIfGzipped,
};


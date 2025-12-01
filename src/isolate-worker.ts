/**
 * Isolated Worker for LibreOffice WASM
 * 
 * This worker runs the blocking WASM module in complete isolation.
 * Communication happens via message passing - the blocking doesn't
 * affect the main thread.
 */

import { parentPort, workerData } from 'worker_threads';
import * as path from 'path';
import * as fs from 'fs';

// Configuration from parent
const config = workerData as {
  wasmPath: string;
  verbose: boolean;
};

const wasmDir = path.resolve(config.wasmPath);

// Change working directory for data file loading
process.chdir(wasmDir);

/**
 * XMLHttpRequest polyfill for Node.js
 */
class NodeXMLHttpRequest {
  readyState = 0;
  status = 0;
  statusText = '';
  responseType = '';
  response: unknown = null;
  responseText = '';
  onload: (() => void) | null = null;
  onerror: ((err: Error) => void) | null = null;
  onreadystatechange: (() => void) | null = null;
  private _url = '';

  open(_method: string, url: string) {
    this._url = url;
    this.readyState = 1;
  }

  overrideMimeType() {}
  setRequestHeader() {}

  send() {
    try {
      const data = fs.readFileSync(this._url);
      this.status = 200;
      this.statusText = 'OK';
      this.readyState = 4;

      if (this.responseType === 'arraybuffer') {
        this.response = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      } else {
        this.responseText = data.toString('utf8');
        this.response = this.responseText;
      }

      // Callbacks must be sync for Emscripten
      if (this.onload) this.onload();
      if (this.onreadystatechange) this.onreadystatechange();
    } catch (err) {
      this.status = 404;
      this.statusText = 'Not Found';
      this.readyState = 4;
      if (this.onerror) this.onerror(err as Error);
    }
  }
}

// Set up global polyfills
(global as any).XMLHttpRequest = NodeXMLHttpRequest;

// Global state
let Module: any = null;
let lokPtr = 0;
let initialized = false;

function log(...args: unknown[]) {
  if (config.verbose) {
    console.log('[Worker]', ...args);
  }
}

function allocString(str: string): number {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str + '\0');
  const ptr = Module._malloc(bytes.length);
  Module.HEAPU8.set(bytes, ptr);
  return ptr;
}

function readPtr(addr: number): number {
  return Module.HEAP32[addr >> 2];
}

/**
 * Initialize LibreOfficeKit
 * This WILL block until LibreOffice is ready
 */
function initializeLOK(): void {
  log('Initializing LOK...');
  
  const installPath = '/instdir/program';
  const pathPtr = allocString(installPath);

  if (Module._lok_preinit) {
    log('Calling _lok_preinit...');
    Module._lok_preinit(pathPtr, 0);
  }

  log('Calling _libreofficekit_hook...');
  lokPtr = Module._libreofficekit_hook(pathPtr);
  Module._free(pathPtr);

  if (lokPtr === 0) {
    throw new Error('Failed to initialize LibreOfficeKit');
  }

  log('LOK initialized, ptr:', lokPtr);
  initialized = true;
}

/**
 * Convert a document
 */
function convert(
  inputData: Uint8Array,
  inputExt: string,
  outputFormat: string,
  filterOptions: string
): Uint8Array {
  if (!initialized || lokPtr === 0) {
    throw new Error('Not initialized');
  }

  const inputPath = `/tmp/input/doc.${inputExt}`;
  const outputPath = `/tmp/output/doc.${outputFormat}`;

  // Ensure directories
  try { Module.FS.mkdir('/tmp'); } catch {}
  try { Module.FS.mkdir('/tmp/input'); } catch {}
  try { Module.FS.mkdir('/tmp/output'); } catch {}

  // Write input
  Module.FS.writeFile(inputPath, inputData);
  log('Input written:', inputPath);

  // Load document
  const lokClassPtr = readPtr(lokPtr);
  const loadFnPtr = readPtr(lokClassPtr + 8);
  
  const wasmTable = Module.wasmTable as WebAssembly.Table;
  const loadFn = wasmTable.get(loadFnPtr) as (lok: number, path: number) => number;
  
  const inputPathPtr = allocString(inputPath);
  log('Loading document...');
  const docPtr = loadFn(lokPtr, inputPathPtr);
  Module._free(inputPathPtr);

  if (docPtr === 0) {
    throw new Error('Failed to load document');
  }
  log('Document loaded, ptr:', docPtr);

  try {
    // Save document
    const docClassPtr = readPtr(docPtr);
    const saveFnPtr = readPtr(docClassPtr + 8);
    const saveFn = wasmTable.get(saveFnPtr) as (
      doc: number, path: number, format: number, opts: number
    ) => number;

    const outputPathPtr = allocString(outputPath);
    const formatPtr = allocString(outputFormat);
    const optsPtr = allocString(filterOptions);

    log('Saving document...');
    const result = saveFn(docPtr, outputPathPtr, formatPtr, optsPtr);

    Module._free(outputPathPtr);
    Module._free(formatPtr);
    Module._free(optsPtr);

    if (result === 0) {
      throw new Error('Failed to save document');
    }
    log('Document saved');

    // Read output
    const outputData = Module.FS.readFile(outputPath) as Uint8Array;
    log('Output size:', outputData.length);

    // Cleanup
    try { Module.FS.unlink(inputPath); } catch {}
    try { Module.FS.unlink(outputPath); } catch {}

    return outputData;
  } finally {
    // Destroy document
    const docClassPtr = readPtr(docPtr);
    const destroyFnPtr = readPtr(docClassPtr + 4);
    if (destroyFnPtr !== 0) {
      const destroyFn = wasmTable.get(destroyFnPtr) as (doc: number) => void;
      destroyFn(docPtr);
      log('Document destroyed');
    }
  }
}

// Set up Module configuration
(global as any).Module = {
  locateFile: (filename: string) => filename,
  onRuntimeInitialized: () => {
    log('Runtime initialized');
    Module = (global as any).Module;
    
    try {
      initializeLOK();
      parentPort?.postMessage({ type: 'ready' });
    } catch (error) {
      parentPort?.postMessage({ 
        type: 'error', 
        error: (error as Error).message 
      });
    }
  },
  print: config.verbose ? console.log : () => {},
  printErr: config.verbose ? console.error : () => {},
};

// Load the WASM module (this will block until ready)
log('Loading WASM module...');
require(path.join(wasmDir, 'soffice.cjs'));
log('WASM module loaded');

// Handle messages from parent
parentPort?.on('message', (msg: { type: string; id: string; payload?: any }) => {
  try {
    switch (msg.type) {
      case 'convert': {
        const { inputData, inputExt, outputFormat, filterOptions } = msg.payload;
        const result = convert(
          new Uint8Array(inputData),
          inputExt,
          outputFormat,
          filterOptions || ''
        );
        parentPort?.postMessage({
          type: 'response',
          id: msg.id,
          success: true,
          data: Array.from(result),
        });
        break;
      }
      
      case 'destroy': {
        if (lokPtr !== 0 && Module) {
          const lokClassPtr = readPtr(lokPtr);
          const destroyFnPtr = readPtr(lokClassPtr + 4);
          if (destroyFnPtr !== 0) {
            const wasmTable = Module.wasmTable as WebAssembly.Table;
            const destroyFn = wasmTable.get(destroyFnPtr) as (lok: number) => void;
            destroyFn(lokPtr);
          }
          lokPtr = 0;
        }
        initialized = false;
        parentPort?.postMessage({ type: 'response', id: msg.id, success: true });
        break;
      }
    }
  } catch (error) {
    parentPort?.postMessage({
      type: 'response',
      id: msg.id,
      success: false,
      error: (error as Error).message,
    });
  }
});


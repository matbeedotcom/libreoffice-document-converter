/**
 * LibreOffice WASM Worker Thread
 * 
 * This module runs the LibreOffice WASM in a Worker thread to avoid
 * blocking the main Node.js event loop. The WASM module is designed
 * for browser use and will block during initialization.
 */

import { parentPort, workerData } from 'worker_threads';
import * as path from 'path';
import * as fs from 'fs';

interface WorkerMessage {
  type: 'init' | 'convert' | 'destroy';
  id: string;
  payload?: unknown;
}

interface InitPayload {
  wasmPath: string;
  verbose: boolean;
}

interface ConvertPayload {
  inputData: Uint8Array;
  inputPath: string;
  outputPath: string;
  outputFormat: string;
  filterOptions: string;
}

// Global state
let Module: any = null;
let lokPtr: number = 0;
let initialized = false;

/**
 * XMLHttpRequest polyfill for Node.js
 */
class NodeXMLHttpRequest {
  readyState = 0;
  status = 0;
  statusText = '';
  responseType = '';
  response: any = null;
  responseText = '';
  onload: (() => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  onreadystatechange: (() => void) | null = null;
  private _url = '';
  private _wasmDir = '';

  constructor(wasmDir: string) {
    this._wasmDir = wasmDir;
  }

  open(_method: string, url: string) {
    this._url = url;
    this.readyState = 1;
  }

  overrideMimeType() {}
  setRequestHeader() {}

  send() {
    let filePath = this._url;
    if (filePath.startsWith('file://')) {
      filePath = filePath.slice(7);
    }
    if (!path.isAbsolute(filePath) && !filePath.startsWith('http')) {
      filePath = path.resolve(this._wasmDir, filePath);
    }

    try {
      const data = fs.readFileSync(filePath);
      this.status = 200;
      this.statusText = 'OK';
      this.readyState = 4;

      if (this.responseType === 'arraybuffer') {
        this.response = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      } else {
        this.responseText = data.toString('utf8');
        this.response = this.responseText;
      }

      if (this.onload) this.onload();
      if (this.onreadystatechange) this.onreadystatechange();
    } catch (err) {
      this.status = 404;
      this.statusText = 'Not Found';
      this.readyState = 4;
      if (this.onerror) this.onerror(err);
      if (this.onreadystatechange) this.onreadystatechange();
    }
  }
}

/**
 * Allocate a null-terminated string in WASM memory
 */
function allocString(str: string): number {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str + '\0');
  const ptr = Module._malloc(bytes.length);
  Module.HEAPU8.set(bytes, ptr);
  return ptr;
}

/**
 * Read a 32-bit pointer from WASM memory
 */
function readPtr(address: number): number {
  return Module.HEAP32[address >> 2];
}

// Global wasm directory for XHR polyfill
let wasmDirectory = '';

/**
 * Initialize the WASM module
 */
async function initialize(payload: InitPayload): Promise<void> {
  if (initialized) {
    return;
  }

  wasmDirectory = path.resolve(payload.wasmPath);

  // Set up XMLHttpRequest polyfill with the wasm directory
  (global as any).XMLHttpRequest = class extends NodeXMLHttpRequest {
    constructor() {
      super(wasmDirectory);
    }
  };

  // Set up Module with locateFile for proper file resolution
  (global as any).Module = {
    locateFile: (filename: string) => {
      return path.join(wasmDirectory, filename);
    },
    print: payload.verbose ? console.log : () => {},
    printErr: payload.verbose ? console.error : () => {},
  };

  // Load the module from absolute path
  const loaderPath = path.join(wasmDirectory, 'soffice.cjs');
  
  // Override require to handle relative paths from within soffice.cjs
  const originalRequire = require;
  (global as any).require = (id: string) => {
    if (id.startsWith('./') || id.startsWith('../')) {
      return originalRequire(path.join(wasmDirectory, id));
    }
    return originalRequire(id);
  };
  
  originalRequire(loaderPath);
  
  (global as any).require = originalRequire;

  Module = (global as any).Module;

  // Wait for WASM to be ready (poll for _malloc)
  const startTime = Date.now();
  const timeout = 120000; // 2 minutes
  
  while (!Module._malloc || !Module._libreofficekit_hook) {
    if (Date.now() - startTime > timeout) {
      throw new Error('WASM initialization timeout');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Initialize LibreOfficeKit
  const installPath = '/instdir/program';
  const pathPtr = allocString(installPath);

  if (Module._lok_preinit) {
    Module._lok_preinit(pathPtr, 0);
  }

  lokPtr = Module._libreofficekit_hook(pathPtr);
  Module._free(pathPtr);

  if (lokPtr === 0) {
    throw new Error('Failed to initialize LibreOfficeKit');
  }

  initialized = true;
}

/**
 * Convert a document
 */
async function convert(payload: ConvertPayload): Promise<Uint8Array> {
  if (!initialized || !Module || lokPtr === 0) {
    throw new Error('Worker not initialized');
  }

  // Write input file to virtual filesystem
  Module.FS.writeFile(payload.inputPath, payload.inputData);

  // Get LOK class vtable
  const lokClassPtr = readPtr(lokPtr);
  const documentLoadFnPtr = readPtr(lokClassPtr + 8); // offset for documentLoad

  // Load document
  const inputPathPtr = allocString(payload.inputPath);
  
  // Call documentLoad through function table
  const wasmTable = Module.wasmTable as WebAssembly.Table;
  const documentLoadFn = wasmTable.get(documentLoadFnPtr) as (lok: number, path: number) => number;
  const docPtr = documentLoadFn(lokPtr, inputPathPtr);
  Module._free(inputPathPtr);

  if (docPtr === 0) {
    throw new Error('Failed to load document');
  }

  try {
    // Get document class vtable
    const docClassPtr = readPtr(docPtr);
    const saveAsFnPtr = readPtr(docClassPtr + 8); // offset for saveAs

    // Save document
    const outputPathPtr = allocString(payload.outputPath);
    const formatPtr = allocString(payload.outputFormat);
    const filterPtr = allocString(payload.filterOptions);

    const saveAsFn = wasmTable.get(saveAsFnPtr) as (
      doc: number, path: number, format: number, filter: number
    ) => number;
    
    const result = saveAsFn(docPtr, outputPathPtr, formatPtr, filterPtr);

    Module._free(outputPathPtr);
    Module._free(formatPtr);
    Module._free(filterPtr);

    if (result === 0) {
      throw new Error('Failed to save document');
    }

    // Read output file
    const outputData = Module.FS.readFile(payload.outputPath) as Uint8Array;

    // Cleanup files
    try { Module.FS.unlink(payload.inputPath); } catch {}
    try { Module.FS.unlink(payload.outputPath); } catch {}

    return outputData;
  } finally {
    // Destroy document
    const docClassPtr = readPtr(docPtr);
    const destroyFnPtr = readPtr(docClassPtr + 4); // offset for destroy
    if (destroyFnPtr !== 0) {
      const destroyFn = wasmTable.get(destroyFnPtr) as (doc: number) => void;
      destroyFn(docPtr);
    }
  }
}

/**
 * Main message handler
 */
parentPort?.on('message', async (message: WorkerMessage) => {
  try {
    switch (message.type) {
      case 'init':
        await initialize(message.payload as InitPayload);
        parentPort?.postMessage({ id: message.id, success: true });
        break;

      case 'convert':
        const result = await convert(message.payload as ConvertPayload);
        parentPort?.postMessage({ 
          id: message.id, 
          success: true, 
          data: result 
        });
        break;

      case 'destroy':
        // Destroy LOK instance
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
        parentPort?.postMessage({ id: message.id, success: true });
        break;
    }
  } catch (error) {
    parentPort?.postMessage({ 
      id: message.id, 
      success: false, 
      error: (error as Error).message 
    });
  }
});

// Signal ready
parentPort?.postMessage({ type: 'ready' });


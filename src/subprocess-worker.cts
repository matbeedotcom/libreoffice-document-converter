/**
 * Subprocess Worker for LibreOffice WASM
 * 
 * This worker runs in a completely separate Node.js process and owns the 
 * entire LibreOffice WASM module. It communicates with the main process
 * via IPC message passing.
 * 
 * Architecture:
 * - Main process spawns this subprocess
 * - Subprocess loads and initializes LibreOffice WASM (blocking is OK here)
 * - Main process sends conversion requests via IPC
 * - Subprocess performs conversions and sends results back
 * 
 * This approach works without PROXY_TO_PTHREAD because:
 * - The subprocess can block during initialization
 * - Main process remains responsive
 * - Clean process isolation for memory stability
 */

import * as path from 'path';
import * as fs from 'fs';
import { Worker } from 'worker_threads';

const wasmPath = process.env.WASM_PATH || './wasm';
const verbose = process.env.VERBOSE === 'true';
const wasmDir = path.resolve(wasmPath);

// Change to wasm directory for soffice.data path resolution
process.chdir(wasmDir);

function log(...args: unknown[]) {
  if (verbose) console.error('[SubprocessWorker]', ...args);
}

// XMLHttpRequest polyfill for Emscripten
class NodeXHR {
  readyState = 0;
  status = 0;
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
      this.readyState = 4;
      if (this.onerror) this.onerror(err as Error);
    }
  }
}

// Set up global polyfills
(global as any).XMLHttpRequest = NodeXHR;
(global as any).Worker = Worker;

// Module state
let Module: any = null;
let lokPtr = 0;
let initialized = false;
let useShims = false;

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
 * Read a null-terminated string from WASM memory
 */
function readString(ptr: number): string | null {
  if (ptr === 0) return null;
  const heap = Module.HEAPU8;
  let end = ptr;
  while (heap[end] !== 0) end++;
  return new TextDecoder().decode(heap.subarray(ptr, end));
}

/**
 * Read a 32-bit pointer from memory
 */
function readPtr(addr: number): number {
  return Module.HEAP32[addr >> 2];
}

/**
 * Initialize LibreOfficeKit
 */
function initLOK(): void {
  log('Initializing LibreOfficeKit...');
  
  const pathPtr = allocString('/instdir/program');
  
  try {
    // Skip _lok_preinit - it causes abort in subprocess mode
    // Go directly to _libreofficekit_hook
    log('Calling _libreofficekit_hook...');
    lokPtr = Module._libreofficekit_hook(pathPtr);
    
    if (lokPtr === 0) {
      throw new Error('_libreofficekit_hook returned null');
    }
    
    log('LOK initialized, ptr:', lokPtr);
    
    // Check if shim exports are available
    useShims = typeof Module._lok_documentLoad === 'function';
    log('Using LOK shims:', useShims);
    
    initialized = true;
  } finally {
    Module._free(pathPtr);
  }
}

/**
 * Get the last error from LibreOfficeKit
 */
function getError(): string | null {
  if (lokPtr === 0) return null;
  
  if (useShims && typeof Module._lok_getError === 'function') {
    const errPtr = Module._lok_getError(lokPtr);
    return readString(errPtr);
  }
  
  // Fallback: vtable traversal
  const lokClassPtr = readPtr(lokPtr);
  const getErrorFnPtr = readPtr(lokClassPtr + 12); // offset 12 for getError
  if (getErrorFnPtr === 0) return null;
  
  const wasmTable = Module.wasmTable as WebAssembly.Table;
  const getErrorFn = wasmTable.get(getErrorFnPtr) as (lok: number) => number;
  const errPtr = getErrorFn(lokPtr);
  return readString(errPtr);
}

/**
 * Load a document using LOK shims or vtable
 */
function loadDocument(inputPath: string): number {
  const inputPathPtr = allocString(inputPath);
  let docPtr: number;
  
  try {
    if (useShims && typeof Module._lok_documentLoad === 'function') {
      docPtr = Module._lok_documentLoad(lokPtr, inputPathPtr);
    } else {
      // Fallback: vtable traversal
      const lokClassPtr = readPtr(lokPtr);
      const loadFnPtr = readPtr(lokClassPtr + 8); // offset 8 for documentLoad
      const wasmTable = Module.wasmTable as WebAssembly.Table;
      const loadFn = wasmTable.get(loadFnPtr) as (lok: number, path: number) => number;
      docPtr = loadFn(lokPtr, inputPathPtr);
    }
    
    if (docPtr === 0) {
      const error = getError();
      throw new Error(`Failed to load document: ${error || 'unknown error'}`);
    }
    
    return docPtr;
  } finally {
    Module._free(inputPathPtr);
  }
}

/**
 * Save a document using LOK shims or vtable
 */
function saveDocument(docPtr: number, outputPath: string, format: string, filterOptions: string): void {
  const outPathPtr = allocString(outputPath);
  const fmtPtr = allocString(format);
  const optPtr = allocString(filterOptions);
  
  try {
    let result: number;
    
    if (useShims && typeof Module._lok_documentSaveAs === 'function') {
      result = Module._lok_documentSaveAs(docPtr, outPathPtr, fmtPtr, optPtr);
    } else {
      // Fallback: vtable traversal
      const docClassPtr = readPtr(docPtr);
      const saveFnPtr = readPtr(docClassPtr + 8); // offset 8 for saveAs
      const wasmTable = Module.wasmTable as WebAssembly.Table;
      const saveFn = wasmTable.get(saveFnPtr) as (d: number, p: number, f: number, o: number) => number;
      result = saveFn(docPtr, outPathPtr, fmtPtr, optPtr);
    }
    
    if (result === 0) {
      const error = getError();
      throw new Error(`Failed to save document: ${error || 'unknown error'}`);
    }
  } finally {
    Module._free(outPathPtr);
    Module._free(fmtPtr);
    Module._free(optPtr);
  }
}

/**
 * Destroy a document using LOK shims or vtable
 */
function destroyDocument(docPtr: number): void {
  if (docPtr === 0) return;
  
  try {
    if (useShims && typeof Module._lok_documentDestroy === 'function') {
      Module._lok_documentDestroy(docPtr);
    } else {
      // Fallback: vtable traversal
      const docClassPtr = readPtr(docPtr);
      const destroyFnPtr = readPtr(docClassPtr + 4); // offset 4 for destroy
      if (destroyFnPtr !== 0) {
        const wasmTable = Module.wasmTable as WebAssembly.Table;
        const destroyFn = wasmTable.get(destroyFnPtr) as (d: number) => void;
        destroyFn(docPtr);
      }
    }
  } catch (err) {
    log('Error destroying document:', err);
  }
}

/**
 * Destroy the LOK instance
 */
function destroyLOK(): void {
  if (lokPtr === 0) return;
  
  try {
    // LOK destroy is always via vtable (no shim for this)
    const lokClassPtr = readPtr(lokPtr);
    const destroyFnPtr = readPtr(lokClassPtr + 4); // offset 4 for destroy
    
    if (destroyFnPtr !== 0) {
      const wasmTable = Module.wasmTable as WebAssembly.Table;
      const destroyFn = wasmTable.get(destroyFnPtr) as (lok: number) => void;
      destroyFn(lokPtr);
    }
  } catch (err) {
    log('Error destroying LOK:', err);
  }
  
  lokPtr = 0;
  initialized = false;
}

/**
 * Perform a document conversion
 */
function convert(
  inputData: number[],
  inputExt: string,
  outputFormat: string,
  filterOptions: string
): number[] {
  if (!initialized) {
    throw new Error('LibreOfficeKit not initialized');
  }

  const inputPath = `/tmp/input/doc.${inputExt}`;
  const outputPath = `/tmp/output/doc.${outputFormat}`;

  // Ensure directories exist
  try { Module.FS.mkdir('/tmp'); } catch {}
  try { Module.FS.mkdir('/tmp/input'); } catch {}
  try { Module.FS.mkdir('/tmp/output'); } catch {}

  // Write input file
  Module.FS.writeFile(inputPath, new Uint8Array(inputData));
  log('Input written:', inputPath, inputData.length, 'bytes');

  // Load document
  log('Loading document...');
  const docPtr = loadDocument(inputPath);
  log('Document loaded, ptr:', docPtr);

  try {
    // Save document
    log('Saving as:', outputFormat);
    saveDocument(docPtr, outputPath, outputFormat, filterOptions);
    log('Document saved');

    // Read output
    const output = Module.FS.readFile(outputPath) as Uint8Array;
    log('Output read:', output.length, 'bytes');

    // Cleanup temp files
    try { Module.FS.unlink(inputPath); } catch {}
    try { Module.FS.unlink(outputPath); } catch {}

    return Array.from(output);
  } finally {
    // Always destroy the document
    destroyDocument(docPtr);
  }
}

// Message types
interface ConvertRequest {
  type: 'convert';
  id: string;
  payload: {
    inputData: number[];
    inputExt: string;
    outputFormat: string;
    filterOptions: string;
  };
}

interface DestroyRequest {
  type: 'destroy';
  id: string;
}

type WorkerRequest = ConvertRequest | DestroyRequest;

// Handle incoming messages
process.on('message', (msg: WorkerRequest) => {
  try {
    if (msg.type === 'convert') {
      const { inputData, inputExt, outputFormat, filterOptions } = msg.payload;
      log('Converting:', inputExt, '->', outputFormat);
      const result = convert(inputData, inputExt, outputFormat, filterOptions || '');
      process.send?.({ type: 'response', id: msg.id, success: true, data: result });
    } else if (msg.type === 'destroy') {
      log('Destroying LOK...');
      destroyLOK();
      process.send?.({ type: 'response', id: msg.id, success: true });
    }
  } catch (err) {
    const errorMsg = (err as Error).message;
    log('Error:', errorMsg);
    // Include recent LO output in error for debugging
    const recentOutput = getRecentOutput();
    const fullError = recentOutput ? `${errorMsg}\n\nRecent LibreOffice output:\n${recentOutput}` : errorMsg;
    process.send?.({ type: 'response', id: msg.id, success: false, error: fullError });
  }
});

// Track runtime initialization
let runtimeInitialized = false;

// Buffer to capture recent LibreOffice output for crash debugging
const loOutputBuffer: string[] = [];
const MAX_OUTPUT_BUFFER = 50;

function captureOutput(type: 'out' | 'err', msg: string) {
  const line = `[LO:${type}] ${msg}`;
  loOutputBuffer.push(line);
  if (loOutputBuffer.length > MAX_OUTPUT_BUFFER) {
    loOutputBuffer.shift();
  }
  if (verbose) {
    type === 'out' ? console.log(msg) : console.error(msg);
  }
}

// Get recent LO output for debugging crashes
function getRecentOutput(): string {
  return loOutputBuffer.join('\n');
}

// Configure Emscripten module
(global as any).Module = {
  locateFile: (filename: string) => {
    log('locateFile:', filename);
    // Return absolute path for worker files (Node.js worker_threads requirement)
    return path.join(wasmDir, filename);
  },
  print: (msg: string) => captureOutput('out', msg),
  printErr: (msg: string) => captureOutput('err', msg),
  onRuntimeInitialized: () => {
    log('Emscripten runtime initialized');
    runtimeInitialized = true;
  },
  onAbort: (what: string) => {
    log('LibreOffice ABORT:', what);
    log('Recent output:\n' + getRecentOutput());
  },
};

log('Loading WASM module from:', wasmDir);

// Load the WASM module
const { createRequire } = require('module');
const nodeRequire = createRequire(__filename);

try {
  nodeRequire(path.join(wasmDir, 'soffice.cjs'));
} catch (err) {
  log('Failed to load soffice.cjs:', err);
  process.send?.({ type: 'error', error: `Failed to load WASM module: ${(err as Error).message}` });
  process.exit(1);
}

log('Module loaded, waiting for initialization...');

// Poll for module readiness - need to wait for full Emscripten runtime init
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 300; // 30 seconds max

function checkReady() {
  initAttempts++;
  Module = (global as any).Module;
  log('Exports:',
    typeof Module._lok_documentLoad,
    typeof Module._lok_documentSaveAs,
    typeof Module._lok_documentDestroy,
    typeof Module._lok_getError,
    typeof Module._lok_destroy
  );
  // Check for all required functions AND that the runtime is fully initialized
  const hasRequiredFunctions = Module._malloc && Module._libreofficekit_hook && Module.FS;
  const runtimeReady = runtimeInitialized || Module.calledRun || Module.ready;
  
  if (hasRequiredFunctions && runtimeReady) {
    log('Module functions available, runtime ready');
    
    // Add a small delay to ensure pthread workers are initialized
    setTimeout(() => {
      try {
        initLOK();
        process.send?.({ type: 'ready' });
        log('Initialization complete - ready for conversions');
      } catch (err) {
        log('Initialization error:', err);
        process.send?.({ type: 'error', error: (err as Error).message });
        process.exit(1);
      }
    }, 100);
  } else if (initAttempts >= MAX_INIT_ATTEMPTS) {
    log('Timeout waiting for module initialization');
    process.send?.({ type: 'error', error: 'Timeout waiting for WASM module initialization' });
    process.exit(1);
  } else {
    // Keep polling
    setTimeout(checkReady, 100);
  }
}

// Start polling after a short delay to allow module to initialize
setTimeout(checkReady, 500);

// Keep process alive
setInterval(() => {}, 60000);



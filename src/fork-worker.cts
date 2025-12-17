/**
 * Forked Process Worker for LibreOffice WASM
 */

import * as path from 'path';
import * as fs from 'fs';

const wasmPath = process.env.WASM_PATH || './wasm';
const verbose = process.env.VERBOSE === 'true';
const wasmDir = path.resolve(wasmPath);

process.chdir(wasmDir);

function log(...args: unknown[]) {
  if (verbose) console.error('[ForkWorker]', ...args);
}

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

  open(_m: string, url: string) { this._url = url; this.readyState = 1; }
  overrideMimeType() { }
  setRequestHeader() { }
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

(global as any).XMLHttpRequest = NodeXHR;

let Module: any = null;
let lokPtr = 0;
let initialized = false;

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

function initLOK(): void {
  log('Initializing LOK...');
  const pathPtr = allocString('/instdir/program');
  if (Module._lok_preinit) {
    Module._lok_preinit(pathPtr, 0);
  }
  lokPtr = Module._libreofficekit_hook(pathPtr);
  Module._free(pathPtr);
  if (lokPtr === 0) throw new Error('LOK init failed');
  log('LOK ready, ptr:', lokPtr);
  initialized = true;
}

function convert(
  inputData: number[],
  inputExt: string,
  outputFormat: string,
  filterOptions: string
): number[] {
  if (!initialized) throw new Error('Not initialized');

  const inputPath = `/tmp/input/doc.${inputExt}`;
  const outputPath = `/tmp/output/doc.${outputFormat}`;

  try { Module.FS.mkdir('/tmp'); } catch { }
  try { Module.FS.mkdir('/tmp/input'); } catch { }
  try { Module.FS.mkdir('/tmp/output'); } catch { }

  Module.FS.writeFile(inputPath, new Uint8Array(inputData));
  log('Input written');

  const lokClassPtr = readPtr(lokPtr);
  const loadFnPtr = readPtr(lokClassPtr + 8);
  const wasmTable = Module.wasmTable as WebAssembly.Table;
  const loadFn = wasmTable.get(loadFnPtr) as (lok: number, path: number) => number;

  const inputPathPtr = allocString(inputPath);
  const docPtr = loadFn(lokPtr, inputPathPtr);
  Module._free(inputPathPtr);
  if (docPtr === 0) throw new Error('Failed to load document');
  log('Document loaded');

  try {
    const docClassPtr = readPtr(docPtr);
    const saveFnPtr = readPtr(docClassPtr + 8);
    const saveFn = wasmTable.get(saveFnPtr) as (d: number, p: number, f: number, o: number) => number;

    const outPathPtr = allocString(outputPath);
    const fmtPtr = allocString(outputFormat);
    const optPtr = allocString(filterOptions);

    const result = saveFn(docPtr, outPathPtr, fmtPtr, optPtr);
    Module._free(outPathPtr);
    Module._free(fmtPtr);
    Module._free(optPtr);

    if (result === 0) throw new Error('Failed to save');
    log('Document saved');

    const output = Module.FS.readFile(outputPath) as Uint8Array;
    try { Module.FS.unlink(inputPath); } catch { }
    try { Module.FS.unlink(outputPath); } catch { }

    return Array.from(output);
  } finally {
    const docClassPtr = readPtr(docPtr);
    const destroyFnPtr = readPtr(docClassPtr + 4);
    if (destroyFnPtr !== 0) {
      const destroyFn = wasmTable.get(destroyFnPtr) as (d: number) => void;
      destroyFn(docPtr);
    }
  }
}

// Handle messages
process.on('message', (msg: { type: string; id: string; payload?: any }) => {
  try {
    if (msg.type === 'convert') {
      const { inputData, inputExt, outputFormat, filterOptions } = msg.payload;
      const result = convert(inputData, inputExt, outputFormat, filterOptions || '');
      process.send?.({ type: 'response', id: msg.id, success: true, data: result });
    } else if (msg.type === 'destroy') {
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
      process.send?.({ type: 'response', id: msg.id, success: true });
    }
  } catch (err) {
    process.send?.({ type: 'response', id: msg.id, success: false, error: (err as Error).message });
  }
});

// Configure module
(global as any).Module = {
  locateFile: (f: string) => f,
  print: verbose ? console.log : () => { },
  printErr: verbose ? console.error : () => { },
};

log('Loading WASM module from:', wasmDir);

const { createRequire } = require('module');
const nodeRequire = createRequire(__filename);
nodeRequire(path.join(wasmDir, 'soffice.cjs'));

log('Module loaded, polling for ready state...');

// Poll for the module to be ready
function checkReady() {
  Module = (global as any).Module;

  if (Module._malloc && Module._libreofficekit_hook) {
    log('Module functions available');
    try {
      initLOK();
      process.send?.({ type: 'ready' });
      log('Initialization complete');
    } catch (err) {
      log('Init error:', err);
      process.send?.({ type: 'error', error: (err as Error).message });
    }
  } else {
    // Keep polling
    setTimeout(checkReady, 100);
  }
}

// Start polling after a short delay
setTimeout(checkReady, 500);

// Keep process alive
setInterval(() => { }, 60000);

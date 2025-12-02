/**
 * Isolated Worker for LibreOffice WASM (SAFE VERSION)
 *
 * ALL calls go through C shim exports.
 * No vtable traversal. No wasmTable access.
 * No direct pointer dereferencing except HEAPU8/HEAPU32 for strings.
 */

import { parentPort, workerData } from 'worker_threads';
import * as path from 'path';
import * as fs from 'fs';

const config = workerData as {
  wasmPath: string;
  verbose: boolean;
};

const wasmDir = path.resolve(config.wasmPath);
process.chdir(wasmDir);

// ---------- XMLHttpRequest Polyfill ----------
class NodeXMLHttpRequest {
  readyState = 0;
  status = 0;
  responseType = '';
  response: any = null;

  onload: (() => void) | null = null;
  onerror: ((err: Error) => void) | null = null;

  private _url = '';

  open(_method: string, url: string) {
    this._url = url;
    this.readyState = 1;
  }

  send() {
    try {
      const data = fs.readFileSync(this._url);
      this.readyState = 4;
      this.status = 200;

      if (this.responseType === 'arraybuffer') {
        this.response = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      } else {
        this.response = data.toString('utf8');
      }

      this.onload?.();
    } catch (err) {
      this.readyState = 4;
      this.status = 404;
      this.onerror?.(err as Error);
    }
  }

  overrideMimeType() {}
  setRequestHeader() {}
}

(global as any).XMLHttpRequest = NodeXMLHttpRequest;

// ---------- Globals ----------
let Module: any = null;
let lokPtr = 0;
let initialized = false;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function log(...args: unknown[]) {
  if (config.verbose) console.log('[Worker]', ...args);
}

function allocString(str: string): number {
  const bytes = encoder.encode(str + '\0');
  const ptr = Module._malloc(bytes.length);
  Module.HEAPU8.set(bytes, ptr);
  return ptr;
}

// ---------- Initialize LOK ----------
function initializeLOK(): void {
  log('Initializing LOK...');

  const pathPtr = allocString('/instdir/program');

  // Optional hook
  if (Module._lok_preinit) {
    Module._lok_preinit(pathPtr, 0);
  }

  lokPtr = Module._libreofficekit_hook(pathPtr);
  Module._free(pathPtr);

  if (lokPtr === 0) throw new Error('Failed to initialize LibreOfficeKit');

  log('LOK initialized:', lokPtr);
  initialized = true;
}

// ---------- Convert Document (shim-only) ----------
function convert(
  inputData: Uint8Array,
  inputExt: string,
  outputFormat: string,
  filterOptions: string
): Uint8Array {
  
  if (!initialized) throw new Error('LOK not initialized');

  // Track memory before conversion
  const memBefore = Module.HEAPU8?.length || 0;

  const inputPath = `/tmp/input.${inputExt}`;
  const outputPath = `/tmp/output.${outputFormat}`;

  try { Module.FS.mkdir('/tmp'); } catch {}
  Module.FS.writeFile(inputPath, inputData);

  // ---- LOAD DOCUMENT ----
  const inputPathPtr = allocString(inputPath);
  const docPtr = Module._lok_documentLoad(lokPtr, inputPathPtr);
  Module._free(inputPathPtr);

  if (docPtr === 0) {
    const errPtr = Module._lok_getError?.(lokPtr) ?? 0;
    const msg = errPtr ? decoder.decode(Module.HEAPU8.subarray(errPtr, Module.HEAPU8.indexOf(0, errPtr))) : 'unknown error';
    throw new Error('Load failed: ' + msg);
  }

  // ---- SAVE DOCUMENT ----
  const urlPtr = allocString(outputPath);
  const fmtPtr = allocString(outputFormat);
  const optsPtr = allocString(filterOptions);

  const ok = Module._lok_documentSaveAs(docPtr, urlPtr, fmtPtr, optsPtr);

  Module._free(urlPtr);
  Module._free(fmtPtr);
  Module._free(optsPtr);

  if (ok === 0) throw new Error('Save failed');

  // ---- READ OUTPUT ----
  const output = Module.FS.readFile(outputPath) as Uint8Array;

  // ---- DESTROY DOC ----
  Module._lok_documentDestroy(docPtr);

  // Track memory after conversion
  const memAfter = Module.HEAPU8?.length || 0;
  if (memAfter !== memBefore) {
    log(`Memory changed during conversion: ${memBefore} -> ${memAfter}`);
    memoryGrowthCount++;
  }

  return output;
}

// ---------- Memory Growth Tracking ----------
let memoryGrowthCount = 0;
let lastMemorySize = 0;

function onMemoryGrowth() {
  memoryGrowthCount++;
  const newSize = Module.HEAPU8?.length || 0;
  log(`Memory grew! Count: ${memoryGrowthCount}, Old: ${lastMemorySize}, New: ${newSize}`);
  lastMemorySize = newSize;
}

// ---------- Module Setup ----------
(global as any).Module = {
  locateFile: (f: string) => f,
  onRuntimeInitialized: () => {
    Module = (global as any).Module;
    lastMemorySize = Module.HEAPU8?.length || 0;
    log(`Initial memory size: ${lastMemorySize}`);
    
    // Register memory growth callback if available
    if (Module.addOnPostRun) {
      // Not exactly right but helps track
    }
    
    try {
      initializeLOK();
      parentPort?.postMessage({ type: 'ready' });
    } catch (err) {
      parentPort?.postMessage({ type: 'error', error: (err as Error).message });
    }
  },
  print: config.verbose ? console.log : () => {},
  printErr: config.verbose ? console.error : () => {},
};

// Load WASM module
log('Loading WASM...');
require(path.join(wasmDir, 'soffice.cjs'));

// ---------- Message Handling ----------
parentPort?.on('message', msg => {
  try {
    if (msg.type === 'convert') {
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
        data: result
      });

    } else if (msg.type === 'destroy') {
      if (lokPtr && Module._lok_destroy) {
        Module._lok_destroy(lokPtr);
      }
      lokPtr = 0;
      initialized = false;

      parentPort?.postMessage({
        type: 'response',
        id: msg.id,
        success: true
      });
    }

  } catch (err) {
    parentPort?.postMessage({
      type: 'response',
      id: msg.id,
      success: false,
      error: (err as Error).message
    });
  }
});

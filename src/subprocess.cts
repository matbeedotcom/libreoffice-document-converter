/**
 * LibreOffice WASM Subprocess Script
 * 
 * This runs as a child process to handle the WASM module.
 * The subprocess CAN change working directory which is required
 * for Emscripten's data file loading.
 */

import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';

interface Message {
  type: 'init' | 'convert' | 'destroy';
  id: string;
  payload?: unknown;
}

interface InitPayload {
  wasmPath: string;
  verbose: boolean;
}

interface ConvertPayload {
  inputData: number[];
  inputExt: string;
  outputFormat: string;
  filterOptions: string;
}

// Global state
let Module: any = null;
let lokPtr: number = 0;
let initialized = false;

/**
 * XMLHttpRequest polyfill
 */
class NodeXMLHttpRequest {
  readyState = 0;
  status = 0;
  responseType = '';
  response: any = null;
  responseText = '';
  onload: (() => void) | null = null;
  onerror: ((err: any) => void) | null = null;
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
      if (this.onerror) this.onerror(err);
    }
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

async function initialize(payload: InitPayload): Promise<void> {
  if (initialized) return;

  const verbose = payload.verbose;
  
  // Set up polyfill
  (global as any).XMLHttpRequest = NodeXMLHttpRequest;

  // Configure module
  (global as any).Module = {
    print: verbose ? console.log : () => {},
    printErr: verbose ? console.error : () => {},
  };

  // Load the module (cwd is already set to wasm directory)
  // Use createRequire to get a require function that works in ESM
  const require = createRequire(import.meta.url);
  const sofficeModule = require(path.join(process.cwd(), 'soffice.cjs'));
  Module = (global as any).Module || sofficeModule;

  // Wait for initialization
  const start = Date.now();
  const timeout = 120000;
  
  while (!Module._malloc || !Module._libreofficekit_hook) {
    if (Date.now() - start > timeout) {
      throw new Error('WASM init timeout');
    }
    await new Promise(r => setTimeout(r, 100));
  }

  // Initialize LOK
  const pathPtr = allocString('/instdir/program');
  if (Module._lok_preinit) {
    Module._lok_preinit(pathPtr, 0);
  }
  lokPtr = Module._libreofficekit_hook(pathPtr);
  Module._free(pathPtr);

  if (lokPtr === 0) {
    throw new Error('Failed to init LOK');
  }

  initialized = true;
}

async function convert(payload: ConvertPayload): Promise<number[]> {
  if (!initialized || !Module || lokPtr === 0) {
    throw new Error('Not initialized');
  }

  const inputPath = `/tmp/input/doc.${payload.inputExt}`;
  const outputPath = `/tmp/output/doc.${payload.outputFormat}`;

  // Ensure directories exist
  try { Module.FS.mkdir('/tmp'); } catch {}
  try { Module.FS.mkdir('/tmp/input'); } catch {}
  try { Module.FS.mkdir('/tmp/output'); } catch {}

  // Write input
  const inputData = new Uint8Array(payload.inputData);
  Module.FS.writeFile(inputPath, inputData);

  // Load document
  const lokClassPtr = readPtr(lokPtr);
  const loadFnPtr = readPtr(lokClassPtr + 8);
  
  const wasmTable = Module.wasmTable as WebAssembly.Table;
  const loadFn = wasmTable.get(loadFnPtr) as (lok: number, path: number) => number;
  
  const inputPathPtr = allocString(inputPath);
  const docPtr = loadFn(lokPtr, inputPathPtr);
  Module._free(inputPathPtr);

  if (docPtr === 0) {
    throw new Error('Failed to load document');
  }

  try {
    // Save document
    const docClassPtr = readPtr(docPtr);
    const saveFnPtr = readPtr(docClassPtr + 8);
    const saveFn = wasmTable.get(saveFnPtr) as (
      doc: number, path: number, format: number, opts: number
    ) => number;

    const outputPathPtr = allocString(outputPath);
    const formatPtr = allocString(payload.outputFormat);
    const optsPtr = allocString(payload.filterOptions);

    const result = saveFn(docPtr, outputPathPtr, formatPtr, optsPtr);

    Module._free(outputPathPtr);
    Module._free(formatPtr);
    Module._free(optsPtr);

    if (result === 0) {
      throw new Error('Failed to save document');
    }

    // Read output
    const outputData = Module.FS.readFile(outputPath) as Uint8Array;
    
    // Cleanup
    try { Module.FS.unlink(inputPath); } catch {}
    try { Module.FS.unlink(outputPath); } catch {}

    return Array.from(outputData);
  } finally {
    // Destroy document
    const docClassPtr = readPtr(docPtr);
    const destroyFnPtr = readPtr(docClassPtr + 4);
    if (destroyFnPtr !== 0) {
      const destroyFn = wasmTable.get(destroyFnPtr) as (doc: number) => void;
      destroyFn(docPtr);
    }
  }
}

// Message handler
process.on('message', async (msg: Message) => {
  try {
    switch (msg.type) {
      case 'init':
        await initialize(msg.payload as InitPayload);
        process.send?.({ type: 'response', id: msg.id, success: true });
        break;

      case 'convert':
        const result = await convert(msg.payload as ConvertPayload);
        process.send?.({ type: 'response', id: msg.id, success: true, data: result });
        break;

      case 'destroy':
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
        break;
    }
  } catch (error) {
    process.send?.({ 
      type: 'response', 
      id: msg.id, 
      success: false, 
      error: (error as Error).message 
    });
  }
});

// Signal ready
process.send?.({ type: 'ready' });


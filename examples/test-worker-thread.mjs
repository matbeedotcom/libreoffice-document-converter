/**
 * Test: Run WASM entirely inside a Node.js Worker thread
 * This way the main thread never blocks, and the worker can block during init
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (isMainThread) {
  // Main thread - spawn worker
  console.log('Main thread: spawning worker...');
  
  const worker = new Worker(new URL(import.meta.url), {
    workerData: { wasmDir: path.join(__dirname, 'wasm') }
  });
  
  worker.on('message', (msg) => {
    console.log('Main thread received:', msg);
    if (msg.type === 'ready') {
      console.log('Worker is ready! LOK initialized.');
      // Send a test conversion request
      worker.postMessage({ type: 'test' });
    } else if (msg.type === 'done') {
      console.log('Test complete!');
      worker.terminate();
      process.exit(0);
    }
  });
  
  worker.on('error', (err) => {
    console.error('Worker error:', err);
    process.exit(1);
  });
  
  // Timeout after 30 seconds
  setTimeout(() => {
    console.log('Timeout!');
    worker.terminate();
    process.exit(1);
  }, 30000);
  
} else {
  // Worker thread - load WASM and initialize LOK
  const { wasmDir } = workerData;
  
  console.log('Worker: starting with wasmDir:', wasmDir);
  // Note: can't use chdir in worker threads, use absolute paths instead
  
  // XMLHttpRequest polyfill
  class NodeXHR {
    readyState = 0; status = 0; responseType = ''; response = null;
    onload = null; onerror = null; _url = '';
    open(m, url) { this._url = url; this.readyState = 1; }
    overrideMimeType() {}
    setRequestHeader() {}
    send() {
      try {
        // Resolve path relative to wasmDir if not absolute
        const filePath = path.isAbsolute(this._url) ? this._url : path.join(wasmDir, this._url);
        const data = fs.readFileSync(filePath);
        this.status = 200; this.readyState = 4;
        this.response = this.responseType === 'arraybuffer' 
          ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
          : data.toString('utf8');
        if (this.onload) this.onload();
      } catch (err) { 
        this.status = 404; this.readyState = 4; 
        if (this.onerror) this.onerror(err); 
      }
    }
  }
  
  globalThis.XMLHttpRequest = NodeXHR;
  globalThis.Worker = Worker;
  
  globalThis.Module = {
    locateFile: (f) => path.join(wasmDir, f),
    print: (...args) => console.log('LO:', ...args),
    printErr: (...args) => console.error('LO:', ...args),
  };
  
  console.log('Worker: loading soffice.cjs...');
  
  // Dynamic import for CommonJS in worker
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  require(path.join(wasmDir, 'soffice.cjs'));
  
  console.log('Worker: module loaded, waiting for functions...');
  
  // Poll for readiness
  let count = 0;
  const poll = setInterval(() => {
    count++;
    const M = globalThis.Module;
    
    if (M._malloc && M._libreofficekit_hook && M.FS) {
      clearInterval(poll);
      console.log('Worker: functions available at poll', count);
      
      // Initialize LOK
      console.log('Worker: calling _libreofficekit_hook...');
      const enc = new TextEncoder();
      const pathStr = '/instdir/program';
      const bytes = enc.encode(pathStr + '\0');
      const ptr = M._malloc(bytes.length);
      M.HEAPU8.set(bytes, ptr);
      
      const start = Date.now();
      const lokPtr = M._libreofficekit_hook(ptr);
      console.log('Worker: _libreofficekit_hook returned', lokPtr, 'in', Date.now() - start, 'ms');
      M._free(ptr);
      
      if (lokPtr) {
        parentPort.postMessage({ type: 'ready', lokPtr });
      } else {
        parentPort.postMessage({ type: 'error', message: 'LOK init failed' });
      }
    }
    
    if (count > 100) {
      clearInterval(poll);
      parentPort.postMessage({ type: 'error', message: 'Timeout waiting for module' });
    }
  }, 100);
  
  // Handle messages from main thread
  parentPort.on('message', (msg) => {
    if (msg.type === 'test') {
      console.log('Worker: got test message');
      parentPort.postMessage({ type: 'done' });
    }
  });
}


/**
 * Node.js WASM Loader for LibreOffice
 * 
 * This CommonJS wrapper provides the necessary polyfills and setup
 * for loading the Emscripten-generated LibreOffice WASM module in Node.js.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');

// Make Worker globally available
global.Worker = Worker;

const wasmDir = __dirname;

// Change to wasm directory for relative path resolution
const origCwd = process.cwd();
process.chdir(wasmDir);

// Make fs.readFile synchronous (required because WASM init blocks event loop)
const origReadFile = fs.readFile.bind(fs);
fs.readFile = function(filePath, optionsOrCallback, maybeCallback) {
  const callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback;
  const options = typeof optionsOrCallback === 'function' ? undefined : optionsOrCallback;
  
  try {
    const data = fs.readFileSync(filePath, options);
    callback(null, data);
  } catch (err) {
    callback(err);
  }
};

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
    this._url = '';
  }

  open(method, url) {
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

      // onreadystatechange is what Emscripten uses
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

global.XMLHttpRequest = NodeXMLHttpRequest;

/**
 * Create and initialize the LibreOffice WASM module
 * 
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} - The initialized Emscripten module
 */
function createModule(config = {}) {
  return new Promise((resolve, reject) => {
    // Set up the Module configuration
    global.Module = {
      // Pre-load WASM binary for faster loading
      wasmBinary: config.wasmBinary,
      
      // Locate files using absolute paths
      locateFile: (filename) => {
        const resolved = path.join(wasmDir, filename);
        if (config.verbose) {
          console.log('[WASM] locateFile:', filename, '->', resolved);
        }
        return resolved;
      },
      
      // Runtime initialized callback
      onRuntimeInitialized: () => {
        if (config.verbose) {
          console.log('[WASM] Runtime initialized');
        }
        
        // Restore original cwd
        process.chdir(origCwd);
        
        // Call user's callback if provided
        if (config.onRuntimeInitialized) {
          config.onRuntimeInitialized();
        }
        
        resolve(global.Module);
      },
      
      // Output handlers
      print: config.print || (() => {}),
      printErr: config.printErr || (() => {}),
      
      // Copy any additional config
      ...config,
    };

    try {
      // Load the soffice module
      // This is a patched version that uses global.Module
      require('./soffice.cjs');
    } catch (err) {
      process.chdir(origCwd);
      reject(err);
    }
  });
}

/**
 * Synchronous module initialization
 * Returns a Module object that will be populated when ready
 */
function createModuleSync(config = {}) {
  global.Module = {
    wasmBinary: config.wasmBinary,
    locateFile: (filename) => path.join(wasmDir, filename),
    onRuntimeInitialized: config.onRuntimeInitialized || (() => {}),
    print: config.print || (() => {}),
    printErr: config.printErr || (() => {}),
    ...config,
  };

  require('./soffice.cjs');
  
  return global.Module;
}

module.exports = {
  createModule,
  createModuleSync,
  wasmDir,
};

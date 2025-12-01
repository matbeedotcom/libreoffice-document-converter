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

// File sizes for progress calculation (approximate)
const FILE_SIZES = {
  'soffice.wasm': 116000000,  // ~110MB
  'soffice.data': 84000000,   // ~80MB
};

let currentProgressCallback = null;

// Make fs.readFile synchronous (required because WASM init blocks event loop)
const origReadFile = fs.readFile.bind(fs);
fs.readFile = function(filePath, optionsOrCallback, maybeCallback) {
  const callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback;
  const options = typeof optionsOrCallback === 'function' ? undefined : optionsOrCallback;
  
  const filename = path.basename(filePath);
  
  // Emit progress for large files
  if (currentProgressCallback && filename === 'soffice.data') {
    currentProgressCallback('loading_data', 15, 'Loading LibreOffice data files...');
  }
  
  try {
    const data = fs.readFileSync(filePath, options);
    
    if (currentProgressCallback && filename === 'soffice.data') {
      currentProgressCallback('loading_data', 35, `Loaded ${(data.length / 1024 / 1024).toFixed(0)}MB data file`);
    }
    
    callback(null, data);
  } catch (err) {
    callback(err);
  }
};

// XMLHttpRequest polyfill for Node.js with progress
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
      // Emit progress before loading large files
      if (currentProgressCallback && filename === 'soffice.data') {
        currentProgressCallback('loading_data', 20, 'Loading LibreOffice filesystem image...');
      }
      
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

      // Emit progress after loading
      if (currentProgressCallback) {
        if (filename === 'soffice.data') {
          currentProgressCallback('loading_data', 40, `Loaded ${(data.length / 1024 / 1024).toFixed(0)}MB filesystem`);
        } else if (filename.endsWith('.metadata')) {
          currentProgressCallback('loading_metadata', 12, 'Loading metadata...');
        }
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
 * @param {Function} config.onProgress - Progress callback (phase, percent, message)
 * @returns {Promise<Object>} - The initialized Emscripten module
 */
function createModule(config = {}) {
  return new Promise((resolve, reject) => {
    // Set up progress callback
    currentProgressCallback = config.onProgress || null;
    
    // Emit initial progress
    if (currentProgressCallback) {
      currentProgressCallback('starting', 0, 'Starting LibreOffice WASM...');
    }
    
    // Pre-load WASM binary with progress
    let wasmBinary = config.wasmBinary;
    if (!wasmBinary) {
      if (currentProgressCallback) {
        currentProgressCallback('loading_wasm', 5, 'Loading WebAssembly binary...');
      }
      
      const wasmPath = path.join(wasmDir, 'soffice.wasm');
      const wasmData = fs.readFileSync(wasmPath);
      wasmBinary = wasmData.buffer.slice(wasmData.byteOffset, wasmData.byteOffset + wasmData.byteLength);
      
      if (currentProgressCallback) {
        currentProgressCallback('loading_wasm', 10, `Loaded ${(wasmData.length / 1024 / 1024).toFixed(0)}MB WASM binary`);
      }
    }
    
    // Set up the Module configuration
    global.Module = {
      wasmBinary,
      
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
        if (currentProgressCallback) {
          currentProgressCallback('runtime_ready', 45, 'WebAssembly runtime initialized');
        }
        
        if (config.verbose) {
          console.log('[WASM] Runtime initialized');
        }
        
        // Restore original cwd
        process.chdir(origCwd);
        
        // Clear progress callback
        currentProgressCallback = null;
        
        // Call user's callback if provided
        if (config.onRuntimeInitialized) {
          config.onRuntimeInitialized();
        }
        
        resolve(global.Module);
      },
      
      // Output handlers
      print: config.print || (() => {}),
      printErr: config.printErr || (() => {}),
      
      // Copy any additional config (except functions we've handled)
      ...Object.fromEntries(
        Object.entries(config).filter(([k]) => 
          !['onProgress', 'onRuntimeInitialized', 'print', 'printErr', 'verbose', 'wasmBinary'].includes(k)
        )
      ),
    };

    if (currentProgressCallback) {
      currentProgressCallback('loading_module', 42, 'Initializing Emscripten module...');
    }

    try {
      // Load the soffice module
      // This is a patched version that uses global.Module
      require('./soffice.cjs');
    } catch (err) {
      process.chdir(origCwd);
      currentProgressCallback = null;
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

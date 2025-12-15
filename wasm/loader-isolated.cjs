/**
 * Isolated Node.js WASM Loader for LibreOffice
 *
 * This loader creates isolated module instances by:
 * 1. Clearing the require cache for soffice.cjs before each load
 * 2. Creating a fresh Module object for each instance
 * 3. Storing the module reference locally, not on global
 * 4. Properly cleaning up after destroy()
 *
 * Key differences from loader.cjs:
 * - Clears require cache before each module load
 * - Returns the module directly without leaving global pollution
 * - Proper cleanup enables sequential create/destroy cycles
 *
 * Note: For true parallel isolation, use WorkerConverter or SubprocessConverter,
 * as WebAssembly memory cannot be truly isolated within a single thread.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Worker: NodeWorker } = require('worker_threads');
const zlib = require('zlib');

/**
 * Check if data starts with gzip magic bytes (0x1f 0x8b)
 */
function isGzipped(data) {
  return data && data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
}

/**
 * Decompress data if it's gzipped, otherwise return as-is
 */
function decompressIfGzipped(data) {
  if (isGzipped(data)) {
    return zlib.gunzipSync(data);
  }
  return data;
}

const wasmDir = __dirname;

// Custom Worker wrapper that resolves paths to wasmDir
class Worker extends NodeWorker {
  constructor(filename, options) {
    let resolvedPath = filename;
    if (!path.isAbsolute(filename)) {
      resolvedPath = path.join(wasmDir, path.basename(filename));
    }
    super(resolvedPath, options);
  }
}

// Make Worker globally available (required by Emscripten)
global.Worker = Worker;

// Cache for WASM binary only (immutable, safe to share)
let cachedWasmBinary = null;

// Track active modules for debugging
let activeModuleCount = 0;

/**
 * Clear the require cache for soffice.cjs to force fresh module load
 */
function clearSofficeCache() {
  const sofficePathCjs = path.join(wasmDir, 'soffice.cjs');
  const sofficePathJs = path.join(wasmDir, 'soffice.js');

  // Clear specific paths
  if (require.cache[sofficePathCjs]) {
    delete require.cache[sofficePathCjs];
  }
  if (require.cache[sofficePathJs]) {
    delete require.cache[sofficePathJs];
  }

  // Also clear any aliased paths
  const cacheKeys = Object.keys(require.cache);
  for (const key of cacheKeys) {
    if (key.includes('soffice.cjs') || key.includes('soffice.js')) {
      delete require.cache[key];
    }
  }
}

/**
 * Create XMLHttpRequest polyfill for Node.js
 */
function createXMLHttpRequest(emitProgress) {
  return class NodeXMLHttpRequest {
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
        } else if (filename.endsWith('.metadata')) {
          emitProgress('loading_metadata', 15, 'Loading filesystem metadata...');
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
  };
}

/**
 * Create a patched fs.readFile for the module
 */
function createPatchedReadFile(emitProgress) {
  return function patchedReadFile(filePath, optionsOrCallback, maybeCallback) {
    const callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback;
    const options = typeof optionsOrCallback === 'function' ? undefined : optionsOrCallback;
    const filename = path.basename(filePath);

    if (filename === 'soffice.data' || filename === 'soffice.data.gz') {
      emitProgress('loading_data', 20, 'Loading LibreOffice data files...');
    }

    try {
      let actualPath = filePath;
      if (!fs.existsSync(filePath) && !filePath.endsWith('.gz')) {
        const gzPath = filePath + '.gz';
        if (fs.existsSync(gzPath)) {
          actualPath = gzPath;
        }
      }

      let data = fs.readFileSync(actualPath, options);

      if (!options && isGzipped(data)) {
        emitProgress('loading_data', 25, 'Decompressing data file...');
        data = decompressIfGzipped(data);
      }

      if (filename === 'soffice.data' || filename === 'soffice.data.gz') {
        emitProgress('loading_data', 35, `Loaded ${(data.length / 1024 / 1024).toFixed(0)}MB filesystem image`);
      }

      callback(null, data);
    } catch (err) {
      callback(err);
    }
  };
}

/**
 * Create and initialize an isolated LibreOffice WASM module
 *
 * Each call creates a fresh module by:
 * 1. Clearing the soffice.cjs require cache
 * 2. Setting up a new Module object on global (required by Emscripten)
 * 3. Loading the module fresh
 * 4. Returning the module (caller should store this reference)
 *
 * @param {Object} config - Configuration options
 * @param {Function} config.onProgress - Progress callback (phase, percent, message)
 * @param {boolean} config.verbose - Enable verbose logging
 * @returns {Promise<Object>} - The initialized Emscripten module
 */
function createModule(config = {}) {
  return new Promise((resolve, reject) => {
    let lastProgress = 0;

    const emitProgress = (phase, percent, message) => {
      if (config.onProgress) {
        const adjustedPercent = Math.max(lastProgress, percent);
        lastProgress = adjustedPercent;
        config.onProgress(phase, adjustedPercent, message);
      }
    };

    // CRITICAL: Clear the require cache to get a fresh module
    clearSofficeCache();

    // Also clear global.Module to ensure no leftover state
    global.Module = undefined;

    emitProgress('starting', 0, 'Starting LibreOffice WASM (isolated)...');

    // Load WASM binary (shared cache is safe - immutable data)
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

    // Patch fs.readFile for this load
    const originalReadFile = fs.readFile;
    fs.readFile = createPatchedReadFile(emitProgress);

    // Patch XMLHttpRequest
    const OriginalXHR = global.XMLHttpRequest;
    global.XMLHttpRequest = createXMLHttpRequest(emitProgress);

    // Change to wasm directory for relative path resolution
    const origCwd = process.cwd();
    let changedDir = false;
    try {
      process.chdir(wasmDir);
      changedDir = true;
    } catch (err) {
      if (err.code !== 'ERR_WORKER_UNSUPPORTED_OPERATION') {
        throw err;
      }
    }

    // Create fresh Module object
    const moduleId = ++activeModuleCount;

    global.Module = {
      _isolatedModuleId: moduleId,
      wasmBinary,
      preRun: [],

      locateFile: (filename) => {
        const resolved = path.join(wasmDir, filename);
        if (!fs.existsSync(resolved)) {
          const gzResolved = resolved + '.gz';
          if (fs.existsSync(gzResolved)) {
            if (config.verbose) {
              console.log(`[WASM-${moduleId}] locateFile:`, filename, '->', gzResolved);
            }
            return gzResolved;
          }
        }
        if (config.verbose) {
          console.log(`[WASM-${moduleId}] locateFile:`, filename, '->', resolved);
        }
        return resolved;
      },

      onRuntimeInitialized: () => {
        emitProgress('runtime_ready', 45, 'WebAssembly runtime initialized');

        if (config.verbose) {
          console.log(`[WASM-${moduleId}] Runtime initialized`);
        }

        // Restore original cwd
        if (changedDir) {
          try {
            process.chdir(origCwd);
          } catch {}
        }

        // Restore original fs.readFile
        fs.readFile = originalReadFile;

        // Restore original XMLHttpRequest (or remove if none)
        if (OriginalXHR) {
          global.XMLHttpRequest = OriginalXHR;
        }

        // Get reference to the module before potentially clearing global
        const moduleRef = global.Module;

        // Call user's callback
        if (config.onRuntimeInitialized) {
          config.onRuntimeInitialized();
        }

        // Resolve with the module reference
        // The caller (converter) should store this and use it directly
        resolve(moduleRef);
      },

      print: config.print || (() => {}),
      printErr: config.printErr || (() => {}),
    };

    // Copy additional config options
    for (const [key, value] of Object.entries(config)) {
      if (!['onProgress', 'onRuntimeInitialized', 'print', 'printErr', 'verbose', 'wasmBinary'].includes(key)) {
        global.Module[key] = value;
      }
    }

    try {
      // Load the soffice module fresh
      require('./soffice.cjs');
    } catch (err) {
      // Cleanup on error
      if (changedDir) {
        try {
          process.chdir(origCwd);
        } catch {}
      }
      fs.readFile = originalReadFile;
      if (OriginalXHR) {
        global.XMLHttpRequest = OriginalXHR;
      }
      reject(err);
    }
  });
}

/**
 * Pre-load the WASM binary into memory
 */
function preloadWasmBinary() {
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
async function precompileWasm() {
  const binary = preloadWasmBinary();
  return await WebAssembly.compile(binary);
}

/**
 * Check if WASM binary is already cached
 */
function isCached() {
  return !!cachedWasmBinary;
}

/**
 * Clear cached data and prepare for fresh module creation
 *
 * IMPORTANT: Call this after destroying a converter and before creating a new one.
 * This clears:
 * - The cached WASM binary
 * - The soffice.cjs require cache
 * - global.Module reference
 */
function clearCache() {
  cachedWasmBinary = null;
  clearSofficeCache();

  if (typeof global !== 'undefined' && global.Module) {
    global.Module = undefined;
  }
}

/**
 * Get file sizes for progress estimation
 */
function getFileSizes() {
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

/**
 * Get the number of modules created (for debugging)
 */
function getActiveModuleCount() {
  return activeModuleCount;
}

module.exports = {
  createModule,
  preloadWasmBinary,
  precompileWasm,
  isCached,
  clearCache,
  clearSofficeCache,
  getFileSizes,
  getActiveModuleCount,
  wasmDir,
  isGzipped,
  decompressIfGzipped,
};

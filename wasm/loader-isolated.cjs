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
const vm = require('vm');
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

// Cache for compiled WebAssembly.Module (immutable, safe to share)
// This separates Module compilation from Instance creation per GitHub issue #1396
// The Module contains compiled code only; Instance contains memory
let cachedWasmModule = null;

// Track active modules for debugging
let activeModuleCount = 0;

// Mutex to prevent concurrent createModule calls from interfering
// Since they share global.Module, only one can run at a time
// Using a simple queue-based approach to avoid promise chain accumulation
let isCreatingModule = false;
const pendingCreations = [];

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
 * 1. Waiting for any in-progress module creation to complete (mutex)
 * 2. Clearing the soffice.cjs require cache
 * 3. Setting up a new Module object on global (required by Emscripten)
 * 4. Loading the module fresh
 * 5. Returning the module (caller should store this reference)
 *
 * @param {Object} config - Configuration options
 * @param {Function} config.onProgress - Progress callback (phase, percent, message)
 * @param {boolean} config.verbose - Enable verbose logging
 * @returns {Promise<Object>} - The initialized Emscripten module
 */
function createModule(config = {}) {
  // Use mutex to prevent concurrent createModule calls from interfering
  // Since they all use global.Module, only one can initialize at a time
  const queuePosition = activeModuleCount + 1; // For logging purposes

  const doCreateModule = () => new Promise((resolve, reject) => {
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

    // Track the WebAssembly.Instance for this module (for disposal)
    let wasmInstance = null;

    global.Module = {
      _isolatedModuleId: moduleId,
      wasmBinary,
      preRun: [],

      // Custom instantiateWasm hook to separate Module compilation from Instance creation
      // Per GitHub issue #1396: keep Module cached, create fresh Instance with Memory each time
      // This allows Instance/Memory to be GC'd when disposed
      instantiateWasm: (info, receiveInstance) => {
        (async () => {
          try {
            // Compile Module once and cache it (immutable, safe to share)
            if (!cachedWasmModule) {
              if (config.verbose) {
                console.log(`[WASM-${moduleId}] Compiling WebAssembly.Module...`);
              }
              emitProgress('compiling', 16, 'Compiling WebAssembly module...');
              cachedWasmModule = await WebAssembly.compile(wasmBinary);
              emitProgress('compiling', 20, 'WebAssembly module compiled');
            } else {
              if (config.verbose) {
                console.log(`[WASM-${moduleId}] Using cached WebAssembly.Module`);
              }
              emitProgress('compiling', 20, 'Using cached WebAssembly module');
            }

            // Create fresh Instance with the imports (includes fresh Memory)
            if (config.verbose) {
              console.log(`[WASM-${moduleId}] Creating WebAssembly.Instance...`);
            }
            emitProgress('instantiating', 22, 'Creating WebAssembly instance...');

            wasmInstance = await WebAssembly.instantiate(cachedWasmModule, info);

            emitProgress('instantiating', 25, 'WebAssembly instance created');

            // Pass instance to Emscripten
            receiveInstance(wasmInstance, cachedWasmModule);
          } catch (err) {
            console.error(`[WASM-${moduleId}] instantiateWasm failed:`, err);
            throw err;
          }
        })();

        // Return empty exports - Emscripten will use the ones from receiveInstance
        return {};
      },

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

        // Wait for module to be fully ready (all run dependencies resolved)
        // This prevents "malloc called before runtime initialization" errors
        const waitForReady = () => {
          const mod = global.Module;

          // Check if module is fully initialized
          // calledRun means the main() function has been called
          // monitorRunDependencies with 0 deps means all async loads are done
          if (mod && mod.calledRun && (!mod.monitorRunDependencies || mod._malloc)) {
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

            // Get reference to the module
            const moduleRef = global.Module;

            // Store the WebAssembly.Instance reference for disposal
            // This is critical for memory cleanup per GitHub issue #1396
            if (wasmInstance) {
              moduleRef._wasmInstance = wasmInstance;
            }

            // Call user's callback
            if (config.onRuntimeInitialized) {
              config.onRuntimeInitialized();
            }

            // Resolve with the module reference
            resolve(moduleRef);
          } else {
            // Module not fully ready yet, wait a bit
            if (config.verbose) {
              console.log(`[WASM-${moduleId}] Waiting for module to be fully ready...`);
            }
            setTimeout(waitForReady, 10);
          }
        };

        // Start checking for readiness
        waitForReady();
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
      // Load soffice.cjs in an isolated VM context
      // This ensures all module-level variables (wasmMemory, HEAP8, etc.)
      // are contained in a separate context that can be fully GC'd
      const sofficeCode = fs.readFileSync(path.join(wasmDir, 'soffice.cjs'), 'utf8');

      // Create isolated context with necessary globals
      // The context object itself becomes 'global' and 'globalThis' within the VM
      const contextObj = {
        // Provide the Module object we configured
        Module: global.Module,
        // Node.js globals needed by Emscripten
        process: process,
        console: console,
        require: require,
        __dirname: wasmDir,
        __filename: path.join(wasmDir, 'soffice.cjs'),
        // Web APIs Emscripten might use
        Worker: Worker,
        XMLHttpRequest: global.XMLHttpRequest,
        WebAssembly: WebAssembly,
        URL: URL,
        Blob: typeof Blob !== 'undefined' ? Blob : undefined,
        // Standard JS globals
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        setImmediate: setImmediate,
        clearImmediate: clearImmediate,
        Buffer: Buffer,
        ArrayBuffer: ArrayBuffer,
        SharedArrayBuffer: SharedArrayBuffer,
        Uint8Array: Uint8Array,
        Int8Array: Int8Array,
        Uint16Array: Uint16Array,
        Int16Array: Int16Array,
        Uint32Array: Uint32Array,
        Int32Array: Int32Array,
        Float32Array: Float32Array,
        Float64Array: Float64Array,
        BigInt64Array: BigInt64Array,
        BigUint64Array: BigUint64Array,
        DataView: DataView,
        TextEncoder: TextEncoder,
        TextDecoder: TextDecoder,
        Error: Error,
        TypeError: TypeError,
        RangeError: RangeError,
        Math: Math,
        Date: Date,
        JSON: JSON,
        Object: Object,
        Array: Array,
        String: String,
        Number: Number,
        Boolean: Boolean,
        Symbol: Symbol,
        Map: Map,
        Set: Set,
        WeakMap: WeakMap,
        WeakRef: WeakRef,
        FinalizationRegistry: FinalizationRegistry,
        Promise: Promise,
        Proxy: Proxy,
        Reflect: Reflect,
        Atomics: Atomics,
        queueMicrotask: queueMicrotask,
        performance: typeof performance !== 'undefined' ? performance : { now: () => Date.now() },
        // Critical: Function constructor is needed by Emscripten's embind
        Function: Function,
        eval: eval,
        // Additional globals that might be needed
        RegExp: RegExp,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        isFinite: isFinite,
        encodeURIComponent: encodeURIComponent,
        decodeURIComponent: decodeURIComponent,
        encodeURI: encodeURI,
        decodeURI: decodeURI,
        NaN: NaN,
        Infinity: Infinity,
        undefined: undefined,
      };

      // Create the VM context
      const isolatedContext = vm.createContext(contextObj);

      // Make 'global' and 'globalThis' point to the context itself
      // This is critical for Emscripten which does things like global.Module = ...
      contextObj.global = contextObj;
      contextObj.globalThis = contextObj;

      // Store context reference for cleanup
      global.Module._vmContext = isolatedContext;

      // Run soffice.cjs in the isolated context
      vm.runInContext(sofficeCode, isolatedContext, {
        filename: path.join(wasmDir, 'soffice.cjs'),
      });
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

  // Queue-based mutex: ensures only one module initializes at a time
  // This avoids the promise-chain accumulation issue of the previous implementation
  return new Promise((resolveOuter, rejectOuter) => {
    const executeCreation = async () => {
      if (config.verbose) {
        console.log(`[WASM] Queue position: ${queuePosition}, lock acquired`);
      }

      try {
        const module = await doCreateModule();

        // Clean up closures on the module to help GC
        // These were only needed during initialization
        if (module) {
          // Note: Don't delete essential Emscripten properties
          // Only clean up our custom initialization callbacks
          delete module.onRuntimeInitialized;

          // Make the module disposable for explicit resource management
          // This enables: `using module = await createModule()` syntax
          makeDisposable(module);
        }

        resolveOuter(module);
      } catch (err) {
        rejectOuter(err);
      } finally {
        // Release lock and process next in queue
        isCreatingModule = false;

        if (config.verbose) {
          console.log(`[WASM] Queue position: ${queuePosition}, releasing lock`);
        }

        // Process next pending creation
        if (pendingCreations.length > 0) {
          const next = pendingCreations.shift();
          next();
        }
      }
    };

    if (isCreatingModule) {
      // Queue this creation
      if (config.verbose) {
        console.log(`[WASM] Queue position: ${queuePosition}, waiting for lock...`);
      }
      pendingCreations.push(executeCreation);
    } else {
      // Acquire lock and execute immediately
      isCreatingModule = true;
      executeCreation();
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
 * Pre-compile the WASM module and cache it
 * This is useful for warming up the cache before the first conversion
 */
async function precompileWasm() {
  if (cachedWasmModule) {
    return cachedWasmModule;
  }
  const binary = preloadWasmBinary();
  cachedWasmModule = await WebAssembly.compile(binary);
  return cachedWasmModule;
}

/**
 * Check if WASM binary is already cached
 */
function isCached() {
  return !!cachedWasmBinary;
}

/**
 * Clean up a module instance to help garbage collection
 * Call this before setting your module reference to null
 *
 * Per GitHub issue #1396: The key to freeing WebAssembly memory is disposing
 * the WebAssembly.Instance and all references to it. The WebAssembly.Module
 * can be kept cached since it's just compiled code with no memory attached.
 *
 * This performs aggressive cleanup of Emscripten module internals:
 * - Disposes the WebAssembly.Instance (critical for memory release)
 * - Removes initialization callbacks that hold closures
 * - Clears HEAP arrays to release ArrayBuffer references
 * - Clears the virtual filesystem cache
 * - Terminates any pthread workers
 *
 * @param {Object} module - The Emscripten module to clean up
 */
function cleanupModule(module) {
  if (!module) return;

  // Remove initialization callbacks that may hold closures
  // Use try/catch for each access since Emscripten getters can throw
  try { delete module.onRuntimeInitialized; } catch {}
  try { delete module.onAbort; } catch {}
  try { delete module.instantiateWasm; } catch {}

  // Terminate pthread workers if present
  // Must wrap ALL property access in try/catch due to Emscripten's getters
  try {
    const pThread = module.PThread;
    if (pThread) {
      if (pThread.terminateAllThreads) {
        pThread.terminateAllThreads();
      }
      if (pThread.runningWorkers) {
        for (const worker of pThread.runningWorkers) {
          try { if (worker?.terminate) worker.terminate(); } catch {}
        }
        pThread.runningWorkers = [];
      }
      if (pThread.unusedWorkers) {
        for (const worker of pThread.unusedWorkers) {
          try { if (worker?.terminate) worker.terminate(); } catch {}
        }
        pThread.unusedWorkers = [];
      }
    }
  } catch {
    // Ignore pthread cleanup errors - PThread access may throw
  }

  // CRITICAL: Dispose the WebAssembly.Instance to allow memory GC
  // Per GitHub issue #1396, the Instance holds the Memory reference
  // Releasing the Instance allows the Memory to be garbage collected
  try {
    if (module._wasmInstance) {
      // Clear exports reference which holds functions that reference memory
      if (module._wasmInstance.exports) {
        // Try to null out all exports to break references
        for (const key of Object.keys(module._wasmInstance.exports)) {
          try {
            module._wasmInstance.exports[key] = null;
          } catch {}
        }
      }
      module._wasmInstance = null;
    }
  } catch {
    // Ignore instance cleanup errors
  }

  // Clear HEAP arrays and other references to release ArrayBuffer references
  // These reference the WebAssembly.Memory buffer
  // Note: Emscripten uses getters that can throw if accessed in certain states,
  // so we use Object.defineProperty to safely override them without triggering getters
  const propsToNull = [
    'HEAP8', 'HEAP16', 'HEAP32', 'HEAPU8', 'HEAPU16', 'HEAPU32',
    'HEAPF32', 'HEAPF64', 'HEAP64', 'HEAPU64',
    'wasmMemory', 'buffer', 'FS', 'PThread',
    // Also clear Emscripten's WASM-related references
    'wasmExports', 'wasmTable', 'wasmModule'
  ];

  for (const prop of propsToNull) {
    try {
      Object.defineProperty(module, prop, { value: null, writable: true, configurable: true });
    } catch {
      // Ignore - property may not be configurable
    }
  }

  // Clear all function exports that might hold references to memory
  try {
    const exportKeys = Object.keys(module).filter(k => k.startsWith('_') && typeof module[k] === 'function');
    for (const key of exportKeys) {
      try {
        Object.defineProperty(module, key, { value: null, writable: true, configurable: true });
      } catch {}
    }
  } catch {
    // Ignore
  }
}

/**
 * Add Symbol.dispose support to a module for explicit resource management
 * This enables the `using` syntax: `using module = await createModule()`
 *
 * @param {Object} module - The Emscripten module to make disposable
 * @returns {Object} - The same module with Symbol.dispose added
 */
function makeDisposable(module) {
  if (!module) return module;

  // Add Symbol.dispose for sync disposal (using syntax)
  if (typeof Symbol !== 'undefined' && Symbol.dispose) {
    module[Symbol.dispose] = () => {
      cleanupModule(module);
      clearSofficeCache();
    };
  }

  // Add Symbol.asyncDispose for async disposal (await using syntax)
  if (typeof Symbol !== 'undefined' && Symbol.asyncDispose) {
    module[Symbol.asyncDispose] = async () => {
      cleanupModule(module);
      clearSofficeCache();
    };
  }

  // Also add a regular dispose method for environments without Symbol support
  module.dispose = () => {
    cleanupModule(module);
    clearSofficeCache();
  };

  return module;
}

/**
 * Clear cached data and prepare for fresh module creation
 *
 * IMPORTANT: Call this after destroying a converter and before creating a new one.
 * This clears:
 * - The cached WASM binary (optional, controlled by clearWasmBinary param)
 * - The cached compiled WebAssembly.Module (optional, same as above)
 * - The soffice.cjs require cache
 * - global.Module reference
 * - Pending creation queue
 *
 * Note: Per GitHub issue #1396, keeping the WebAssembly.Module cached is safe
 * and improves performance. The Module is just compiled code with no memory.
 * Only the Instance (which contains Memory) needs to be disposed.
 *
 * @param {boolean} clearWasmBinary - Whether to clear the cached WASM binary AND
 *                                    compiled Module (default: false)
 *                                    Set to true for complete cleanup, false to keep cached
 */
function clearCache(clearWasmBinary = false) {
  // Only clear WASM binary and compiled Module if explicitly requested
  // Both are immutable and safe to share, so keeping them cached improves performance
  if (clearWasmBinary) {
    cachedWasmBinary = null;
    cachedWasmModule = null;
  }

  clearSofficeCache();

  if (typeof global !== 'undefined' && global.Module) {
    // Clean up the module before clearing
    cleanupModule(global.Module);
    global.Module = undefined;
  }

  // Clear pending queue (shouldn't have any, but just in case)
  pendingCreations.length = 0;
  isCreatingModule = false;
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
  cleanupModule,
  makeDisposable,
  getFileSizes,
  getActiveModuleCount,
  wasmDir,
  isGzipped,
  decompressIfGzipped,
};

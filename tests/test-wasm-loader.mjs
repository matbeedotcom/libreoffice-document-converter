/**
 * Test WASM Loader - wraps createSofficeModule for test compatibility
 * 
 * This provides a wasmLoader-compatible interface using createSofficeModule directly,
 * bypassing loader.cjs for simpler testing.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Worker } from 'worker_threads';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmDir = join(__dirname, '..', 'wasm');

// Make Worker globally available for Emscripten
globalThis.Worker = Worker;

// Import createSofficeModule
const createSofficeModule = (await import(join(wasmDir, 'soffice.mjs'))).default;

/**
 * Create module using createSofficeModule directly
 */
async function createModule(config = {}) {
  const moduleConfig = {
    locateFile: (filename) => join(wasmDir, filename),
    print: config.verbose ? (msg) => console.log('[LO]', msg) : () => {},
    printErr: config.verbose ? (msg) => console.error('[LO ERR]', msg) : () => {},
    ...config,
  };

  // Call progress callback if provided
  if (config.onProgress) {
    config.onProgress('loading', 0, 'Starting WASM load...');
  }

  const module = await createSofficeModule(moduleConfig);

  if (config.onProgress) {
    config.onProgress('loading', 100, 'WASM loaded');
  }

  return module;
}

/**
 * Clear cache (no-op for direct createSofficeModule usage)
 */
function clearCache() {
  // No caching with direct createSofficeModule
}

/**
 * Check if cached (always false for direct usage)
 */
function isCached() {
  return false;
}

export default {
  createModule,
  clearCache,
  isCached,
  wasmDir,
};

export { createModule, clearCache, isCached, wasmDir };


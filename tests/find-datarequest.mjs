/**
 * Try to find DataRequest from Module properties
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmDir = join(__dirname, '..', 'wasm');

const createSofficeModule = (await import(join(wasmDir, 'soffice.mjs'))).default;

async function findDataRequest() {
  console.log('=== Finding DataRequest ===\n');

  const module = await createSofficeModule({
    locateFile: (path) => join(wasmDir, path),
    print: () => {},
    printErr: () => {},
  });

  console.log('Module keys:', Object.keys(module).length);

  // Check for anything that might be DataRequest
  for (const key of Object.keys(module)) {
    const val = module[key];
    if (val && typeof val === 'function' && val.prototype && val.prototype.byteArray !== undefined) {
      console.log(`Found potential DataRequest at module.${key}`);
    }
    if (val && typeof val === 'object' && val.byteArray !== undefined) {
      console.log(`Found byteArray at module.${key}`);
    }
  }

  // Check if FS has references
  if (module.FS) {
    console.log('\nFS exists');
    // Check FS for data references
    if (module.FS.filesystems) {
      console.log('FS.filesystems:', Object.keys(module.FS.filesystems));
    }
  }

  // Check preloadResults
  if (module.preloadResults) {
    console.log('\npreloadResults:', Object.keys(module.preloadResults));
    for (const [key, val] of Object.entries(module.preloadResults)) {
      console.log(`  ${key}:`, val);
    }
  }

  // Check for global pollution
  console.log('\nglobal.Worker exists:', 'Worker' in global);
  console.log('globalThis.moduleLoaded:', globalThis.moduleLoaded);

  // Search for ArrayBuffer references in Module
  console.log('\nSearching for large ArrayBuffers...');
  function searchForArrayBuffers(obj, path = 'module', depth = 0, seen = new WeakSet()) {
    if (depth > 3 || !obj || typeof obj !== 'object') return;
    if (seen.has(obj)) return;
    seen.add(obj);

    for (const key of Object.keys(obj).slice(0, 50)) { // Limit keys to avoid infinite loops
      try {
        const val = obj[key];
        if (val instanceof ArrayBuffer && val.byteLength > 1024 * 1024) {
          console.log(`  ArrayBuffer at ${path}.${key}: ${(val.byteLength / 1024 / 1024).toFixed(2)} MB`);
        } else if (val instanceof Uint8Array && val.byteLength > 1024 * 1024) {
          console.log(`  Uint8Array at ${path}.${key}: ${(val.byteLength / 1024 / 1024).toFixed(2)} MB`);
        } else if (val && typeof val === 'object' && depth < 2) {
          searchForArrayBuffers(val, `${path}.${key}`, depth + 1, seen);
        }
      } catch (e) {
        // Skip getters that throw
      }
    }
  }

  searchForArrayBuffers(module);
}

findDataRequest().catch(console.error);

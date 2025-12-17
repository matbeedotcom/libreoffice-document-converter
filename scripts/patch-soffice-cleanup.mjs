/**
 * Post-processor to patch soffice.mjs with memory cleanup capability
 *
 * This patches the generated Emscripten code to:
 * 1. Expose DataRequest.prototype for cleanup
 * 2. Add a Module._cleanup() function that releases the 80MB data file
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const wasmDir = join(__dirname, '..', 'wasm');
const sofficeFile = join(wasmDir, 'soffice.mjs');

console.log('Reading', sofficeFile);
let content = readFileSync(sofficeFile, 'utf-8');

// Check if already patched
if (content.includes('Module._cleanup')) {
  console.log('Already patched!');
  process.exit(0);
}

// Find DataRequest.prototype definition and add cleanup exposure
// Pattern: DataRequest.prototype={requests:{},
const dataRequestPattern = /DataRequest\.prototype=\{requests:\{\}/;

if (!dataRequestPattern.test(content)) {
  console.error('Could not find DataRequest.prototype pattern');
  process.exit(1);
}

// After DataRequest.prototype is defined, we need to expose it on Module
// Find where Module is returned (at the end of the factory)
// Pattern: return moduleRtn;
const returnPattern = /return moduleRtn;/;

if (!returnPattern.test(content)) {
  console.error('Could not find return moduleRtn pattern');
  process.exit(1);
}

// Add cleanup function before return
const cleanupCode = `
// PATCHED: Expose wasmMemory directly (getter throws in some states)
Module._wasmMemory = wasmMemory;

// PATCHED: Memory cleanup function
Module._cleanup = function() {
  // First terminate worker threads before clearing memory references
  if (typeof terminateAllThreads === 'function') {
    try { terminateAllThreads(); } catch(e) {}
  }

  // Clear DataRequest prototype (releases ~80MB data file)
  if (typeof DataRequest !== 'undefined' && DataRequest.prototype) {
    DataRequest.prototype.byteArray = null;
    DataRequest.prototype.requests = {};
  }

  // Clear preloadResults which holds the package name reference
  if (Module.preloadResults) {
    for (var k in Module.preloadResults) { delete Module.preloadResults[k]; }
  }

  // Note: We can't null out HEAP views or wasmMemory because worker threads may still reference them
  // The important thing is clearing DataRequest.prototype.byteArray which holds the 80MB data file
};
`;

content = content.replace(returnPattern, cleanupCode + '\nreturn moduleRtn;');

// Write back
const outputFile = join(wasmDir, 'soffice-patched.mjs');
writeFileSync(outputFile, content);
console.log('Wrote patched file to', outputFile);
console.log('\nTo test:');
console.log('  import createSofficeModule from "./wasm/soffice-patched.mjs";');
console.log('  const module = await createSofficeModule({...});');
console.log('  // ... use module ...');
console.log('  module._cleanup(); // Release internal references');
console.log('  module = null; // Allow GC');

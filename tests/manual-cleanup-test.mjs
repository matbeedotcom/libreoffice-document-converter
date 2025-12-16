/**
 * Test using patched soffice.mjs with _cleanup() function
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmDir = join(__dirname, '..', 'wasm');

// Use patched version with _cleanup()
const createSofficeModule = (await import(join(wasmDir, 'soffice-patched.mjs'))).default;

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemory() {
  if (global.gc) global.gc();
  const mem = process.memoryUsage();
  return {
    heapUsed: mem.heapUsed,
    rss: mem.rss,
    external: mem.external,
    arrayBuffers: mem.arrayBuffers
  };
}

function printMemory(label) {
  const mem = getMemory();
  console.log(`[${label}] ArrayBuffers: ${formatMB(mem.arrayBuffers)}, External: ${formatMB(mem.external)}, RSS: ${formatMB(mem.rss)}`);
  return mem;
}

async function testPatchedCleanup() {
  console.log('=== Patched Module _cleanup() Memory Test ===\n');

  const initialMem = printMemory('Initial');

  console.log('\n--- Creating module instance ---');
  let module1 = await createSofficeModule({
    locateFile: (path) => join(wasmDir, path),
    print: () => {},
    printErr: () => {},
  });

  printMemory('After creating module');

  console.log('\n--- Calling module._cleanup() ---');
  if (typeof module1._cleanup === 'function') {
    module1._cleanup();
    console.log('  _cleanup() called successfully');
  } else {
    console.log('  ERROR: _cleanup() not found - patch may have failed');
  }

  console.log('\n--- Releasing module reference ---');
  module1 = null;

  // Force multiple GC cycles
  for (let i = 0; i < 10; i++) {
    if (global.gc) global.gc();
    await new Promise(r => setTimeout(r, 200));
  }

  const afterCleanup = printMemory('After release + GC');

  const freedMB = (afterCleanup.arrayBuffers - initialMem.arrayBuffers) / 1024 / 1024;
  console.log(`\nNet ArrayBuffer change: ${freedMB.toFixed(2)} MB`);

  if (freedMB < 50) {
    console.log('✅ SUCCESS: Memory was cleaned up!');
  } else {
    console.log('❌ FAILURE: Memory still held');
  }
}

testPatchedCleanup().catch(console.error);

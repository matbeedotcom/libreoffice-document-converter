/**
 * Test if ES6 modularized WASM allows memory to be garbage collected
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmDir = join(__dirname, '..', 'wasm');

// Dynamic import the ES6 module
const createSofficeModule = (await import(join(wasmDir, 'soffice.mjs'))).default;

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemory() {
  if (global.gc) global.gc();
  const mem = process.memoryUsage();
  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    rss: mem.rss,
    external: mem.external,
    arrayBuffers: mem.arrayBuffers
  };
}

function printMemory(label) {
  const mem = getMemory();
  console.log(`[${label}]`);
  console.log(`  Heap: ${formatMB(mem.heapUsed)} / ${formatMB(mem.heapTotal)}`);
  console.log(`  RSS: ${formatMB(mem.rss)}`);
  console.log(`  External: ${formatMB(mem.external)}`);
  console.log(`  ArrayBuffers: ${formatMB(mem.arrayBuffers)}`);
  return mem;
}

async function testMemoryCleanup() {
  console.log('=== ES6 Module Memory Cleanup Test ===\n');

  const initialMem = printMemory('Initial');

  console.log('\n--- Creating first module instance ---');
  let module1 = await createSofficeModule({
    locateFile: (path) => join(wasmDir, path),
    print: () => {},
    printErr: () => {},
  });

  const afterCreate1 = printMemory('After creating module 1');

  console.log('\n--- Destroying module 1 reference ---');
  module1 = null;

  // Force multiple GC cycles
  for (let i = 0; i < 5; i++) {
    if (global.gc) global.gc();
    await new Promise(r => setTimeout(r, 100));
  }

  const afterDestroy1 = printMemory('After destroying module 1 + GC');

  const freedMB = (afterCreate1.arrayBuffers - afterDestroy1.arrayBuffers) / 1024 / 1024;
  console.log(`\nArrayBuffers freed: ${freedMB.toFixed(2)} MB`);

  if (freedMB > 50) {
    console.log('✅ SUCCESS: Memory was garbage collected!');
  } else {
    console.log('❌ FAILURE: Memory was NOT garbage collected');
  }

  console.log('\n--- Creating second module instance ---');
  let module2 = await createSofficeModule({
    locateFile: (path) => join(wasmDir, path),
    print: () => {},
    printErr: () => {},
  });

  const afterCreate2 = printMemory('After creating module 2');

  console.log('\n--- Destroying module 2 reference ---');
  module2 = null;

  for (let i = 0; i < 5; i++) {
    if (global.gc) global.gc();
    await new Promise(r => setTimeout(r, 100));
  }

  const afterDestroy2 = printMemory('After destroying module 2 + GC');

  const freedMB2 = (afterCreate2.arrayBuffers - afterDestroy2.arrayBuffers) / 1024 / 1024;
  console.log(`\nArrayBuffers freed: ${freedMB2.toFixed(2)} MB`);

  console.log('\n=== Final Summary ===');
  console.log(`Initial ArrayBuffers: ${formatMB(initialMem.arrayBuffers)}`);
  console.log(`Final ArrayBuffers: ${formatMB(afterDestroy2.arrayBuffers)}`);
  console.log(`Net change: ${formatMB(afterDestroy2.arrayBuffers - initialMem.arrayBuffers)}`);

  if (afterDestroy2.arrayBuffers - initialMem.arrayBuffers < 50 * 1024 * 1024) {
    console.log('\n✅ OVERALL SUCCESS: Memory returned to near-initial levels');
  } else {
    console.log('\n❌ OVERALL FAILURE: Significant memory leak detected');
  }
}

testMemoryCleanup().catch(console.error);

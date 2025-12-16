/**
 * Test reusing the same WebAssembly.Memory across module instances
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmDir = join(__dirname, '..', 'wasm');

// Use patched version with _wasmMemory exposed
const createSofficeModule = (await import(join(wasmDir, 'soffice-patched.mjs'))).default;

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemory() {
  if (global.gc) global.gc();
  const mem = process.memoryUsage();
  return {
    arrayBuffers: mem.arrayBuffers,
    rss: mem.rss
  };
}

function printMemory(label) {
  const mem = getMemory();
  console.log(`[${label}] ArrayBuffers: ${formatMB(mem.arrayBuffers)}, RSS: ${formatMB(mem.rss)}`);
  return mem;
}

async function testMemoryReuse() {
  console.log('=== WebAssembly.Memory Reuse Test ===\n');

  printMemory('Initial');

  // Create first module to get a wasmMemory reference
  console.log('\n--- Creating first module (to get wasmMemory) ---');
  let module1 = await createSofficeModule({
    locateFile: (path) => join(wasmDir, path),
    print: () => {},
    printErr: () => {},
  });

  const afterFirst = printMemory('After first module');

  // Capture the wasmMemory using patched _wasmMemory (getter throws)
  let sharedMemory = module1._wasmMemory;
  console.log(`Captured _wasmMemory: ${sharedMemory ? 'yes' : 'no'}`);
  if (sharedMemory) {
    console.log(`  Buffer size: ${formatMB(sharedMemory.buffer.byteLength)}`);
    console.log(`  Is SharedArrayBuffer: ${sharedMemory.buffer instanceof SharedArrayBuffer}`);
  }

  // Terminate threads and release first module
  console.log('\n--- Terminating first module threads ---');
  if (typeof module1.terminateAllThreads === 'function') {
    module1.terminateAllThreads();
    console.log('  terminateAllThreads() called');
  }
  module1 = null;

  // Wait for threads to terminate
  await new Promise(r => setTimeout(r, 1000));
  printMemory('After releasing first module');

  if (!sharedMemory) {
    console.log('\n❌ Cannot test memory reuse - wasmMemory not captured');
    return;
  }

  // Try to create second module with same wasmMemory
  console.log('\n--- Creating second module with same wasmMemory ---');
  try {
    let module2 = await createSofficeModule({
      locateFile: (path) => join(wasmDir, path),
      print: () => {},
      printErr: () => {},
      wasmMemory: sharedMemory, // Pass the existing memory
    });

    const afterSecond = printMemory('After second module');

    const memoryGrowth = (afterSecond.arrayBuffers - afterFirst.arrayBuffers) / 1024 / 1024;
    console.log(`\nMemory growth: ${memoryGrowth.toFixed(2)} MB`);

    if (memoryGrowth < 50) {
      console.log('✅ SUCCESS: Memory was reused!');
    } else {
      console.log('❌ FAILURE: New memory was allocated');
    }

    module2 = null;
  } catch (e) {
    console.log('❌ Failed to create second module:', e.message);
  }

  // Wait and check final state
  await new Promise(r => setTimeout(r, 500));
  printMemory('Final');
}

testMemoryReuse().catch(console.error);

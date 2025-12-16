/**
 * Test providing our own WebAssembly.Memory to the WASM module
 *
 * This tests whether we can:
 * 1. Provide a pre-allocated WebAssembly.Memory
 * 2. Reuse it across module instances
 *
 * Run with: node --expose-gc tests/shared-memory-test.cjs
 */

'use strict';

const { LibreOfficeConverter } = require('../dist/index.cjs');
const isolatedLoader = require('../wasm/loader-isolated.cjs');

const INIT_TIMEOUT = 120000;

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemoryUsage() {
  if (global.gc) global.gc();
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    external: usage.external,
    rss: usage.rss,
  };
}

function printMemory(label, mem) {
  console.log(`[${label}] Heap: ${formatBytes(mem.heapUsed)}, External: ${formatBytes(mem.external)}, RSS: ${formatBytes(mem.rss)}`);
}

async function initializeWithTimeout(converter, timeoutMs, label) {
  return Promise.race([
    converter.initialize(),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label}: Timeout`)), timeoutMs))
  ]);
}

async function runTest() {
  console.log('========================================');
  console.log('  Shared WebAssembly.Memory Test');
  console.log('========================================\n');

  const initialMemory = getMemoryUsage();
  printMemory('Initial', initialMemory);

  // Create a shared WebAssembly.Memory
  // 1GB initial = 1073741824 bytes = 16384 pages (64KB each)
  // max 65536 pages = 4GB
  console.log('\nCreating shared WebAssembly.Memory (1GB initial, 4GB max)...');
  const sharedMemory = new WebAssembly.Memory({
    initial: 16384,      // 1GB in 64KB pages
    maximum: 65536,      // 4GB max
    shared: true         // Required for pthreads
  });
  console.log(`Created memory with ${sharedMemory.buffer.byteLength / 1024 / 1024}MB buffer`);

  const afterMemoryCreate = getMemoryUsage();
  printMemory('After Memory create', afterMemoryCreate);

  // Test 1: Can we provide wasmMemory to the module?
  console.log('\n--- Test 1: Providing wasmMemory to module ---');

  // Create a custom loader config that includes wasmMemory
  const customLoader = {
    ...isolatedLoader,
    createModule: async (config) => {
      return isolatedLoader.createModule({
        ...config,
        wasmMemory: sharedMemory,  // Provide our memory
      });
    }
  };

  const converter1 = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: customLoader,
  });

  console.log('Initializing converter with shared memory...');
  try {
    await initializeWithTimeout(converter1, INIT_TIMEOUT, 'Converter 1');
    console.log('SUCCESS: Converter initialized with provided wasmMemory!');

    const afterInit = getMemoryUsage();
    printMemory('After init', afterInit);

    // Check if the module is using our memory
    const module = converter1.getModule();
    if (module && module.wasmMemory === sharedMemory) {
      console.log('VERIFIED: Module is using our shared memory!');
    } else {
      console.log('NOTE: Module may have created its own memory');
    }

    // Do a conversion
    console.log('\nConverting test document...');
    const testDoc = new TextEncoder().encode('Test document with shared memory');
    const result = await converter1.convert(testDoc, { outputFormat: 'pdf' }, 'test.txt');
    console.log(`Converted to PDF: ${result.data.length} bytes`);

    const afterConvert = getMemoryUsage();
    printMemory('After convert', afterConvert);

    // Destroy
    console.log('\nDestroying converter...');
    await converter1.destroy();
    isolatedLoader.clearCache(true);

    if (global.gc) {
      global.gc();
      await new Promise(r => setTimeout(r, 500));
      global.gc();
    }

    const afterDestroy = getMemoryUsage();
    printMemory('After destroy', afterDestroy);

    // Test 2: Can we reuse the same memory for a new converter?
    console.log('\n--- Test 2: Reusing memory for second converter ---');
    console.log('NOTE: This will likely fail because LibreOffice state is corrupted');

    // Zero out the memory to "reset" it
    console.log('Zeroing memory buffer...');
    const view = new Uint8Array(sharedMemory.buffer);
    view.fill(0);

    const converter2 = new LibreOfficeConverter({
      wasmPath: './wasm',
      verbose: false,
      wasmLoader: customLoader,
    });

    console.log('Initializing second converter with same memory...');
    await initializeWithTimeout(converter2, INIT_TIMEOUT, 'Converter 2');
    console.log('SUCCESS: Second converter initialized!');

    await converter2.destroy();

  } catch (err) {
    console.log('Error:', err.message);
  }

  // Final memory check
  console.log('\n========================================');
  console.log('  Final Results');
  console.log('========================================\n');

  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 1000));
    global.gc();
  }

  const finalMemory = getMemoryUsage();
  printMemory('Final', finalMemory);

  const externalGrowth = finalMemory.external - initialMemory.external;
  console.log(`\nExternal memory growth: ${formatBytes(externalGrowth)}`);

  console.log('\nKey insight: If external growth is ~236MB (1 instance) instead of ~472MB (2 instances),');
  console.log('then sharing memory works and prevents additional allocations.');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

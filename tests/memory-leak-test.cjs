/**
 * Memory leak test for loader-isolated.cjs
 *
 * This test creates and destroys converters repeatedly to identify memory leaks.
 * Run with: node --expose-gc tests/memory-leak-test.cjs
 */

'use strict';

const { LibreOfficeConverter } = require('../dist/index.cjs');
const isolatedLoader = require('../wasm/loader-isolated.cjs');

const ITERATIONS = 5;
const INIT_TIMEOUT = 120000;

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemoryUsage() {
  if (global.gc) {
    global.gc(); // Force GC if available
  }
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
    arrayBuffers: usage.arrayBuffers,
  };
}

function printMemory(label, mem) {
  console.log(`[${label}] Heap: ${formatBytes(mem.heapUsed)} / ${formatBytes(mem.heapTotal)}, External: ${formatBytes(mem.external)}, ArrayBuffers: ${formatBytes(mem.arrayBuffers)}, RSS: ${formatBytes(mem.rss)}`);
}

async function initializeWithTimeout(converter, timeoutMs, label) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${label}: Timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([converter.initialize(), timeoutPromise]);
}

async function runTest() {
  console.log('========================================');
  console.log('  Memory Leak Test for loader-isolated');
  console.log('  (with Symbol.dispose support)');
  console.log('========================================\n');

  if (!global.gc) {
    console.log('WARNING: Run with --expose-gc for accurate results\n');
  }

  const initialMemory = getMemoryUsage();
  printMemory('Initial', initialMemory);
  console.log(`Active module count: ${isolatedLoader.getActiveModuleCount()}\n`);

  const memoryHistory = [initialMemory.heapUsed];
  const externalHistory = [initialMemory.external];

  for (let i = 0; i < ITERATIONS; i++) {
    console.log(`\n--- Iteration ${i + 1}/${ITERATIONS} ---`);

    // Create converter
    console.log('Creating converter...');
    const converter = new LibreOfficeConverter({
      wasmPath: './wasm',
      verbose: false,
      wasmLoader: isolatedLoader,
    });

    // Initialize
    console.log('Initializing...');
    const startInit = Date.now();
    await initializeWithTimeout(converter, INIT_TIMEOUT, `Iteration ${i + 1}`);
    console.log(`Initialized in ${Date.now() - startInit}ms`);

    const afterInit = getMemoryUsage();
    printMemory('After init', afterInit);
    console.log(`Active module count: ${isolatedLoader.getActiveModuleCount()}`);

    // Do a conversion to ensure module is fully utilized
    console.log('Converting test document...');
    const testDoc = new TextEncoder().encode(`Test document ${i + 1}`);
    await converter.convert(testDoc, { outputFormat: 'pdf' }, 'test.txt');

    const afterConvert = getMemoryUsage();
    printMemory('After convert', afterConvert);

    // Destroy using the new dispose pattern
    console.log('Destroying converter (using dispose)...');

    // Get module and use dispose if available
    const module = converter.getModule();
    if (module && module.dispose) {
      console.log('  Using module.dispose() for aggressive cleanup');
      module.dispose();
    }

    await converter.destroy();

    // Clear cache with WASM binary clearing for max cleanup
    isolatedLoader.clearCache(true); // true = also clear WASM binary

    // Force GC multiple times and wait
    if (global.gc) {
      global.gc();
      await new Promise(resolve => setTimeout(resolve, 200));
      global.gc();
      await new Promise(resolve => setTimeout(resolve, 200));
      global.gc();
    }

    const afterDestroy = getMemoryUsage();
    printMemory('After destroy', afterDestroy);
    console.log(`Active module count: ${isolatedLoader.getActiveModuleCount()}`);

    memoryHistory.push(afterDestroy.heapUsed);
    externalHistory.push(afterDestroy.external);
  }

  // Final memory check
  console.log('\n========================================');
  console.log('  Results');
  console.log('========================================\n');

  if (global.gc) {
    global.gc();
    await new Promise(resolve => setTimeout(resolve, 1000));
    global.gc();
  }

  const finalMemory = getMemoryUsage();
  printMemory('Final', finalMemory);
  console.log(`Active module count: ${isolatedLoader.getActiveModuleCount()}`);

  // Calculate memory growth
  const heapGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
  const externalGrowth = finalMemory.external - initialMemory.external;
  console.log(`\nHeap growth: ${formatBytes(heapGrowth)}`);
  console.log(`External memory growth: ${formatBytes(externalGrowth)}`);

  // Check for linear growth pattern (memory leak indicator)
  console.log('\nHeap trend per iteration:');
  for (let i = 1; i < memoryHistory.length; i++) {
    const delta = memoryHistory[i] - memoryHistory[i - 1];
    console.log(`  Iteration ${i}: ${delta > 0 ? '+' : ''}${formatBytes(delta)}`);
  }

  console.log('\nExternal memory trend per iteration:');
  for (let i = 1; i < externalHistory.length; i++) {
    const delta = externalHistory[i] - externalHistory[i - 1];
    console.log(`  Iteration ${i}: ${delta > 0 ? '+' : ''}${formatBytes(delta)}`);
  }

  // Linear regression to detect leak pattern
  const avgHeapGrowth = heapGrowth / ITERATIONS;
  const avgExternalGrowth = externalGrowth / ITERATIONS;
  console.log(`\nAverage heap growth per iteration: ${formatBytes(avgHeapGrowth)}`);
  console.log(`Average external growth per iteration: ${formatBytes(avgExternalGrowth)}`);

  const totalAvgGrowth = avgHeapGrowth + avgExternalGrowth;

  if (totalAvgGrowth > 10 * 1024 * 1024) { // More than 10MB per iteration
    console.log('\nWARNING: Significant memory leak detected!');
    process.exit(1);
  } else if (totalAvgGrowth > 1 * 1024 * 1024) { // More than 1MB per iteration
    console.log('\nWARNING: Possible memory leak (moderate growth)');
    process.exit(1);
  } else {
    console.log('\nMemory appears stable.');
    process.exit(0);
  }
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

/**
 * Test script to verify destroy() and reinitialize works in the same process.
 * This test runs in a single Node.js process to simulate real-world usage
 * where multiple converters are created/destroyed over time.
 *
 * Run with: node tests/reinit-test.cjs
 */

'use strict';

// Load the converter and loader
const { LibreOfficeConverter } = require('../dist/index.cjs');
const wasmLoader = require('../wasm/loader.cjs');

const INIT_TIMEOUT = 5000; // 5 second timeout for reinitialization

async function initializeWithTimeout(converter, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Initialization timed out after ${timeoutMs}ms - likely hung on PThread reuse`)), timeoutMs);
  });
  return Promise.race([converter.initialize(), timeoutPromise]);
}

async function runTest() {
  console.log('=== Destroy and Reinitialize Test ===\n');

  // First converter
  console.log('1. Creating first converter...');
  const converter1 = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader,
  });

  console.log('2. Initializing first converter (cold start, may take a while)...');
  const start1 = Date.now();
  await converter1.initialize();
  console.log(`   Initialized in ${Date.now() - start1}ms`);

  if (!converter1.isReady()) {
    throw new Error('First converter failed to initialize');
  }

  // Do a conversion
  console.log('3. Converting with first converter...');
  const textContent = new TextEncoder().encode('Test document from first converter');
  const result1 = await converter1.convert(
    textContent,
    { outputFormat: 'pdf' },
    'test1.txt'
  );
  console.log(`   Converted: ${result1.data.length} bytes`);

  // Destroy first converter
  console.log('4. Destroying first converter...');
  await converter1.destroy();

  if (converter1.isReady()) {
    throw new Error('First converter should not be ready after destroy');
  }
  console.log('   Destroyed successfully');

  // Second converter - this is where it would hang without the fix
  console.log('\n5. Creating second converter...');
  const converter2 = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader,
  });

  console.log(`6. Initializing second converter (with ${INIT_TIMEOUT}ms timeout)...`);
  console.log('   If this hangs, destroy() did not clean up properly.');
  const start2 = Date.now();

  try {
    await initializeWithTimeout(converter2, INIT_TIMEOUT);
    console.log(`   Initialized in ${Date.now() - start2}ms`);
  } catch (err) {
    console.error('\n❌ FAILED: Second initialization timed out!');
    console.error('   This means destroy() did not properly clean up the WASM state.');
    console.error('   Error:', err.message);
    process.exit(1);
  }

  if (!converter2.isReady()) {
    console.error('\n❌ FAILED: Second converter is not ready');
    process.exit(1);
  }

  // Do a conversion with second converter
  console.log('7. Converting with second converter...');
  const textContent2 = new TextEncoder().encode('Test document from second converter');
  const result2 = await converter2.convert(
    textContent2,
    { outputFormat: 'pdf' },
    'test2.txt'
  );
  console.log(`   Converted: ${result2.data.length} bytes`);

  // Cleanup
  console.log('8. Destroying second converter...');
  await converter2.destroy();
  console.log('   Destroyed successfully');

  console.log('\n✅ SUCCESS: Destroy and reinitialize works correctly!');
  console.log('   The PThread state was properly cleaned up between instances.');

  process.exit(0);
}

runTest().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});

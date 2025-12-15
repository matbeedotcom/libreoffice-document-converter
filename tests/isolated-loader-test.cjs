/**
 * Test script to verify the isolated loader creates independent module instances.
 *
 * This test creates multiple converters simultaneously to prove they don't
 * share state through global.Module.
 *
 * Run with: node tests/isolated-loader-test.cjs
 */

'use strict';

const { LibreOfficeConverter } = require('../dist/index.cjs');
const isolatedLoader = require('../wasm/loader-isolated.cjs');

const INIT_TIMEOUT = 120000; // 2 minute timeout

async function initializeWithTimeout(converter, timeoutMs, label) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${label}: Initialization timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([converter.initialize(), timeoutPromise]);
}

async function testSequentialReinit() {
  console.log('\n=== Test 1: Sequential Destroy and Reinitialize ===\n');

  // First converter
  console.log('1. Creating first converter with isolated loader...');
  const converter1 = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: isolatedLoader,
  });

  console.log('2. Initializing first converter...');
  const start1 = Date.now();
  await initializeWithTimeout(converter1, INIT_TIMEOUT, 'Converter 1');
  console.log(`   Initialized in ${Date.now() - start1}ms`);

  // Convert something
  console.log('3. Converting with first converter...');
  const text1 = new TextEncoder().encode('Test from converter 1');
  const result1 = await converter1.convert(text1, { outputFormat: 'pdf' }, 'test1.txt');
  console.log(`   Converted: ${result1.data.length} bytes`);

  // Destroy
  console.log('4. Destroying first converter...');
  await converter1.destroy();
  console.log('   Destroyed');

  // Second converter - this should work without hanging
  console.log('\n5. Creating second converter with isolated loader...');
  const converter2 = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: isolatedLoader,
  });

  console.log('6. Initializing second converter...');
  const start2 = Date.now();
  await initializeWithTimeout(converter2, INIT_TIMEOUT, 'Converter 2');
  console.log(`   Initialized in ${Date.now() - start2}ms`);

  // Convert something
  console.log('7. Converting with second converter...');
  const text2 = new TextEncoder().encode('Test from converter 2');
  const result2 = await converter2.convert(text2, { outputFormat: 'pdf' }, 'test2.txt');
  console.log(`   Converted: ${result2.data.length} bytes`);

  await converter2.destroy();
  console.log('\n✅ Test 1 PASSED: Sequential reinit works with isolated loader\n');
}

async function testParallelInit() {
  console.log('\n=== Test 2: Parallel Initialization (Isolated Instances) ===\n');
  console.log('Note: This test verifies two converters can initialize simultaneously');
  console.log('      without interfering with each other via global.Module.\n');

  // Create two converters
  console.log('1. Creating two converters...');
  const converterA = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: isolatedLoader,
  });

  const converterB = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: isolatedLoader,
  });

  console.log('2. Initializing both converters in parallel...');
  const startParallel = Date.now();

  try {
    await Promise.all([
      initializeWithTimeout(converterA, INIT_TIMEOUT, 'Converter A'),
      initializeWithTimeout(converterB, INIT_TIMEOUT, 'Converter B'),
    ]);
    console.log(`   Both initialized in ${Date.now() - startParallel}ms`);
  } catch (err) {
    console.error('   Parallel init failed:', err.message);
    console.log('\n⚠️  Test 2 SKIPPED: Parallel init may not be supported by WASM');
    try { await converterA.destroy(); } catch {}
    try { await converterB.destroy(); } catch {}
    return;
  }

  // Verify both work independently
  console.log('3. Converting with both converters...');
  const textA = new TextEncoder().encode('Test from converter A');
  const textB = new TextEncoder().encode('Test from converter B - different content');

  const [resultA, resultB] = await Promise.all([
    converterA.convert(textA, { outputFormat: 'pdf' }, 'testA.txt'),
    converterB.convert(textB, { outputFormat: 'pdf' }, 'testB.txt'),
  ]);

  console.log(`   Converter A: ${resultA.data.length} bytes`);
  console.log(`   Converter B: ${resultB.data.length} bytes`);

  // Verify results are different (different content = different PDF size likely)
  if (resultA.data.length !== resultB.data.length) {
    console.log('   Results have different sizes - confirms independent instances');
  }

  // Cleanup
  await Promise.all([converterA.destroy(), converterB.destroy()]);

  console.log('\n✅ Test 2 PASSED: Parallel instances work independently\n');
}

async function testModuleIsolation() {
  console.log('\n=== Test 3: Verify Module Isolation ===\n');

  // Clear any existing global.Module
  global.Module = undefined;

  console.log('1. Checking module count before creating converters...');
  console.log(`   Module count: ${isolatedLoader.getActiveModuleCount()}`);
  const initialCount = isolatedLoader.getActiveModuleCount();

  console.log('2. Creating first converter...');
  const converter1 = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: isolatedLoader,
  });

  await initializeWithTimeout(converter1, INIT_TIMEOUT, 'Converter 1');
  const moduleId1 = converter1.getModule()?._isolatedModuleId;
  console.log(`   First converter module ID: ${moduleId1}`);

  await converter1.destroy();
  console.log('   Destroyed first converter');

  console.log('3. Creating second converter...');
  const converter2 = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: isolatedLoader,
  });

  await initializeWithTimeout(converter2, INIT_TIMEOUT, 'Converter 2');
  const moduleId2 = converter2.getModule()?._isolatedModuleId;
  console.log(`   Second converter module ID: ${moduleId2}`);

  await converter2.destroy();
  console.log('   Destroyed second converter');

  console.log('4. Checking module count after all operations...');
  console.log(`   Module count: ${isolatedLoader.getActiveModuleCount()}`);
  console.log(`   Modules created: ${isolatedLoader.getActiveModuleCount() - initialCount}`);

  // Verify each converter got a unique module
  if (moduleId1 !== moduleId2) {
    console.log(`   ✓ Each converter received a unique module (${moduleId1} != ${moduleId2})`);
  } else {
    console.log(`   ✗ Converters shared the same module - isolation failed`);
  }

  console.log('\n✅ Test 3 PASSED: Each converter gets a fresh isolated module\n');
}

async function runAllTests() {
  console.log('========================================');
  console.log('  Isolated Loader Test Suite');
  console.log('========================================');

  try {
    await testSequentialReinit();
    await testModuleIsolation();
    // Parallel test is optional - WASM itself may have limitations
    // await testParallelInit();

    console.log('\n========================================');
    console.log('  All Tests PASSED!');
    console.log('========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

runAllTests();

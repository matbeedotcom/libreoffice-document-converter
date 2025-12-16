/**
 * Test the abort API functionality
 * 
 * Tests:
 * 1. Check API methods exist on LibreOfficeConverter class
 * 2. Check API methods work before initialization
 * 3. Check error codes exist
 * 4. Check OPERATION_STATE constants exist
 * 5. Direct WASM module test using createSofficeModule
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the converter types
const { LibreOfficeConverter, ConversionErrorCode, OPERATION_STATE } = await import(join(__dirname, '..', 'dist', 'server.js'));

// Import createSofficeModule directly
const wasmDir = join(__dirname, '..', 'wasm');
const createSofficeModule = (await import(join(wasmDir, 'soffice.mjs'))).default;

console.log('=== Abort API Test ===\n');

// Test 1: Check that API methods exist on the class
function testAPIMethodsExist() {
  console.log('--- Test 1: API Methods Exist ---');
  
  const converter = new LibreOfficeConverter({
    wasmPath: wasmDir,
  });
  
  // Check methods exist
  const methodsToCheck = [
    'abortOperation',
    'setOperationTimeout', 
    'getOperationState',
    'resetAbort',
    'hasAbortSupport',
  ];
  
  let allMethodsExist = true;
  for (const method of methodsToCheck) {
    const exists = typeof converter[method] === 'function';
    console.log(`  ${method}(): ${exists ? '✅ exists' : '❌ missing'}`);
    if (!exists) allMethodsExist = false;
  }
  
  if (allMethodsExist) {
    console.log('  ✅ All abort API methods exist on LibreOfficeConverter');
  } else {
    console.log('  ❌ Some methods are missing');
  }
  
  return allMethodsExist;
}

// Test 2: Check methods work before initialization (should not throw)
function testMethodsBeforeInit() {
  console.log('\n--- Test 2: Methods Work Before Initialization ---');
  
  const converter = new LibreOfficeConverter({
    wasmPath: wasmDir,
  });
  
  try {
    // These should not throw, just return gracefully
    converter.abortOperation();
    console.log('  abortOperation(): ✅ no error');
    
    converter.setOperationTimeout(5000);
    console.log('  setOperationTimeout(5000): ✅ no error');
    
    const state = converter.getOperationState();
    console.log(`  getOperationState(): ✅ returned "${state}"`);
    
    converter.resetAbort();
    console.log('  resetAbort(): ✅ no error');
    
    const hasSupport = converter.hasAbortSupport();
    console.log(`  hasAbortSupport(): ✅ returned ${hasSupport}`);
    
    return true;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 3: Check new error codes exist
function testErrorCodesExist() {
  console.log('\n--- Test 3: New Error Codes Exist ---');
  
  const codes = [
    ['OPERATION_ABORTED', ConversionErrorCode.OPERATION_ABORTED],
    ['OPERATION_TIMED_OUT', ConversionErrorCode.OPERATION_TIMED_OUT],
  ];
  
  let allExist = true;
  for (const [name, code] of codes) {
    const exists = code !== undefined;
    console.log(`  ConversionErrorCode.${name}: ${exists ? `✅ "${code}"` : '❌ missing'}`);
    if (!exists) allExist = false;
  }
  
  return allExist;
}

// Test 4: Check OPERATION_STATE constants exist
function testOperationStateConstants() {
  console.log('\n--- Test 4: OPERATION_STATE Constants Exist ---');
  
  const states = ['NONE', 'IDLE', 'RUNNING', 'ABORTED', 'TIMED_OUT', 'COMPLETED', 'ERROR', 'UNKNOWN'];
  
  let allExist = true;
  for (const state of states) {
    const value = OPERATION_STATE?.[state];
    const exists = value !== undefined;
    console.log(`  OPERATION_STATE.${state}: ${exists ? `✅ "${value}"` : '❌ missing'}`);
    if (!exists) allExist = false;
  }
  
  return allExist;
}

// Test 5: Direct WASM module test using createSofficeModule
async function testWithWASM() {
  console.log('\n--- Test 5: Direct WASM Module Test (createSofficeModule) ---');
  
  // Check if WASM files exist
  const wasmFile = join(wasmDir, 'soffice.wasm');
  
  if (!existsSync(wasmFile)) {
    console.log('  ⚠️  Skipping - soffice.wasm not found');
    console.log('     Run "npm run build:wasm" to build WASM files');
    return 'skipped';
  }
  
  try {
    console.log('  Loading WASM module with createSofficeModule...');
    const Module = await createSofficeModule({
      locateFile: (p) => join(wasmDir, p),
      print: () => {},
      printErr: () => {},
    });
    console.log('  ✅ Module loaded');
    
    // Check abort functions exist on Module
    const funcs = [
      '_lok_abortOperation',
      '_lok_setOperationTimeout',
      '_lok_getOperationState',
      '_lok_resetAbort'
    ];
    
    let allExist = true;
    console.log('\n  Checking abort functions on Module:');
    for (const fn of funcs) {
      const exists = typeof Module[fn] === 'function';
      console.log(`    ${fn}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
      if (!exists) allExist = false;
    }
    
    if (!allExist) {
      console.log('\n  ⚠️  Some abort functions missing from WASM module');
      return false;
    }
    
    // Test resetAbort
    console.log('\n  Testing _lok_resetAbort()...');
    Module._lok_resetAbort();
    console.log('    ✅ resetAbort called');
    
    // Test getOperationState
    console.log('  Testing _lok_getOperationState()...');
    const statePtr = Module._lok_getOperationState();
    const state = Module.UTF8ToString(statePtr);
    console.log(`    ✅ State: "${state}"`);
    
    // Test setOperationTimeout
    console.log('  Testing _lok_setOperationTimeout(30000)...');
    Module._lok_setOperationTimeout(30000);
    console.log('    ✅ Timeout set to 30s');
    
    // Test abortOperation
    console.log('  Testing _lok_abortOperation()...');
    Module._lok_abortOperation();
    console.log('    ✅ abortOperation called');
    
    // Check state after abort
    const statePtr2 = Module._lok_getOperationState();
    const state2 = Module.UTF8ToString(statePtr2);
    console.log(`    State after abort: "${state2}"`);
    
    // Verify state changed to aborted
    if (state2 === 'aborted') {
      console.log('\n  ✅ All abort API functions work correctly!');
      return true;
    } else {
      console.log(`\n  ⚠️  Expected state "aborted" but got "${state2}"`);
      return false;
    }
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  let passed = 0;
  let total = 0;
  let wasmSkipped = false;
  
  total++; if (testAPIMethodsExist()) passed++;
  total++; if (testMethodsBeforeInit()) passed++;
  total++; if (testErrorCodesExist()) passed++;
  total++; if (testOperationStateConstants()) passed++;
  
  // WASM test - uses createSofficeModule directly
  const wasmResult = await testWithWASM();
  if (wasmResult === 'skipped') {
    wasmSkipped = true;
    console.log('  (WASM test skipped - WASM files not found)');
  } else {
    total++;
    if (wasmResult) passed++;
  }
  
  console.log('\n=== Test Summary ===');
  console.log(`${passed}/${total} tests passed` + (wasmSkipped ? ' (WASM test skipped)' : ''));
  
  if (passed === total) {
    console.log('✅ All abort API tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runTests();


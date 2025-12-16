/**
 * Direct test with soffice.cjs - no wrapper code
 * Goal: Can we load and unload the WASM module and have memory freed?
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');

const wasmDir = path.join(__dirname, '..', 'wasm');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemory() {
  if (global.gc) global.gc();
  return process.memoryUsage();
}

// Make Worker available globally (Emscripten needs it)
global.Worker = Worker;

async function loadAndUnload() {
  console.log('========================================');
  console.log('  Direct soffice.cjs Memory Test');
  console.log('========================================\n');

  console.log('Initial:', formatBytes(getMemory().external));

  // Clear require cache
  const sofficePathCjs = path.join(wasmDir, 'soffice.cjs');
  delete require.cache[sofficePathCjs];

  // Load WASM binary
  console.log('\nLoading WASM binary...');
  const wasmPath = path.join(wasmDir, 'soffice.wasm');
  const wasmData = fs.readFileSync(wasmPath);
  const wasmBinary = wasmData.buffer.slice(wasmData.byteOffset, wasmData.byteOffset + wasmData.byteLength);
  console.log('WASM binary loaded:', formatBytes(wasmData.length));

  // Create Module config
  console.log('\nCreating Module config...');

  let moduleRef = null;
  let resolveInit;
  const initPromise = new Promise(r => resolveInit = r);

  global.Module = {
    wasmBinary,
    locateFile: (filename) => path.join(wasmDir, filename),
    onRuntimeInitialized: () => {
      console.log('Runtime initialized!');
      moduleRef = global.Module;
      resolveInit();
    },
    print: () => {},
    printErr: () => {},
  };

  // Load soffice.cjs
  console.log('Loading soffice.cjs...');
  process.chdir(wasmDir);
  require(sofficePathCjs);

  // Wait for initialization
  console.log('Waiting for initialization...');
  await initPromise;

  console.log('\nAfter init:', formatBytes(getMemory().external));

  // Now try to clean up
  console.log('\n=== Attempting cleanup ===');

  // 1. Clear global.Module
  console.log('Clearing global.Module...');
  global.Module = undefined;

  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('After clearing global.Module:', formatBytes(getMemory().external));

  // 2. Clear require cache
  console.log('Clearing require cache...');
  delete require.cache[sofficePathCjs];
  Object.keys(require.cache).filter(k => k.includes('soffice')).forEach(k => delete require.cache[k]);

  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('After clearing require cache:', formatBytes(getMemory().external));

  // 3. Clear our moduleRef
  console.log('Clearing moduleRef...');
  moduleRef = null;

  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('After clearing moduleRef:', formatBytes(getMemory().external));

  // Final GC
  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 1000));
    global.gc();
  }

  console.log('\nFinal memory:', formatBytes(getMemory().external));
  console.log('\nIf still ~237MB, the memory is held by closures in soffice.cjs module scope');
}

loadAndUnload().catch(console.error);

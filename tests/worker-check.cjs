/**
 * Check for lingering worker threads holding memory references
 */

'use strict';

const { LibreOfficeConverter } = require('../dist/index.cjs');
const isolatedLoader = require('../wasm/loader-isolated.cjs');
const { Worker } = require('worker_threads');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemory() {
  if (global.gc) global.gc();
  return process.memoryUsage();
}

// Intercept Worker creation to track all workers
const createdWorkers = [];
const originalWorker = global.Worker;

class TrackedWorker extends Worker {
  constructor(...args) {
    super(...args);
    createdWorkers.push(this);
    console.log('[Worker] Created:', args[0]);

    this.on('exit', (code) => {
      console.log('[Worker] Exited with code:', code);
      const idx = createdWorkers.indexOf(this);
      if (idx !== -1) createdWorkers.splice(idx, 1);
    });
  }
}

global.Worker = TrackedWorker;

async function checkWorkers() {
  console.log('========================================');
  console.log('  Worker Thread Memory Test');
  console.log('========================================\n');

  console.log('Initial:', formatBytes(getMemory().external));
  console.log('Workers at start:', createdWorkers.length);

  const converter = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: isolatedLoader,
  });

  await converter.initialize();
  console.log('\nAfter init:', formatBytes(getMemory().external));
  console.log('Workers after init:', createdWorkers.length);

  // Do a conversion
  const testDoc = new TextEncoder().encode('Test document');
  await converter.convert(testDoc, { outputFormat: 'pdf' }, 'test.txt');
  console.log('After convert:', formatBytes(getMemory().external));
  console.log('Workers after convert:', createdWorkers.length);

  // Get the module and check PThread state
  const module = converter.getModule();

  // Check PThread without triggering getter
  console.log('\n=== Checking pthread state ===');

  // Destroy converter
  console.log('\n=== Destroying converter ===');
  await converter.destroy();
  isolatedLoader.clearCache(true);

  console.log('Workers after destroy:', createdWorkers.length);

  // Try to terminate any remaining workers
  console.log('\n=== Terminating remaining workers ===');
  for (const worker of [...createdWorkers]) {
    console.log('Terminating worker...');
    try {
      await worker.terminate();
    } catch (e) {
      console.log('Failed to terminate:', e.message);
    }
  }

  console.log('Workers after termination:', createdWorkers.length);

  // Force GC
  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 1000));
    global.gc();
  }

  console.log('\nFinal memory:', formatBytes(getMemory().external));
}

checkWorkers().catch(console.error);

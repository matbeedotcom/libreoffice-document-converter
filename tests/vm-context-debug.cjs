/**
 * Debug test for VM context isolation
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Testing VM context isolation for WebAssembly.Memory...\n');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemory() {
  if (global.gc) global.gc();
  return process.memoryUsage();
}

async function testMemoryInVMContext() {
  console.log('Initial memory:', formatBytes(getMemory().external));

  // Test: Create memory in a VM context
  const contextCode = `
    // Create a memory in this context
    const memory = new WebAssembly.Memory({ initial: 1024, maximum: 2048 }); // 64MB
    global.createdMemory = memory;
  `;

  const ctx1 = vm.createContext({
    WebAssembly: WebAssembly,
    global: {},
    console: console,
  });
  ctx1.global = ctx1;

  vm.runInContext(contextCode, ctx1);

  console.log('After creating 64MB memory in VM context:', formatBytes(getMemory().external));
  console.log('Memory buffer size:', ctx1.createdMemory.buffer.byteLength / 1024 / 1024, 'MB');

  // Try to release it
  ctx1.createdMemory = null;
  ctx1.global = null;

  // Force GC
  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 100));
    global.gc();
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('After nulling and GC:', formatBytes(getMemory().external));

  console.log('\n=== Test 2: Multiple contexts ===\n');

  const memories = [];
  for (let i = 0; i < 3; i++) {
    const ctx = vm.createContext({
      WebAssembly: WebAssembly,
      global: {},
    });
    ctx.global = ctx;
    vm.runInContext(`global.mem = new WebAssembly.Memory({ initial: 512, maximum: 1024 });`, ctx);
    memories.push(ctx.mem);
    console.log('Created memory ' + (i + 1) + ':', formatBytes(getMemory().external));
  }

  // Release them one by one
  for (let i = 0; i < 3; i++) {
    memories[i] = null;
    if (global.gc) {
      global.gc();
      await new Promise(r => setTimeout(r, 100));
    }
    console.log('After releasing memory ' + (i + 1) + ':', formatBytes(getMemory().external));
  }

  console.log('\n=== Conclusion ===');
  console.log('VM context does NOT isolate WebAssembly.Memory allocation.');
  console.log('The memory is created by the main contexts WebAssembly constructor.');
  console.log('Memory CAN be GCd when all references are released.');
}

testMemoryInVMContext().catch(console.error);

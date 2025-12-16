/**
 * Find what references are keeping the WebAssembly.Memory alive
 */

'use strict';

const { LibreOfficeConverter } = require('../dist/index.cjs');
const isolatedLoader = require('../wasm/loader-isolated.cjs');

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemory() {
  if (global.gc) global.gc();
  return process.memoryUsage();
}

async function findReferences() {
  console.log('========================================');
  console.log('  Finding Memory References');
  console.log('========================================\n');

  console.log('Initial:', formatBytes(getMemory().external));

  // Create and initialize
  const converter = new LibreOfficeConverter({
    wasmPath: './wasm',
    verbose: false,
    wasmLoader: isolatedLoader,
  });

  await converter.initialize();
  console.log('After init:', formatBytes(getMemory().external));

  // Get the module
  const module = converter.getModule();

  console.log('\n=== Searching for memory references ===\n');

  // List all own properties (without triggering getters)
  const ownProps = Object.getOwnPropertyNames(module);
  console.log('Module has', ownProps.length, 'own properties');

  // Check which properties have getters vs values
  const propsWithGetters = [];
  const propsWithValues = [];
  for (const prop of ownProps) {
    const desc = Object.getOwnPropertyDescriptor(module, prop);
    if (desc.get) {
      propsWithGetters.push(prop);
    } else {
      propsWithValues.push(prop);
    }
  }
  console.log('Properties with getters:', propsWithGetters.length);
  console.log('Properties with values:', propsWithValues.length);

  // The _wasmInstance we stored
  console.log('\n_wasmInstance exists:', !!module._wasmInstance);
  if (module._wasmInstance) {
    console.log('_wasmInstance.exports keys:', Object.keys(module._wasmInstance.exports).length);
  }

  // Check for PThread references - avoid getter
  console.log('\n=== PThread references ===');
  const pthreadDesc = Object.getOwnPropertyDescriptor(module, 'PThread');
  console.log('PThread is getter:', !!pthreadDesc?.get);

  // Check global for Module reference
  console.log('\n=== Global references ===');
  console.log('global.Module exists:', !!global.Module);
  console.log('global.Module === module:', global.Module === module);

  // Check require.cache
  console.log('\n=== Require cache ===');
  const sofficeKeys = Object.keys(require.cache).filter(k => k.includes('soffice'));
  console.log('soffice in require.cache:', sofficeKeys.length);

  // Now destroy and check what's still referenced
  console.log('\n=== Destroying converter ===');
  await converter.destroy();

  // Clear cache
  isolatedLoader.clearCache(true);

  // Check what's still holding references
  console.log('\n=== After destroy ===');
  console.log('global.Module exists:', !!global.Module);

  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 500));
    global.gc();
  }

  console.log('After GC:', formatBytes(getMemory().external));

  // The issue: even after destroy, there are still references somewhere
  // Let's check if the module reference we captured is keeping things alive
  console.log('\n=== Module reference we captured ===');
  console.log('Our module ref still exists:', !!module);

  // Check _wasmInstance after cleanup
  console.log('module._wasmInstance after destroy:', module._wasmInstance);

  // List properties that are still non-null after cleanup
  console.log('\n=== Non-null properties after cleanup ===');
  const nonNullProps = [];
  for (const prop of Object.getOwnPropertyNames(module)) {
    const desc = Object.getOwnPropertyDescriptor(module, prop);
    // Only check value properties, not getters
    if (!desc.get) {
      try {
        const val = module[prop];
        if (val !== null && val !== undefined && typeof val !== 'function') {
          nonNullProps.push({ prop, type: typeof val, isArray: Array.isArray(val) });
        }
      } catch (e) {
        // Skip if access throws
      }
    }
  }
  console.log('Non-null non-function properties:', nonNullProps.length);
  console.log('Sample:', nonNullProps.slice(0, 10));

  // Check the getters - these are the likely culprits
  console.log('\n=== Getter properties (potential memory holders) ===');
  const getterProps = [];
  for (const prop of Object.getOwnPropertyNames(module)) {
    const desc = Object.getOwnPropertyDescriptor(module, prop);
    if (desc.get) {
      getterProps.push(prop);
    }
  }
  console.log('Total getters:', getterProps.length);
  console.log('Sample getter names:', getterProps.slice(0, 20));

  // Key getters that hold memory references
  const memoryGetters = getterProps.filter(p =>
    p.includes('HEAP') || p.includes('memory') || p.includes('Memory') ||
    p.includes('buffer') || p.includes('PThread') || p.includes('FS')
  );
  console.log('\nMemory-related getters:', memoryGetters);

  // Try deleting all getters and see if memory is freed
  console.log('\n=== Attempting to delete all getters ===');
  let deletedCount = 0;
  for (const prop of getterProps) {
    try {
      delete module[prop];
      deletedCount++;
    } catch (e) {
      // Can't delete
    }
  }
  console.log('Deleted', deletedCount, 'of', getterProps.length, 'getter properties');

  // Force GC again
  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 500));
    global.gc();
  }
  console.log('After deleting getters + GC:', formatBytes(getMemory().external));

  // The real test: does releasing ALL references to module free memory?
  console.log('\n=== Releasing all module references ===');

  // The problem: soffice.cjs creates module-level variables (wasmMemory, HEAP8, etc.)
  // that are captured in closures. The VM context holds these.
  // Let's try to see if releasing _vmContext helps

  // Release _vmContext
  if (module._vmContext) {
    console.log('Clearing _vmContext...');
    module._vmContext = null;
  }

  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 500));
    global.gc();
  }
  console.log('After clearing _vmContext + GC:', formatBytes(getMemory().external));
}

// Wrap in async IIFE to test if releasing all references frees memory
async function testFullRelease() {
  await findReferences();

  console.log('\n=== After findReferences() function returns ===');
  console.log('(All local variables including "module" should be out of scope)');

  if (global.gc) {
    global.gc();
    await new Promise(r => setTimeout(r, 1000));
    global.gc();
    await new Promise(r => setTimeout(r, 500));
    global.gc();
  }

  const mem = process.memoryUsage();
  console.log('Final external memory:', formatBytes(mem.external));
  console.log('If still ~237MB, then something outside this function holds a reference');
}

testFullRelease().catch(console.error);

/**
 * Memory measurement script for Node.js
 * Run with: npx tsx scripts/measure-memory.ts
 */

import { createWorkerConverter } from '../src/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatBytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

function getMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
    rss: mem.rss,
    arrayBuffers: mem.arrayBuffers,
  };
}

function printMemory(label: string) {
  const mem = getMemoryUsage();
  console.log(`\n${label}:`);
  console.log(`  RSS (total process):     ${formatBytes(mem.rss)}`);
  console.log(`  Heap Used:               ${formatBytes(mem.heapUsed)}`);
  console.log(`  Heap Total:              ${formatBytes(mem.heapTotal)}`);
  console.log(`  External (native/WASM):  ${formatBytes(mem.external)}`);
  console.log(`  ArrayBuffers:            ${formatBytes(mem.arrayBuffers)}`);
  return mem;
}

async function main() {
  console.log('=== LibreOffice WASM Memory Measurement ===\n');

  // Force GC if available
  if (global.gc) {
    global.gc();
  }

  const baseline = printMemory('Baseline (before loading)');

  console.log('\nInitializing converter...');
  const startInit = Date.now();
  const converter = await createWorkerConverter({
    wasmPath: './wasm',
    verbose: false,
  });
  const initTime = Date.now() - startInit;
  console.log(`Initialization took: ${initTime}ms`);

  if (global.gc) global.gc();
  const afterInit = printMemory('After initialization');

  // Calculate WASM memory overhead
  const wasmOverhead = afterInit.rss - baseline.rss;
  console.log(`\n  => WASM memory overhead: ~${formatBytes(wasmOverhead)}`);

  // Try a conversion if test file exists
  const testFile = path.join(__dirname, '../tests/sample_2_page.docx');
  if (fs.existsSync(testFile)) {
    console.log('\nPerforming test conversion...');
    const docx = fs.readFileSync(testFile);

    const startConvert = Date.now();
    await converter.convert(docx, { outputFormat: 'pdf' });
    const convertTime = Date.now() - startConvert;
    console.log(`Conversion took: ${convertTime}ms`);

    if (global.gc) global.gc();
    const afterConvert = printMemory('After conversion');

    // Check for memory growth
    const conversionGrowth = afterConvert.rss - afterInit.rss;
    console.log(`\n  => Memory growth from conversion: ${formatBytes(conversionGrowth)}`);
  }

  // Cleanup
  console.log('\nDestroying converter...');
  await converter.destroy();

  if (global.gc) global.gc();
  await new Promise(r => setTimeout(r, 100)); // Let cleanup settle
  if (global.gc) global.gc();

  const afterDestroy = printMemory('After destroy');

  const memoryRecovered = afterInit.rss - afterDestroy.rss;
  console.log(`\n  => Memory recovered: ${formatBytes(memoryRecovered)}`);

  console.log('\n=== Summary ===');
  console.log(`WASM module size (approx): ${formatBytes(wasmOverhead)}`);
  console.log(`Init time: ${initTime}ms`);

  // Exit explicitly since worker threads keep process alive
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

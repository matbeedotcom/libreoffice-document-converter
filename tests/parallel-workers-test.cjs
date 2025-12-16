/**
 * Test script to demonstrate parallel conversion using WorkerConverters.
 *
 * Each WorkerConverter runs in its own thread with its own WASM module,
 * enabling true parallel execution.
 *
 * Run with: node tests/parallel-workers-test.cjs
 */

'use strict';

const { WorkerConverter } = require('../dist/index.cjs');

const NUM_WORKERS = 3;
const NUM_DOCUMENTS = 6;

async function runTest() {
  console.log('========================================');
  console.log('  Parallel WorkerConverter Test');
  console.log('========================================\n');

  console.log(`Creating ${NUM_WORKERS} worker converters...`);

  // Create multiple workers in parallel
  const startInit = Date.now();
  const workers = await Promise.all(
    Array.from({ length: NUM_WORKERS }, async (_, i) => {
      console.log(`  Starting worker ${i + 1}...`);
      const worker = new WorkerConverter({
        wasmPath: './wasm',
        verbose: false,
      });
      await worker.initialize();
      console.log(`  Worker ${i + 1} ready`);
      return worker;
    })
  );
  console.log(`\nAll workers initialized in ${Date.now() - startInit}ms\n`);

  // Create test documents
  const documents = Array.from({ length: NUM_DOCUMENTS }, (_, i) =>
    new TextEncoder().encode(`Test document ${i + 1} with some content for conversion testing.`)
  );

  console.log(`Converting ${NUM_DOCUMENTS} documents using ${NUM_WORKERS} workers...\n`);

  // Convert documents in parallel, distributing across workers
  const startConvert = Date.now();

  const conversionPromises = documents.map((doc, i) => {
    const workerIndex = i % NUM_WORKERS;
    const worker = workers[workerIndex];

    console.log(`  Document ${i + 1} -> Worker ${workerIndex + 1}`);

    return worker.convert(doc, { outputFormat: 'pdf' }, `doc${i + 1}.txt`)
      .then((result) => ({
        docIndex: i + 1,
        workerIndex: workerIndex + 1,
        size: result.data.length,
        success: true,
      }))
      .catch((err) => ({
        docIndex: i + 1,
        workerIndex: workerIndex + 1,
        error: err.message,
        success: false,
      }));
  });

  const results = await Promise.all(conversionPromises);
  const convertDuration = Date.now() - startConvert;

  console.log('\n--- Results ---');
  for (const result of results) {
    if (result.success) {
      console.log(`  Document ${result.docIndex} (Worker ${result.workerIndex}): ${result.size} bytes`);
    } else {
      console.log(`  Document ${result.docIndex} (Worker ${result.workerIndex}): FAILED - ${result.error}`);
    }
  }

  const successful = results.filter((r) => r.success).length;
  console.log(`\nConverted ${successful}/${NUM_DOCUMENTS} documents in ${convertDuration}ms`);
  console.log(`Average: ${(convertDuration / NUM_DOCUMENTS).toFixed(0)}ms per document`);
  console.log(`Throughput: ${(NUM_DOCUMENTS / (convertDuration / 1000)).toFixed(1)} docs/sec`);

  // Cleanup
  console.log('\nDestroying workers...');
  await Promise.all(workers.map((w) => w.destroy()));

  if (successful === NUM_DOCUMENTS) {
    console.log('\n✅ SUCCESS: All parallel conversions completed!');
    process.exit(0);
  } else {
    console.log('\n❌ FAILED: Some conversions failed');
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

/**
 * Test cases designed to force memory failures in LibreOffice WASM
 * Run with: node tests/force-failure.mjs
 */

import { createConverter } from '../dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test files
const DOCX_SMALL = fs.readFileSync(path.join(__dirname, 'sample_2_page.docx'));
const DOCX_LARGE = fs.readFileSync(path.join(__dirname, 'sample_2_page.docx'));
const ODS_FILE = fs.readFileSync(path.join(__dirname, 'sample_test_4.ods'));

let converter = null;
let testsPassed = 0;
let testsFailed = 0;

async function setup() {
  console.log('Creating converter...');
  converter = await createConverter({ wasmPath: path.join(__dirname, '..', 'wasm') });
  console.log('Converter ready\n');
}

async function teardown() {
  if (converter) {
    await converter.destroy();
  }
}

async function runTest(name, fn) {
  process.stdout.write(`[TEST] ${name}... `);
  try {
    await fn();
    console.log('✓ PASS');
    testsPassed++;
    return true;
  } catch (e) {
    console.log(`✗ FAIL: ${e.message.slice(0, 60)}`);
    testsFailed++;
    return false;
  }
}

// ==================== TEST CASES ====================

async function test_single_docx_to_pdf() {
  await converter.convert(DOCX_SMALL, { outputFormat: 'pdf' });
}

async function test_single_ods_to_pdf() {
  await converter.convert(ODS_FILE, { outputFormat: 'pdf' });
}

async function test_single_ods_to_xlsx() {
  await converter.convert(ODS_FILE, { outputFormat: 'xlsx' });
}

async function test_rapid_sequential_same_file() {
  // Rapid sequential conversions of the same file
  for (let i = 0; i < 5; i++) {
    await converter.convert(DOCX_SMALL, { outputFormat: 'pdf' });
  }
}

async function test_rapid_alternating_formats() {
  // Alternate between different output formats
  for (let i = 0; i < 3; i++) {
    await converter.convert(DOCX_SMALL, { outputFormat: 'pdf' });
    await converter.convert(DOCX_SMALL, { outputFormat: 'odt' });
    await converter.convert(DOCX_SMALL, { outputFormat: 'txt' });
  }
}

async function test_mixed_document_types() {
  // Mix Writer and Calc documents
  for (let i = 0; i < 3; i++) {
    await converter.convert(DOCX_SMALL, { outputFormat: 'pdf' });
    await converter.convert(ODS_FILE, { outputFormat: 'pdf' });
  }
}

async function test_ods_xlsx_loop() {
  // ODS->XLSX seems to be problematic
  for (let i = 0; i < 5; i++) {
    await converter.convert(ODS_FILE, { outputFormat: 'xlsx' });
  }
}

async function test_large_then_small() {
  // Large document followed by small - tests memory shrinking
  await converter.convert(DOCX_LARGE, { outputFormat: 'pdf' });
  await converter.convert(DOCX_SMALL, { outputFormat: 'pdf' });
  await converter.convert(DOCX_LARGE, { outputFormat: 'pdf' });
  await converter.convert(DOCX_SMALL, { outputFormat: 'pdf' });
}

async function test_parallel_start() {
  // Start multiple conversions simultaneously (don't await immediately)
  const promises = [
    converter.convert(DOCX_SMALL, { outputFormat: 'pdf' }),
    converter.convert(ODS_FILE, { outputFormat: 'pdf' }),
  ];
  await Promise.all(promises);
}

async function test_repeated_pdf_exports() {
  // PDF export 10 times in a row
  for (let i = 0; i < 10; i++) {
    await converter.convert(DOCX_SMALL, { outputFormat: 'pdf' });
  }
}

async function test_all_output_formats() {
  // Test all supported output formats
  const formats = ['pdf', 'odt', 'txt', 'docx', 'html'];
  for (const fmt of formats) {
    await converter.convert(DOCX_SMALL, { outputFormat: fmt });
  }
}

async function test_stress_20_conversions() {
  // 20 conversions in sequence
  for (let i = 0; i < 20; i++) {
    await converter.convert(DOCX_SMALL, { outputFormat: 'pdf' });
  }
}

// ==================== MAIN ====================

async function main() {
  console.log('='.repeat(60));
  console.log('LibreOffice WASM Failure Test Suite');
  console.log('='.repeat(60));
  console.log('');

  await setup();

  // Run tests in order - each builds on the previous
  const tests = [
    ['Single DOCX -> PDF', test_single_docx_to_pdf],
    ['Single ODS -> PDF', test_single_ods_to_pdf],
    ['Single ODS -> XLSX', test_single_ods_to_xlsx],
    ['Rapid sequential (same file x5)', test_rapid_sequential_same_file],
    ['Rapid alternating formats', test_rapid_alternating_formats],
    ['Mixed document types', test_mixed_document_types],
    ['ODS -> XLSX loop (x5)', test_ods_xlsx_loop],
    ['Large then small alternating', test_large_then_small],
    ['Parallel start (2 simultaneous)', test_parallel_start],
    ['Repeated PDF exports (x10)', test_repeated_pdf_exports],
    ['All output formats', test_all_output_formats],
    ['Stress: 20 conversions', test_stress_20_conversions],
  ];

  let firstFailure = null;
  
  for (const [name, fn] of tests) {
    const passed = await runTest(name, fn);
    if (!passed && !firstFailure) {
      firstFailure = name;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  if (firstFailure) {
    console.log(`First failure: ${firstFailure}`);
  }

  await teardown();
  process.exit(testsFailed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});





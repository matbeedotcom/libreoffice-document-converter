// test-conversions.mjs

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

// --- Resolve CJS from ESM cleanly ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { createConverter } = await import(path.resolve(__dirname, './dist/index.cjs'));

async function test() {
  const wasmPath = path.resolve(__dirname, './wasm');
  console.log('Using wasmPath:', wasmPath);

  const converter = await createConverter({ wasmPath, verbose: true });
  console.log('\n=== Converter Ready ===\n');

  // Read test files
  const docx = readFileSync(path.resolve(__dirname, 'tests/sample_2_page.docx'));
  const pptx = readFileSync(path.resolve(__dirname, 'tests/sample_test_1.pptx'));
  
  // Check if ODP exists
  let odp = null;
  try {
    odp = readFileSync(path.resolve(__dirname, 'tests/sample.odp'));
    console.log('ODP file loaded:', odp.length, 'bytes');
  } catch (e) {
    console.log('No ODP file found, skipping ODP test');
  }

  // Test 1: DOCX -> PDF
  console.log('\n=== Test 1: DOCX -> PDF ===');
  try {
    const result = await converter.convert(Buffer.from(docx), {
      inputFormat: 'docx',
      outputFormat: 'pdf'
    });
    console.log('✅ DOCX->PDF SUCCESS:', result.data?.length || result.length, 'bytes');
  } catch (e) {
    console.error('❌ DOCX->PDF FAILED:', e.message);
  }

  // Test 2: PPTX -> PDF
  console.log('\n=== Test 2: PPTX -> PDF ===');
  try {
    const result = await converter.convert(Buffer.from(pptx), {
      inputFormat: 'pptx',
      outputFormat: 'pdf'
    });
    console.log('✅ PPTX->PDF SUCCESS:', result.data?.length || result.length, 'bytes');
  } catch (e) {
    console.error('❌ PPTX->PDF FAILED:', e.message);
  }

  // Test 3: ODP -> PDF (if file exists)
  if (odp) {
    console.log('\n=== Test 3: ODP -> PDF ===');
    try {
      const result = await converter.convert(Buffer.from(odp), {
        inputFormat: 'odp',
        outputFormat: 'pdf'
      });
      console.log('✅ ODP->PDF SUCCESS:', result.data?.length || result.length, 'bytes');
    } catch (e) {
      console.error('❌ ODP->PDF FAILED:', e.message);
    }
  }

  console.log('\n=== All tests complete ===');
  await converter.destroy();
  process.exit(0);
}

test().catch(err => {
  console.error('Unhandled top-level error:', err);
  process.exit(1);
});

/**
 * Test the subprocess worker architecture without PROXY_TO_PTHREAD
 */

import { createSubprocessConverter } from './dist/index.js';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('Testing subprocess worker architecture (no PROXY_TO_PTHREAD)');
  console.log('='.repeat(60));

  const converter = await createSubprocessConverter({
    wasmPath: './wasm',
    verbose: true,
  });

  console.log('\n✓ Converter initialized successfully!\n');

  // Test 1: ODS -> PDF
  try {
    console.log('Test 1: ODS -> PDF');
    const odsPath = path.join('tests', 'fixtures', 'sample_test_4.ods');
    const odsData = await fs.readFile(odsPath);
    console.log(`  Input: ${odsData.length} bytes`);
    
    const start = Date.now();
    const result = await converter.convert(odsData, { outputFormat: 'pdf' }, 'test.ods');
    console.log(`  Output: ${result.data.length} bytes`);
    console.log(`  Time: ${Date.now() - start}ms`);
    console.log('  ✓ ODS -> PDF success!\n');
  } catch (err) {
    console.error('  ✗ ODS -> PDF failed:', err.message);
  }

  // Test 2: DOCX -> PDF
  try {
    console.log('Test 2: DOCX -> PDF');
    const docxPath = path.join('tests', 'fixtures', 'sample_test.docx');
    const docxData = await fs.readFile(docxPath);
    console.log(`  Input: ${docxData.length} bytes`);
    
    const start = Date.now();
    const result = await converter.convert(docxData, { outputFormat: 'pdf' }, 'test.docx');
    console.log(`  Output: ${result.data.length} bytes`);
    console.log(`  Time: ${Date.now() - start}ms`);
    console.log('  ✓ DOCX -> PDF success!\n');
  } catch (err) {
    console.error('  ✗ DOCX -> PDF failed:', err.message);
  }

  // Test 3: Sequential conversions
  try {
    console.log('Test 3: Sequential conversions');
    const files = [
      { path: 'tests/fixtures/sample_test_4.ods', format: 'pdf' },
      { path: 'tests/fixtures/sample_test.docx', format: 'pdf' },
      { path: 'tests/fixtures/sample_test_4.ods', format: 'xlsx' },
    ];

    for (const file of files) {
      const data = await fs.readFile(file.path);
      const ext = path.extname(file.path).slice(1);
      const start = Date.now();
      const result = await converter.convert(data, { outputFormat: file.format }, `test.${ext}`);
      console.log(`  ${ext.toUpperCase()} -> ${file.format.toUpperCase()}: ${result.data.length} bytes in ${Date.now() - start}ms`);
    }
    console.log('  ✓ Sequential conversions success!\n');
  } catch (err) {
    console.error('  ✗ Sequential conversions failed:', err.message);
  }

  await converter.destroy();
  console.log('\n✓ All tests completed');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});





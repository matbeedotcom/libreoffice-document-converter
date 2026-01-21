/**
 * Direct spreadsheet to PDF conversion test using LibreOfficeConverter
 * Tests both XLSX and CSV to isolate any CSV-specific issues
 */
import { LibreOfficeConverter } from '../dist/server.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testConversion(converter, inputPath, inputFormat, outputName) {
  console.log(`\n[Test] === Testing ${inputFormat.toUpperCase()} to PDF ===`);
  
  try {
    const inputData = readFileSync(inputPath);
    console.log(`[Test] Read ${inputFormat} file: ${inputData.length} bytes`);

    console.log(`[Test] Converting ${inputFormat} to PDF...`);
    const startTime = Date.now();
    
    const result = await converter.convert(
      inputData,
      { outputFormat: 'pdf', inputFormat },
      outputName
    );

    const elapsed = Date.now() - startTime;
    console.log(`[Test] Conversion completed in ${elapsed}ms`);
    console.log(`[Test] Output: ${result.filename}, ${result.data.length} bytes, ${result.mimeType}`);

    // Save the PDF
    const outputPath = join(__dirname, `../tests/${outputName.replace(/\.[^.]+$/, '')}-output.pdf`);
    writeFileSync(outputPath, result.data);
    console.log(`[Test] Saved PDF to: ${outputPath}`);

    // Verify it's a valid PDF
    const pdfHeader = Buffer.from(result.data.slice(0, 5)).toString('ascii');
    
    if (pdfHeader === '%PDF-') {
      console.log(`[Test] ✅ SUCCESS: Valid PDF generated for ${inputFormat}!`);
      return true;
    } else {
      console.log(`[Test] ❌ FAILED: Output is not a valid PDF`);
      return false;
    }
  } catch (error) {
    console.error(`[Test] ❌ FAILED (${inputFormat}):`, error.message);
    return false;
  }
}

async function main() {
  console.log('[Test] Creating LibreOfficeConverter directly...');
  
  // Import the WASM loader
  const wasmLoader = await import('../wasm/loader.cjs');
  
  const converter = new LibreOfficeConverter({
    wasmPath: join(__dirname, '../wasm'),
    wasmLoader,
    verbose: false, // Less verbose for cleaner output
    onProgress: (p) => console.log(`[Progress] ${p.phase} - ${p.percent}% - ${p.message}`),
  });

  console.log('[Test] Initializing converter...');
  const initStart = Date.now();
  await converter.initialize();
  console.log(`[Test] Initialized in ${Date.now() - initStart}ms`);

  try {
    // Test 1: XLSX to PDF (should work)
    const xlsxPath = join(__dirname, '../tests/sample_test_5.xlsx');
    await testConversion(converter, xlsxPath, 'xlsx', 'sample_test_5.xlsx');

    // Test 2: Simple CSV to PDF (no embedded newlines)
    const simpleCsvPath = join(__dirname, '../tests/simple.csv');
    await testConversion(converter, simpleCsvPath, 'csv', 'simple.csv');

    // Test 3: Complex CSV to PDF (with embedded newlines)
    const complexCsvPath = join(__dirname, '../tests/sample.csv');
    await testConversion(converter, complexCsvPath, 'csv', 'sample.csv');

  } finally {
    console.log('\n[Test] Destroying converter...');
    await converter.destroy();
    console.log('[Test] Done!');
  }
}

main().catch(console.error);

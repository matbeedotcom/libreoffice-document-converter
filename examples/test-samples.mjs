import { createConverter } from './dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test files: Writer (DOCX/ODT), Calc (ODS), and Impress (PPTX)
// Note: XLSX loading is extremely slow in WASM - use ODS instead
const testFiles = [
  // Writer conversions - fast and reliable
  { path: 'tests/sample_2_page.docx', format: 'pdf', type: 'Writer' },
  { path: 'tests/sample_2_page.docx', format: 'pdf', type: 'Writer' },
  { path: 'tests/sample_2_page.docx', format: 'odt', type: 'Writer' },
  { path: 'tests/sample_2_page.docx', format: 'txt', type: 'Writer' },
  // Calc conversions - ODS is fast, XLSX is slow
  { path: 'tests/sample_test_4.ods', format: 'pdf', type: 'Calc' },
  { path: 'tests/sample_test_4.ods', format: 'xlsx', type: 'Calc' },
  // Impress conversions - PPTX to PDF
  { path: 'tests/sample_test_1.pptx', format: 'pdf', type: 'Impress' },
];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     LibreOffice WASM Multi-Document Conversion Test         ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

const startTotal = Date.now();

// Initialize converter (one-time cost)
console.log('Initializing converter...');
const initStart = Date.now();

const converter = await createConverter({
  wasmPath: path.join(__dirname, 'wasm'),
  verbose: true,
  onProgress: (info) => {
    process.stdout.write(`\r  [${info.phase}] ${info.percent}% - ${info.message}`.padEnd(70));
  },
});

const initTime = Date.now() - initStart;
console.log(`\n\nConverter ready in ${(initTime/1000).toFixed(1)}s`);
console.log('');

// Create output directory
const outputDir = path.join(__dirname, 'tests/output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Convert all files sequentially (reusing the same converter instance)
const results = [];

console.log(`Converting ${testFiles.length} documents...`);
console.log('');

for (const testFile of testFiles) {
  const inputName = path.basename(testFile.path);
  const outputFormat = testFile.format;
  
  console.log(`─────────────────────────────────────────`);
  console.log(`[${testFile.type}] ${inputName} → ${outputFormat.toUpperCase()}`);
  
  try {
    const inputPath = path.join(__dirname, testFile.path);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`  ⚠️  File not found, skipping`);
      results.push({ file: inputName, format: outputFormat, success: false, error: 'File not found' });
      continue;
    }
    
    const inputData = fs.readFileSync(inputPath);
    console.log(`  Input: ${(inputData.length / 1024).toFixed(1)} KB`);
    
    const convStart = Date.now();
    const result = await converter.convert(inputData, {
      outputFormat: outputFormat,
    }, inputName);
    const convTime = Date.now() - convStart;
    
    // Save output
    const outputPath = path.join(outputDir, result.filename);
    fs.writeFileSync(outputPath, result.data);
    
    console.log(`  Output: ${result.filename} (${(result.data.length / 1024).toFixed(1)} KB)`);
    console.log(`  Time: ${(convTime/1000).toFixed(2)}s`);
    console.log(`  ✅ Success`);
    
    results.push({
      file: inputName,
      format: outputFormat,
      type: testFile.type,
      success: true,
      time: convTime,
      inputSize: inputData.length,
      outputSize: result.data.length
    });
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    results.push({
      file: inputName,
      format: outputFormat,
      type: testFile.type,
      success: false,
      error: error.message
    });
  }
}

// Summary
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('                         SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`Total conversions: ${results.length}`);
console.log(`Successful: ${successful.length}`);
console.log(`Failed: ${failed.length}`);
console.log('');

// Group by type
const writerResults = successful.filter(r => r.type === 'Writer');
const calcResults = successful.filter(r => r.type === 'Calc');
const impressResults = successful.filter(r => r.type === 'Impress');

if (writerResults.length > 0) {
  const avgTime = writerResults.reduce((a, b) => a + b.time, 0) / writerResults.length;
  console.log(`Writer avg conversion: ${(avgTime/1000).toFixed(2)}s (${writerResults.length} files)`);
}

if (calcResults.length > 0) {
  const avgTime = calcResults.reduce((a, b) => a + b.time, 0) / calcResults.length;
  console.log(`Calc avg conversion: ${(avgTime/1000).toFixed(2)}s (${calcResults.length} files)`);
}

if (impressResults.length > 0) {
  const avgTime = impressResults.reduce((a, b) => a + b.time, 0) / impressResults.length;
  console.log(`Impress avg conversion: ${(avgTime/1000).toFixed(2)}s (${impressResults.length} files)`);
}

if (successful.length > 0) {
  const totalConvTime = successful.reduce((a, b) => a + b.time, 0);
  console.log('');
  console.log(`Total conversion time: ${(totalConvTime/1000).toFixed(2)}s`);
  console.log(`Average per document: ${(totalConvTime/successful.length/1000).toFixed(2)}s`);
}

console.log('');
console.log(`Initialization (one-time): ${(initTime/1000).toFixed(1)}s`);
console.log(`Total elapsed: ${((Date.now()-startTotal)/1000).toFixed(1)}s`);

console.log('');
console.log('Output files saved to: tests/output/');

if (failed.length > 0) {
  console.log('');
  console.log('Failed conversions:');
  failed.forEach(f => console.log(`  - ${f.file} → ${f.format}: ${f.error}`));
}

console.log('');

// Clean exit (required due to LibreOffice pthread workers)
await converter.destroy();
process.exit(0);

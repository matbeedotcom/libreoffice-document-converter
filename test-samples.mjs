import { createConverter } from './dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFiles = [
  'tests/sample_test_1.pptx',
  'tests/sample_test_2.docx', 
  'tests/sample_test_3.docx'
];

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║        LibreOffice WASM Conversion Test                  ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

const startTotal = Date.now();

// Initialize converter
console.log('Initializing converter...');
const initStart = Date.now();

const converter = await createConverter({
  wasmPath: path.join(__dirname, 'wasm'),
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

// Convert each file
const results = [];

for (const file of testFiles) {
  console.log(`─────────────────────────────────────────`);
  console.log(`Converting: ${path.basename(file)}`);
  
  try {
    const inputPath = path.join(__dirname, file);
    const inputData = fs.readFileSync(inputPath);
    console.log(`  Input size: ${(inputData.length / 1024).toFixed(1)} KB`);
    
    const convStart = Date.now();
    const result = await converter.convert(inputData, {
      outputFormat: 'pdf',
    }, path.basename(file));
    const convTime = Date.now() - convStart;
    
    // Save output
    const outputPath = path.join(outputDir, result.filename);
    fs.writeFileSync(outputPath, result.data);
    
    console.log(`  Output: ${result.filename}`);
    console.log(`  Output size: ${(result.data.length / 1024).toFixed(1)} KB`);
    console.log(`  Time: ${(convTime/1000).toFixed(2)}s`);
    console.log(`  ✅ Success`);
    
    results.push({
      file: path.basename(file),
      success: true,
      time: convTime,
      inputSize: inputData.length,
      outputSize: result.data.length
    });
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    results.push({
      file: path.basename(file),
      success: false,
      error: error.message
    });
  }
}

// Summary
console.log('');
console.log('═══════════════════════════════════════════');
console.log('                  SUMMARY');
console.log('═══════════════════════════════════════════');

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`Total files: ${results.length}`);
console.log(`Successful: ${successful.length}`);
console.log(`Failed: ${failed.length}`);
console.log('');

if (successful.length > 0) {
  const avgTime = successful.reduce((a, b) => a + b.time, 0) / successful.length;
  console.log(`Average conversion time: ${(avgTime/1000).toFixed(2)}s`);
}

console.log(`Initialization time: ${(initTime/1000).toFixed(1)}s`);
console.log(`Total time: ${((Date.now()-startTotal)/1000).toFixed(1)}s`);

console.log('');
console.log('Output files saved to: tests/output/');
console.log('');

// Clean exit
await converter.destroy();
process.exit(0);

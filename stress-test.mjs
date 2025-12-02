import { createConverter } from './dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFiles = [
  { path: 'tests/sample_test_2.docx', format: 'pdf' },
  { path: 'tests/sample_test_3.docx', format: 'pdf' },
  { path: 'tests/sample_test_2.docx', format: 'odt' },
  { path: 'tests/sample_test_2.docx', format: 'txt' },
  { path: 'tests/sample_test_4.ods', format: 'pdf' },
  { path: 'tests/sample_test_4.ods', format: 'xlsx' },
];

const ITERATIONS = 50;
let totalSuccess = 0;
let totalFail = 0;
const failures = [];

console.log(`Stress test: ${ITERATIONS} iterations x ${testFiles.length} conversions = ${ITERATIONS * testFiles.length} total`);
console.log('');

const converter = await createConverter({
  wasmPath: path.join(__dirname, 'wasm'),
});

console.log('Converter ready\n');

for (let i = 1; i <= ITERATIONS; i++) {
  process.stdout.write(`Iteration ${i}/${ITERATIONS}: `);
  let iterSuccess = 0;
  let iterFail = 0;
  
  for (const testFile of testFiles) {
    try {
      const inputPath = path.join(__dirname, testFile.path);
      const inputData = fs.readFileSync(inputPath);
      const inputName = path.basename(testFile.path);
      
      await converter.convert(inputData, { outputFormat: testFile.format }, inputName);
      iterSuccess++;
      totalSuccess++;
    } catch (error) {
      iterFail++;
      totalFail++;
      failures.push({ iteration: i, file: testFile.path, format: testFile.format, error: error.message });
    }
  }
  
  console.log(`${iterSuccess}/${testFiles.length} passed` + (iterFail > 0 ? ` (${iterFail} failed)` : ''));
  
  if (iterFail > 0) {
    // Show recent failure
    const recent = failures[failures.length - 1];
    console.log(`  └─ ${recent.file} -> ${recent.format}: ${recent.error.slice(0, 80)}`);
  }
}

console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));
console.log(`Total conversions: ${ITERATIONS * testFiles.length}`);
console.log(`Successful: ${totalSuccess}`);
console.log(`Failed: ${totalFail}`);
console.log(`Success rate: ${(totalSuccess / (ITERATIONS * testFiles.length) * 100).toFixed(1)}%`);

if (failures.length > 0) {
  console.log('\nFailures by type:');
  const byType = {};
  failures.forEach(f => {
    const key = `${path.basename(f.file)} -> ${f.format}`;
    byType[key] = (byType[key] || 0) + 1;
  });
  Object.entries(byType).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

await converter.destroy();
process.exit(totalFail > 0 ? 1 : 0);

#!/usr/bin/env node
/**
 * LibreOffice WASM Benchmark Script
 *
 * Measures:
 * - First initialization time
 * - DOCX → PDF conversion (multiple runs for average)
 * - XLSX → PDF conversion
 * - PPTX → PDF conversion
 */

import { createConverter } from './dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const ITERATIONS = 5;  // Number of conversion iterations per format

// Test files
const TEST_FILES = {
  docx: 'tests/sample_2_page.docx',  // Smaller DOCX for consistent benchmarks
  xlsx: 'tests/sample_test_5.xlsx',
  pptx: 'tests/sample_test_1.pptx',
};

// Track all results
const results = {
  initialization: null,
  docx: [],
  xlsx: [],
  pptx: [],
};

function formatTime(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function calculateStats(times) {
  if (times.length === 0) return null;
  const sorted = [...times].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  return { min, max, avg, median };
}

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║          LibreOffice WASM Benchmark                            ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`Configuration: ${ITERATIONS} iterations per format`);
console.log('');

// Phase 1: Initialization
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Phase 1: Initialization');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const initStart = Date.now();

const converter = await createConverter({
  wasmPath: path.join(__dirname, 'wasm'),
  verbose: false,
  onProgress: (info) => {
    process.stdout.write(`\r  [${info.phase}] ${info.percent}% - ${info.message}`.padEnd(80));
  },
});

results.initialization = Date.now() - initStart;
console.log(`\n  Initialization complete: ${formatTime(results.initialization)}`);
console.log('');

// Helper function to run conversion benchmark
async function benchmarkConversion(name, filePath, iterations) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Phase: ${name.toUpperCase()} → PDF`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return [];
  }

  const inputData = fs.readFileSync(fullPath);
  const inputName = path.basename(filePath);
  console.log(`  Input: ${inputName} (${(inputData.length / 1024).toFixed(1)} KB)`);
  console.log('');

  const times = [];

  for (let i = 0; i < iterations; i++) {
    process.stdout.write(`  Run ${i + 1}/${iterations}... `);

    try {
      const start = Date.now();
      const result = await converter.convert(inputData, {
        outputFormat: 'pdf',
      }, inputName);
      const elapsed = Date.now() - start;

      times.push(elapsed);
      console.log(`${formatTime(elapsed)} (output: ${(result.data.length / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.log(`ERROR: ${error.message}`);
    }
  }

  if (times.length > 0) {
    const stats = calculateStats(times);
    console.log('');
    console.log(`  Results: min=${formatTime(stats.min)}, max=${formatTime(stats.max)}, avg=${formatTime(stats.avg)}, median=${formatTime(stats.median)}`);
  }

  console.log('');
  return times;
}

// Phase 2: DOCX → PDF
results.docx = await benchmarkConversion('docx', TEST_FILES.docx, ITERATIONS);

// Phase 3: XLSX → PDF
results.xlsx = await benchmarkConversion('xlsx', TEST_FILES.xlsx, ITERATIONS);

// Phase 4: PPTX → PDF
results.pptx = await benchmarkConversion('pptx', TEST_FILES.pptx, ITERATIONS);

// Final Summary
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                      BENCHMARK RESULTS                         ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('| Operation | Min | Max | Avg | Median |');
console.log('|-----------|-----|-----|-----|--------|');
console.log(`| Initialization | - | - | ${formatTime(results.initialization)} | - |`);

for (const [name, times] of Object.entries({ docx: results.docx, xlsx: results.xlsx, pptx: results.pptx })) {
  if (times.length > 0) {
    const stats = calculateStats(times);
    console.log(`| ${name.toUpperCase()} → PDF | ${formatTime(stats.min)} | ${formatTime(stats.max)} | ${formatTime(stats.avg)} | ${formatTime(stats.median)} |`);
  }
}

console.log('');
console.log('README-ready format:');
console.log('');
console.log('| Operation | Time |');
console.log('|-----------|------|');
console.log(`| First initialization | ~${formatTime(results.initialization)} |`);

for (const [name, times] of Object.entries({ docx: results.docx, xlsx: results.xlsx, pptx: results.pptx })) {
  if (times.length > 0) {
    const stats = calculateStats(times);
    const label = name === 'docx' ? 'DOCX → PDF' : name === 'xlsx' ? 'XLSX → PDF' : 'PPTX → PDF';
    console.log(`| ${label} | ~${formatTime(stats.avg)} |`);
  }
}

console.log('');

// Cleanup
await converter.destroy();
process.exit(0);

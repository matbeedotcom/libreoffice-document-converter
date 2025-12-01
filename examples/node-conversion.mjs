/**
 * Node.js Document Conversion Example
 * 
 * This example demonstrates how to use the LibreOffice WASM converter
 * to convert documents in Node.js.
 * 
 * Usage:
 *   node examples/node-conversion.mjs
 */

import { createConverter } from '../dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   LibreOffice WASM Document Converter - Node.js Example  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Create the converter
  console.log('Initializing converter...');
  const converter = await createConverter({
    wasmPath: path.join(__dirname, '..', 'wasm'),
    verbose: false,
    onProgress: (info) => {
      console.log(`  [${info.phase}] ${info.percent}% - ${info.message}`);
    },
  });

  console.log('Converter ready!\n');

  // Example 1: RTF to PDF
  console.log('─────────────────────────────────────────');
  console.log('Example 1: Convert RTF to PDF');
  console.log('─────────────────────────────────────────');
  
  const rtfDoc = String.raw`{\rtf1\ansi\deff0 
{\fonttbl {\f0 Times New Roman;}}
\pard\qc\b Hello from LibreOffice WASM!\par
\pard\par
This document was converted using LibreOffice compiled to WebAssembly.\par
It runs entirely in Node.js without any native dependencies.\par
}`;
  
  const result = await converter.convert(
    new TextEncoder().encode(rtfDoc),
    { outputFormat: 'pdf', inputFormat: 'rtf' },
    'example.rtf'
  );
  
  console.log(`  Output:   ${result.filename}`);
  console.log(`  Size:     ${result.data.length.toLocaleString()} bytes`);
  console.log(`  MIME:     ${result.mimeType}`);
  console.log(`  Duration: ${result.duration}ms\n`);
  
  // Save the PDF
  const outputPath = '/tmp/libreoffice-wasm-example.pdf';
  fs.writeFileSync(outputPath, result.data);
  console.log(`  ✓ Saved to: ${outputPath}\n`);

  // Example 2: Show supported formats
  console.log('─────────────────────────────────────────');
  console.log('Supported Formats:');
  console.log('─────────────────────────────────────────');
  
  const { LibreOfficeConverter } = await import('../dist/index.js');
  const inputFormats = LibreOfficeConverter.getSupportedInputFormats();
  const outputFormats = LibreOfficeConverter.getSupportedOutputFormats();
  
  console.log(`  Input:  ${inputFormats.slice(0, 8).join(', ')}...`);
  console.log(`  Output: ${outputFormats.join(', ')}\n`);

  // Clean up
  try {
    await converter.destroy();
  } catch {
    // Ignore cleanup errors
  }
  
  console.log('─────────────────────────────────────────');
  console.log('✓ Done!');
  console.log('─────────────────────────────────────────');
  
  // Note: WASM pthread workers keep the process alive.
  // In production, either call process.exit() or use worker_threads
  // to run conversions in a subprocess that can be terminated.
  process.exit(0);
}

main().catch((error) => {
  console.error('\n✗ Error:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});


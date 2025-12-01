/**
 * Node.js Document Conversion Example
 * 
 * This example demonstrates how to use the LibreOffice WASM converter
 * to convert documents in Node.js.
 */

import { createConverter } from '../dist/index.js';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('LibreOffice WASM Document Converter - Node.js Example\n');

  // Create the converter
  console.log('Initializing converter...');
  const converter = await createConverter({
    wasmPath: path.join(import.meta.dirname, '..', 'wasm'),
    verbose: false,
    onProgress: (info) => {
      console.log(`  [${info.phase}] ${info.percent}% - ${info.message}`);
    },
  });

  console.log('Converter ready!\n');

  // Example 1: RTF to PDF
  console.log('Example 1: RTF to PDF');
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
  
  console.log(`  Output: ${result.filename}`);
  console.log(`  Size: ${result.data.length} bytes`);
  console.log(`  Duration: ${result.duration}ms\n`);
  
  // Save the PDF
  const outputPath = '/tmp/libreoffice-wasm-example.pdf';
  fs.writeFileSync(outputPath, result.data);
  console.log(`  Saved to: ${outputPath}\n`);

  // Clean up
  await converter.destroy();
  console.log('Done!');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});


/**
 * Basic Document Conversion Example
 *
 * Demonstrates converting documents between formats using @matbee/libreoffice-converter
 *
 * Usage: node convert.js <input-file> [output-format]
 * Example: node convert.js document.docx pdf
 */

import { WorkerConverter } from '@matbee/libreoffice-converter';
import { readFileSync, writeFileSync } from 'fs';
import { basename, extname } from 'path';

async function main() {
  const inputFile = process.argv[2];
  const outputFormat = process.argv[3] || 'pdf';

  if (!inputFile) {
    console.log('Usage: node convert.js <input-file> [output-format]');
    console.log('');
    console.log('Supported input formats: docx, xlsx, pptx, odt, ods, odp, doc, xls, ppt, rtf, txt, csv');
    console.log('Supported output formats: pdf, docx, xlsx, pptx, odt, ods, odp, html, txt, png');
    console.log('');
    console.log('Examples:');
    console.log('  node convert.js report.docx pdf');
    console.log('  node convert.js spreadsheet.xlsx csv');
    console.log('  node convert.js presentation.pptx pdf');
    process.exit(1);
  }

  console.log(`Converting ${inputFile} to ${outputFormat}...`);

  // Create converter instance
  const converter = new WorkerConverter({
    verbose: false,
  });

  try {
    // Initialize the WASM module
    console.log('Initializing LibreOffice WASM...');
    await converter.initialize();
    console.log('Initialized!');

    // Read input file
    const inputBuffer = readFileSync(inputFile);
    const inputFilename = basename(inputFile);

    // Convert the document
    console.log('Converting...');
    const result = await converter.convert(inputBuffer, { outputFormat }, inputFilename);

    // Generate output filename
    const outputFilename = basename(inputFile, extname(inputFile)) + '.' + outputFormat;

    // Write output file
    writeFileSync(outputFilename, Buffer.from(result.data));
    console.log(`Saved: ${outputFilename} (${result.duration}ms)`);

  } catch (error) {
    console.error('Conversion failed:', error.message);
    await converter.destroy();
    process.exit(1);
  }

  // Clean up - worker will exit automatically after destroy
  await converter.destroy();
}

main();

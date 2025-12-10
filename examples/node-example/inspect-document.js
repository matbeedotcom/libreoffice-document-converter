/**
 * Document Inspection Example
 *
 * Demonstrates using the document inspection APIs to get metadata,
 * page count, text content, and page names from documents.
 *
 * Usage: node inspect-document.js <input-file>
 */

import { WorkerConverter } from '@matbee/libreoffice-converter';
import { readFileSync } from 'fs';
import { basename } from 'path';

async function main() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.log('Usage: node inspect-document.js <input-file>');
    console.log('');
    console.log('Examples:');
    console.log('  node inspect-document.js report.docx');
    console.log('  node inspect-document.js presentation.pptx');
    console.log('  node inspect-document.js spreadsheet.xlsx');
    process.exit(1);
  }

  const converter = new WorkerConverter({ verbose: false });

  try {
    console.log('Initializing LibreOffice WASM...');
    await converter.initialize();

    const inputBuffer = readFileSync(inputFile);
    const inputFilename = basename(inputFile);

    console.log(`\nInspecting: ${inputFilename}\n`);
    console.log('='.repeat(50));

    // Get document info
    console.log('\n--- Document Info ---');
    const info = await converter.getDocumentInfo(inputBuffer, inputFilename);
    console.log(`Type: ${info.type}`);
    console.log(`Page Count: ${info.pageCount}`);
    if (info.width && info.height) {
      console.log(`Dimensions: ${info.width} x ${info.height} twips`);
    }

    // Get page count
    console.log('\n--- Page Count ---');
    const pageCount = await converter.getPageCount(inputBuffer, inputFilename);
    console.log(`Total pages: ${pageCount}`);

    // Get page names (for spreadsheets: sheet names, presentations: slide names)
    console.log('\n--- Page/Sheet Names ---');
    const pageNames = await converter.getPageNames(inputBuffer, inputFilename);
    if (pageNames.length > 0) {
      pageNames.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`);
      });
    } else {
      console.log('  (No named pages)');
    }

    // Get document text (first 500 characters)
    console.log('\n--- Document Text Preview ---');
    const text = await converter.getDocumentText(inputBuffer, inputFilename);
    if (text.length > 0) {
      const preview = text.substring(0, 500);
      console.log(preview);
      if (text.length > 500) {
        console.log(`\n... (${text.length - 500} more characters)`);
      }
    } else {
      console.log('  (No text content)');
    }

    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('Inspection failed:', error.message);
    process.exit(1);
  } finally {
    await converter.destroy();
  }
}

main();

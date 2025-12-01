/**
 * Example: Node.js Document Conversion
 * 
 * This example demonstrates how to use the LibreOffice WASM converter
 * in a Node.js environment.
 * 
 * Usage:
 *   npx tsx examples/node-convert.ts input.docx output.pdf
 */

import { createConverter } from '../src/index.js';
import { readFile, writeFile } from 'fs/promises';
import { basename, extname } from 'path';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: npx tsx examples/node-convert.ts <input> <output>');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx examples/node-convert.ts document.docx output.pdf');
    console.log('  npx tsx examples/node-convert.ts spreadsheet.xlsx output.csv');
    console.log('  npx tsx examples/node-convert.ts presentation.pptx output.pdf');
    process.exit(1);
  }

  const inputPath = args[0]!;
  const outputPath = args[1]!;
  const outputFormat = extname(outputPath).slice(1).toLowerCase();

  console.log('🔄 LibreOffice WASM Document Converter');
  console.log('');
  console.log(`   Input:  ${inputPath}`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Format: ${outputFormat.toUpperCase()}`);
  console.log('');

  try {
    // Read input file
    console.log('📖 Reading input file...');
    const inputData = await readFile(inputPath);

    // Create and initialize converter
    console.log('⚙️  Initializing LibreOffice WASM...');
    const converter = await createConverter({
      wasmPath: './wasm',
      verbose: false,
      onProgress: (p) => {
        process.stdout.write(`\r   ${p.phase}: ${p.percent}% - ${p.message}`);
      },
    });

    console.log('\n✅ LibreOffice initialized');

    // Perform conversion
    console.log('🔄 Converting document...');
    const startTime = Date.now();

    const result = await converter.convert(
      new Uint8Array(inputData),
      {
        outputFormat: outputFormat as any,
        pdf: {
          embedFonts: true,
          quality: 90,
        },
      },
      basename(inputPath)
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Conversion complete in ${duration}ms`);

    // Write output file
    console.log('💾 Writing output file...');
    await writeFile(outputPath, result.data);

    console.log('');
    console.log('📊 Result:');
    console.log(`   File: ${result.filename}`);
    console.log(`   Size: ${(result.data.length / 1024).toFixed(2)} KB`);
    console.log(`   MIME: ${result.mimeType}`);
    if (result.pageCount) {
      console.log(`   Pages: ${result.pageCount}`);
    }

    // Cleanup
    await converter.destroy();

    console.log('');
    console.log('✨ Done!');
  } catch (error) {
    console.error('');
    console.error('❌ Error:', (error as Error).message);
    process.exit(1);
  }
}

main();


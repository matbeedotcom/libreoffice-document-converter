/**
 * Document Preview Generation Example
 *
 * Demonstrates rendering document pages as images for thumbnails or previews.
 *
 * Usage: node generate-previews.js <input-file> [max-pages]
 */

import { WorkerConverter } from '@matbee/libreoffice-converter';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { basename, extname } from 'path';

async function main() {
  const inputFile = process.argv[2];
  const maxPages = parseInt(process.argv[3]) || 5;

  if (!inputFile) {
    console.log('Usage: node generate-previews.js <input-file> [max-pages]');
    console.log('');
    console.log('Examples:');
    console.log('  node generate-previews.js presentation.pptx');
    console.log('  node generate-previews.js report.pdf 10');
    process.exit(1);
  }

  const converter = new WorkerConverter({ verbose: false });

  try {
    console.log('Initializing LibreOffice WASM...');
    await converter.initialize();

    const inputBuffer = readFileSync(inputFile);
    const inputFilename = basename(inputFile);
    const baseName = basename(inputFile, extname(inputFile));

    // Create output directory
    const outputDir = `${baseName}-previews`;
    mkdirSync(outputDir, { recursive: true });

    // Get page count
    const pageCount = await converter.getPageCount(inputBuffer, inputFilename);
    const pagesToRender = Math.min(pageCount, maxPages);
    console.log(`Document has ${pageCount} pages, rendering ${pagesToRender}...\n`);

    // Method 1: Render individual pages at high resolution
    console.log('--- High-Resolution Page Renders ---');
    for (let i = 0; i < pagesToRender; i++) {
      const pageData = await converter.renderPage(inputBuffer, inputFilename, i, {
        width: 1920,
        height: 1080,
        format: 'png',
      });

      const outputPath = `${outputDir}/page-${i + 1}-hires.png`;
      writeFileSync(outputPath, Buffer.from(pageData));
      console.log(`  Saved: ${outputPath}`);
    }

    // Method 2: Generate thumbnail previews (batch)
    console.log('\n--- Thumbnail Previews ---');
    const previews = await converter.renderPagePreviews(inputBuffer, inputFilename, {
      maxPages: pagesToRender,
      width: 300,
      height: 400,
      format: 'png',
    });

    for (const preview of previews) {
      const outputPath = `${outputDir}/thumb-${preview.pageIndex + 1}.png`;
      writeFileSync(outputPath, Buffer.from(preview.data));
      console.log(`  Saved: ${outputPath} (page ${preview.pageIndex + 1})`);
    }

    console.log(`\nAll previews saved to: ${outputDir}/`);

  } catch (error) {
    console.error('Preview generation failed:', error.message);
    process.exit(1);
  } finally {
    await converter.destroy();
  }
}

main();

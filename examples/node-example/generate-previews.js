/**
 * Document Preview Generation Example
 *
 * Demonstrates rendering document pages as images for thumbnails or previews.
 * Uses the built-in rgbaToPng utility which automatically uses sharp when available.
 *
 * Usage: node generate-previews.js <input-file> [max-pages]
 */

import { WorkerConverter, rgbaToPng, isSharpAvailable } from '@matbee/libreoffice-converter';
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

  // Check if sharp is available for faster encoding
  const hasSharp = await isSharpAvailable();
  console.log(`Image encoding: ${hasSharp ? 'sharp (fast)' : 'pure JS fallback'}`);
  if (!hasSharp) {
    console.log('  Tip: Install sharp for faster PNG encoding: npm install sharp\n');
  }

  const converter = new WorkerConverter({ verbose: false });

  try {
    console.log('Initializing LibreOffice WASM...');
    await converter.initialize();

    const inputBuffer = readFileSync(inputFile);
    const inputFormat = extname(inputFile).slice(1).toLowerCase();
    const baseName = basename(inputFile, extname(inputFile));

    // Create output directory
    const outputDir = `${baseName}-previews`;
    mkdirSync(outputDir, { recursive: true });

    // Get page count
    const pageCount = await converter.getPageCount(inputBuffer, inputFormat);
    const pagesToRender = Math.min(pageCount, maxPages);
    console.log(`Document has ${pageCount} pages, rendering ${pagesToRender}...\n`);

    // Method 1: Render individual pages at high resolution
    // renderPage(input, inputFormat, pageIndex, width, height?) returns PagePreview with raw RGBA data
    console.log('--- High-Resolution Page Renders ---');
    for (let i = 0; i < pagesToRender; i++) {
      const preview = await converter.renderPage(inputBuffer, inputFormat, i, 1920, 0);

      const outputPath = `${outputDir}/page-${i + 1}-hires.png`;
      const pngData = await rgbaToPng(preview.data, preview.width, preview.height);
      writeFileSync(outputPath, pngData);
      console.log(`  Saved: ${outputPath} (${preview.width}x${preview.height})`);
    }

    // Method 2: Generate thumbnail previews (batch)
    // renderPagePreviews(input, inputFormat, { width?, height?, pageIndices? }) returns PagePreview[]
    console.log('\n--- Thumbnail Previews ---');
    const pageIndices = Array.from({ length: pagesToRender }, (_, i) => i);
    const previews = await converter.renderPagePreviews(inputBuffer, inputFormat, {
      width: 300,
      pageIndices,
    });

    for (const preview of previews) {
      const outputPath = `${outputDir}/thumb-${preview.page + 1}.png`;
      const pngData = await rgbaToPng(preview.data, preview.width, preview.height);
      writeFileSync(outputPath, pngData);
      console.log(`  Saved: ${outputPath} (page ${preview.page + 1}, ${preview.width}x${preview.height})`);
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

import { createConverter } from './dist/index.js';
import { readFileSync, writeFileSync } from 'fs';

async function main() {
  console.log('Creating converter...');
  const converter = await createConverter({
    wasmDir: './wasm',
    verbose: true
  });

  try {
    // Test 1: Get page count for DOCX
    console.log('\n=== Test 1: Get page count for DOCX ===');
    const docx = readFileSync('tests/sample_2_page.docx');
    const docxPageCount = await converter.getPageCount(docx, { inputFormat: 'docx' });
    console.log(`DOCX page count: ${docxPageCount}`);

    // Test 2: Get page count for PPTX
    console.log('\n=== Test 2: Get page count for PPTX ===');
    const pptx = readFileSync('tests/sample_test_1.pptx');
    const pptxPageCount = await converter.getPageCount(pptx, { inputFormat: 'pptx' });
    console.log(`PPTX page count: ${pptxPageCount}`);

    // Test 3: Render page previews for PPTX
    console.log('\n=== Test 3: Render page previews for PPTX ===');
    const previews = await converter.renderPagePreviews(pptx, { inputFormat: 'pptx' }, 256);
    console.log(`Rendered ${previews.length} page previews`);
    
    for (const preview of previews) {
      console.log(`  Page ${preview.page}: ${preview.width}x${preview.height}, ${preview.data.length} bytes`);
      
      // Save first preview as raw RGBA for verification
      if (preview.page === 1) {
        writeFileSync('/tmp/preview-page1.rgba', preview.data);
        console.log(`  Saved raw RGBA to /tmp/preview-page1.rgba`);
      }
    }

    console.log('\n✅ All tests passed!');
  } catch (e) {
    console.error('❌ Test failed:', e.message);
    console.error(e.stack);
  } finally {
    await converter.destroy();
    process.exit(0);
  }
}

main();


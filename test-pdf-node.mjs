/**
 * Test PDF preview in Node.js to see if it's browser-specific
 */
import { createConverter } from './dist/index.js';
import { readFileSync } from 'fs';

async function testPdfNode() {
  console.log('Creating converter...');
  const converter = await createConverter({
    wasmDir: './wasm',
    verbose: true
  });

  try {
    console.log('\n=== Testing PDF page count ===');
    const pdf = readFileSync('tests/sample.pdf');
    
    console.log('Getting page count...');
    const pageCount = await converter.getPageCount(pdf, { inputFormat: 'pdf' });
    console.log(`PDF page count: ${pageCount}`);

    console.log('\n=== Testing PDF render preview ===');
    console.log('Rendering page previews (this may hang)...');
    
    // Set a timeout
    const timeout = setTimeout(() => {
      console.error('❌ TIMEOUT: renderPagePreviews took more than 30 seconds');
      process.exit(1);
    }, 30000);

    const previews = await converter.renderPagePreviews(pdf, { inputFormat: 'pdf' }, 300);
    clearTimeout(timeout);
    
    console.log(`✅ Rendered ${previews.length} previews`);
    for (const p of previews) {
      console.log(`  Page ${p.page}: ${p.width}x${p.height}`);
    }

  } catch (e) {
    console.error('❌ Test FAILED:', e);
  } finally {
    console.log('\nDestroying converter...');
    await converter.destroy();
    process.exit(0);
  }
}

testPdfNode().catch(console.error);


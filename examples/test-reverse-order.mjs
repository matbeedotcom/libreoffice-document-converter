/**
 * Test rendering pages in reverse order in Edge
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testReverseOrder() {
  console.log('Launching Microsoft Edge...');
  
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => {
    console.log('[Browser]', msg.text());
  });
  
  try {
    // Navigate to a minimal page that has COOP/COEP headers
    await page.goto('http://localhost:3000/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    console.log('Creating converter and testing reverse order rendering...');
    
    const result = await page.evaluate(async () => {
      // Import the converter module
      const { WorkerBrowserConverter } = await import('/dist/browser.js');
      
      const converter = new WorkerBrowserConverter({
        wasmPath: '/wasm',
        verbose: false,
      });
      
      console.log('Initializing converter...');
      await converter.initialize();
      console.log('Converter initialized!');
      
      // Load test file
      const response = await fetch('/tests/large_sample.pptx');
      const buffer = await response.arrayBuffer();
      const inputData = new Uint8Array(buffer);
      
      // Get page count
      const pageCount = await converter.getPageCount(inputData.slice(), { inputFormat: 'pptx' });
      console.log('Page count:', pageCount);
      
      const results = [];
      
      // Render pages in REVERSE order (last page first)
      for (let i = pageCount - 1; i >= 0; i--) {
        console.log(`Rendering page ${i + 1} (index ${i}) in reverse order...`);
        try {
          const preview = await converter.renderSinglePage(inputData.slice(), { inputFormat: 'pptx' }, i, 400);
          results.push({ page: i + 1, success: true, size: `${preview.width}x${preview.height}` });
          console.log(`✅ Page ${i + 1} rendered: ${preview.width}x${preview.height}`);
        } catch (e) {
          results.push({ page: i + 1, success: false, error: e.message });
          console.log(`❌ Page ${i + 1} failed: ${e.message}`);
        }
      }
      
      await converter.destroy();
      return { pageCount, results };
    });
    
    console.log('\n=== Results ===');
    console.log(JSON.stringify(result, null, 2));
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testReverseOrder().catch(console.error);


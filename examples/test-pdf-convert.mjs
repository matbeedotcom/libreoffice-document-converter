/**
 * Test PDF conversion (not preview) in Edge
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testPdfConvert() {
  console.log('Launching Microsoft Edge...');
  
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.error('[Browser ERROR]', text);
    } else {
      console.log('[Browser]', text);
    }
  });
  
  page.on('pageerror', error => {
    console.error('[Page Error]', error.message);
  });
  
  try {
    console.log('Navigating to browser-test.html...');
    await page.goto('http://localhost:3000/examples/browser-test.html', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    console.log('Waiting for LibreOffice to initialize...');
    await page.waitForSelector('#status', { timeout: 180000 });
    await page.waitForFunction(() => {
      const status = document.querySelector('#status');
      return status && status.textContent.includes('ready');
    }, { timeout: 180000 });
    console.log('✅ LibreOffice initialized');
    
    // Click Preview PDF button to test preview
    console.log('Clicking Preview PDF button...');
    await page.click('#previewPdf');
    
    // Wait for preview to complete - PDF rendering can be slow
    console.log('Waiting for preview (up to 5 minutes)...');
    await page.waitForFunction(() => {
      const container = document.querySelector('#preview-container');
      return container && container.querySelectorAll('canvas').length > 0;
    }, { timeout: 300000 });
    
    const canvasCount = await page.locator('#preview-container canvas').count();
    console.log(`Preview canvases: ${canvasCount}`);
    
    if (canvasCount > 0) {
      console.log('✅ PPTX preview works in Edge!');
    } else {
      console.log('❌ PPTX preview failed');
    }
    
    // Keep browser open
    console.log('\nKeeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testPdfConvert().catch(console.error);


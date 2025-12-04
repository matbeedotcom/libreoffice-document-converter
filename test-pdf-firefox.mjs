/**
 * Test PDF preview in Firefox
 */
import { firefox } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testPdfFirefox() {
  console.log('Launching Firefox...');
  
  const browser = await firefox.launch({
    headless: false,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.error('[Firefox ERROR]', text);
    } else {
      console.log('[Firefox]', text);
    }
  });
  
  try {
    console.log('Navigating to browser-test.html...');
    await page.goto('http://localhost:3000/examples/browser-test.html', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    console.log('Waiting for LibreOffice to initialize...');
    await page.waitForFunction(() => {
      const status = document.querySelector('#status');
      return status && status.textContent.includes('ready');
    }, { timeout: 180000 });
    console.log('✅ LibreOffice initialized');
    
    // Click Preview PDF button
    console.log('Clicking Preview PDF button...');
    await page.click('#previewPdf');
    
    // Wait for preview to complete
    console.log('Waiting for preview...');
    await page.waitForFunction(() => {
      const container = document.querySelector('#preview-container');
      return container && container.querySelectorAll('canvas').length > 0;
    }, { timeout: 60000 });
    
    const canvasCount = await page.locator('#preview-container canvas').count();
    console.log(`Preview canvases: ${canvasCount}`);
    
    if (canvasCount > 0) {
      console.log('✅ PDF preview works in Firefox!');
    } else {
      console.log('❌ PDF preview failed');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testPdfFirefox().catch(console.error);

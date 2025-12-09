/**
 * Test lazy loading page previews in browser-demo.html with Edge
 */
import { chromium, firefox } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testLazyLoading() {
  console.log('Launching Microsoft Edge...');
  
  // Launch Edge (Chromium-based)
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false, // Show browser for visual inspection
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // Enable console logging - capture ALL messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error('[Browser ERROR]', text);
    } else if (type === 'warning') {
      console.warn('[Browser WARN]', text);
    } else {
      console.log('[Browser]', text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.error('[Page Error]', error.message);
  });
  
  try {
    console.log('Navigating to browser-demo.html...');
    await page.goto('http://localhost:3000/examples/browser-demo.html', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    console.log('Waiting for LibreOffice to initialize...');
    // Wait for the converter to be ready - check progress bar reaches 100%
    await page.waitForFunction(() => {
      const progressFill = document.querySelector('#progressFill');
      if (progressFill) {
        const width = progressFill.style.width;
        return width === '100%';
      }
      return false;
    }, { timeout: 180000 });
    console.log('✅ LibreOffice initialized');
    
    // Upload a test file - small PPTX (2 slides)
    console.log('Uploading small PPTX file...');
    const testFile = path.join(__dirname, 'tests', 'sample_test_1.pptx');
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFile);
    
    // Wait for document info to load
    console.log('Waiting for document analysis...');
    await page.waitForFunction(() => {
      const docInfo = document.querySelector('#docInfo');
      return docInfo && docInfo.textContent.includes('page');
    }, { timeout: 30000 });
    
    const docInfoText = await page.locator('#docInfo').textContent();
    console.log('✅ Document info:', docInfoText);
    
    // Wait for page skeletons to appear
    await page.waitForSelector('.page-card', { timeout: 30000 });
    const skeletonCount = await page.locator('.page-card').count();
    console.log(`✅ Created ${skeletonCount} page skeletons`);
    
    // Check for loaded pages over time
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      
      const loadedCount = await page.locator('.page-badge.loaded').count();
      const loadedCountText = await page.locator('#loadedCount').textContent();
      
      console.log(`  [${i + 1}s] Loaded: ${loadedCount} pages (UI shows: ${loadedCountText})`);
      
      // Check for canvas OR img elements (PNG fallback uses img)
      const canvasCount = await page.locator('.page-preview canvas').count();
      const imgCount = await page.locator('.page-preview img').count();
      console.log(`         Canvas: ${canvasCount}, Images: ${imgCount}`);
      
      if (loadedCount >= skeletonCount) {
        console.log('✅ All pages loaded!');
        break;
      }
    }
    
    // Get final stats
    const finalLoadedCount = await page.locator('.page-badge.loaded').count();
    const finalCanvasCount = await page.locator('.page-preview canvas').count();
    const finalImgCount = await page.locator('.page-preview img').count();
    
    console.log('\n=== Final Results ===');
    console.log(`Total pages: ${skeletonCount}`);
    console.log(`Loaded pages: ${finalLoadedCount}`);
    console.log(`Canvas elements: ${finalCanvasCount}`);
    console.log(`Image elements: ${finalImgCount}`);
    
    if (finalLoadedCount > 0) {
      console.log('\n✅ TEST PASSED: PDF preview works in Edge using PNG fallback!');
    } else {
      console.log('\n❌ TEST FAILED: No pages loaded');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'lazy-loading-test-edge.png', fullPage: true });
    console.log('📸 Screenshot saved to lazy-loading-test-edge.png');
    
    // Verify at least one page loaded
    if (finalCanvasCount > 0) {
      console.log('\n✅ TEST PASSED: Pages are loading lazily in Edge!');
    } else {
      console.log('\n❌ TEST FAILED: No pages loaded');
    }
    
    // Keep browser open for manual inspection
    console.log('\nKeeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'lazy-loading-test-edge-error.png' });
  } finally {
    await browser.close();
  }
}

testLazyLoading().catch(console.error);


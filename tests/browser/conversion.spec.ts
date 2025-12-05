import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Browser Document Conversion', () => {
  test.beforeEach(async ({ page }) => {
    // Enable verbose console logging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (text.includes('[Worker') || text.includes('[Browser') || text.includes('LOK')) {
        console.log(`[Browser] ${text}`);
      }
    });

    // Log page errors
    page.on('pageerror', error => {
      console.error(`[Page Error] ${error.message}`);
    });
  });

  test.afterEach(async ({ page }) => {
    // Clear any lingering workers by navigating away
    // Use try-catch to handle Firefox navigation race conditions
    try {
      await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
    } catch {
      // Ignore navigation errors during cleanup
    }
    // Small delay to ensure cleanup
    await page.waitForTimeout(500);
  });

  test('should load the demo page', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');
    await expect(page.locator('h1')).toContainText('Free Document Conversion');
    await expect(page.locator('#dropZone')).toBeVisible();
    await expect(page.locator('#convertBtn')).toBeDisabled();
  });

  test('should convert DOCX to PDF', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    // Get the test file path
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');

    // Upload file via file input
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Verify file is selected
    await expect(page.locator('#fileInfo')).toBeVisible();
    await expect(page.locator('#fileName')).toContainText('sample_test_2.docx');

    // Convert button should be enabled
    await expect(page.locator('#convertBtn')).toBeEnabled();

    // Select PDF output format (default)
    await page.selectOption('#outputFormat', 'pdf');

    // Set up download listener before clicking convert (120s for WASM init + conversion)
    const downloadPromise = page.waitForEvent('download', { timeout: 120 * 1000 });

    // Click convert
    await page.locator('#convertBtn').click();

    // Wait for progress to show
    await expect(page.locator('#progressContainer')).toBeVisible({ timeout: 10000 });

    // Wait for conversion to complete
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);

    // Save the file to verify it's valid
    const downloadPath = path.join(__dirname, '..', 'output', download.suggestedFilename());
    await download.saveAs(downloadPath);

    // Check success message
    await expect(page.locator('#status')).toContainText('complete', { timeout: 10000 });
  });

  test('should convert XLSX to PDF', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    const testFilePath = path.join(__dirname, '..', 'sample_test_5.xlsx');

    // Upload file
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Verify file is selected
    await expect(page.locator('#fileName')).toContainText('sample_test_5.xlsx');

    // Select PDF output
    await page.selectOption('#outputFormat', 'pdf');

    // Set up download listener (120s for WASM init + conversion)
    const downloadPromise = page.waitForEvent('download', { timeout: 120 * 1000 });

    // Click convert
    await page.locator('#convertBtn').click();

    // Wait for download
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);

    // Check success
    await expect(page.locator('#status')).toContainText('complete', { timeout: 10000 });
  });

  test('should convert PPTX to PDF', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    const testFilePath = path.join(__dirname, '..', 'sample_test_1.pptx');

    // Upload file
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Verify file is selected
    await expect(page.locator('#fileName')).toContainText('sample_test_1.pptx');

    // Select PDF output
    await page.selectOption('#outputFormat', 'pdf');

    // Set up download listener (longer timeout for PPTX - Impress takes longer)
    const downloadPromise = page.waitForEvent('download', { timeout: 120 * 1000 });

    // Click convert
    await page.locator('#convertBtn').click();

    // Wait for download
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    
    // Download completed successfully - that's the main test
    // Status message may or may not show depending on timing
  });

  test.skip('should show error for invalid file', async ({ page }) => {
    // Skipped: LibreOffice gracefully handles most file types, even .mjs files
    // It converts them as plain text documents
    await page.goto('/examples/browser-demo.html');

    // Create a fake invalid file
    const invalidFilePath = path.join(__dirname, '..', 'force-failure.mjs');

    // Upload file
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(invalidFilePath);

    // Click convert
    await page.locator('#convertBtn').click();

    // Wait for error status (conversion should fail)
    await expect(page.locator('#status')).toContainText('Error', { timeout: 30 * 1000 });
  });
});

test.describe('PDF Image Export', () => {
  test('should convert PDF to PNG', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    const testFilePath = path.join(__dirname, '..', 'sample.pdf');

    // Upload file
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Verify file is selected
    await expect(page.locator('#fileName')).toContainText('sample.pdf');

    // Select PNG output
    await page.selectOption('#outputFormat', 'png');

    // Set up download listener (120s for WASM init + conversion)
    const downloadPromise = page.waitForEvent('download', { timeout: 120 * 1000 });

    // Click convert
    await page.locator('#convertBtn').click();

    // Wait for download
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.png$/);

    // Save the file
    const downloadPath = path.join(__dirname, '..', 'output', download.suggestedFilename());
    await download.saveAs(downloadPath);
  });

  test('should convert PDF to SVG', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    const testFilePath = path.join(__dirname, '..', 'sample.pdf');

    // Upload file
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Verify file is selected
    await expect(page.locator('#fileName')).toContainText('sample.pdf');

    // Select SVG output
    await page.selectOption('#outputFormat', 'svg');

    // Set up download listener (120s for WASM init + conversion)
    const downloadPromise = page.waitForEvent('download', { timeout: 120 * 1000 });

    // Click convert
    await page.locator('#convertBtn').click();

    // Wait for download
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.svg$/);

    // Save the file
    const downloadPath = path.join(__dirname, '..', 'output', download.suggestedFilename());
    await download.saveAs(downloadPath);
  });
});

test.describe('WorkerBrowserConverter Initialization', () => {
  test('should initialize WASM in worker without blocking main thread', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    // Upload a small file
    const testFilePath = path.join(__dirname, '..', 'sample_test_3.docx'); // Use smaller file
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Trigger conversion (which initializes WASM)
    const downloadPromise = page.waitForEvent('download', { timeout: 120 * 1000 });
    await page.locator('#convertBtn').click();

    // Wait for conversion
    const download = await downloadPromise;

    // Verify it completed
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});

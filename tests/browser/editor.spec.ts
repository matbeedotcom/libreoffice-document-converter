import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Browser Editor API', () => {
  test.beforeEach(async ({ page }) => {
    // Enable verbose console logging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (text.includes('[LOK]') || text.includes('Progress') || text.includes('Structure')) {
        console.log(`[Browser] ${text}`);
      }
    });

    // Log page errors
    page.on('pageerror', error => {
      console.error(`[Page Error] ${error.message}`);
    });
  });

  test.afterEach(async ({ page }) => {
    try {
      await page.goto('about:blank');
      await page.waitForTimeout(500);
    } catch {
      // Ignore navigation errors during cleanup
    }
  });

  test('should load the editor test page', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    await expect(page.locator('h1')).toContainText('Editor API');
    await expect(page.locator('#runAllTests')).toBeVisible();
  });

  test('should open and inspect a DOCX file with WriterEditor', async ({ page }) => {
    await page.goto('/examples/editor-test.html');

    // Get the test file path
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');

    // Upload file via file input
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Verify file is selected
    await expect(page.locator('#fileName')).toContainText('sample_test_2.docx');
    await expect(page.locator('#runTests')).toBeEnabled();

    // Click run tests (120s timeout for WASM init)
    await page.locator('#runTests').click();

    // Wait for WASM initialization
    await expect(page.locator('#status')).toContainText(/initialized|Loading|Opening/, { timeout: 120000 });

    // Wait for tests to complete
    await expect(page.locator('#status')).toContainText(/passed|failed/, { timeout: 60000 });

    // Check test results - should have passed tests
    const passedTests = await page.locator('.test-result.pass').count();
    expect(passedTests).toBeGreaterThan(0);

    // Verify specific tests passed
    await expect(page.locator('.test-result:has-text("Open document")')).toHaveClass(/pass/);
    await expect(page.locator('.test-result:has-text("Get document type")')).toHaveClass(/pass/);
    await expect(page.locator('.test-result:has-text("Get structure")')).toHaveClass(/pass/);
  });

  test('should open and inspect an XLSX file with CalcEditor', async ({ page }) => {
    await page.goto('/examples/editor-test.html');

    const testFilePath = path.join(__dirname, '..', 'sample_test_5.xlsx');
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    await expect(page.locator('#fileName')).toContainText('sample_test_5.xlsx');
    await page.locator('#runTests').click();

    // Wait for completion (120s for init + tests)
    await expect(page.locator('#status')).toContainText(/passed|failed/, { timeout: 180000 });

    // Check Calc-specific tests passed
    const passedTests = await page.locator('.test-result.pass').count();
    expect(passedTests).toBeGreaterThan(0);

    await expect(page.locator('.test-result:has-text("Open document")')).toHaveClass(/pass/);
    await expect(page.locator('.test-result:has-text("Get structure")')).toHaveClass(/pass/);
  });

  test('should open and inspect a PPTX file with ImpressEditor', async ({ page }) => {
    await page.goto('/examples/editor-test.html');

    const testFilePath = path.join(__dirname, '..', 'sample_test_4.pptx');
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    await expect(page.locator('#fileName')).toContainText('sample_test_4.pptx');
    await page.locator('#runTests').click();

    // Wait for completion
    await expect(page.locator('#status')).toContainText(/passed|failed/, { timeout: 180000 });

    // Check tests passed
    const passedTests = await page.locator('.test-result.pass').count();
    expect(passedTests).toBeGreaterThan(0);

    await expect(page.locator('.test-result:has-text("Open document")')).toHaveClass(/pass/);
    await expect(page.locator('.test-result:has-text("Get structure")')).toHaveClass(/pass/);
  });

  test('should open and inspect a PDF file with DrawEditor', async ({ page }) => {
    await page.goto('/examples/editor-test.html');

    const testFilePath = path.join(__dirname, '..', 'sample.pdf');
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    await expect(page.locator('#fileName')).toContainText('sample.pdf');
    await page.locator('#runTests').click();

    // Wait for completion
    await expect(page.locator('#status')).toContainText(/passed|failed/, { timeout: 180000 });

    // Check tests passed
    const passedTests = await page.locator('.test-result.pass').count();
    expect(passedTests).toBeGreaterThan(0);

    await expect(page.locator('.test-result:has-text("Open document")')).toHaveClass(/pass/);
    await expect(page.locator('.test-result:has-text("Get structure")')).toHaveClass(/pass/);
  });
});

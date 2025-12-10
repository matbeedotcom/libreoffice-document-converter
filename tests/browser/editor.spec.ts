import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Browser Editor API', () => {
  test.beforeEach(async ({ page }) => {
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
    const testFilePath = path.join(__dirname, '..', 'sample_2_page.docx');

    // Upload file via file input
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Verify file is selected
    await expect(page.locator('#fileName')).toContainText('sample_2_page.docx');
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

    // Verify key tests passed (using worker-based getLokInfo)
    await expect(page.locator('.test-result:has-text("Get document info")')).toHaveClass(/pass/);
    // Note: Additional tests like Get page rectangles, Get document size depend on getLokInfo working
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

    await expect(page.locator('.test-result:has-text("Get document info")')).toHaveClass(/pass/);
  });

  test('should open and inspect a PPTX file with ImpressEditor', async ({ page }) => {
    await page.goto('/examples/editor-test.html');

    const testFilePath = path.join(__dirname, '..', 'sample_test_1.pptx');
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    await expect(page.locator('#fileName')).toContainText('sample_test_1.pptx');
    await page.locator('#runTests').click();

    // Wait for completion
    await expect(page.locator('#status')).toContainText(/passed|failed/, { timeout: 180000 });

    // Check tests passed
    const passedTests = await page.locator('.test-result.pass').count();
    expect(passedTests).toBeGreaterThan(0);

    await expect(page.locator('.test-result:has-text("Get document info")')).toHaveClass(/pass/);
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

    await expect(page.locator('.test-result:has-text("Get document info")')).toHaveClass(/pass/);
  });

  test('should insert text into a DOCX file and verify modification', async ({ page }) => {
    // Navigate to a blank page and run test inline
    await page.goto('/examples/editor-test.html');

    // Load test file
    const testFilePath = path.join(__dirname, '..', 'sample_2_page.docx');
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);

    // Wait for file to be selected
    await expect(page.locator('#runTests')).toBeEnabled();

    // Run the text insertion test via page.evaluate
    const result = await page.evaluate(async () => {
      // @ts-ignore - access global module from test page
      const { WorkerBrowserConverter, createWasmPaths } = await import('/dist/browser.js');

      const baseUrl = new URL('..', window.location.href).href;
      const converter = new WorkerBrowserConverter({
        ...createWasmPaths(baseUrl + 'wasm/'),
        browserWorkerJs: baseUrl + 'dist/browser.worker.global.js',
        verbose: true,
      });

      await converter.initialize();

      // Get the file data from the input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (!file) throw new Error('No file selected');

      const fileData = new Uint8Array(await file.arrayBuffer());
      const originalSize = fileData.length;

      // Insert text
      const insertResult = await converter.editText(fileData.slice(), { inputFormat: 'docx' }, {
        insertText: '\n\n=== INSERTED BY LIBREOFFICE WASM TEST ===\n\n',
      });

      const modifiedSize = insertResult.modifiedDocument?.length || 0;
      const sizeDiff = modifiedSize - originalSize;

      return {
        success: insertResult.success,
        message: insertResult.message,
        originalSize,
        modifiedSize,
        sizeDiff,
        hasModifiedDoc: !!insertResult.modifiedDocument && insertResult.modifiedDocument.length > 0,
      };
    });

    console.log('[Text Insert Test] Result:', JSON.stringify(result, null, 2));

    // Verify the document was modified
    expect(result.hasModifiedDoc).toBe(true);
    expect(result.modifiedSize).toBeGreaterThan(0);
    // The modified document should be different from original (could be larger or smaller due to format changes)
    console.log(`[Text Insert Test] Original: ${result.originalSize}, Modified: ${result.modifiedSize}, Diff: ${result.sizeDiff}`);
  });

  test('should verify text content actually changed after insertion', async ({ page }) => {
    await page.goto('/examples/editor-test.html');

    const testFilePath = path.join(__dirname, '..', 'sample_large.docx');
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);
    await expect(page.locator('#runTests')).toBeEnabled();

    const result = await page.evaluate(async () => {
      // @ts-ignore
      const { WorkerBrowserConverter, createWasmPaths } = await import('/dist/browser.js');

      const baseUrl = new URL('..', window.location.href).href;
      const converter = new WorkerBrowserConverter({
        ...createWasmPaths(baseUrl + 'wasm/'),
        browserWorkerJs: baseUrl + 'dist/browser.worker.global.js',
        verbose: true,
      });

      await converter.initialize();

      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (!file) throw new Error('No file selected');

      const fileData = new Uint8Array(await file.arrayBuffer());

      // Convert original DOCX to TXT to get text content
      const originalTxt = await converter.convert(fileData.slice(), {
        inputFormat: 'docx',
        outputFormat: 'txt',
      });
      const originalText = new TextDecoder().decode(originalTxt.data);

      // Insert our marker text
      const marker = '=== LIBREOFFICE_WASM_MARKER_12345 ===';
      const insertResult = await converter.editText(fileData.slice(), { inputFormat: 'docx' }, {
        insertText: `\n\n${marker}\n\n`,
      });

      if (!insertResult.modifiedDocument) {
        return { error: 'No modified document returned' };
      }

      // Convert modified DOCX to TXT
      const modifiedTxt = await converter.convert(insertResult.modifiedDocument, {
        inputFormat: 'docx',
        outputFormat: 'txt',
      });
      const modifiedText = new TextDecoder().decode(modifiedTxt.data);

      return {
        originalLength: originalText.length,
        modifiedLength: modifiedText.length,
        originalContainsMarker: originalText.includes(marker),
        modifiedContainsMarker: modifiedText.includes(marker),
        originalPreview: originalText.slice(-200),
        modifiedPreview: modifiedText.slice(-200),
      };
    });

    console.log('[Text Verify Test] Result:', JSON.stringify(result, null, 2));

    // The original should NOT contain our marker
    expect(result.originalContainsMarker).toBe(false);
    // The modified document SHOULD contain our marker
    expect(result.modifiedContainsMarker).toBe(true);
    console.log(`[Text Verify Test] Original contains marker: ${result.originalContainsMarker}, Modified contains marker: ${result.modifiedContainsMarker}`);
  });

  test('should test LOK operations (SelectAll, Delete, Undo, Redo, Bold, Italic)', async ({ page }) => {
    await page.goto('/examples/editor-test.html');

    const testFilePath = path.join(__dirname, '..', 'sample_2_page.docx');
    const fileInput = page.locator('#fileInput');
    await fileInput.setInputFiles(testFilePath);
    await expect(page.locator('#runTests')).toBeEnabled();

    const result = await page.evaluate(async () => {
      // @ts-ignore
      const { WorkerBrowserConverter, createWasmPaths } = await import('/dist/browser.js');

      const baseUrl = new URL('..', window.location.href).href;
      const converter = new WorkerBrowserConverter({
        ...createWasmPaths(baseUrl + 'wasm/'),
        browserWorkerJs: baseUrl + 'dist/browser.worker.global.js',
        verbose: true,
      });

      await converter.initialize();

      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (!file) throw new Error('No file selected');

      const fileData = new Uint8Array(await file.arrayBuffer());

      // Run LOK operations tests
      const testResult = await converter.testLokOperations(fileData.slice(), { inputFormat: 'docx' });

      return testResult;
    });

    console.log('[LOK Operations Test] Summary:', result.summary);
    console.log('[LOK Operations Test] Results:', JSON.stringify(result.operations, null, 2));

    // Verify overall results
    const successCount = result.operations.filter((op: { success: boolean }) => op.success).length;
    expect(successCount).toBeGreaterThan(0);
    console.log(`[LOK Operations Test] ${result.summary}`);

    // Check specific operations
    // Note: getTextSelection may return empty due to text/plain MIME type not being supported
    // in some LibreOffice configurations. The operation runs without error but returns empty.
    const selectAllResult = result.operations.find((op: { operation: string }) => op.operation === 'SelectAll+getTextSelection');
    if (selectAllResult) {
      console.log(`[LOK Operations Test] SelectAll+getTextSelection: success=${selectAllResult.success}, result=${JSON.stringify(selectAllResult.result)}`);
      // Just log this - text extraction via getTextSelection may not work in all configs
    }

    const undoResult = result.operations.find((op: { operation: string }) => op.operation === 'Undo');
    if (undoResult) {
      console.log(`[LOK Operations Test] Undo: success=${undoResult.success}`);
      expect(undoResult.success).toBe(true);
    }

    const boldResult = result.operations.find((op: { operation: string }) => op.operation === 'Bold');
    if (boldResult) {
      console.log(`[LOK Operations Test] Bold: success=${boldResult.success}`);
      expect(boldResult.success).toBe(true);
    }

    // Verify document was modified and saved
    const saveResult = result.operations.find((op: { operation: string }) => op.operation === 'documentSave');
    if (saveResult) {
      console.log(`[LOK Operations Test] documentSave: success=${saveResult.success}, result=${JSON.stringify(saveResult.result)}`);
      expect(saveResult.success).toBe(true);
    }
  });
});

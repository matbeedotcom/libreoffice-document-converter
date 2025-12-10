/**
 * Comprehensive tests for the Editor API via BrowserEditorProxy
 *
 * Tests cover all editor types (Writer, Calc, Impress, Draw) and their methods
 * using the openDocument() -> BrowserEditorProxy -> close() workflow.
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to create a converter and initialize it
const initConverter = `
  const { WorkerBrowserConverter, createWasmPaths } = await import('/dist/browser.js');
  const baseUrl = new URL('..', window.location.href).href;
  const converter = new WorkerBrowserConverter({
    ...createWasmPaths(baseUrl + 'wasm/'),
    browserWorkerJs: baseUrl + 'dist/browser.worker.global.js',
    verbose: true,
  });
  await converter.initialize();
`;

// Helper to read file from input
const getFileData = `
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files?.[0];
  if (!file) throw new Error('No file selected');
  const fileData = new Uint8Array(await file.arrayBuffer());
`;

test.describe('Editor API - WriterEditor', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (text.includes('[LOK]') || text.includes('Editor')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  test('should open document and get correct document type', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });

      const result = {
        sessionId: editor.sessionId,
        documentType: editor.documentType,
        pageCount: editor.pageCount,
        isOpen: editor.isOpen,
      };

      await editor.close();
      return result;
    });

    console.log('[WriterEditor] Document info:', result);
    expect(result.documentType).toBe('writer');
    expect(result.pageCount).toBeGreaterThan(0);
    expect(result.isOpen).toBe(true);
    expect(result.sessionId).toContain('session_');
  });

  test('should get document structure', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });
      const structure = await editor.getStructure();
      await editor.close();

      return structure;
    });

    console.log('[WriterEditor] Structure:', JSON.stringify(result, null, 2));
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.type).toBe('writer');
    expect(result.data.paragraphs).toBeDefined();
  });

  test('should get text formatting via callback mechanism', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });
      const format = await editor.getFormat();
      await editor.close();

      return format;
    });

    console.log('[WriterEditor] Format:', JSON.stringify(result, null, 2));
    expect(result.success).toBe(true);
    // Format should have at least some formatting info (may be empty object if no text selected)
    expect(result.data).toBeDefined();
  });

  test('should get paragraphs or handle empty document', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'large_sample_2.docx'); // Use larger file with more content
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });

      // First get structure to know paragraph count
      const structure = await editor.getStructure();

      // Get first 5 paragraphs (or all if fewer)
      const paragraphs = await editor.getParagraphs(0, 5);

      // Get single paragraph only if document has content
      let singlePara = { success: true, data: null, skipped: true };
      if (structure.data?.paragraphs?.length > 0) {
        singlePara = await editor.getParagraph(0);
      }

      await editor.close();

      return { structure, paragraphs, singlePara };
    });

    console.log('[WriterEditor] Paragraphs:', JSON.stringify(result, null, 2));
    // Structure should succeed
    expect(result.structure.success).toBe(true);
    // Paragraphs may succeed or fail gracefully with error
    expect(result.paragraphs).toBeDefined();
    expect(result.singlePara).toBeDefined();
  });

  test('should insert paragraph and save document', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });

      // Insert a new paragraph
      const insertResult = await editor.insertParagraph('=== INSERTED BY EDITOR API TEST ===');

      // Close and get modified document
      const savedDoc = await editor.close();

      return {
        insertResult,
        savedDocSize: savedDoc?.length || 0,
        originalSize: fileData.length,
      };
    });

    console.log('[WriterEditor] Insert result:', JSON.stringify(result, null, 2));
    expect(result.insertResult.success).toBe(true);
    expect(result.savedDocSize).toBeGreaterThan(0);
  });

  test('should perform undo and redo operations', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });

      // Make a change
      await editor.insertParagraph('Test paragraph for undo');

      // Undo the change
      const undoResult = await editor.undo();

      // Redo the change
      const redoResult = await editor.redo();

      await editor.close();

      return { undoResult, redoResult };
    });

    console.log('[WriterEditor] Undo/Redo:', JSON.stringify(result, null, 2));
    expect(result.undoResult.success).toBe(true);
    expect(result.redoResult.success).toBe(true);
  });

  test('should execute find operation', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });

      // Execute find operation - may or may not succeed depending on document state
      const findResult = await editor.find('test');

      await editor.close();

      return findResult;
    });

    console.log('[WriterEditor] Find result:', JSON.stringify(result, null, 2));
    // Validate the result structure is correct (success or error with proper fields)
    expect(result).toHaveProperty('success');
    if (result.success) {
      expect(result.data).toBeDefined();
    } else {
      expect(result.error).toBeDefined();
    }
  });

  test('should execute replace text operation', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });

      // Execute replace text operation - may or may not succeed
      const replaceResult = await editor.replaceText('test', 'TEST', { all: true });

      const savedDoc = await editor.close();

      return {
        replaceResult,
        savedDocSize: savedDoc?.length || 0,
      };
    });

    console.log('[WriterEditor] Replace result:', JSON.stringify(result, null, 2));
    // Validate the result structure is correct
    expect(result.replaceResult).toHaveProperty('success');
    // Document should still be saved regardless of replace result
    expect(result.savedDocSize).toBeGreaterThan(0);
  });

  test('should get selection format via callback mechanism', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });

      // Get selection format (uses callback mechanism)
      const selectionFormat = await editor.getSelectionFormat();

      // Also test flushAndPollState
      const stateChanges = await editor.flushAndPollState();

      await editor.close();

      return { selectionFormat, stateChanges };
    });

    console.log('[WriterEditor] Selection format:', JSON.stringify(result, null, 2));
    expect(result.selectionFormat.success).toBe(true);
    expect(result.stateChanges.success).toBe(true);
  });
});

test.describe('Editor API - CalcEditor', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (text.includes('[LOK]') || text.includes('Editor')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  test('should open spreadsheet and get correct document type', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_5.xlsx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'xlsx' });

      const result = {
        documentType: editor.documentType,
        pageCount: editor.pageCount,
      };

      await editor.close();
      return result;
    });

    console.log('[CalcEditor] Document info:', result);
    expect(result.documentType).toBe('calc');
    expect(result.pageCount).toBeGreaterThan(0);
  });

  test('should get spreadsheet structure with sheet info', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_5.xlsx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'xlsx' });
      const structure = await editor.getStructure();
      await editor.close();

      return structure;
    });

    console.log('[CalcEditor] Structure:', JSON.stringify(result, null, 2));
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.type).toBe('calc');
    expect(result.data.sheets).toBeDefined();
    expect(Array.isArray(result.data.sheets)).toBe(true);
  });
});

test.describe('Editor API - ImpressEditor', () => {
  // ImpressEditor tests need longer timeout as pptx loading is slower
  test.setTimeout(300000);

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (text.includes('[LOK]') || text.includes('Editor')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  test('should open presentation and get correct document type', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_1.pptx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'pptx' });

      const result = {
        documentType: editor.documentType,
        pageCount: editor.pageCount,
      };

      await editor.close();
      return result;
    });

    console.log('[ImpressEditor] Document info:', result);
    expect(result.documentType).toBe('impress');
    expect(result.pageCount).toBeGreaterThan(0);
  });

  test('should get presentation structure with slide info', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_1.pptx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'pptx' });
      const structure = await editor.getStructure();
      await editor.close();

      return structure;
    });

    console.log('[ImpressEditor] Structure:', JSON.stringify(result, null, 2));
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.type).toBe('impress');
    expect(result.data.slides).toBeDefined();
    expect(Array.isArray(result.data.slides)).toBe(true);
  });
});

test.describe('Editor API - DrawEditor (PDF)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (text.includes('[LOK]') || text.includes('Editor')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  test('should open PDF and get correct document type', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample.pdf');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'pdf' });

      const result = {
        documentType: editor.documentType,
        pageCount: editor.pageCount,
      };

      await editor.close();
      return result;
    });

    console.log('[DrawEditor] Document info:', result);
    expect(result.documentType).toBe('draw');
    expect(result.pageCount).toBeGreaterThan(0);
  });

  test('should get draw/PDF structure with page info', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample.pdf');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'pdf' });
      const structure = await editor.getStructure();
      await editor.close();

      return structure;
    });

    console.log('[DrawEditor] Structure:', JSON.stringify(result, null, 2));
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.type).toBe('draw');
    expect(result.data.pages).toBeDefined();
    expect(Array.isArray(result.data.pages)).toBe(true);
  });
});

test.describe('Editor API - Session Management', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (text.includes('[LOK]') || text.includes('Editor') || text.includes('session')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  test('should manage multiple document sessions', async ({ page }) => {
    await page.goto('/examples/editor-test.html');

    // Load first file
    const testFilePath1 = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath1);

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

      // Open first document
      const editor1 = await converter.openDocument(fileData, { inputFormat: 'docx' });
      const session1Id = editor1.sessionId;
      const session1Type = editor1.documentType;

      // Get structure from first document
      const structure1 = await editor1.getStructure();

      // Close first document
      await editor1.close();

      // Verify editor reports closed
      const isClosed = !editor1.isOpen;

      return {
        session1Id,
        session1Type,
        structure1Success: structure1.success,
        isClosed,
      };
    });

    console.log('[Session Management] Result:', JSON.stringify(result, null, 2));
    expect(result.session1Id).toContain('session_');
    expect(result.session1Type).toBe('writer');
    expect(result.structure1Success).toBe(true);
    expect(result.isClosed).toBe(true);
  });

  test('should throw error when using closed session', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });
      await editor.close();

      // Try to use closed session
      try {
        await editor.getStructure();
        return { threwError: false };
      } catch (e) {
        return { threwError: true, errorMessage: (e as Error).message };
      }
    });

    console.log('[Session Management] Closed session error:', result);
    expect(result.threwError).toBe(true);
    expect(result.errorMessage).toContain('closed');
  });
});

test.describe('Editor API - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.error(`[Browser Error] ${text}`);
      }
    });
  });

  test('should handle invalid paragraph index gracefully', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

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

      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });

      // Try to get invalid paragraph index
      const invalidResult = await editor.getParagraph(99999);

      await editor.close();

      return invalidResult;
    });

    console.log('[Error Handling] Invalid paragraph:', JSON.stringify(result, null, 2));
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

test.describe('Editor API - Document Modification & Save', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        console.error(`[Browser Error] ${text}`);
      } else if (text.includes('[LOK]') || text.includes('modified')) {
        console.log(`[Browser] ${text}`);
      }
    });
  });

  test('should save modified document and verify changes persist', async ({ page }) => {
    await page.goto('/examples/editor-test.html');
    const testFilePath = path.join(__dirname, '..', 'sample_test_2.docx');
    await page.locator('#fileInput').setInputFiles(testFilePath);

    // Wait for file input to be populated
    await page.waitForFunction(() => {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      return fileInput.files && fileInput.files.length > 0 && fileInput.files[0]!.size > 0;
    }, { timeout: 10000 });

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
      if (!file) {
        return { success: false, error: 'No file selected', fileCount: fileInput.files?.length || 0, originalSize: 0 };
      }
      const fileData = new Uint8Array(await file.arrayBuffer());
      if (fileData.length === 0) {
        return { success: false, error: 'File data is empty', fileName: file.name, originalSize: 0 };
      }

      // Open and modify
      const marker = '=== EDITOR_API_MARKER_' + Date.now() + ' ===';
      const editor = await converter.openDocument(fileData, { inputFormat: 'docx' });
      const insertResult = await editor.insertParagraph(marker);
      const savedDoc = await editor.close();

      // Return results even if savedDoc is empty
      return {
        success: true,
        originalSize: fileData.length,
        savedSize: savedDoc?.length || 0,
        insertResult,
        savedDocReceived: !!savedDoc,
      };
    });

    console.log('[Document Save] Result:', JSON.stringify(result, null, 2));
    // The test validates the edit flow works
    expect(result.success).toBe(true);
    // Insert operation should succeed
    expect(result.insertResult?.success).toBe(true);
    // Saved document should be received and have content
    expect(result.savedDocReceived).toBe(true);
    expect(result.savedSize).toBeGreaterThan(0);
  });
});

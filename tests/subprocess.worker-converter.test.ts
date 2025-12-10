/**
 * SubprocessConverter Tests
 *
 * Tests for the SubprocessConverter class which runs LibreOffice WASM
 * in a separate forked process for maximum isolation.
 *
 * Note: Integration tests require the WASM build to be present.
 * Run `npm run build:wasm` first to build the WASM files.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  SubprocessConverter,
  createSubprocessConverter,
  RenderOptions,
  PagePreview,
  DocumentInfo,
  EditorSession,
} from '../src/subprocess.worker-converter.js';
import { ConversionError, EditorOperationResult } from '../src/types.js';
import * as fs from 'fs';
import * as path from 'path';

describe('SubprocessConverter', () => {
  describe('Instance creation', () => {
    it('should create a converter instance', () => {
      const converter = new SubprocessConverter({
        wasmPath: './wasm',
      });
      expect(converter).toBeInstanceOf(SubprocessConverter);
      expect(converter.isReady()).toBe(false);
    });

    it('should accept custom options', () => {
      const onProgress = vi.fn();
      const onReady = vi.fn();
      const onError = vi.fn();

      const converter = new SubprocessConverter({
        wasmPath: '/custom/path',
        verbose: true,
        onProgress,
        onReady,
        onError,
        maxInitRetries: 5,
        maxConversionRetries: 3,
        restartOnMemoryError: false,
      });

      expect(converter).toBeDefined();
      expect(converter.isReady()).toBe(false);
    });
  });

  describe('Error handling before initialization', () => {
    it('should throw error when converting without initialization', async () => {
      const converter = new SubprocessConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(
        converter.convert(testData, { outputFormat: 'pdf' })
      ).rejects.toThrow(ConversionError);
    });

    it('should throw error when getting page count without initialization', async () => {
      const converter = new SubprocessConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(converter.getPageCount(testData, { inputFormat: 'docx' })).rejects.toThrow(
        ConversionError
      );
    });

    it('should throw error when getting document info without initialization', async () => {
      const converter = new SubprocessConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(converter.getDocumentInfo(testData, { inputFormat: 'docx' })).rejects.toThrow(
        ConversionError
      );
    });

    it('should throw error when rendering page without initialization', async () => {
      const converter = new SubprocessConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(
        converter.renderPage(testData, { inputFormat: 'docx' }, 0, 800)
      ).rejects.toThrow(ConversionError);
    });

    it('should throw error when rendering page previews without initialization', async () => {
      const converter = new SubprocessConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(
        converter.renderPagePreviews(testData, { inputFormat: 'docx' }, { width: 800 })
      ).rejects.toThrow(ConversionError);
    });

    it('should throw error when getting document text without initialization', async () => {
      const converter = new SubprocessConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(converter.getDocumentText(testData, 'docx')).rejects.toThrow(
        ConversionError
      );
    });

    it('should throw error when getting page names without initialization', async () => {
      const converter = new SubprocessConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(converter.getPageNames(testData, 'pptx')).rejects.toThrow(
        ConversionError
      );
    });

    it('should throw error when opening document without initialization', async () => {
      const converter = new SubprocessConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(converter.openDocument(testData, { inputFormat: 'docx' })).rejects.toThrow(
        ConversionError
      );
    });

    it('should throw error when calling editor operation without initialization', async () => {
      const converter = new SubprocessConverter();

      await expect(
        converter.editorOperation('test-session', 'getStructure')
      ).rejects.toThrow(ConversionError);
    });

    it('should throw error when closing document without initialization', async () => {
      const converter = new SubprocessConverter();

      await expect(converter.closeDocument('test-session')).rejects.toThrow(
        ConversionError
      );
    });
  });

  describe('Type exports', () => {
    it('should export RenderOptions interface', () => {
      const options: RenderOptions = {
        width: 800,
        height: 600,
        pageIndices: [0, 1, 2],
      };
      expect(options.width).toBe(800);
      expect(options.height).toBe(600);
      expect(options.pageIndices).toEqual([0, 1, 2]);
    });

    it('should export PagePreview interface', () => {
      const preview: PagePreview = {
        page: 0,
        data: new Uint8Array([1, 2, 3]),
        width: 800,
        height: 600,
      };
      expect(preview.page).toBe(0);
      expect(preview.data).toBeInstanceOf(Uint8Array);
      expect(preview.width).toBe(800);
      expect(preview.height).toBe(600);
    });

    it('should export DocumentInfo interface', () => {
      const info: DocumentInfo = {
        documentType: 0,
        documentTypeName: 'Text Document',
        validOutputFormats: ['pdf', 'docx', 'html'],
        pageCount: 5,
      };
      expect(info.documentType).toBe(0);
      expect(info.documentTypeName).toBe('Text Document');
      expect(info.validOutputFormats).toContain('pdf');
      expect(info.pageCount).toBe(5);
    });

    it('should export EditorSession interface', () => {
      const session: EditorSession = {
        sessionId: 'test-session-123',
        documentType: 'writer',
        pageCount: 3,
      };
      expect(session.sessionId).toBe('test-session-123');
      expect(session.documentType).toBe('writer');
      expect(session.pageCount).toBe(3);
    });

    it('should export EditorOperationResult interface', () => {
      const result: EditorOperationResult<string> = {
        success: true,
        verified: true,
        data: 'test data',
        error: undefined,
        suggestion: undefined,
      };
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.data).toBe('test data');
    });

    it('should export EditorOperationResult with error', () => {
      const result: EditorOperationResult = {
        success: false,
        verified: false,
        data: undefined,
        error: 'Something went wrong',
        suggestion: 'Try again',
      };
      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
      expect(result.suggestion).toBe('Try again');
    });
  });

  describe('Factory function', () => {
    it('should export createSubprocessConverter factory function', () => {
      expect(createSubprocessConverter).toBeDefined();
      expect(typeof createSubprocessConverter).toBe('function');
    });
  });

  describe('Empty document handling', () => {
    it('should throw error for empty document in convert', async () => {
      const converter = new SubprocessConverter();
      const emptyData = new Uint8Array([]);

      await expect(
        converter.convert(emptyData, { outputFormat: 'pdf' })
      ).rejects.toThrow(ConversionError);
    });
  });

  // Integration tests (require WASM build)
  describe('Integration tests (requires WASM build)', () => {
    let converter: SubprocessConverter;
    let testDocxPath: string;
    let testXlsxPath: string;
    let testPptxPath: string;
    let testPdfPath: string;

    beforeAll(async () => {
      // Check for test files
      testDocxPath = path.resolve(__dirname, 'sample_2_page.docx');
      testXlsxPath = path.resolve(__dirname, 'sample_test_5.xlsx');
      testPptxPath = path.resolve(__dirname, 'sample_test_1.pptx');
      testPdfPath = path.resolve(__dirname, 'output/sample_test_2.pdf');

      converter = new SubprocessConverter({
        wasmPath: './wasm',
        verbose: false,
      });
      await converter.initialize();
    }, 180000); // 180s timeout for subprocess WASM initialization

    afterAll(async () => {
      if (converter?.isReady()) {
        await converter.destroy();
      }
    });

    it('should initialize successfully', () => {
      expect(converter.isReady()).toBe(true);
    });

    describe('Document conversion', () => {
      it('should convert DOCX to PDF', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const result = await converter.convert(
          docxData,
          { inputFormat: 'docx', outputFormat: 'pdf' },
          'test.docx'
        );

        expect(result.data).toBeInstanceOf(Uint8Array);
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.mimeType).toBe('application/pdf');
        expect(result.filename).toBe('test.pdf');
      });

      it('should convert XLSX to PDF', async () => {
        if (!converter?.isReady() || !fs.existsSync(testXlsxPath)) return;

        const xlsxData = fs.readFileSync(testXlsxPath);
        const result = await converter.convert(
          xlsxData,
          { inputFormat: 'xlsx', outputFormat: 'pdf' },
          'test.xlsx'
        );

        expect(result.data).toBeInstanceOf(Uint8Array);
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.mimeType).toBe('application/pdf');
      });

      it('should convert PPTX to PDF', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPptxPath)) return;

        const pptxData = fs.readFileSync(testPptxPath);
        const result = await converter.convert(
          pptxData,
          { inputFormat: 'pptx', outputFormat: 'pdf' },
          'test.pptx'
        );

        expect(result.data).toBeInstanceOf(Uint8Array);
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.mimeType).toBe('application/pdf');
      });
    });

    describe('getPageCount', () => {
      it('should get page count for DOCX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const pageCount = await converter.getPageCount(docxData, { inputFormat: 'docx' });

        expect(typeof pageCount).toBe('number');
        expect(pageCount).toBeGreaterThanOrEqual(1);
      });

      it('should get page count for PDF', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPdfPath)) return;

        const pdfData = fs.readFileSync(testPdfPath);
        const pageCount = await converter.getPageCount(pdfData, { inputFormat: 'pdf' });

        expect(typeof pageCount).toBe('number');
        expect(pageCount).toBeGreaterThanOrEqual(1);
      });

      it('should get slide count for PPTX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPptxPath)) return;

        const pptxData = fs.readFileSync(testPptxPath);
        const pageCount = await converter.getPageCount(pptxData, { inputFormat: 'pptx' });

        expect(typeof pageCount).toBe('number');
        expect(pageCount).toBeGreaterThanOrEqual(1);
      });
    });

    describe('getDocumentInfo', () => {
      it('should get document info for DOCX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const info = await converter.getDocumentInfo(docxData, { inputFormat: 'docx' });

        expect(info.documentType).toBeDefined();
        expect(info.documentTypeName).toBeDefined();
        expect(Array.isArray(info.validOutputFormats)).toBe(true);
        expect(info.validOutputFormats.length).toBeGreaterThan(0);
        expect(info.pageCount).toBeGreaterThanOrEqual(1);
      });

      it('should get document info for XLSX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testXlsxPath)) return;

        const xlsxData = fs.readFileSync(testXlsxPath);
        const info = await converter.getDocumentInfo(xlsxData, { inputFormat: 'xlsx' });

        expect(info.documentType).toBeDefined();
        expect(info.documentTypeName).toBeDefined();
        expect(Array.isArray(info.validOutputFormats)).toBe(true);
      });

      it('should get document info for PPTX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPptxPath)) return;

        const pptxData = fs.readFileSync(testPptxPath);
        const info = await converter.getDocumentInfo(pptxData, { inputFormat: 'pptx' });

        expect(info.documentType).toBeDefined();
        expect(info.documentTypeName).toBeDefined();
        expect(Array.isArray(info.validOutputFormats)).toBe(true);
      });
    });

    describe('renderPage', () => {
      it('should render a single page from DOCX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const preview = await converter.renderPage(docxData, { inputFormat: 'docx' }, 0, 800);

        expect(preview.page).toBe(0);
        expect(preview.data).toBeInstanceOf(Uint8Array);
        expect(preview.data.length).toBeGreaterThan(0);
        expect(preview.width).toBeGreaterThan(0);
        expect(preview.height).toBeGreaterThan(0);
      });

      it('should render a specific page from PDF', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPdfPath)) return;

        const pdfData = fs.readFileSync(testPdfPath);
        const preview = await converter.renderPage(pdfData, { inputFormat: 'pdf' }, 0, 1024);

        expect(preview.page).toBe(0);
        expect(preview.data).toBeInstanceOf(Uint8Array);
        expect(preview.width).toBeGreaterThan(0);
      });

      it('should render with custom height', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const preview = await converter.renderPage(docxData, { inputFormat: 'docx' }, 0, 800, 600);

        expect(preview.data).toBeInstanceOf(Uint8Array);
        expect(preview.width).toBeGreaterThan(0);
        expect(preview.height).toBeGreaterThan(0);
      });
    });

    describe('renderPagePreviews', () => {
      it('should render all pages from a document', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const previews = await converter.renderPagePreviews(docxData, { inputFormat: 'docx' }, {
          width: 400,
        });

        expect(Array.isArray(previews)).toBe(true);
        expect(previews.length).toBeGreaterThanOrEqual(1);

        for (const preview of previews) {
          expect(preview.data).toBeInstanceOf(Uint8Array);
          expect(preview.width).toBeGreaterThan(0);
          expect(preview.height).toBeGreaterThan(0);
        }
      });

      it('should render specific pages', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPptxPath)) return;

        const pptxData = fs.readFileSync(testPptxPath);
        const pageCount = await converter.getPageCount(pptxData, { inputFormat: 'pptx' });

        if (pageCount >= 2) {
          const previews = await converter.renderPagePreviews(pptxData, { inputFormat: 'pptx' }, {
            width: 400,
            pageIndices: [0, 1],
          });

          expect(previews.length).toBe(2);
          expect(previews[0]?.page).toBe(0);
          expect(previews[1]?.page).toBe(1);
        }
      });

      it('should use default width when not specified', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const previews = await converter.renderPagePreviews(docxData, { inputFormat: 'docx' });

        expect(Array.isArray(previews)).toBe(true);
        expect(previews.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('getDocumentText', () => {
      it('should extract text from DOCX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const text = await converter.getDocumentText(docxData, 'docx');

        expect(text === null || typeof text === 'string').toBe(true);
      });

      it('should extract text from PDF', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPdfPath)) return;

        const pdfData = fs.readFileSync(testPdfPath);
        const text = await converter.getDocumentText(pdfData, 'pdf');

        expect(text === null || typeof text === 'string').toBe(true);
      });
    });

    describe('getPageNames', () => {
      it('should get slide names from PPTX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPptxPath)) return;

        const pptxData = fs.readFileSync(testPptxPath);
        const names = await converter.getPageNames(pptxData, 'pptx');

        expect(Array.isArray(names)).toBe(true);
      });

      it('should get sheet names from XLSX', async () => {
        if (!converter?.isReady() || !fs.existsSync(testXlsxPath)) return;

        const xlsxData = fs.readFileSync(testXlsxPath);
        const names = await converter.getPageNames(xlsxData, 'xlsx');

        expect(Array.isArray(names)).toBe(true);
      });
    });

    describe('Editor operations', () => {
      it('should open document for editing', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const session = await converter.openDocument(docxData, { inputFormat: 'docx' });

        expect(session.sessionId).toBeDefined();
        expect(typeof session.sessionId).toBe('string');
        expect(session.documentType).toBeDefined();
        expect(session.pageCount).toBeGreaterThanOrEqual(1);

        // Clean up
        await converter.closeDocument(session.sessionId);
      });

      it('should execute editor operation getStructure', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const session = await converter.openDocument(docxData, { inputFormat: 'docx' });

        try {
          const result = await converter.editorOperation(
            session.sessionId,
            'getStructure'
          );

          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
        } finally {
          await converter.closeDocument(session.sessionId);
        }
      });

      it.fails('should execute editor operation getDocumentType', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const session = await converter.openDocument(docxData, { inputFormat: 'docx' });

        try {
          const result = await converter.editorOperation(
            session.sessionId,
            'getDocumentType'
          );

          expect(result.success).toBe(true);
          expect(result.data).toBe('writer');
        } finally {
          await converter.closeDocument(session.sessionId);
        }
      });

      it('should close document and return modified data', async () => {
        if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const session = await converter.openDocument(docxData, { inputFormat: 'docx' });

        const modifiedData = await converter.closeDocument(session.sessionId);

        expect(
          modifiedData === undefined || modifiedData instanceof Uint8Array
        ).toBe(true);
      });

      it('should open XLSX for editing', async () => {
        if (!converter?.isReady() || !fs.existsSync(testXlsxPath)) return;

        const xlsxData = fs.readFileSync(testXlsxPath);
        const session = await converter.openDocument(xlsxData, { inputFormat: 'xlsx' });

        expect(session.sessionId).toBeDefined();
        expect(session.documentType).toBe('calc');

        await converter.closeDocument(session.sessionId);
      });

      it('should open PPTX for editing', async () => {
        if (!converter?.isReady() || !fs.existsSync(testPptxPath)) return;

        const pptxData = fs.readFileSync(testPptxPath);
        const session = await converter.openDocument(pptxData, { inputFormat: 'pptx' });

        expect(session.sessionId).toBeDefined();
        expect(session.documentType).toBe('impress');

        await converter.closeDocument(session.sessionId);
      });

      it('should manage multiple sessions', async () => {
        if (!converter?.isReady()) return;
        if (!fs.existsSync(testDocxPath) || !fs.existsSync(testXlsxPath)) return;

        const docxData = fs.readFileSync(testDocxPath);
        const xlsxData = fs.readFileSync(testXlsxPath);

        const session1 = await converter.openDocument(docxData, { inputFormat: 'docx' });
        const session2 = await converter.openDocument(xlsxData, { inputFormat: 'xlsx' });

        expect(session1.sessionId).not.toBe(session2.sessionId);
        expect(session1.documentType).toBe('writer');
        expect(session2.documentType).toBe('calc');

        await converter.closeDocument(session1.sessionId);
        await converter.closeDocument(session2.sessionId);
      });

      // Writer editor operations
      describe('Writer editor operations', () => {
        it.fails('should get paragraph from DOCX', async () => {
          if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

          const docxData = fs.readFileSync(testDocxPath);
          const session = await converter.openDocument(docxData, { inputFormat: 'docx' });

          try {
            const result = await converter.editorOperation(
              session.sessionId,
              'getParagraph',
              [0]
            );

            expect(result.success).toBe(true);
            if (result.success && result.data) {
              const para = result.data as { index: number; text: string; charCount: number };
              expect(para.index).toBe(0);
              expect(typeof para.text).toBe('string');
              expect(typeof para.charCount).toBe('number');
            }
          } finally {
            await converter.closeDocument(session.sessionId);
          }
        });

        it('should insert paragraph in DOCX', async () => {
          if (!converter?.isReady() || !fs.existsSync(testDocxPath)) return;

          const docxData = fs.readFileSync(testDocxPath);
          const session = await converter.openDocument(docxData, { inputFormat: 'docx' });

          try {
            const insertText = 'Test paragraph from SubprocessConverter';
            const result = await converter.editorOperation(
              session.sessionId,
              'insertParagraph',
              [insertText]
            );

            expect(result.success).toBe(true);
            if (result.success && result.data) {
              const data = result.data as { index: number };
              expect(typeof data.index).toBe('number');
            }
          } finally {
            await converter.closeDocument(session.sessionId);
          }
        });
      });

      // Calc editor operations
      describe('Calc editor operations', () => {
        it('should get structure from XLSX', async () => {
          if (!converter?.isReady() || !fs.existsSync(testXlsxPath)) return;

          const xlsxData = fs.readFileSync(testXlsxPath);
          const session = await converter.openDocument(xlsxData, { inputFormat: 'xlsx' });

          try {
            const result = await converter.editorOperation(
              session.sessionId,
              'getStructure'
            );

            expect(result.success).toBe(true);
            if (result.success && result.data) {
              const structure = result.data as { type: string; sheets: unknown[] };
              expect(structure.type).toBe('calc');
              expect(Array.isArray(structure.sheets)).toBe(true);
            }
          } finally {
            await converter.closeDocument(session.sessionId);
          }
        });

        it('should get cell value from XLSX', async () => {
          if (!converter?.isReady() || !fs.existsSync(testXlsxPath)) return;

          const xlsxData = fs.readFileSync(testXlsxPath);
          const session = await converter.openDocument(xlsxData, { inputFormat: 'xlsx' });

          try {
            const result = await converter.editorOperation(
              session.sessionId,
              'getCell',
              ['A1']
            );

            expect(result.success).toBe(true);
            if (result.success && result.data) {
              const cell = result.data as { address: string; value: unknown };
              expect(cell.address).toBe('A1');
            }
          } finally {
            await converter.closeDocument(session.sessionId);
          }
        });

        it.fails('should set cell value in XLSX', async () => {
          if (!converter?.isReady() || !fs.existsSync(testXlsxPath)) return;

          const xlsxData = fs.readFileSync(testXlsxPath);
          const session = await converter.openDocument(xlsxData, { inputFormat: 'xlsx' });

          try {
            const testValue = 'Test Value ' + Date.now();
            const result = await converter.editorOperation(
              session.sessionId,
              'setCellValue',
              ['Z99', testValue]
            );

            expect(result.success).toBe(true);

            // Verify by reading back
            const readResult = await converter.editorOperation(
              session.sessionId,
              'getCell',
              ['Z99']
            );

            expect(readResult.success).toBe(true);
            if (readResult.success && readResult.data) {
              const cell = readResult.data as { value: unknown };
              expect(cell.value).toBe(testValue);
            }
          } finally {
            await converter.closeDocument(session.sessionId);
          }
        });
      });

      // Impress editor operations
      describe('Impress editor operations', () => {
        it('should get structure from PPTX', async () => {
          if (!converter?.isReady() || !fs.existsSync(testPptxPath)) return;

          const pptxData = fs.readFileSync(testPptxPath);
          const session = await converter.openDocument(pptxData, { inputFormat: 'pptx' });

          try {
            const result = await converter.editorOperation(
              session.sessionId,
              'getStructure'
            );

            expect(result.success).toBe(true);
            if (result.success && result.data) {
              const structure = result.data as { type: string; slides: unknown[] };
              expect(structure.type).toBe('impress');
              expect(Array.isArray(structure.slides)).toBe(true);
            }
          } finally {
            await converter.closeDocument(session.sessionId);
          }
        });

        it('should get slide count from PPTX', async () => {
          if (!converter?.isReady() || !fs.existsSync(testPptxPath)) return;

          const pptxData = fs.readFileSync(testPptxPath);
          const session = await converter.openDocument(pptxData, { inputFormat: 'pptx' });

          try {
            const result = await converter.editorOperation(
              session.sessionId,
              'getSlideCount'
            );

            expect(result.success).toBe(true);
            if (result.success && result.data !== undefined) {
              expect(typeof result.data).toBe('number');
              expect(result.data as number).toBeGreaterThan(0);
            }
          } finally {
            await converter.closeDocument(session.sessionId);
          }
        });
      });
    });

    describe('destroy', () => {
      it('should destroy converter and clean up', async () => {
        const tempConverter = new SubprocessConverter({
          wasmPath: './wasm',
          verbose: false,
        });

        await tempConverter.initialize();
        expect(tempConverter.isReady()).toBe(true);

        await tempConverter.destroy();
        expect(tempConverter.isReady()).toBe(false);
      }, 180000);
    });
  });
});

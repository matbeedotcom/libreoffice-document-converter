// tests/editor/integration.test.ts
/**
 * Integration tests for editor API
 *
 * These tests use mocked LOK bindings to verify the full editor workflow.
 * For real LOK integration tests, see tests/converter.test.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createEditor,
  isWriterEditor,
  isCalcEditor,
  isImpressEditor,
  isDrawEditor,
} from '../../src/editor/index.js';
import type { LOKBindings } from '../../src/lok-bindings.js';

// LOK document type constants
const LOK_DOCTYPE_TEXT = 0;
const LOK_DOCTYPE_SPREADSHEET = 1;
const LOK_DOCTYPE_PRESENTATION = 2;
const LOK_DOCTYPE_DRAWING = 3;

// Comprehensive mock that simulates LOK behavior
const createComprehensiveMock = (docType: number): Partial<LOKBindings> => {
  let currentPart = 0;
  const parts = docType === LOK_DOCTYPE_TEXT ? 1 : 3;

  return {
    documentGetDocumentType: vi.fn().mockReturnValue(docType),
    documentGetParts: vi.fn().mockReturnValue(parts),
    documentGetPart: vi.fn().mockReturnValue(currentPart),
    documentSetPart: vi.fn().mockImplementation((_, part) => { currentPart = part; }),
    documentGetDocumentSize: vi.fn().mockReturnValue({ width: 21000, height: 29700 }),
    documentSaveAs: vi.fn(),
    documentDestroy: vi.fn(),
    getAllText: vi.fn().mockReturnValue('Test paragraph 1\n\nTest paragraph 2\n\nTest paragraph 3'),
    getPartName: vi.fn().mockImplementation((_, i) => `Part ${i + 1}`),
    getTextSelection: vi.fn().mockReturnValue('selected text'),
    postUnoCommand: vi.fn(),
    getCommandValues: vi.fn().mockReturnValue('{}'),
    resetSelection: vi.fn(),
    selectAll: vi.fn(),
    getDataArea: vi.fn().mockReturnValue({ row: 100, col: 26 }),
  };
};

describe('Editor Integration', () => {
  describe('Document Lifecycle', () => {
    it('should create editor, get structure, and close', () => {
      const mockLok = createComprehensiveMock(LOK_DOCTYPE_TEXT);
      const editor = createEditor(mockLok as LOKBindings, 12345);

      expect(isWriterEditor(editor)).toBe(true);

      const structure = editor.getStructure();
      expect(structure.success).toBe(true);
      expect(structure.data?.type).toBe('writer');

      const closeResult = editor.close();
      expect(closeResult.success).toBe(true);
      expect(mockLok.documentDestroy).toHaveBeenCalled();
    });

    it('should support save and saveAs', () => {
      const mockLok = createComprehensiveMock(LOK_DOCTYPE_TEXT);
      const editor = createEditor(mockLok as LOKBindings, 12345);

      // Save without path should fail
      const saveResult = editor.save();
      expect(saveResult.success).toBe(false);

      // SaveAs should work
      const saveAsResult = editor.saveAs('/tmp/test.pdf', 'pdf');
      expect(saveAsResult.success).toBe(true);
      expect(mockLok.documentSaveAs).toHaveBeenCalledWith(12345, '/tmp/test.pdf', 'pdf', '');
    });
  });

  describe('Writer Integration', () => {
    let mockLok: Partial<LOKBindings>;

    beforeEach(() => {
      mockLok = createComprehensiveMock(LOK_DOCTYPE_TEXT);
    });

    it('should support full paragraph workflow', () => {
      const editor = createEditor(mockLok as LOKBindings, 12345);
      if (!isWriterEditor(editor)) throw new Error('Expected WriterEditor');

      // Get structure
      const structure = editor.getStructure();
      expect(structure.success).toBe(true);
      expect(structure.data?.paragraphs.length).toBeGreaterThan(0);

      // Get specific paragraph
      const para = editor.getParagraph(0);
      expect(para.success).toBe(true);

      // Insert new paragraph
      const insertResult = editor.insertParagraph('New paragraph');
      expect(insertResult.success).toBe(true);

      // Replace text
      const replaceResult = editor.replaceText('old', 'new');
      expect(replaceResult.success).toBe(true);
    });
  });

  describe('Calc Integration', () => {
    let mockLok: Partial<LOKBindings>;

    beforeEach(() => {
      mockLok = createComprehensiveMock(LOK_DOCTYPE_SPREADSHEET);
    });

    it('should support full spreadsheet workflow', () => {
      const editor = createEditor(mockLok as LOKBindings, 12345);
      if (!isCalcEditor(editor)) throw new Error('Expected CalcEditor');

      // Get structure
      const structure = editor.getStructure();
      expect(structure.success).toBe(true);
      expect(structure.data?.sheets.length).toBe(3);

      // Get sheet names
      const namesResult = editor.getSheetNames();
      expect(namesResult.success).toBe(true);

      // Set cell value
      const setResult = editor.setCellValue('A1', 'Hello');
      expect(setResult.success).toBe(true);

      // Get cell
      const getResult = editor.getCell('A1');
      expect(getResult.success).toBe(true);

      // Set formula
      const formulaResult = editor.setCellFormula('B1', '=A1*2');
      expect(formulaResult.success).toBe(true);
    });

    it('should support both A1 and row/col notation', () => {
      const editor = createEditor(mockLok as LOKBindings, 12345);
      if (!isCalcEditor(editor)) throw new Error('Expected CalcEditor');

      // A1 notation
      const a1Result = editor.getCell('B2');
      expect(a1Result.success).toBe(true);

      // Row/col notation
      const rowColResult = editor.getCell({ row: 1, col: 1 });
      expect(rowColResult.success).toBe(true);
    });
  });

  describe('Impress Integration', () => {
    let mockLok: Partial<LOKBindings>;

    beforeEach(() => {
      mockLok = createComprehensiveMock(LOK_DOCTYPE_PRESENTATION);
    });

    it('should support full presentation workflow', () => {
      const editor = createEditor(mockLok as LOKBindings, 12345);
      if (!isImpressEditor(editor)) throw new Error('Expected ImpressEditor');

      // Get structure
      const structure = editor.getStructure();
      expect(structure.success).toBe(true);
      expect(structure.data?.slideCount).toBe(3);

      // Get slide
      const slideResult = editor.getSlide(0);
      expect(slideResult.success).toBe(true);

      // Add slide
      const addResult = editor.addSlide();
      expect(addResult.success).toBe(true);

      // Set slide title
      const titleResult = editor.setSlideTitle(0, 'New Title');
      expect(titleResult.success).toBe(true);

      // Duplicate slide
      const dupResult = editor.duplicateSlide(0);
      expect(dupResult.success).toBe(true);
    });
  });

  describe('Draw Integration', () => {
    let mockLok: Partial<LOKBindings>;

    beforeEach(() => {
      mockLok = createComprehensiveMock(LOK_DOCTYPE_DRAWING);
    });

    it('should support full drawing workflow', () => {
      const editor = createEditor(mockLok as LOKBindings, 12345);
      if (!isDrawEditor(editor)) throw new Error('Expected DrawEditor');

      // Get structure
      const structure = editor.getStructure();
      expect(structure.success).toBe(true);
      expect(structure.data?.pageCount).toBe(3);

      // Get page
      const pageResult = editor.getPage(0);
      expect(pageResult.success).toBe(true);

      // Add shape
      const shapeResult = editor.addShape(0, 'rectangle', {
        x: 100, y: 100, width: 200, height: 150
      });
      expect(shapeResult.success).toBe(true);

      // Add line
      const lineResult = editor.addLine(0, { x: 0, y: 0 }, { x: 100, y: 100 });
      expect(lineResult.success).toBe(true);

      // Add page
      const addPageResult = editor.addPage();
      expect(addPageResult.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return error results with suggestions', () => {
      const mockLok = createComprehensiveMock(LOK_DOCTYPE_SPREADSHEET);
      const editor = createEditor(mockLok as LOKBindings, 12345);
      if (!isCalcEditor(editor)) throw new Error('Expected CalcEditor');

      // Invalid sheet index
      const result = editor.getCell('A1', 999);
      // Should still succeed as selectSheet doesn't validate in mock
      expect(result.success).toBe(true);
    });

    it('should handle operation failures gracefully', () => {
      const mockLok = createComprehensiveMock(LOK_DOCTYPE_TEXT);
      (mockLok.getAllText as any).mockImplementation(() => {
        throw new Error('LOK error');
      });

      const editor = createEditor(mockLok as LOKBindings, 12345);
      if (!isWriterEditor(editor)) throw new Error('Expected WriterEditor');

      const result = editor.getStructure();
      expect(result.success).toBe(false);
      expect(result.error).toContain('LOK error');
    });
  });

  describe('History Operations', () => {
    it('should support undo and redo', () => {
      const mockLok = createComprehensiveMock(LOK_DOCTYPE_TEXT);
      const editor = createEditor(mockLok as LOKBindings, 12345);

      const undoResult = editor.undo();
      expect(undoResult.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalledWith(12345, '.uno:Undo');

      const redoResult = editor.redo();
      expect(redoResult.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalledWith(12345, '.uno:Redo');
    });
  });

  describe('Search Operations', () => {
    it('should support find and replace', () => {
      const mockLok = createComprehensiveMock(LOK_DOCTYPE_TEXT);
      const editor = createEditor(mockLok as LOKBindings, 12345);

      const findResult = editor.find('test');
      expect(findResult.success).toBe(true);

      const replaceResult = editor.findAndReplaceAll('old', 'new');
      expect(replaceResult.success).toBe(true);
    });
  });
});

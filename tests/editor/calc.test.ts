// tests/editor/calc.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalcEditor } from '../../src/editor/calc.js';
import type { LOKBindings } from '../../src/lok-bindings.js';

const createMockLok = (): Partial<LOKBindings> => ({
  documentGetParts: vi.fn().mockReturnValue(3), // 3 sheets
  getPartName: vi.fn().mockImplementation((_, index) => `Sheet${index + 1}`),
  getDataArea: vi.fn().mockReturnValue({ col: 10, row: 100 }),
  documentSetPart: vi.fn(),
  postUnoCommand: vi.fn(),
  getCommandValues: vi.fn().mockReturnValue('{"value": "test"}'),
  getTextSelection: vi.fn().mockReturnValue('42'),
});

describe('CalcEditor', () => {
  let editor: CalcEditor;
  let mockLok: Partial<LOKBindings>;

  beforeEach(() => {
    mockLok = createMockLok();
    editor = new CalcEditor(mockLok as LOKBindings, 12345, { maxResponseChars: 8000 });
  });

  describe('getDocumentType', () => {
    it('should return "calc"', () => {
      expect(editor.getDocumentType()).toBe('calc');
    });
  });

  describe('getStructure', () => {
    it('should return structure with sheets', () => {
      const result = editor.getStructure();
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('calc');
      expect(result.data?.sheets).toBeDefined();
      expect(result.data?.sheets.length).toBe(3);
    });
  });

  describe('getSheetNames', () => {
    it('should return array of sheet names', () => {
      const result = editor.getSheetNames();
      expect(result.success).toBe(true);
      expect(result.data).toContain('Sheet1');
    });
  });

  describe('cell addressing', () => {
    it('should accept A1 notation for getCell', () => {
      const result = editor.getCell('A1');
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });

    it('should accept row/col object for getCell', () => {
      const result = editor.getCell({ row: 0, col: 0 });
      expect(result.success).toBe(true);
    });
  });

  describe('setCellValue', () => {
    it('should set cell value and verify', () => {
      const result = editor.setCellValue('B2', 100);
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
    });
  });

  describe('setCellFormula', () => {
    it('should set formula and return calculated value', () => {
      const result = editor.setCellFormula('C1', '=SUM(A1:B1)');
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });
  });

  describe('sheet operations', () => {
    it('should add a new sheet', () => {
      const result = editor.addSheet('NewSheet');
      expect(result.success).toBe(true);
    });

    it('should rename a sheet', () => {
      const result = editor.renameSheet(0, 'RenamedSheet');
      expect(result.success).toBe(true);
    });
  });
});

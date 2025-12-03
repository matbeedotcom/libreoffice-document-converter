// tests/editor/index.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createEditor,
  isWriterEditor,
  isCalcEditor,
  isImpressEditor,
  isDrawEditor,
} from '../../src/editor/index.js';
import { WriterEditor } from '../../src/editor/writer.js';
import { CalcEditor } from '../../src/editor/calc.js';
import { ImpressEditor } from '../../src/editor/impress.js';
import { DrawEditor } from '../../src/editor/draw.js';
import type { LOKBindings } from '../../src/lok-bindings.js';

// Mock LOKBindings
const createMockLok = (docType: number): Partial<LOKBindings> => ({
  documentGetDocumentType: vi.fn().mockReturnValue(docType),
  documentGetParts: vi.fn().mockReturnValue(1),
  documentGetDocumentSize: vi.fn().mockReturnValue({ width: 12240, height: 15840 }),
  getAllText: vi.fn().mockReturnValue('Test content'),
  getPartName: vi.fn().mockReturnValue('Sheet1'),
  getTextSelection: vi.fn().mockReturnValue(''),
  postUnoCommand: vi.fn(),
  getCommandValues: vi.fn().mockReturnValue('{}'),
  resetSelection: vi.fn(),
  selectAll: vi.fn(),
  documentSetPart: vi.fn(),
  getDataArea: vi.fn().mockReturnValue({ row: 10, col: 5 }),
});

// LOK document type constants (from LibreOfficeKit)
const LOK_DOCTYPE_TEXT = 0;
const LOK_DOCTYPE_SPREADSHEET = 1;
const LOK_DOCTYPE_PRESENTATION = 2;
const LOK_DOCTYPE_DRAWING = 3;

describe('createEditor', () => {
  it('should create WriterEditor for text documents', () => {
    const mockLok = createMockLok(LOK_DOCTYPE_TEXT);
    const editor = createEditor(mockLok as LOKBindings, 12345);
    expect(editor).toBeInstanceOf(WriterEditor);
    expect(editor.getDocumentType()).toBe('writer');
  });

  it('should create CalcEditor for spreadsheet documents', () => {
    const mockLok = createMockLok(LOK_DOCTYPE_SPREADSHEET);
    const editor = createEditor(mockLok as LOKBindings, 12345);
    expect(editor).toBeInstanceOf(CalcEditor);
    expect(editor.getDocumentType()).toBe('calc');
  });

  it('should create ImpressEditor for presentation documents', () => {
    const mockLok = createMockLok(LOK_DOCTYPE_PRESENTATION);
    const editor = createEditor(mockLok as LOKBindings, 12345);
    expect(editor).toBeInstanceOf(ImpressEditor);
    expect(editor.getDocumentType()).toBe('impress');
  });

  it('should create DrawEditor for drawing documents', () => {
    const mockLok = createMockLok(LOK_DOCTYPE_DRAWING);
    const editor = createEditor(mockLok as LOKBindings, 12345);
    expect(editor).toBeInstanceOf(DrawEditor);
    expect(editor.getDocumentType()).toBe('draw');
  });

  it('should throw for unsupported document type', () => {
    const mockLok = createMockLok(99);
    expect(() => createEditor(mockLok as LOKBindings, 12345)).toThrow('Unsupported document type');
  });

  it('should pass options to editor', () => {
    const mockLok = createMockLok(LOK_DOCTYPE_TEXT);
    const editor = createEditor(mockLok as LOKBindings, 12345, { maxResponseChars: 5000 });
    // Options are internal, but editor should be created successfully
    expect(editor).toBeInstanceOf(WriterEditor);
  });
});

describe('Type guards', () => {
  let writerEditor: WriterEditor;
  let calcEditor: CalcEditor;
  let impressEditor: ImpressEditor;
  let drawEditor: DrawEditor;

  beforeEach(() => {
    const mockLok = createMockLok(LOK_DOCTYPE_TEXT) as LOKBindings;
    writerEditor = new WriterEditor(mockLok, 1);
    calcEditor = new CalcEditor(mockLok, 2);
    impressEditor = new ImpressEditor(mockLok, 3);
    drawEditor = new DrawEditor(mockLok, 4);
  });

  describe('isWriterEditor', () => {
    it('should return true for WriterEditor', () => {
      expect(isWriterEditor(writerEditor)).toBe(true);
    });

    it('should return false for other editors', () => {
      expect(isWriterEditor(calcEditor)).toBe(false);
      expect(isWriterEditor(impressEditor)).toBe(false);
      expect(isWriterEditor(drawEditor)).toBe(false);
    });
  });

  describe('isCalcEditor', () => {
    it('should return true for CalcEditor', () => {
      expect(isCalcEditor(calcEditor)).toBe(true);
    });

    it('should return false for other editors', () => {
      expect(isCalcEditor(writerEditor)).toBe(false);
      expect(isCalcEditor(impressEditor)).toBe(false);
      expect(isCalcEditor(drawEditor)).toBe(false);
    });
  });

  describe('isImpressEditor', () => {
    it('should return true for ImpressEditor', () => {
      expect(isImpressEditor(impressEditor)).toBe(true);
    });

    it('should return false for other editors', () => {
      expect(isImpressEditor(writerEditor)).toBe(false);
      expect(isImpressEditor(calcEditor)).toBe(false);
      expect(isImpressEditor(drawEditor)).toBe(false);
    });
  });

  describe('isDrawEditor', () => {
    it('should return true for DrawEditor', () => {
      expect(isDrawEditor(drawEditor)).toBe(true);
    });

    it('should return false for other editors', () => {
      expect(isDrawEditor(writerEditor)).toBe(false);
      expect(isDrawEditor(calcEditor)).toBe(false);
      expect(isDrawEditor(impressEditor)).toBe(false);
    });
  });
});

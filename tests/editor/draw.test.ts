// tests/editor/draw.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrawEditor } from '../../src/editor/draw.js';
import type { LOKBindings } from '../../src/lok-bindings.js';

// Mock LOKBindings
const createMockLok = (): Partial<LOKBindings> => ({
  documentGetParts: vi.fn().mockReturnValue(3), // 3 pages
  documentSetPart: vi.fn(),
  documentGetDocumentSize: vi.fn().mockReturnValue({ width: 21000, height: 29700 }), // A4
  getPartName: vi.fn().mockImplementation((_, i) => `Page ${i + 1}`),
  getAllText: vi.fn().mockReturnValue('Shape text content'),
  getTextSelection: vi.fn().mockReturnValue('selected shape'),
  postUnoCommand: vi.fn(),
  getCommandValues: vi.fn().mockReturnValue('{}'),
  resetSelection: vi.fn(),
  selectAll: vi.fn(),
});

describe('DrawEditor', () => {
  let editor: DrawEditor;
  let mockLok: Partial<LOKBindings>;

  beforeEach(() => {
    mockLok = createMockLok();
    editor = new DrawEditor(mockLok as LOKBindings, 12345, { maxResponseChars: 8000 });
  });

  describe('getDocumentType', () => {
    it('should return "draw"', () => {
      expect(editor.getDocumentType()).toBe('draw');
    });
  });

  describe('getStructure', () => {
    it('should return draw structure with pages', () => {
      const result = editor.getStructure();
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('draw');
      expect(result.data?.pages).toBeDefined();
      expect(result.data?.pageCount).toBe(3);
    });
  });

  describe('getPage', () => {
    it('should return page data for valid index', () => {
      const result = editor.getPage(0);
      expect(result.success).toBe(true);
      expect(result.data?.index).toBe(0);
    });

    it('should return error for invalid index', () => {
      const result = editor.getPage(-1);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for out of bounds index', () => {
      const result = editor.getPage(100);
      expect(result.success).toBe(false);
    });
  });

  describe('addPage', () => {
    it('should add a new page', () => {
      const result = editor.addPage();
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });

    it('should add page at specific position', () => {
      const result = editor.addPage({ afterPage: 1 });
      expect(result.success).toBe(true);
    });
  });

  describe('deletePage', () => {
    it('should delete a page', () => {
      const result = editor.deletePage(1);
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });

    it('should prevent deleting last page', () => {
      (mockLok.documentGetParts as any).mockReturnValue(1);
      const result = editor.deletePage(0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete');
    });
  });

  describe('addShape', () => {
    it('should add a rectangle shape', () => {
      const result = editor.addShape(0, 'rectangle', {
        x: 100, y: 100, width: 200, height: 150
      });
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });

    it('should add an ellipse shape', () => {
      const result = editor.addShape(0, 'ellipse', {
        x: 100, y: 100, width: 100, height: 100
      });
      expect(result.success).toBe(true);
    });

    it('should add a text box', () => {
      const result = editor.addShape(0, 'text', {
        x: 50, y: 50, width: 300, height: 50
      }, { text: 'Hello World' });
      expect(result.success).toBe(true);
    });
  });

  describe('addLine', () => {
    it('should add a line', () => {
      const result = editor.addLine(0, { x: 0, y: 0 }, { x: 100, y: 100 });
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });
  });

  describe('setShapeText', () => {
    it('should set text on a shape', () => {
      const result = editor.setShapeText(0, 0, 'New text');
      expect(result.success).toBe(true);
    });
  });

  describe('deleteShape', () => {
    it('should delete a shape', () => {
      const result = editor.deleteShape(0, 0);
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });
  });

  describe('moveShape', () => {
    it('should move a shape to new position', () => {
      const result = editor.moveShape(0, 0, { x: 200, y: 200 });
      expect(result.success).toBe(true);
    });
  });

  describe('resizeShape', () => {
    it('should resize a shape', () => {
      const result = editor.resizeShape(0, 0, { width: 300, height: 200 });
      expect(result.success).toBe(true);
    });
  });
});

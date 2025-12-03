// tests/editor/writer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WriterEditor } from '../../src/editor/writer.js';
import type { LOKBindings } from '../../src/lok-bindings.js';

// Mock LOKBindings
const createMockLok = (): Partial<LOKBindings> => ({
  documentGetParts: vi.fn().mockReturnValue(3),
  documentGetDocumentSize: vi.fn().mockReturnValue({ width: 12240, height: 15840 }),
  getAllText: vi.fn().mockReturnValue('Paragraph 1\n\nParagraph 2\n\nParagraph 3'),
  getTextSelection: vi.fn().mockReturnValue('selected text'),
  postUnoCommand: vi.fn(),
  getCommandValues: vi.fn().mockReturnValue('{}'),
  resetSelection: vi.fn(),
  selectAll: vi.fn(),
});

describe('WriterEditor', () => {
  let editor: WriterEditor;
  let mockLok: Partial<LOKBindings>;

  beforeEach(() => {
    mockLok = createMockLok();
    editor = new WriterEditor(mockLok as LOKBindings, 12345, { maxResponseChars: 8000 });
  });

  describe('getDocumentType', () => {
    it('should return "writer"', () => {
      expect(editor.getDocumentType()).toBe('writer');
    });
  });

  describe('getStructure', () => {
    it('should return document structure with paragraphs', () => {
      const result = editor.getStructure();
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('writer');
      expect(result.data?.paragraphs).toBeDefined();
    });
  });

  describe('getParagraph', () => {
    it('should return a specific paragraph', () => {
      const result = editor.getParagraph(0);
      expect(result.success).toBe(true);
      expect(result.data?.index).toBe(0);
    });

    it('should return error for invalid index', () => {
      const result = editor.getParagraph(-1);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('insertParagraph', () => {
    it('should insert paragraph and return new index', () => {
      const result = editor.insertParagraph('New paragraph text');
      expect(result.success).toBe(true);
      // Note: verified is false in test because mock doesn't simulate paragraph count change
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });

    it('should insert paragraph with style', () => {
      const result = editor.insertParagraph('Heading', { style: 'Heading 1' });
      expect(result.success).toBe(true);
    });
  });

  describe('replaceText', () => {
    it('should replace text in document', () => {
      const result = editor.replaceText('old', 'new');
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });
  });

  describe('formatText', () => {
    it('should apply formatting to selection', () => {
      const result = editor.formatText(
        { start: { paragraph: 0, character: 0 }, end: { paragraph: 0, character: 5 } },
        { bold: true }
      );
      expect(result.success).toBe(true);
    });
  });
});

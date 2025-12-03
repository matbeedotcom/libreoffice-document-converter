// tests/editor/impress.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImpressEditor } from '../../src/editor/impress.js';
import type { LOKBindings } from '../../src/lok-bindings.js';

// Mock LOKBindings
const createMockLok = (): Partial<LOKBindings> => ({
  documentGetParts: vi.fn().mockReturnValue(5), // 5 slides
  documentGetPartName: vi.fn().mockImplementation((_, i) => `Slide ${i + 1}`),
  documentSetPart: vi.fn(),
  documentGetDocumentSize: vi.fn().mockReturnValue({ width: 25400, height: 19050 }), // 16:9 aspect
  getPartName: vi.fn().mockImplementation((_, i) => `Slide ${i + 1}`),
  getAllText: vi.fn().mockReturnValue('Title Text\n\nBody content here'),
  getTextSelection: vi.fn().mockReturnValue('selected text'),
  postUnoCommand: vi.fn(),
  getCommandValues: vi.fn().mockReturnValue('{}'),
  resetSelection: vi.fn(),
  selectAll: vi.fn(),
});

describe('ImpressEditor', () => {
  let editor: ImpressEditor;
  let mockLok: Partial<LOKBindings>;

  beforeEach(() => {
    mockLok = createMockLok();
    editor = new ImpressEditor(mockLok as LOKBindings, 12345, { maxResponseChars: 8000 });
  });

  describe('getDocumentType', () => {
    it('should return "impress"', () => {
      expect(editor.getDocumentType()).toBe('impress');
    });
  });

  describe('getStructure', () => {
    it('should return presentation structure with slides', () => {
      const result = editor.getStructure();
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe('impress');
      expect(result.data?.slides).toBeDefined();
      expect(result.data?.slideCount).toBe(5);
    });
  });

  describe('getSlide', () => {
    it('should return slide data for valid index', () => {
      const result = editor.getSlide(0);
      expect(result.success).toBe(true);
      expect(result.data?.index).toBe(0);
    });

    it('should return error for invalid index', () => {
      const result = editor.getSlide(-1);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for out of bounds index', () => {
      const result = editor.getSlide(100);
      expect(result.success).toBe(false);
    });
  });

  describe('addSlide', () => {
    it('should add a new slide', () => {
      const result = editor.addSlide();
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });

    it('should add slide at specific position', () => {
      const result = editor.addSlide({ afterSlide: 2 });
      expect(result.success).toBe(true);
    });

    it('should add slide with layout', () => {
      const result = editor.addSlide({ layout: 'titleContent' });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteSlide', () => {
    it('should delete a slide', () => {
      const result = editor.deleteSlide(1);
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });

    it('should prevent deleting last slide', () => {
      (mockLok.documentGetParts as any).mockReturnValue(1);
      const result = editor.deleteSlide(0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete');
    });
  });

  describe('setSlideTitle', () => {
    it('should set slide title text', () => {
      const result = editor.setSlideTitle(0, 'New Title');
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });
  });

  describe('setSlideBody', () => {
    it('should set slide body text', () => {
      const result = editor.setSlideBody(0, 'New body content');
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });
  });

  describe('moveSlide', () => {
    it('should move slide to new position', () => {
      const result = editor.moveSlide(0, 3);
      expect(result.success).toBe(true);
    });

    it('should return error for same position', () => {
      const result = editor.moveSlide(2, 2);
      expect(result.success).toBe(false);
    });
  });

  describe('duplicateSlide', () => {
    it('should duplicate a slide', () => {
      const result = editor.duplicateSlide(0);
      expect(result.success).toBe(true);
      expect(mockLok.postUnoCommand).toHaveBeenCalled();
    });
  });
});

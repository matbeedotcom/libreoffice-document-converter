// tests/editor/base.test.ts
import { describe, it, expect, vi } from 'vitest';
import { OfficeEditor } from '../../src/editor/base.js';
import type { OperationResult, DocumentStructure } from '../../src/editor/types.js';

// Create a concrete implementation for testing
class TestEditor extends OfficeEditor {
  getStructure(): OperationResult<DocumentStructure> {
    return {
      success: true,
      verified: true,
      data: { type: 'writer', paragraphs: [], pageCount: 1, wordCount: 0 },
    };
  }

  getDocumentType(): 'writer' | 'calc' | 'impress' | 'draw' {
    return 'writer';
  }
}

describe('OfficeEditor', () => {
  it('should create result with success', () => {
    const editor = new TestEditor(null as any, 0, { maxResponseChars: 8000 });
    const result = editor['createResult']({ value: 'test' });
    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.data).toEqual({ value: 'test' });
  });

  it('should create error result with suggestion', () => {
    const editor = new TestEditor(null as any, 0, { maxResponseChars: 8000 });
    const result = editor['createErrorResult']('Something failed', 'Try this instead');
    expect(result.success).toBe(false);
    expect(result.verified).toBe(false);
    expect(result.error).toBe('Something failed');
    expect(result.suggestion).toBe('Try this instead');
  });

  it('should truncate content exceeding maxResponseChars', () => {
    const editor = new TestEditor(null as any, 0, { maxResponseChars: 100 });
    const longContent = 'a'.repeat(200);
    const result = editor['truncateContent'](longContent);
    expect(result.content.length).toBeLessThanOrEqual(100);
    expect(result.truncated).toBe(true);
    expect(result.original).toBe(200);
  });

  it('should not truncate content within limit', () => {
    const editor = new TestEditor(null as any, 0, { maxResponseChars: 8000 });
    const shortContent = 'hello world';
    const result = editor['truncateContent'](shortContent);
    expect(result.content).toBe(shortContent);
    expect(result.truncated).toBe(false);
  });

  it('should convert A1 notation to row/col', () => {
    const editor = new TestEditor(null as any, 0, { maxResponseChars: 8000 });
    expect(editor['a1ToRowCol']('A1')).toEqual({ row: 0, col: 0 });
    expect(editor['a1ToRowCol']('B2')).toEqual({ row: 1, col: 1 });
    expect(editor['a1ToRowCol']('Z10')).toEqual({ row: 9, col: 25 });
    expect(editor['a1ToRowCol']('AA1')).toEqual({ row: 0, col: 26 });
  });

  it('should convert row/col to A1 notation', () => {
    const editor = new TestEditor(null as any, 0, { maxResponseChars: 8000 });
    expect(editor['rowColToA1'](0, 0)).toBe('A1');
    expect(editor['rowColToA1'](1, 1)).toBe('B2');
    expect(editor['rowColToA1'](9, 25)).toBe('Z10');
    expect(editor['rowColToA1'](0, 26)).toBe('AA1');
  });
});

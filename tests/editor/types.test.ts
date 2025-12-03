// tests/editor/types.test.ts
import { describe, it, expect } from 'vitest';
import type {
  OperationResult,
  TextPosition,
  TextFormat,
  CellRef,
  RangeRef,
  CellValue,
  CellData,
  OpenDocumentOptions,
} from '../../src/editor/types.js';

describe('Editor Types', () => {
  it('should define OperationResult with required fields', () => {
    const result: OperationResult<string> = {
      success: true,
      verified: true,
      data: 'test',
    };
    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.data).toBe('test');
  });

  it('should define OperationResult with error and suggestion', () => {
    const result: OperationResult<void> = {
      success: false,
      verified: false,
      error: 'Cell is protected',
      suggestion: 'Use unprotectSheet() first',
    };
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.suggestion).toBeDefined();
  });

  it('should define OperationResult with truncation info', () => {
    const result: OperationResult<string> = {
      success: true,
      verified: true,
      data: 'truncated content...',
      truncated: {
        original: 50000,
        returned: 4000,
        message: 'Content truncated. Use offset/limit to paginate.',
      },
    };
    expect(result.truncated?.original).toBe(50000);
  });

  it('should allow CellRef as string or object', () => {
    const ref1: CellRef = 'A1';
    const ref2: CellRef = { row: 0, col: 0 };
    expect(ref1).toBe('A1');
    expect(ref2.row).toBe(0);
  });

  it('should define CellData with value and optional formula', () => {
    const cell: CellData = {
      address: 'B2',
      value: 100,
      formula: '=SUM(A1:A10)',
    };
    expect(cell.address).toBe('B2');
    expect(cell.formula).toBeDefined();
  });
});

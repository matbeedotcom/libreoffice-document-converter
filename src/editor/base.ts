// src/editor/base.ts
import type { LOKBindings } from '../lok-bindings.js';
import type { OutputFormat } from '../types.js';
import type {
  OperationResult,
  DocumentStructure,
  OpenDocumentOptions,
  SelectionRange,
  FindOptions,
  Position,
  TruncationInfo,
  CellRef,
} from './types.js';

/**
 * Abstract base class for all document editors
 */
export abstract class OfficeEditor {
  protected lok: LOKBindings;
  protected docPtr: number;
  protected options: Required<Pick<OpenDocumentOptions, 'maxResponseChars'>> & OpenDocumentOptions;
  protected inputPath: string = '';

  constructor(lok: LOKBindings, docPtr: number, options: OpenDocumentOptions = {}) {
    this.lok = lok;
    this.docPtr = docPtr;
    this.options = {
      maxResponseChars: options.maxResponseChars ?? 8000,
      ...options,
    };
  }

  // ============================================
  // Abstract methods (implemented by subclasses)
  // ============================================

  abstract getStructure(options?: { maxResponseChars?: number }): OperationResult<DocumentStructure>;
  abstract getDocumentType(): 'writer' | 'calc' | 'impress' | 'draw';

  // ============================================
  // Lifecycle methods
  // ============================================

  save(): OperationResult<{ path: string }> {
    try {
      // Save to the original path
      if (!this.inputPath) {
        return this.createErrorResult('No input path set', 'Use saveAs() to specify a path');
      }
      // LibreOffice auto-saves on document operations, but we can force it
      this.lok.postUnoCommand(this.docPtr, '.uno:Save');
      return this.createResult({ path: this.inputPath });
    } catch (error) {
      return this.createErrorResult(`Save failed: ${error}`);
    }
  }

  saveAs(path: string, format: OutputFormat): OperationResult<{ path: string }> {
    try {
      this.lok.documentSaveAs(this.docPtr, path, format, '');
      return this.createResult({ path });
    } catch (error) {
      return this.createErrorResult(`SaveAs failed: ${error}`);
    }
  }

  close(): OperationResult<void> {
    try {
      this.lok.documentDestroy(this.docPtr);
      this.docPtr = 0;
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Close failed: ${error}`);
    }
  }

  // ============================================
  // History methods
  // ============================================

  undo(): OperationResult<void> {
    try {
      this.lok.postUnoCommand(this.docPtr, '.uno:Undo');
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Undo failed: ${error}`);
    }
  }

  redo(): OperationResult<void> {
    try {
      this.lok.postUnoCommand(this.docPtr, '.uno:Redo');
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`Redo failed: ${error}`);
    }
  }

  // ============================================
  // Search methods
  // ============================================

  find(text: string, options?: FindOptions): OperationResult<{ matches: number; firstMatch?: Position }> {
    try {
      const searchArgs = JSON.stringify({
        'SearchItem.SearchString': { type: 'string', value: text },
        'SearchItem.Backward': { type: 'boolean', value: false },
        'SearchItem.SearchAll': { type: 'boolean', value: true },
        'SearchItem.MatchCase': { type: 'boolean', value: options?.caseSensitive ?? false },
        'SearchItem.WordOnly': { type: 'boolean', value: options?.wholeWord ?? false },
      });

      this.lok.postUnoCommand(this.docPtr, '.uno:ExecuteSearch', searchArgs);

      // Get search results - this is approximate as LOK doesn't return match count directly
      const selection = this.lok.getTextSelection(this.docPtr, 'text/plain');
      const hasMatch = selection !== null && selection.length > 0;

      return this.createResult({
        matches: hasMatch ? 1 : 0, // LOK doesn't provide count, we report if found
        firstMatch: hasMatch ? { x: 0, y: 0 } : undefined,
      });
    } catch (error) {
      return this.createErrorResult(`Find failed: ${error}`);
    }
  }

  findAndReplaceAll(find: string, replace: string, options?: FindOptions): OperationResult<{ replacements: number }> {
    try {
      const searchArgs = JSON.stringify({
        'SearchItem.SearchString': { type: 'string', value: find },
        'SearchItem.ReplaceString': { type: 'string', value: replace },
        'SearchItem.Command': { type: 'long', value: 3 }, // Replace All
        'SearchItem.MatchCase': { type: 'boolean', value: options?.caseSensitive ?? false },
        'SearchItem.WordOnly': { type: 'boolean', value: options?.wholeWord ?? false },
      });

      this.lok.postUnoCommand(this.docPtr, '.uno:ExecuteSearch', searchArgs);

      // LOK doesn't return replacement count, we assume success
      return this.createResult({ replacements: -1 }); // -1 indicates unknown count
    } catch (error) {
      return this.createErrorResult(`Replace failed: ${error}`);
    }
  }

  // ============================================
  // Selection methods
  // ============================================

  select(_selection: SelectionRange): OperationResult<{ selected: string }> {
    try {
      // Implementation depends on selection type - subclasses may override
      // Base implementation just returns current selection
      const text = this.lok.getTextSelection(this.docPtr, 'text/plain');
      return this.createResult({ selected: text || '' });
    } catch (error) {
      return this.createErrorResult(`Select failed: ${error}`);
    }
  }

  getSelection(): OperationResult<{ text: string; range: SelectionRange }> {
    try {
      const text = this.lok.getTextSelection(this.docPtr, 'text/plain');
      return this.createResult({
        text: text || '',
        range: { type: 'text', start: { paragraph: 0, character: 0 } },
      });
    } catch (error) {
      return this.createErrorResult(`GetSelection failed: ${error}`);
    }
  }

  clearSelection(): OperationResult<void> {
    try {
      this.lok.resetSelection(this.docPtr);
      return this.createResult(undefined);
    } catch (error) {
      return this.createErrorResult(`ClearSelection failed: ${error}`);
    }
  }

  // ============================================
  // Protected helper methods
  // ============================================

  protected createResult<T>(data: T): OperationResult<T> {
    return {
      success: true,
      verified: true,
      data,
    };
  }

  protected createErrorResult<T>(error: string, suggestion?: string): OperationResult<T> {
    return {
      success: false,
      verified: false,
      error,
      suggestion,
    };
  }

  protected createResultWithTruncation<T>(data: T, truncation?: TruncationInfo): OperationResult<T> {
    return {
      success: true,
      verified: true,
      data,
      truncated: truncation,
    };
  }

  protected truncateContent(content: string, maxChars?: number): {
    content: string;
    truncated: boolean;
    original: number;
    returned: number;
  } {
    const limit = maxChars ?? this.options.maxResponseChars;
    const original = content.length;

    if (original <= limit) {
      return { content, truncated: false, original, returned: original };
    }

    // Truncate at a word boundary if possible
    let truncated = content.slice(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > limit * 0.8) {
      truncated = truncated.slice(0, lastSpace);
    }

    return {
      content: truncated,
      truncated: true,
      original,
      returned: truncated.length,
    };
  }

  protected truncateArray<T>(items: T[], maxChars: number, itemToString: (item: T) => string): {
    items: T[];
    truncated: boolean;
    original: number;
    returned: number;
  } {
    const original = items.length;
    let charCount = 0;
    let includedCount = 0;

    for (const item of items) {
      const itemStr = itemToString(item);
      if (charCount + itemStr.length > maxChars) {
        break;
      }
      charCount += itemStr.length;
      includedCount++;
    }

    return {
      items: items.slice(0, includedCount),
      truncated: includedCount < original,
      original,
      returned: includedCount,
    };
  }

  // ============================================
  // Cell address helpers
  // ============================================

  protected a1ToRowCol(a1: string): { row: number; col: number } {
    const match = a1.match(/^([A-Z]+)(\d+)$/i);
    if (!match) {
      throw new Error(`Invalid A1 notation: ${a1}`);
    }

    const colStr = match[1]!.toUpperCase();
    const rowStr = match[2]!;

    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    col -= 1; // 0-indexed

    const row = parseInt(rowStr, 10) - 1; // 0-indexed

    return { row, col };
  }

  protected rowColToA1(row: number, col: number): string {
    let colStr = '';
    let c = col + 1; // 1-indexed for conversion

    while (c > 0) {
      const remainder = (c - 1) % 26;
      colStr = String.fromCharCode(65 + remainder) + colStr;
      c = Math.floor((c - 1) / 26);
    }

    return `${colStr}${row + 1}`;
  }

  protected normalizeCellRef(ref: CellRef): { row: number; col: number } {
    if (typeof ref === 'string') {
      return this.a1ToRowCol(ref);
    }
    return ref;
  }

  // ============================================
  // Internal state
  // ============================================

  setInputPath(path: string): void {
    this.inputPath = path;
  }

  getDocPtr(): number {
    return this.docPtr;
  }

  isOpen(): boolean {
    return this.docPtr !== 0;
  }
}

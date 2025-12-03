// src/editor/index.ts
import type { LOKBindings } from '../lok-bindings.js';
import { OfficeEditor } from './base.js';
import { WriterEditor } from './writer.js';
import { CalcEditor } from './calc.js';
import { ImpressEditor } from './impress.js';
import { DrawEditor } from './draw.js';
import type { OpenDocumentOptions } from './types.js';

// LOK document type constants (from LibreOfficeKit)
const LOK_DOCTYPE_TEXT = 0;
const LOK_DOCTYPE_SPREADSHEET = 1;
const LOK_DOCTYPE_PRESENTATION = 2;
const LOK_DOCTYPE_DRAWING = 3;

/**
 * Factory function to create the appropriate editor based on document type
 *
 * @param lok - LibreOfficeKit bindings instance
 * @param docPtr - Document pointer from lok.documentLoad()
 * @param options - Editor options (maxResponseChars, etc.)
 * @returns Typed editor instance (WriterEditor, CalcEditor, ImpressEditor, or DrawEditor)
 * @throws Error if document type is unsupported
 *
 * @example
 * ```typescript
 * const docPtr = lok.documentLoad('/tmp/document.docx');
 * const editor = createEditor(lok, docPtr);
 *
 * if (isWriterEditor(editor)) {
 *   // TypeScript knows editor has WriterEditor methods
 *   const result = editor.insertParagraph('Hello World');
 * }
 * ```
 */
export function createEditor(
  lok: LOKBindings,
  docPtr: number,
  options?: OpenDocumentOptions
): OfficeEditor {
  const docType = lok.documentGetType(docPtr);

  switch (docType) {
    case LOK_DOCTYPE_TEXT:
      return new WriterEditor(lok, docPtr, options);

    case LOK_DOCTYPE_SPREADSHEET:
      return new CalcEditor(lok, docPtr, options);

    case LOK_DOCTYPE_PRESENTATION:
      return new ImpressEditor(lok, docPtr, options);

    case LOK_DOCTYPE_DRAWING:
      return new DrawEditor(lok, docPtr, options);

    default:
      throw new Error(`Unsupported document type: ${docType}`);
  }
}

// ============================================
// Type Guards
// ============================================

/**
 * Type guard for WriterEditor
 */
export function isWriterEditor(editor: OfficeEditor): editor is WriterEditor {
  return editor.getDocumentType() === 'writer';
}

/**
 * Type guard for CalcEditor
 */
export function isCalcEditor(editor: OfficeEditor): editor is CalcEditor {
  return editor.getDocumentType() === 'calc';
}

/**
 * Type guard for ImpressEditor
 */
export function isImpressEditor(editor: OfficeEditor): editor is ImpressEditor {
  return editor.getDocumentType() === 'impress';
}

/**
 * Type guard for DrawEditor
 */
export function isDrawEditor(editor: OfficeEditor): editor is DrawEditor {
  return editor.getDocumentType() === 'draw';
}

// ============================================
// Re-exports
// ============================================

// Export all types
export type {
  OperationResult,
  TruncationInfo,
  OpenDocumentOptions,
  TextPosition,
  TextRange,
  TextFormat,
  Paragraph,
  WriterStructure,
  CellRef,
  RangeRef,
  ColRef,
  SheetRef,
  CellValue,
  CellData,
  CellFormat,
  SheetInfo,
  CalcStructure,
  SlideLayout,
  TextFrame,
  SlideData,
  SlideInfo,
  ImpressStructure,
  ShapeType,
  ShapeData,
  PageData,
  PageInfo,
  DrawStructure,
  Rectangle,
  Size,
  Position,
  DocumentMetadata,
  DocumentStructure,
  DocumentType,
  SelectionRange,
  FindOptions,
} from './types.js';

// Export all editor classes
export { OfficeEditor } from './base.js';
export { WriterEditor } from './writer.js';
export { CalcEditor } from './calc.js';
export { ImpressEditor } from './impress.js';
export { DrawEditor } from './draw.js';

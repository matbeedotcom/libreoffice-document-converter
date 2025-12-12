// src/editor/tools.ts
/**
 * LLM-friendly tool definitions for document editing
 *
 * This module provides a hashmap of tools with names, descriptions, and Zod schemas
 * for use with LLM function calling / tool use APIs.
 */

import { z } from 'zod';

// ============================================
// Shared Schemas
// ============================================

const TextPositionSchema = z.object({
  paragraph: z.number().int().min(0).describe('Zero-based paragraph index'),
  character: z.number().int().min(0).describe('Zero-based character offset within the paragraph'),
});

const TextRangeSchema = z.object({
  start: TextPositionSchema.describe('Start position of the range'),
  end: TextPositionSchema.describe('End position of the range'),
});

const TextFormatSchema = z.object({
  bold: z.boolean().optional().describe('Apply bold formatting'),
  italic: z.boolean().optional().describe('Apply italic formatting'),
  underline: z.boolean().optional().describe('Apply underline formatting'),
  fontSize: z.number().positive().optional().describe('Font size in points'),
  fontName: z.string().optional().describe('Font family name (e.g., "Arial", "Times New Roman")'),
  color: z.string().optional().describe('Text color as hex string (e.g., "#FF0000")'),
});

const CellRefSchema = z.union([
  z.string().describe('A1-style cell reference (e.g., "A1", "B5", "AA100")'),
  z.object({
    row: z.number().int().min(0).describe('Zero-based row index'),
    col: z.number().int().min(0).describe('Zero-based column index'),
  }),
]);

const RangeRefSchema = z.union([
  z.string().describe('A1-style range (e.g., "A1:B10", "C5:D20")'),
  z.object({
    start: CellRefSchema.describe('Start cell of the range'),
    end: CellRefSchema.describe('End cell of the range'),
  }),
]);

const SheetRefSchema = z.union([
  z.string().describe('Sheet name'),
  z.number().int().min(0).describe('Zero-based sheet index'),
]);

const CellValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]).describe('Cell value: string, number, boolean, or null');

const CellFormatSchema = z.object({
  bold: z.boolean().optional().describe('Apply bold formatting'),
  numberFormat: z.string().optional().describe('Number format string (e.g., "#,##0.00", "0%")'),
  backgroundColor: z.string().optional().describe('Background color as hex string'),
  textColor: z.string().optional().describe('Text color as hex string'),
});

const SlideLayoutSchema = z.enum(['blank', 'title', 'titleContent', 'twoColumn'])
  .describe('Slide layout type');

const ShapeTypeSchema = z.enum(['rectangle', 'ellipse', 'line', 'text', 'image', 'group', 'other'])
  .describe('Type of shape to create');

const RectangleSchema = z.object({
  x: z.number().describe('X position in twips'),
  y: z.number().describe('Y position in twips'),
  width: z.number().positive().describe('Width in twips'),
  height: z.number().positive().describe('Height in twips'),
});

const PositionSchema = z.object({
  x: z.number().describe('X position in twips'),
  y: z.number().describe('Y position in twips'),
});

const SizeSchema = z.object({
  width: z.number().positive().describe('Width in twips'),
  height: z.number().positive().describe('Height in twips'),
});

const OutputFormatSchema = z.enum([
  'pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html',
  'xlsx', 'xls', 'ods', 'csv',
  'pptx', 'ppt', 'odp',
  'png', 'jpg', 'svg',
]).describe('Output file format');

// ============================================
// Tool Definition Type
// ============================================

export interface ToolDefinition<T extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  parameters: T;
  documentTypes: ('writer' | 'calc' | 'impress' | 'draw' | 'all')[];
}

// ============================================
// Common Tools (all document types)
// ============================================

export const commonTools = {
  // Document Structure
  getStructure: {
    name: 'getStructure',
    description: 'Get the document structure including paragraphs, sheets, slides, or pages depending on document type. Returns an overview of the document content.',
    parameters: z.object({
      maxResponseChars: z.number().int().positive().optional()
        .describe('Maximum characters to return (default: 8000). Use for large documents.'),
    }),
    documentTypes: ['all'],
  },

  // Lifecycle
  save: {
    name: 'save',
    description: 'Save changes to the document at its original path.',
    parameters: z.object({}),
    documentTypes: ['all'],
  },

  saveAs: {
    name: 'saveAs',
    description: 'Save the document to a new path with optional format conversion.',
    parameters: z.object({
      path: z.string().describe('Output file path'),
      format: OutputFormatSchema,
    }),
    documentTypes: ['all'],
  },

  close: {
    name: 'close',
    description: 'Close the document and release resources.',
    parameters: z.object({}),
    documentTypes: ['all'],
  },

  // History
  undo: {
    name: 'undo',
    description: 'Undo the last edit operation.',
    parameters: z.object({}),
    documentTypes: ['all'],
  },

  redo: {
    name: 'redo',
    description: 'Redo the previously undone operation.',
    parameters: z.object({}),
    documentTypes: ['all'],
  },

  // Search
  find: {
    name: 'find',
    description: 'Find text in the document. Returns match count and position of first match.',
    parameters: z.object({
      text: z.string().min(1).describe('Text to search for'),
      caseSensitive: z.boolean().optional().describe('Match case exactly'),
      wholeWord: z.boolean().optional().describe('Match whole words only'),
    }),
    documentTypes: ['all'],
  },

  findAndReplaceAll: {
    name: 'findAndReplaceAll',
    description: 'Find all occurrences of text and replace them.',
    parameters: z.object({
      find: z.string().min(1).describe('Text to find'),
      replace: z.string().describe('Replacement text'),
      caseSensitive: z.boolean().optional().describe('Match case exactly'),
      wholeWord: z.boolean().optional().describe('Match whole words only'),
    }),
    documentTypes: ['all'],
  },

  // Selection
  getSelection: {
    name: 'getSelection',
    description: 'Get the currently selected text or range.',
    parameters: z.object({}),
    documentTypes: ['all'],
  },

  clearSelection: {
    name: 'clearSelection',
    description: 'Clear the current selection.',
    parameters: z.object({}),
    documentTypes: ['all'],
  },

  // Edit mode
  enableEditMode: {
    name: 'enableEditMode',
    description: 'Enable edit mode for the document. Required before making changes.',
    parameters: z.object({}),
    documentTypes: ['all'],
  },

  getEditMode: {
    name: 'getEditMode',
    description: 'Get the current edit mode (0 = view, 1 = edit).',
    parameters: z.object({}),
    documentTypes: ['all'],
  },
} as const satisfies Record<string, ToolDefinition>;

// ============================================
// Writer Tools (text documents)
// ============================================

export const writerTools = {
  getParagraph: {
    name: 'getParagraph',
    description: 'Get a single paragraph by its index. Use getStructure() first to see available paragraphs.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Zero-based paragraph index'),
    }),
    documentTypes: ['writer'],
  },

  getParagraphs: {
    name: 'getParagraphs',
    description: 'Get a range of paragraphs. Useful for paginating through large documents.',
    parameters: z.object({
      start: z.number().int().min(0).describe('Starting paragraph index'),
      count: z.number().int().positive().describe('Number of paragraphs to retrieve'),
    }),
    documentTypes: ['writer'],
  },

  insertParagraph: {
    name: 'insertParagraph',
    description: 'Insert a new paragraph with optional styling.',
    parameters: z.object({
      text: z.string().describe('Paragraph text content'),
      afterIndex: z.number().int().min(0).optional()
        .describe('Insert after this paragraph index. Omit to append at end.'),
      style: z.enum(['Normal', 'Heading 1', 'Heading 2', 'Heading 3', 'List']).optional()
        .describe('Paragraph style to apply'),
    }),
    documentTypes: ['writer'],
  },

  replaceParagraph: {
    name: 'replaceParagraph',
    description: 'Replace the entire content of a paragraph.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Paragraph index to replace'),
      text: z.string().describe('New paragraph text'),
    }),
    documentTypes: ['writer'],
  },

  deleteParagraph: {
    name: 'deleteParagraph',
    description: 'Delete a paragraph by index.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Paragraph index to delete'),
    }),
    documentTypes: ['writer'],
  },

  insertText: {
    name: 'insertText',
    description: 'Insert text at a specific position within the document.',
    parameters: z.object({
      text: z.string().describe('Text to insert'),
      position: TextPositionSchema.describe('Position to insert at'),
    }),
    documentTypes: ['writer'],
  },

  deleteText: {
    name: 'deleteText',
    description: 'Delete text between two positions.',
    parameters: z.object({
      start: TextPositionSchema.describe('Start position'),
      end: TextPositionSchema.describe('End position'),
    }),
    documentTypes: ['writer'],
  },

  replaceText: {
    name: 'replaceText',
    description: 'Find and replace text within the document.',
    parameters: z.object({
      find: z.string().min(1).describe('Text to find'),
      replace: z.string().describe('Replacement text'),
      paragraph: z.number().int().min(0).optional()
        .describe('Limit to specific paragraph'),
      all: z.boolean().optional().describe('Replace all occurrences (default: false)'),
    }),
    documentTypes: ['writer'],
  },

  formatText: {
    name: 'formatText',
    description: 'Apply formatting to a text range.',
    parameters: z.object({
      range: TextRangeSchema.describe('Text range to format'),
      format: TextFormatSchema.describe('Formatting to apply'),
    }),
    documentTypes: ['writer'],
  },

  getFormat: {
    name: 'getFormat',
    description: 'Get the text formatting at the current cursor position or selection.',
    parameters: z.object({
      position: TextPositionSchema.optional().describe('Position to check (uses current selection if omitted)'),
    }),
    documentTypes: ['writer'],
  },
} as const satisfies Record<string, ToolDefinition>;

// ============================================
// Calc Tools (spreadsheets)
// ============================================

export const calcTools = {
  getSheetNames: {
    name: 'getSheetNames',
    description: 'Get the names of all sheets in the workbook.',
    parameters: z.object({}),
    documentTypes: ['calc'],
  },

  getCell: {
    name: 'getCell',
    description: 'Get the value and formula of a single cell.',
    parameters: z.object({
      cell: CellRefSchema.describe('Cell reference (e.g., "A1" or {row: 0, col: 0})'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index (uses active sheet if omitted)'),
    }),
    documentTypes: ['calc'],
  },

  getCells: {
    name: 'getCells',
    description: 'Get values from a range of cells. Returns a 2D array.',
    parameters: z.object({
      range: RangeRefSchema.describe('Cell range (e.g., "A1:C10")'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
      maxResponseChars: z.number().int().positive().optional()
        .describe('Maximum response size. Use smaller ranges for large data.'),
    }),
    documentTypes: ['calc'],
  },

  setCellValue: {
    name: 'setCellValue',
    description: 'Set the value of a single cell.',
    parameters: z.object({
      cell: CellRefSchema.describe('Cell reference'),
      value: z.union([z.string(), z.number()]).describe('Value to set'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  setCellFormula: {
    name: 'setCellFormula',
    description: 'Set a formula in a cell. Formula should start with "=" (e.g., "=SUM(A1:A10)").',
    parameters: z.object({
      cell: CellRefSchema.describe('Cell reference'),
      formula: z.string().describe('Formula starting with "="'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  setCells: {
    name: 'setCells',
    description: 'Set values for multiple cells at once. Pass a 2D array of values.',
    parameters: z.object({
      range: RangeRefSchema.describe('Starting cell or range'),
      values: z.array(z.array(CellValueSchema))
        .describe('2D array of values. Rows are outer array, columns are inner.'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  clearCell: {
    name: 'clearCell',
    description: 'Clear the contents of a cell.',
    parameters: z.object({
      cell: CellRefSchema.describe('Cell reference'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  clearRange: {
    name: 'clearRange',
    description: 'Clear the contents of a range of cells.',
    parameters: z.object({
      range: RangeRefSchema.describe('Cell range to clear'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  insertRow: {
    name: 'insertRow',
    description: 'Insert a new row after the specified row.',
    parameters: z.object({
      afterRow: z.number().int().min(0).describe('Insert after this row index (0-based)'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  insertColumn: {
    name: 'insertColumn',
    description: 'Insert a new column after the specified column.',
    parameters: z.object({
      afterCol: z.union([
        z.string().describe('Column letter (e.g., "A", "B", "AA")'),
        z.number().int().min(0).describe('Column index (0-based)'),
      ]).describe('Insert after this column'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  deleteRow: {
    name: 'deleteRow',
    description: 'Delete a row.',
    parameters: z.object({
      row: z.number().int().min(0).describe('Row index to delete'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  deleteColumn: {
    name: 'deleteColumn',
    description: 'Delete a column.',
    parameters: z.object({
      col: z.union([
        z.string().describe('Column letter'),
        z.number().int().min(0).describe('Column index'),
      ]).describe('Column to delete'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  formatCells: {
    name: 'formatCells',
    description: 'Apply formatting to a range of cells.',
    parameters: z.object({
      range: RangeRefSchema.describe('Cell range to format'),
      format: CellFormatSchema.describe('Formatting to apply'),
      sheet: SheetRefSchema.optional().describe('Sheet name or index'),
    }),
    documentTypes: ['calc'],
  },

  addSheet: {
    name: 'addSheet',
    description: 'Add a new sheet to the workbook.',
    parameters: z.object({
      name: z.string().min(1).describe('Name for the new sheet'),
    }),
    documentTypes: ['calc'],
  },

  renameSheet: {
    name: 'renameSheet',
    description: 'Rename an existing sheet.',
    parameters: z.object({
      sheet: SheetRefSchema.describe('Sheet to rename'),
      newName: z.string().min(1).describe('New sheet name'),
    }),
    documentTypes: ['calc'],
  },

  deleteSheet: {
    name: 'deleteSheet',
    description: 'Delete a sheet from the workbook.',
    parameters: z.object({
      sheet: SheetRefSchema.describe('Sheet to delete'),
    }),
    documentTypes: ['calc'],
  },
} as const satisfies Record<string, ToolDefinition>;

// ============================================
// Impress Tools (presentations)
// ============================================

export const impressTools = {
  getSlide: {
    name: 'getSlide',
    description: 'Get detailed content of a specific slide including title and text frames.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Zero-based slide index'),
    }),
    documentTypes: ['impress'],
  },

  getSlideCount: {
    name: 'getSlideCount',
    description: 'Get the total number of slides in the presentation.',
    parameters: z.object({}),
    documentTypes: ['impress'],
  },

  addSlide: {
    name: 'addSlide',
    description: 'Add a new slide to the presentation.',
    parameters: z.object({
      afterSlide: z.number().int().min(0).optional()
        .describe('Insert after this slide index. Omit to append at end.'),
      layout: SlideLayoutSchema.optional().describe('Slide layout to use'),
    }),
    documentTypes: ['impress'],
  },

  deleteSlide: {
    name: 'deleteSlide',
    description: 'Delete a slide from the presentation. Cannot delete the last slide.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Slide index to delete'),
    }),
    documentTypes: ['impress'],
  },

  duplicateSlide: {
    name: 'duplicateSlide',
    description: 'Create a copy of a slide. The copy is inserted after the original.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Slide index to duplicate'),
    }),
    documentTypes: ['impress'],
  },

  moveSlide: {
    name: 'moveSlide',
    description: 'Move a slide to a different position.',
    parameters: z.object({
      fromIndex: z.number().int().min(0).describe('Current slide index'),
      toIndex: z.number().int().min(0).describe('Target position index'),
    }),
    documentTypes: ['impress'],
  },

  setSlideTitle: {
    name: 'setSlideTitle',
    description: 'Set or replace the title text of a slide.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Slide index'),
      title: z.string().describe('New title text'),
    }),
    documentTypes: ['impress'],
  },

  setSlideBody: {
    name: 'setSlideBody',
    description: 'Set or replace the body text of a slide.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Slide index'),
      body: z.string().describe('New body text'),
    }),
    documentTypes: ['impress'],
  },

  setSlideNotes: {
    name: 'setSlideNotes',
    description: 'Set speaker notes for a slide.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Slide index'),
      notes: z.string().describe('Speaker notes text'),
    }),
    documentTypes: ['impress'],
  },

  setSlideLayout: {
    name: 'setSlideLayout',
    description: 'Change the layout of a slide.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Slide index'),
      layout: SlideLayoutSchema.describe('New layout to apply'),
    }),
    documentTypes: ['impress'],
  },
} as const satisfies Record<string, ToolDefinition>;

// ============================================
// Draw Tools (vector graphics / PDFs)
// ============================================

export const drawTools = {
  getPage: {
    name: 'getPage',
    description: 'Get detailed content of a specific page including shapes.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Zero-based page index'),
    }),
    documentTypes: ['draw'],
  },

  getPageCount: {
    name: 'getPageCount',
    description: 'Get the total number of pages in the document.',
    parameters: z.object({}),
    documentTypes: ['draw'],
  },

  addPage: {
    name: 'addPage',
    description: 'Add a new page to the document.',
    parameters: z.object({
      afterPage: z.number().int().min(0).optional()
        .describe('Insert after this page index. Omit to append at end.'),
    }),
    documentTypes: ['draw'],
  },

  deletePage: {
    name: 'deletePage',
    description: 'Delete a page from the document. Cannot delete the last page.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Page index to delete'),
    }),
    documentTypes: ['draw'],
  },

  duplicatePage: {
    name: 'duplicatePage',
    description: 'Create a copy of a page. The copy is inserted after the original.',
    parameters: z.object({
      index: z.number().int().min(0).describe('Page index to duplicate'),
    }),
    documentTypes: ['draw'],
  },

  addShape: {
    name: 'addShape',
    description: 'Add a shape to a page.',
    parameters: z.object({
      pageIndex: z.number().int().min(0).describe('Page index'),
      shapeType: ShapeTypeSchema.describe('Type of shape to create'),
      bounds: RectangleSchema.describe('Position and size of the shape'),
      text: z.string().optional().describe('Text content for the shape'),
      fillColor: z.string().optional().describe('Fill color as hex (e.g., "#FF0000")'),
      lineColor: z.string().optional().describe('Line/stroke color as hex'),
    }),
    documentTypes: ['draw'],
  },

  addLine: {
    name: 'addLine',
    description: 'Add a line to a page.',
    parameters: z.object({
      pageIndex: z.number().int().min(0).describe('Page index'),
      start: PositionSchema.describe('Start point of the line'),
      end: PositionSchema.describe('End point of the line'),
      lineColor: z.string().optional().describe('Line color as hex'),
      lineWidth: z.number().positive().optional().describe('Line width in twips'),
    }),
    documentTypes: ['draw'],
  },

  deleteShape: {
    name: 'deleteShape',
    description: 'Delete a shape from a page.',
    parameters: z.object({
      pageIndex: z.number().int().min(0).describe('Page index'),
      shapeIndex: z.number().int().min(0).describe('Shape index on the page'),
    }),
    documentTypes: ['draw'],
  },

  setShapeText: {
    name: 'setShapeText',
    description: 'Set or replace the text content of a shape.',
    parameters: z.object({
      pageIndex: z.number().int().min(0).describe('Page index'),
      shapeIndex: z.number().int().min(0).describe('Shape index'),
      text: z.string().describe('New text content'),
    }),
    documentTypes: ['draw'],
  },

  moveShape: {
    name: 'moveShape',
    description: 'Move a shape to a new position.',
    parameters: z.object({
      pageIndex: z.number().int().min(0).describe('Page index'),
      shapeIndex: z.number().int().min(0).describe('Shape index'),
      position: PositionSchema.describe('New position'),
    }),
    documentTypes: ['draw'],
  },

  resizeShape: {
    name: 'resizeShape',
    description: 'Resize a shape.',
    parameters: z.object({
      pageIndex: z.number().int().min(0).describe('Page index'),
      shapeIndex: z.number().int().min(0).describe('Shape index'),
      size: SizeSchema.describe('New size'),
    }),
    documentTypes: ['draw'],
  },
} as const satisfies Record<string, ToolDefinition>;

// ============================================
// High-Level Document Operations
// ============================================

/**
 * High-level tools for document conversion, export, and rendering.
 * These operate at the document/page level rather than content editing.
 */
export const documentTools = {
  convertDocument: {
    name: 'convertDocument',
    description: 'Convert the entire document to a different format. Returns the converted document as binary data. Use this for format conversions like DOCX to PDF, XLSX to CSV, PPTX to PDF, etc.',
    parameters: z.object({
      outputFormat: OutputFormatSchema.describe('Target format for conversion'),
      options: z.object({
        pdfVersion: z.enum(['PDF/A-1b', 'PDF/A-2b', 'PDF/A-3b']).optional().describe('PDF/A compliance level for PDF output'),
        quality: z.number().min(1).max(100).optional().describe('Quality for image formats (1-100)'),
      }).optional().describe('Format-specific conversion options'),
    }),
    documentTypes: ['all'] as const,
  },

  renderPageToImage: {
    name: 'renderPageToImage',
    description: 'Render a specific page/slide to an image (PNG, JPG, or WebP). Useful for generating thumbnails, previews, or extracting visual content from documents.',
    parameters: z.object({
      pageIndex: z.number().int().min(0).describe('Zero-based page/slide index to render'),
      format: z.enum(['png', 'jpg', 'webp']).default('png').describe('Output image format'),
      width: z.number().int().min(1).max(4096).default(1024).describe('Output image width in pixels'),
      height: z.number().int().min(0).max(4096).default(0).describe('Output image height in pixels (0 = auto based on aspect ratio)'),
      quality: z.number().min(1).max(100).default(90).describe('Quality for JPG/WebP (1-100)'),
    }),
    documentTypes: ['all'] as const,
  },

  getPageCount: {
    name: 'getPageCount',
    description: 'Get the total number of pages, slides, or sheets in the document. For Writer documents, returns page count. For Calc, returns sheet count. For Impress/Draw, returns slide/page count.',
    parameters: z.object({}),
    documentTypes: ['all'] as const,
  },

  exportPageToPdf: {
    name: 'exportPageToPdf',
    description: 'Export a specific page or range of pages to PDF. Useful for extracting a subset of pages from a larger document.',
    parameters: z.object({
      startPage: z.number().int().min(0).describe('Starting page index (0-based)'),
      endPage: z.number().int().min(0).optional().describe('Ending page index (0-based, inclusive). If omitted, exports only startPage.'),
      options: z.object({
        pdfVersion: z.enum(['PDF/A-1b', 'PDF/A-2b', 'PDF/A-3b']).optional().describe('PDF/A compliance level'),
      }).optional(),
    }),
    documentTypes: ['all'] as const,
  },

  getDocumentMetadata: {
    name: 'getDocumentMetadata',
    description: 'Get document metadata including title, author, creation date, modification date, page count, and document type.',
    parameters: z.object({}),
    documentTypes: ['all'] as const,
  },

  setDocumentMetadata: {
    name: 'setDocumentMetadata',
    description: 'Set document metadata such as title, author, subject, and keywords.',
    parameters: z.object({
      title: z.string().optional().describe('Document title'),
      author: z.string().optional().describe('Document author'),
      subject: z.string().optional().describe('Document subject'),
      keywords: z.array(z.string()).optional().describe('Document keywords for search/categorization'),
    }),
    documentTypes: ['all'] as const,
  },

  exportToHtml: {
    name: 'exportToHtml',
    description: 'Export the document to HTML format. Useful for web publishing or extracting formatted content.',
    parameters: z.object({
      includeImages: z.boolean().default(true).describe('Whether to embed images in the HTML'),
      inlineStyles: z.boolean().default(true).describe('Whether to use inline CSS styles'),
    }),
    documentTypes: ['all'] as const,
  },

  extractText: {
    name: 'extractText',
    description: 'Extract all text content from the document as plain text. Useful for indexing, searching, or text analysis.',
    parameters: z.object({
      preserveFormatting: z.boolean().default(false).describe('Attempt to preserve basic formatting like paragraphs and lists'),
      pageRange: z.object({
        start: z.number().int().min(0).describe('Start page (0-based)'),
        end: z.number().int().min(0).describe('End page (0-based, inclusive)'),
      }).optional().describe('Extract text from specific page range only'),
    }),
    documentTypes: ['all'] as const,
  },

  printDocument: {
    name: 'printDocument',
    description: 'Generate print-ready output. Configures the document for printing with specified settings.',
    parameters: z.object({
      copies: z.number().int().min(1).max(999).default(1).describe('Number of copies'),
      pageRange: z.string().optional().describe('Page range to print (e.g., "1-5", "1,3,5", "all")'),
      orientation: z.enum(['portrait', 'landscape']).optional().describe('Page orientation'),
      paperSize: z.enum(['letter', 'a4', 'legal', 'a3', 'a5']).optional().describe('Paper size'),
    }),
    documentTypes: ['all'] as const,
  },
} as const satisfies Record<string, ToolDefinition>;

// ============================================
// Combined Tools Map
// ============================================

/**
 * All available tools organized by document type
 */
export const allTools = {
  common: commonTools,
  writer: writerTools,
  calc: calcTools,
  impress: impressTools,
  draw: drawTools,
  document: documentTools,
} as const;

/**
 * Flat map of all tools by name
 */
export const toolsByName = {
  ...commonTools,
  ...writerTools,
  ...calcTools,
  ...impressTools,
  ...drawTools,
  ...documentTools,
} as const;

/**
 * Get tools available for a specific document type
 */
export function getToolsForDocumentType(docType: 'writer' | 'calc' | 'impress' | 'draw'): ToolDefinition[] {
  const tools: ToolDefinition[] = [];

  // Add common tools
  for (const tool of Object.values(commonTools)) {
    tools.push(tool);
  }

  // Add document-level tools (available for all document types)
  for (const tool of Object.values(documentTools)) {
    tools.push(tool);
  }

  // Add document-specific tools
  const typeTools = {
    writer: writerTools,
    calc: calcTools,
    impress: impressTools,
    draw: drawTools,
  }[docType];

  for (const tool of Object.values(typeTools)) {
    tools.push(tool);
  }

  return tools;
}

/**
 * Check if Zod v4's toJSONSchema is available
 */
const hasToJSONSchema = typeof (z as unknown as { toJSONSchema?: unknown }).toJSONSchema === 'function';

/**
 * Convert a Zod schema to JSON Schema format using Zod v4's native support.
 * Falls back to a minimal schema if Zod v4 is not available.
 */
function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (!hasToJSONSchema) {
    // Fallback for Zod v3: return a minimal schema
    // Users on Zod v3 won't get full JSON Schema conversion but the library won't crash
    return { type: 'object' };
  }
  const jsonSchema = (z as unknown as { toJSONSchema: (s: z.ZodTypeAny, opts: { target: string }) => Record<string, unknown> }).toJSONSchema(schema, { target: 'draft-7' });
  // Remove the $schema property as it's not needed for LLM tools
  const { $schema: _schema, ...rest } = jsonSchema;
  return rest;
}

/**
 * Convert a tool definition to OpenAI-compatible function schema
 */
export function toOpenAIFunction(tool: ToolDefinition): {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
} {
  return {
    name: tool.name,
    description: tool.description,
    parameters: zodToJsonSchema(tool.parameters),
  };
}

/**
 * Convert a tool definition to Anthropic-compatible tool schema
 */
export function toAnthropicTool(tool: ToolDefinition): {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
} {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: zodToJsonSchema(tool.parameters),
  };
}

/**
 * Get all tools as OpenAI function definitions for a document type
 */
export function getOpenAIFunctions(docType: 'writer' | 'calc' | 'impress' | 'draw') {
  return getToolsForDocumentType(docType).map(toOpenAIFunction);
}

/**
 * Get all tools as Anthropic tool definitions for a document type
 */
export function getAnthropicTools(docType: 'writer' | 'calc' | 'impress' | 'draw') {
  return getToolsForDocumentType(docType).map(toAnthropicTool);
}

// ============================================
// Type exports for tool parameters
// ============================================

export type CommonToolName = keyof typeof commonTools;
export type WriterToolName = keyof typeof writerTools;
export type CalcToolName = keyof typeof calcTools;
export type ImpressToolName = keyof typeof impressTools;
export type DrawToolName = keyof typeof drawTools;
export type DocumentToolName = keyof typeof documentTools;
export type AllToolName = CommonToolName | WriterToolName | CalcToolName | ImpressToolName | DrawToolName | DocumentToolName;

// Infer parameter types from zod schemas
export type ToolParameters<T extends AllToolName> = z.infer<(typeof toolsByName)[T]['parameters']>;

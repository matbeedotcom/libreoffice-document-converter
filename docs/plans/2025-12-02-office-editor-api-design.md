# Office Editor API Design

LLM-friendly document editing API for LibreOffice WASM.

## Overview

Enable LLMs to edit LibreOffice documents via tool calling. Supports chatbot assistants and automated pipelines.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    openDocument(path)                    │
│                          │                               │
│                    LOK docType?                          │
│                    ┌────┴────┐                           │
│         ┌──────────┼─────────┼──────────┐               │
│         ▼          ▼         ▼          ▼               │
│   WriterEditor  CalcEditor  ImpressEditor  DrawEditor   │
│         │          │         │          │               │
│         └──────────┴─────────┴──────────┘               │
│                          │                               │
│                   OfficeEditor (base)                    │
│                          │                               │
│                    LOKBindings                           │
└─────────────────────────────────────────────────────────┘
```

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Use case | Chatbot + automated pipelines | Both need rich query APIs |
| Lifecycle | Hybrid (stateless default, session optional) | Safe default, batch mode when needed |
| Editor selection | Auto-detection via LOK docType | LLM just calls openDocument() |
| Operations | Coarse semantic + character-level selection | Fewer round-trips, precision when needed |
| Cell addressing | Both A1 and row/col indices | A1 for LLM, indices for batch |
| Error handling | Result objects with suggestions | LLM self-correction |
| Querying | Hierarchical with token-aware truncation | Handle large docs gracefully |
| Verification | Always verify operations | Safety over speed |

## Result Type

Every operation returns:

```typescript
interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  suggestion?: string;      // Hint for LLM self-correction
  verified: boolean;        // Always true if success
  truncated?: {
    original: number;       // Original char count
    returned: number;       // Returned char count
    message: string;        // Pagination hint
  };
}
```

## Base OfficeEditor

Shared operations across all document types:

```typescript
abstract class OfficeEditor {
  // Document info
  getStructure(options?: { maxResponseChars?: number }): OperationResult<DocumentStructure>;
  getDocumentType(): 'writer' | 'calc' | 'impress' | 'draw';

  // Lifecycle
  save(): OperationResult<{ path: string }>;
  saveAs(path: string, format: OutputFormat): OperationResult<{ path: string }>;
  close(): OperationResult<void>;

  // History
  undo(): OperationResult<void>;
  redo(): OperationResult<void>;

  // Search
  find(text: string, options?: { caseSensitive?: boolean; wholeWord?: boolean }):
    OperationResult<{ matches: number; firstMatch?: Position }>;
  findAndReplaceAll(find: string, replace: string, options?: FindOptions):
    OperationResult<{ replacements: number }>;

  // Selection (character-level precision)
  select(selection: SelectionRange): OperationResult<{ selected: string }>;
  getSelection(): OperationResult<{ text: string; range: SelectionRange }>;
  clearSelection(): OperationResult<void>;
}

interface DocumentStructure {
  type: 'writer' | 'calc' | 'impress' | 'draw';
  metadata?: { title?: string; author?: string; pageCount?: number };
}
```

## WriterEditor

Text document operations:

```typescript
class WriterEditor extends OfficeEditor {
  // Structure query
  getStructure(): OperationResult<WriterStructure>;
  getParagraph(index: number): OperationResult<Paragraph>;
  getParagraphs(start: number, count: number): OperationResult<Paragraph[]>;

  // Coarse semantic operations
  insertParagraph(text: string, options?: {
    afterIndex?: number;
    style?: 'Normal' | 'Heading 1' | 'Heading 2' | 'Heading 3' | 'List';
  }): OperationResult<{ index: number }>;

  replaceParagraph(index: number, text: string): OperationResult<{ oldText: string }>;
  deleteParagraph(index: number): OperationResult<{ deletedText: string }>;

  // Text manipulation within paragraphs
  insertText(text: string, position: TextPosition): OperationResult<void>;
  deleteText(start: TextPosition, end: TextPosition): OperationResult<{ deleted: string }>;
  replaceText(find: string, replace: string, options?: {
    paragraph?: number;
    all?: boolean;
  }): OperationResult<{ replacements: number }>;

  // Formatting
  formatText(range: TextRange, format: TextFormat): OperationResult<void>;
  getFormat(position: TextPosition): OperationResult<TextFormat>;
}

interface TextPosition {
  paragraph: number;
  character: number;
}

interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontName?: string;
  color?: string;
}

interface WriterStructure extends DocumentStructure {
  paragraphs: Array<{ index: number; preview: string; style: string; charCount: number }>;
  pageCount: number;
  wordCount: number;
}
```

## CalcEditor

Spreadsheet operations:

```typescript
class CalcEditor extends OfficeEditor {
  // Structure query
  getStructure(): OperationResult<CalcStructure>;
  getSheetNames(): OperationResult<string[]>;

  // Cell reading (A1 notation or indices)
  getCell(cell: CellRef, sheet?: SheetRef): OperationResult<CellData>;
  getCells(range: RangeRef, sheet?: SheetRef, options?: {
    maxResponseChars?: number;
  }): OperationResult<CellData[][]>;

  // Cell writing
  setCellValue(cell: CellRef, value: string | number, sheet?: SheetRef):
    OperationResult<{ oldValue: CellValue; newValue: CellValue }>;
  setCellFormula(cell: CellRef, formula: string, sheet?: SheetRef):
    OperationResult<{ calculatedValue: CellValue }>;
  setCells(range: RangeRef, values: CellValue[][], sheet?: SheetRef):
    OperationResult<{ cellsUpdated: number }>;

  // Clear operations
  clearCell(cell: CellRef, sheet?: SheetRef): OperationResult<{ oldValue: CellValue }>;
  clearRange(range: RangeRef, sheet?: SheetRef): OperationResult<{ cellsCleared: number }>;

  // Row/column operations
  insertRow(afterRow: number, sheet?: SheetRef): OperationResult<void>;
  insertColumn(afterCol: ColRef, sheet?: SheetRef): OperationResult<void>;
  deleteRow(row: number, sheet?: SheetRef): OperationResult<void>;
  deleteColumn(col: ColRef, sheet?: SheetRef): OperationResult<void>;

  // Formatting
  formatCells(range: RangeRef, format: CellFormat, sheet?: SheetRef): OperationResult<void>;

  // Sheet management
  addSheet(name: string): OperationResult<{ index: number }>;
  renameSheet(sheet: SheetRef, newName: string): OperationResult<void>;
  deleteSheet(sheet: SheetRef): OperationResult<void>;
}

// Flexible addressing
type CellRef = string | { row: number; col: number };
type RangeRef = string | { start: CellRef; end: CellRef };
type ColRef = string | number;
type SheetRef = string | number;

interface CellData {
  address: string;
  value: CellValue;
  formula?: string;
  format?: CellFormat;
}

type CellValue = string | number | boolean | null;

interface CellFormat {
  bold?: boolean;
  numberFormat?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface CalcStructure extends DocumentStructure {
  sheets: Array<{
    index: number;
    name: string;
    usedRange: string;
    rowCount: number;
    colCount: number;
  }>;
}
```

## ImpressEditor

Presentation operations:

```typescript
class ImpressEditor extends OfficeEditor {
  // Structure query
  getStructure(): OperationResult<ImpressStructure>;
  getSlide(index: number): OperationResult<SlideData>;
  getSlides(start: number, count: number): OperationResult<SlideData[]>;

  // Slide management
  addSlide(options?: {
    afterIndex?: number;
    layout?: SlideLayout;
  }): OperationResult<{ index: number }>;
  deleteSlide(index: number): OperationResult<void>;
  moveSlide(fromIndex: number, toIndex: number): OperationResult<void>;
  duplicateSlide(index: number): OperationResult<{ newIndex: number }>;

  // Text content
  getTextFrames(slideIndex: number): OperationResult<TextFrame[]>;
  setTextFrameContent(slideIndex: number, frameIndex: number, text: string):
    OperationResult<{ oldText: string }>;

  // Title/body shortcuts
  setSlideTitle(slideIndex: number, title: string): OperationResult<{ oldTitle: string }>;
  setSlideBody(slideIndex: number, body: string): OperationResult<{ oldBody: string }>;

  // Speaker notes
  getNotes(slideIndex: number): OperationResult<string>;
  setNotes(slideIndex: number, notes: string): OperationResult<{ oldNotes: string }>;
}

type SlideLayout = 'blank' | 'title' | 'titleContent' | 'twoColumn';

interface TextFrame {
  index: number;
  type: 'title' | 'body' | 'subtitle' | 'other';
  text: string;
  bounds: { x: number; y: number; width: number; height: number };
}

interface SlideData {
  index: number;
  title?: string;
  textFrames: TextFrame[];
  hasNotes: boolean;
}

interface ImpressStructure extends DocumentStructure {
  slides: Array<{
    index: number;
    title?: string;
    layout: SlideLayout;
    textFrameCount: number;
  }>;
  slideCount: number;
}
```

## DrawEditor

Drawing/PDF operations:

```typescript
class DrawEditor extends OfficeEditor {
  // Structure query
  getStructure(): OperationResult<DrawStructure>;
  getPage(index: number): OperationResult<PageData>;
  getPages(start: number, count: number): OperationResult<PageData[]>;

  // Page management
  addPage(afterIndex?: number): OperationResult<{ index: number }>;
  deletePage(index: number): OperationResult<void>;
  movePage(fromIndex: number, toIndex: number): OperationResult<void>;

  // Shape/object access
  getShapes(pageIndex: number): OperationResult<ShapeData[]>;
  getShape(pageIndex: number, shapeIndex: number): OperationResult<ShapeData>;

  // Text within shapes
  setShapeText(pageIndex: number, shapeIndex: number, text: string):
    OperationResult<{ oldText: string }>;

  // PDF text extraction
  getPageText(pageIndex: number, options?: { maxResponseChars?: number }):
    OperationResult<string>;
}

interface ShapeData {
  index: number;
  type: 'text' | 'rectangle' | 'ellipse' | 'line' | 'image' | 'group' | 'other';
  text?: string;
  bounds: { x: number; y: number; width: number; height: number };
}

interface PageData {
  index: number;
  shapes: ShapeData[];
  size: { width: number; height: number };
}

interface DrawStructure extends DocumentStructure {
  pages: Array<{
    index: number;
    shapeCount: number;
    size: { width: number; height: number };
  }>;
  pageCount: number;
  isImportedPdf: boolean;
}
```

## Factory Function

```typescript
async function openDocument(
  source: string | Uint8Array,
  options?: OpenDocumentOptions
): Promise<WriterEditor | CalcEditor | ImpressEditor | DrawEditor>;

interface OpenDocumentOptions {
  session?: boolean;           // Keep open for batch ops (default: false)
  maxResponseChars?: number;   // Default query limit (default: 8000)
  password?: string;           // For encrypted documents
  verbose?: boolean;
}

// Type guards
function isWriterEditor(editor: OfficeEditor): editor is WriterEditor;
function isCalcEditor(editor: OfficeEditor): editor is CalcEditor;
function isImpressEditor(editor: OfficeEditor): editor is ImpressEditor;
function isDrawEditor(editor: OfficeEditor): editor is DrawEditor;
```

## Usage Example

```typescript
const editor = await openDocument('/tmp/report.xlsx');

if (isCalcEditor(editor)) {
  // Get structure first
  const structure = editor.getStructure();
  // { success: true, data: { sheets: [{ name: 'Sales', usedRange: 'A1:Z100' }] } }

  // Read cells
  const cells = editor.getCells('A1:D10');

  // Update with formula
  const result = editor.setCellFormula('E1', '=SUM(A1:D1)');
  // { success: true, verified: true, data: { calculatedValue: 150 } }

  editor.save();
  editor.close();
}
```

## Implementation Notes

- All operations verify results by re-reading after write
- Token truncation preserves complete rows/paragraphs
- UNO commands mapped to semantic operations internally
- LOKBindings methods used for low-level LOK interaction

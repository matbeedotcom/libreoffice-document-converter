// src/editor/types.ts
import type { OutputFormat } from '../types.js';

/**
 * Result of any editor operation
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  suggestion?: string;
  verified: boolean;
  truncated?: TruncationInfo;
}

export interface TruncationInfo {
  original: number;
  returned: number;
  message: string;
}

/**
 * Options for opening a document
 */
export interface OpenDocumentOptions {
  session?: boolean;
  maxResponseChars?: number;
  password?: string;
  verbose?: boolean;
}

// ============================================
// Text Document Types (Writer)
// ============================================

export interface TextPosition {
  paragraph: number;
  character: number;
}

export interface TextRange {
  start: TextPosition;
  end: TextPosition;
}

export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontName?: string;
  color?: string;
}

export interface Paragraph {
  index: number;
  text: string;
  style: string;
  charCount: number;
}

export interface WriterStructure {
  type: 'writer';
  paragraphs: Array<{ index: number; preview: string; style: string; charCount: number }>;
  pageCount: number;
  wordCount: number;
  metadata?: DocumentMetadata;
}

// ============================================
// Spreadsheet Types (Calc)
// ============================================

export type CellRef = string | { row: number; col: number };
export type RangeRef = string | { start: CellRef; end: CellRef };
export type ColRef = string | number;
export type SheetRef = string | number;
export type CellValue = string | number | boolean | null;

export interface CellData {
  address: string;
  value: CellValue;
  formula?: string;
  format?: CellFormat;
}

export interface CellFormat {
  bold?: boolean;
  numberFormat?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface SheetInfo {
  index: number;
  name: string;
  usedRange: string;
  rowCount: number;
  colCount: number;
}

export interface CalcStructure {
  type: 'calc';
  sheets: SheetInfo[];
  metadata?: DocumentMetadata;
}

// ============================================
// Presentation Types (Impress)
// ============================================

export type SlideLayout = 'blank' | 'title' | 'titleContent' | 'twoColumn';

export interface TextFrame {
  index: number;
  type: 'title' | 'body' | 'subtitle' | 'other';
  text: string;
  bounds: Rectangle;
}

export interface SlideData {
  index: number;
  title?: string;
  textFrames: TextFrame[];
  hasNotes: boolean;
}

export interface SlideInfo {
  index: number;
  title?: string;
  layout: SlideLayout;
  textFrameCount: number;
}

export interface ImpressStructure {
  type: 'impress';
  slides: SlideInfo[];
  slideCount: number;
  metadata?: DocumentMetadata;
}

// ============================================
// Drawing Types (Draw)
// ============================================

export type ShapeType = 'text' | 'rectangle' | 'ellipse' | 'line' | 'image' | 'group' | 'other';

export interface ShapeData {
  index: number;
  type: ShapeType;
  text?: string;
  bounds: Rectangle;
}

export interface PageData {
  index: number;
  shapes: ShapeData[];
  size: Size;
}

export interface PageInfo {
  index: number;
  shapeCount: number;
  size: Size;
}

export interface DrawStructure {
  type: 'draw';
  pages: PageInfo[];
  pageCount: number;
  isImportedPdf: boolean;
  metadata?: DocumentMetadata;
}

// ============================================
// Common Types
// ============================================

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  pageCount?: number;
}

export type DocumentStructure = WriterStructure | CalcStructure | ImpressStructure | DrawStructure;
export type DocumentType = 'writer' | 'calc' | 'impress' | 'draw';

export interface SelectionRange {
  type: 'text' | 'cell' | 'shape';
  start: TextPosition | CellRef | { page: number; shape: number };
  end?: TextPosition | CellRef | { page: number; shape: number };
}

export interface FindOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  paragraph?: number;
}

export interface Position {
  x: number;
  y: number;
}

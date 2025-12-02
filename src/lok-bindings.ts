/**
 * LibreOfficeKit Low-Level Bindings
 *
 * This module provides direct access to the LibreOfficeKit C API
 * through the WASM module using the stable lok_* shim exports.
 *
 * Shim functions (C side) should be defined as:
 *   - lok_documentLoad(pKit, pPath)
 *   - lok_documentLoadWithOptions(pKit, pPath, pOptions)
 *   - lok_documentSaveAs(pDoc, pUrl, pFormat, pFilterOptions)
 *   - lok_documentDestroy(pDoc)
 *   - lok_getError(pKit)
 *   - lok_destroy(pKit)          <-- RECOMMENDED to add
 */

import type { EmscriptenModule } from './types.js';

// Extended module type with our LOK shim exports
interface LOKModule extends EmscriptenModule {
  _lok_documentLoad?: (lok: number, path: number) => number;
  _lok_documentLoadWithOptions?: (lok: number, path: number, options: number) => number;
  _lok_documentSaveAs?: (doc: number, url: number, format: number, opts: number) => number;
  _lok_documentDestroy?: (doc: number) => void;
  _lok_getError?: (lok: number) => number;
  _lok_destroy?: (lok: number) => void;
  // Page rendering shims
  _lok_documentGetParts?: (doc: number) => number;
  _lok_documentGetPart?: (doc: number) => number;
  _lok_documentSetPart?: (doc: number, part: number) => void;
  _lok_documentGetDocumentType?: (doc: number) => number;
  _lok_documentGetDocumentSize?: (doc: number, widthPtr: number, heightPtr: number) => void;
  _lok_documentInitializeForRendering?: (doc: number, args: number) => void;
  _lok_documentPaintTile?: (
    doc: number,
    buffer: number,
    canvasWidth: number,
    canvasHeight: number,
    tilePosX: number,
    tilePosY: number,
    tileWidth: number,
    tileHeight: number
  ) => void;
  _lok_documentGetTileMode?: (doc: number) => number;
  // Text selection and content shims
  _lok_documentGetTextSelection?: (doc: number, mimeType: number, usedMimeType: number) => number;
  _lok_documentSetTextSelection?: (doc: number, type: number, x: number, y: number) => void;
  _lok_documentGetSelectionType?: (doc: number) => number;
  _lok_documentResetSelection?: (doc: number) => void;
  // Mouse and keyboard event shims
  _lok_documentPostMouseEvent?: (doc: number, type: number, x: number, y: number, count: number, buttons: number, modifier: number) => void;
  _lok_documentPostKeyEvent?: (doc: number, type: number, charCode: number, keyCode: number) => void;
  // UNO command shims
  _lok_documentPostUnoCommand?: (doc: number, command: number, args: number, notifyWhenFinished: number) => void;
  _lok_documentGetCommandValues?: (doc: number, command: number) => number;
  // Page/Part information shims
  _lok_documentGetPartPageRectangles?: (doc: number) => number;
  _lok_documentGetPartInfo?: (doc: number, part: number) => number;
  _lok_documentGetPartName?: (doc: number, part: number) => number;
  // Clipboard shims
  _lok_documentPaste?: (doc: number, mimeType: number, data: number, size: number) => number;
  // View and zoom shims
  _lok_documentSetClientZoom?: (doc: number, tilePixelWidth: number, tilePixelHeight: number, tileTwipWidth: number, tileTwipHeight: number) => void;
  _lok_documentSetClientVisibleArea?: (doc: number, x: number, y: number, width: number, height: number) => void;
  // Accessibility shims
  _lok_documentGetA11yFocusedParagraph?: (doc: number) => number;
  _lok_documentGetA11yCaretPosition?: (doc: number) => number;
  _lok_documentSetAccessibilityState?: (doc: number, viewId: number, enabled: number) => void;
  // Spreadsheet-specific shims
  _lok_documentGetDataArea?: (doc: number, part: number, colPtr: number, rowPtr: number) => void;
  // Edit mode shim
  _lok_documentGetEditMode?: (doc: number) => number;
}

// LOK Mouse Event Types
export const LOK_MOUSEEVENT_BUTTONDOWN = 0;
export const LOK_MOUSEEVENT_BUTTONUP = 1;
export const LOK_MOUSEEVENT_MOVE = 2;

// LOK Key Event Types
export const LOK_KEYEVENT_KEYINPUT = 0;
export const LOK_KEYEVENT_KEYUP = 1;

// LOK Selection Types
export const LOK_SELTYPE_NONE = 0;
export const LOK_SELTYPE_TEXT = 1;
export const LOK_SELTYPE_CELL = 2;

// LOK Text Selection Types
export const LOK_SETTEXTSELECTION_START = 0;
export const LOK_SETTEXTSELECTION_END = 1;
export const LOK_SETTEXTSELECTION_RESET = 2;

// LOK Document Types
export const LOK_DOCTYPE_TEXT = 0;
export const LOK_DOCTYPE_SPREADSHEET = 1;
export const LOK_DOCTYPE_PRESENTATION = 2;
export const LOK_DOCTYPE_DRAWING = 3;
export const LOK_DOCTYPE_OTHER = 4;

// Fallback offsets for WASM32 (4-byte pointers) if shims not available
const LOK_CLASS = {
  nSize: 0,
  destroy: 4,
  documentLoad: 8,
  getError: 12,
  documentLoadWithOptions: 16,
  freeError: 20,
};

const DOC_CLASS = {
  nSize: 0,
  destroy: 4,
  saveAs: 8,
};

// Reuse encoder/decoder
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export class LOKBindings {
  private module: LOKModule;
  private lokPtr = 0;
  private verbose: boolean;
  private useShims: boolean;

  constructor(module: EmscriptenModule, verbose = false) {
    this.module = module as LOKModule;
    this.verbose = verbose;

    this.useShims = typeof this.module._lok_documentLoad === 'function';
    if (this.useShims) {
      this.log('Using direct LOK shim exports');
    } else {
      this.log('Using vtable traversal (shims not available)');
    }
  }

  private log(...args: unknown[]): void {
    if (this.verbose) {
      console.log('[LOK]', ...args);
    }
  }

  /**
   * Get fresh heap views (important after memory growth!)
   */
  private get HEAPU8(): Uint8Array {
    return this.module.HEAPU8;
  }

  private get HEAPU32(): Uint32Array {
    return this.module.HEAPU32;
  }

  private get HEAP32(): Int32Array {
    return this.module.HEAP32;
  }

  /**
   * Allocate a null-terminated string in WASM memory
   */
  allocString(str: string): number {
    const bytes = textEncoder.encode(str + '\0');
    const ptr = this.module._malloc(bytes.length);
    // Always get fresh heap view after malloc (might have grown memory)
    this.HEAPU8.set(bytes, ptr);
    return ptr;
  }

  /**
   * Read a null-terminated string from WASM memory
   */
  readString(ptr: number): string | null {
    if (ptr === 0) return null;
    // Always get fresh heap view
    const heap = this.HEAPU8;
    let end = ptr;
    while (heap[end] !== 0) end++;
    return textDecoder.decode(heap.subarray(ptr, end));
  }

  /**
   * Read a 32-bit pointer from memory (unsigned)
   */
  readPtr(addr: number): number {
    // Always get fresh heap view
    return this.HEAPU32[addr >> 2] || 0;
  }

  /**
   * Get a function from the WASM table (fallback for vtable traversal)
   */
  private getFunc<T>(ptr: number): T {
    const wasmTable = this.module.wasmTable as WebAssembly.Table;
    return wasmTable.get(ptr) as T;
  }

  /**
   * Initialize LibreOfficeKit
   */
  initialize(installPath: string = '/instdir/program'): void {
    this.log('Initializing with path:', installPath);
    const pathPtr = this.allocString(installPath);

    try {
      const hook = (this.module as any)._libreofficekit_hook as
        | ((pathPtr: number) => number)
        | undefined;

      if (typeof hook !== 'function') {
        throw new Error('libreofficekit_hook export not found on module');
      }

      this.lokPtr = hook(pathPtr);

      if (this.lokPtr === 0) {
        throw new Error('Failed to initialize LibreOfficeKit');
      }

      this.log('LOK initialized, ptr:', this.lokPtr);
    } finally {
      this.module._free(pathPtr);
    }
  }

  /**
   * Get the last error message
   */
  getError(): string | null {
    if (this.lokPtr === 0) return null;

    // Prefer shim
    if (this.useShims && this.module._lok_getError) {
      const errPtr = this.module._lok_getError(this.lokPtr);
      return this.readString(errPtr);
    }

    // Fallback: vtable traversal
    const lokClassPtr = this.readPtr(this.lokPtr);
    const getErrorPtr = this.readPtr(lokClassPtr + LOK_CLASS.getError);
    if (getErrorPtr === 0) return null;

    const getError = this.getFunc<(lok: number) => number>(getErrorPtr);
    const errPtr = getError(this.lokPtr);
    return this.readString(errPtr);
  }

  /**
   * Get version info
   */
  getVersionInfo(): string | null {
    return 'LibreOffice WASM';
  }

  /**
   * Convert a filesystem path to a file:// URL
   * Required by LibreOffice's getAbsoluteURL() which uses rtl::Uri::convertRelToAbs()
   */
  private toFileUrl(path: string): string {
    if (path.startsWith('file://')) return path;
    const absolutePath = path.startsWith('/') ? path : '/' + path;
    return 'file://' + absolutePath;
  }

  /**
   * Load a document from the virtual filesystem
   */
  documentLoad(path: string): number {
    if (this.lokPtr === 0) {
      throw new Error('LOK not initialized');
    }

    const fileUrl = this.toFileUrl(path);
    this.log('Loading document:', path, '->', fileUrl);
    const pathPtr = this.allocString(fileUrl);

    try {
      const startTime = Date.now();
      let docPtr: number;

      if (this.useShims && this.module._lok_documentLoad) {
        // Use direct shim export
        docPtr = this.module._lok_documentLoad(this.lokPtr, pathPtr);
      } else {
        // Fallback: vtable traversal
        const lokClassPtr = this.readPtr(this.lokPtr);
        const documentLoadPtr = this.readPtr(lokClassPtr + LOK_CLASS.documentLoad);
        const documentLoad = this.getFunc<(lok: number, path: number) => number>(documentLoadPtr);
        docPtr = documentLoad(this.lokPtr, pathPtr);
      }

      this.log('Document loaded in', Date.now() - startTime, 'ms, ptr:', docPtr);

      if (docPtr === 0) {
        const error = this.getError();
        throw new Error(`Failed to load document: ${error || 'unknown error'}`);
      }

      return docPtr;
    } finally {
      this.module._free(pathPtr);
    }
  }

  /**
   * Load a document with options
   */
  documentLoadWithOptions(path: string, options: string): number {
    if (this.lokPtr === 0) {
      throw new Error('LOK not initialized');
    }

    const fileUrl = this.toFileUrl(path);
    this.log('Loading document with options:', path, '->', fileUrl, options);
    const pathPtr = this.allocString(fileUrl);
    const optsPtr = this.allocString(options);

    try {
      let docPtr: number;

      if (this.useShims && this.module._lok_documentLoadWithOptions) {
        // Use direct shim export
        docPtr = this.module._lok_documentLoadWithOptions(this.lokPtr, pathPtr, optsPtr);
      } else {
        // Fallback: vtable traversal
        const lokClassPtr = this.readPtr(this.lokPtr);
        const loadWithOptsPtr = this.readPtr(lokClassPtr + LOK_CLASS.documentLoadWithOptions);

        if (loadWithOptsPtr === 0) {
          // No special method - fall back to plain load
          return this.documentLoad(path);
        }

        const loadWithOpts = this.getFunc<
          (lok: number, path: number, opts: number) => number
        >(loadWithOptsPtr);
        docPtr = loadWithOpts(this.lokPtr, pathPtr, optsPtr);
      }

      if (docPtr === 0) {
        const error = this.getError();
        throw new Error(`Failed to load document: ${error || 'unknown error'}`);
      }

      this.log('Document loaded, ptr:', docPtr);
      return docPtr;
    } finally {
      this.module._free(pathPtr);
      this.module._free(optsPtr);
    }
  }

  /**
   * Save a document to a different format
   */
  documentSaveAs(
    docPtr: number,
    outputPath: string,
    format: string,
    filterOptions: string = ''
  ): void {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    const fileUrl = this.toFileUrl(outputPath);
    this.log('Saving document to:', outputPath, '->', fileUrl, 'format:', format);

    const urlPtr = this.allocString(fileUrl);
    const formatPtr = this.allocString(format);
    const optsPtr = this.allocString(filterOptions);

    try {
      let result: number;

      if (this.useShims && this.module._lok_documentSaveAs) {
        // Use direct shim export
        result = this.module._lok_documentSaveAs(docPtr, urlPtr, formatPtr, optsPtr);
      } else {
        // Fallback: vtable traversal
        const docClassPtr = this.readPtr(docPtr);
        const saveAsPtr = this.readPtr(docClassPtr + DOC_CLASS.saveAs);
        const saveAs = this.getFunc<
          (doc: number, url: number, format: number, opts: number) => number
        >(saveAsPtr);
        result = saveAs(docPtr, urlPtr, formatPtr, optsPtr);
      }

      this.log('Save result:', result);

      if (result === 0) {
        throw new Error('Failed to save document');
      }
    } finally {
      this.module._free(urlPtr);
      this.module._free(formatPtr);
      this.module._free(optsPtr);
    }
  }

  /**
   * Destroy a document
   */
  documentDestroy(docPtr: number): void {
    if (docPtr === 0) return;

    if (this.useShims && this.module._lok_documentDestroy) {
      // Use direct shim export
      this.module._lok_documentDestroy(docPtr);
      this.log('Document destroyed (via shim)');
      return;
    }

    // Fallback: vtable traversal
    const docClassPtr = this.readPtr(docPtr);
    const destroyPtr = this.readPtr(docClassPtr + DOC_CLASS.destroy);

    if (destroyPtr !== 0) {
      const destroy = this.getFunc<(doc: number) => void>(destroyPtr);
      destroy(docPtr);
      this.log('Document destroyed (via vtable)');
    }
  }

  /**
   * Destroy the LOK instance
   */
  destroy(): void {
    if (this.lokPtr === 0) return;

    try {
      // Prefer C shim if available
      if (this.useShims && this.module._lok_destroy) {
        this.module._lok_destroy(this.lokPtr);
        this.log('LOK destroyed (via shim)');
      } else {
        // Fallback: vtable traversal
        const lokClassPtr = this.readPtr(this.lokPtr);
        const destroyPtr = this.readPtr(lokClassPtr + LOK_CLASS.destroy);

        if (destroyPtr !== 0) {
          const destroy = this.getFunc<(lok: number) => void>(destroyPtr);
          destroy(this.lokPtr);
          this.log('LOK destroyed (via vtable)');
        }
      }
    } catch (error) {
      this.log('LOK destroy error (ignored):', error);
    }

    this.lokPtr = 0;
  }

  /**
   * Check if LOK is initialized
   */
  isInitialized(): boolean {
    return this.lokPtr !== 0;
  }

  /**
   * Check if using direct shim exports
   */
  isUsingShims(): boolean {
    return this.useShims;
  }

  // ==========================================
  // Page Rendering Methods
  // ==========================================

  /**
   * Get the number of parts (pages/slides) in a document
   */
  documentGetParts(docPtr: number): number {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    if (this.useShims && this.module._lok_documentGetParts) {
      return this.module._lok_documentGetParts(docPtr);
    }

    // Fallback not implemented - would need vtable offsets
    this.log('documentGetParts: shim not available');
    return 0;
  }

  /**
   * Get the current part (page/slide) index
   */
  documentGetPart(docPtr: number): number {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    if (this.useShims && this.module._lok_documentGetPart) {
      return this.module._lok_documentGetPart(docPtr);
    }

    this.log('documentGetPart: shim not available');
    return 0;
  }

  /**
   * Set the current part (page/slide) index
   */
  documentSetPart(docPtr: number, part: number): void {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    if (this.useShims && this.module._lok_documentSetPart) {
      this.module._lok_documentSetPart(docPtr, part);
      return;
    }

    this.log('documentSetPart: shim not available');
  }

  /**
   * Get document type (0=text, 1=spreadsheet, 2=presentation, 3=drawing)
   */
  documentGetDocumentType(docPtr: number): number {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    if (this.useShims && this.module._lok_documentGetDocumentType) {
      return this.module._lok_documentGetDocumentType(docPtr);
    }

    this.log('documentGetDocumentType: shim not available');
    return 0;
  }

  /**
   * Get document size in twips (1/1440 inch)
   */
  documentGetDocumentSize(docPtr: number): { width: number; height: number } {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    if (this.useShims && this.module._lok_documentGetDocumentSize) {
      // Allocate space for two longs (32-bit on WASM)
      const sizePtr = this.module._malloc(8);
      try {
        this.module._lok_documentGetDocumentSize(docPtr, sizePtr, sizePtr + 4);
        const width = this.HEAP32[sizePtr >> 2] ?? 0;
        const height = this.HEAP32[(sizePtr + 4) >> 2] ?? 0;
        return { width, height };
      } finally {
        this.module._free(sizePtr);
      }
    }

    this.log('documentGetDocumentSize: shim not available');
    return { width: 0, height: 0 };
  }

  /**
   * Initialize document for rendering
   */
  documentInitializeForRendering(docPtr: number, options: string = ''): void {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    if (this.useShims && this.module._lok_documentInitializeForRendering) {
      const optsPtr = this.allocString(options);
      try {
        this.module._lok_documentInitializeForRendering(docPtr, optsPtr);
      } finally {
        this.module._free(optsPtr);
      }
      return;
    }

    this.log('documentInitializeForRendering: shim not available');
  }

  /**
   * Paint a tile of the document to a buffer
   * @param docPtr Document pointer
   * @param canvasWidth Output width in pixels
   * @param canvasHeight Output height in pixels
   * @param tilePosX X position in twips
   * @param tilePosY Y position in twips
   * @param tileWidth Width in twips
   * @param tileHeight Height in twips
   * @returns RGBA pixel data
   */
  documentPaintTile(
    docPtr: number,
    canvasWidth: number,
    canvasHeight: number,
    tilePosX: number,
    tilePosY: number,
    tileWidth: number,
    tileHeight: number
  ): Uint8Array {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    if (this.useShims && this.module._lok_documentPaintTile) {
      // Allocate RGBA buffer (4 bytes per pixel)
      const bufferSize = canvasWidth * canvasHeight * 4;
      const bufferPtr = this.module._malloc(bufferSize);

      try {
        this.module._lok_documentPaintTile(
          docPtr,
          bufferPtr,
          canvasWidth,
          canvasHeight,
          tilePosX,
          tilePosY,
          tileWidth,
          tileHeight
        );

        // Copy data out of WASM memory
        const result = new Uint8Array(bufferSize);
        result.set(this.HEAPU8.subarray(bufferPtr, bufferPtr + bufferSize));
        return result;
      } finally {
        this.module._free(bufferPtr);
      }
    }

    this.log('documentPaintTile: shim not available');
    return new Uint8Array(0);
  }

  /**
   * Get tile mode (0=RGBA, 1=BGRA)
   */
  documentGetTileMode(docPtr: number): number {
    if (docPtr === 0) {
      throw new Error('Invalid document pointer');
    }

    if (this.useShims && this.module._lok_documentGetTileMode) {
      return this.module._lok_documentGetTileMode(docPtr);
    }

    this.log('documentGetTileMode: shim not available');
    return 0; // Default to RGBA
  }

  /**
   * Render a page/slide to an image
   * @param docPtr Document pointer
   * @param pageIndex Page/slide index (0-based)
   * @param width Output width in pixels
   * @param height Output height in pixels (0 = auto based on aspect ratio)
   * @returns RGBA pixel data and dimensions
   */
  renderPage(
    docPtr: number,
    pageIndex: number,
    width: number,
    height: number = 0
  ): { data: Uint8Array; width: number; height: number } {
    // Initialize for rendering if not already done
    this.documentInitializeForRendering(docPtr);

    // Set the page/part
    this.documentSetPart(docPtr, pageIndex);

    // Get document size in twips
    const docSize = this.documentGetDocumentSize(docPtr);
    this.log('Document size (twips):', docSize);

    if (docSize.width === 0 || docSize.height === 0) {
      throw new Error('Failed to get document size');
    }

    // Calculate output height if not specified (maintain aspect ratio)
    const aspectRatio = docSize.height / docSize.width;
    const outputWidth = width;
    const outputHeight = height > 0 ? height : Math.round(width * aspectRatio);

    this.log(`Rendering page ${pageIndex} at ${outputWidth}x${outputHeight}`);

    // Paint the tile
    const data = this.documentPaintTile(
      docPtr,
      outputWidth,
      outputHeight,
      0,
      0,
      docSize.width,
      docSize.height
    );

    return { data, width: outputWidth, height: outputHeight };
  }

  // ==========================================
  // Text Selection and Content Methods
  // ==========================================

  /**
   * Get currently selected text
   * @param docPtr Document pointer
   * @param mimeType Desired MIME type (e.g., 'text/plain', 'text/html')
   * @returns Selected text or null
   */
  getTextSelection(docPtr: number, mimeType: string = 'text/plain'): string | null {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetTextSelection) {
      const mimePtr = this.allocString(mimeType);
      const usedMimePtr = this.module._malloc(4); // pointer to char*
      try {
        const resultPtr = this.module._lok_documentGetTextSelection(docPtr, mimePtr, usedMimePtr);
        if (resultPtr === 0) return null;
        const result = this.readString(resultPtr);
        this.module._free(resultPtr);
        return result;
      } finally {
        this.module._free(mimePtr);
        this.module._free(usedMimePtr);
      }
    }

    this.log('getTextSelection: shim not available');
    return null;
  }

  /**
   * Set text selection at coordinates
   * @param docPtr Document pointer
   * @param type Selection type (LOK_SETTEXTSELECTION_START, END, or RESET)
   * @param x X coordinate in twips
   * @param y Y coordinate in twips
   */
  setTextSelection(docPtr: number, type: number, x: number, y: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentSetTextSelection) {
      this.module._lok_documentSetTextSelection(docPtr, type, x, y);
      return;
    }

    this.log('setTextSelection: shim not available');
  }

  /**
   * Get current selection type
   * @param docPtr Document pointer
   * @returns Selection type (LOK_SELTYPE_NONE, TEXT, or CELL)
   */
  getSelectionType(docPtr: number): number {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetSelectionType) {
      return this.module._lok_documentGetSelectionType(docPtr);
    }

    this.log('getSelectionType: shim not available');
    return 0;
  }

  /**
   * Reset/clear current selection
   * @param docPtr Document pointer
   */
  resetSelection(docPtr: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentResetSelection) {
      this.module._lok_documentResetSelection(docPtr);
      return;
    }

    this.log('resetSelection: shim not available');
  }

  // ==========================================
  // Mouse and Keyboard Event Methods
  // ==========================================

  /**
   * Post a mouse event to the document
   * @param docPtr Document pointer
   * @param type Event type (LOK_MOUSEEVENT_BUTTONDOWN, BUTTONUP, MOVE)
   * @param x X coordinate in twips
   * @param y Y coordinate in twips
   * @param count Click count (1 for single, 2 for double click)
   * @param buttons Button mask (1=left, 2=middle, 4=right)
   * @param modifier Modifier keys mask
   */
  postMouseEvent(
    docPtr: number,
    type: number,
    x: number,
    y: number,
    count: number = 1,
    buttons: number = 1,
    modifier: number = 0
  ): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentPostMouseEvent) {
      this.module._lok_documentPostMouseEvent(docPtr, type, x, y, count, buttons, modifier);
      return;
    }

    this.log('postMouseEvent: shim not available');
  }

  /**
   * Post a keyboard event to the document
   * @param docPtr Document pointer
   * @param type Event type (LOK_KEYEVENT_KEYINPUT, KEYUP)
   * @param charCode Character code
   * @param keyCode Key code
   */
  postKeyEvent(docPtr: number, type: number, charCode: number, keyCode: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentPostKeyEvent) {
      this.module._lok_documentPostKeyEvent(docPtr, type, charCode, keyCode);
      return;
    }

    this.log('postKeyEvent: shim not available');
  }

  // ==========================================
  // UNO Command Methods
  // ==========================================

  /**
   * Execute a UNO command
   * @param docPtr Document pointer
   * @param command UNO command (e.g., '.uno:SelectAll', '.uno:Copy')
   * @param args JSON arguments string
   * @param notifyWhenFinished Whether to notify when command completes
   */
  postUnoCommand(
    docPtr: number,
    command: string,
    args: string = '{}',
    notifyWhenFinished: boolean = false
  ): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentPostUnoCommand) {
      const cmdPtr = this.allocString(command);
      const argsPtr = this.allocString(args);
      try {
        this.module._lok_documentPostUnoCommand(docPtr, cmdPtr, argsPtr, notifyWhenFinished ? 1 : 0);
      } finally {
        this.module._free(cmdPtr);
        this.module._free(argsPtr);
      }
      return;
    }

    this.log('postUnoCommand: shim not available');
  }

  /**
   * Get command values (query document state)
   * @param docPtr Document pointer
   * @param command Command to query (e.g., '.uno:CharFontName')
   * @returns JSON string with command values
   */
  getCommandValues(docPtr: number, command: string): string | null {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetCommandValues) {
      const cmdPtr = this.allocString(command);
      try {
        const resultPtr = this.module._lok_documentGetCommandValues(docPtr, cmdPtr);
        if (resultPtr === 0) return null;
        const result = this.readString(resultPtr);
        this.module._free(resultPtr);
        return result;
      } finally {
        this.module._free(cmdPtr);
      }
    }

    this.log('getCommandValues: shim not available');
    return null;
  }

  // ==========================================
  // Page/Part Information Methods
  // ==========================================

  /**
   * Get bounding rectangles for all pages
   * @param docPtr Document pointer
   * @returns String with rectangles "x,y,width,height;x,y,width,height;..."
   */
  getPartPageRectangles(docPtr: number): string | null {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetPartPageRectangles) {
      const resultPtr = this.module._lok_documentGetPartPageRectangles(docPtr);
      if (resultPtr === 0) return null;
      const result = this.readString(resultPtr);
      this.module._free(resultPtr);
      return result;
    }

    this.log('getPartPageRectangles: shim not available');
    return null;
  }

  /**
   * Get information about a page/slide
   * @param docPtr Document pointer
   * @param part Part index
   * @returns JSON string with part info
   */
  getPartInfo(docPtr: number, part: number): string | null {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetPartInfo) {
      const resultPtr = this.module._lok_documentGetPartInfo(docPtr, part);
      if (resultPtr === 0) return null;
      const result = this.readString(resultPtr);
      this.module._free(resultPtr);
      return result;
    }

    this.log('getPartInfo: shim not available');
    return null;
  }

  /**
   * Get name of a page/slide
   * @param docPtr Document pointer
   * @param part Part index
   * @returns Part name
   */
  getPartName(docPtr: number, part: number): string | null {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetPartName) {
      const resultPtr = this.module._lok_documentGetPartName(docPtr, part);
      if (resultPtr === 0) return null;
      const result = this.readString(resultPtr);
      this.module._free(resultPtr);
      return result;
    }

    this.log('getPartName: shim not available');
    return null;
  }

  // ==========================================
  // Clipboard Methods
  // ==========================================

  /**
   * Paste content at current cursor position
   * @param docPtr Document pointer
   * @param mimeType MIME type of data
   * @param data Data to paste
   * @returns true if successful
   */
  paste(docPtr: number, mimeType: string, data: string | Uint8Array): boolean {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentPaste) {
      const mimePtr = this.allocString(mimeType);
      let dataPtr: number;
      let dataSize: number;

      if (typeof data === 'string') {
        const bytes = new TextEncoder().encode(data);
        dataSize = bytes.length;
        dataPtr = this.module._malloc(dataSize);
        this.HEAPU8.set(bytes, dataPtr);
      } else {
        dataSize = data.length;
        dataPtr = this.module._malloc(dataSize);
        this.HEAPU8.set(data, dataPtr);
      }

      try {
        return this.module._lok_documentPaste(docPtr, mimePtr, dataPtr, dataSize) !== 0;
      } finally {
        this.module._free(mimePtr);
        this.module._free(dataPtr);
      }
    }

    this.log('paste: shim not available');
    return false;
  }

  // ==========================================
  // View and Zoom Methods
  // ==========================================

  /**
   * Set client zoom level
   * @param docPtr Document pointer
   * @param tilePixelWidth Tile width in pixels
   * @param tilePixelHeight Tile height in pixels
   * @param tileTwipWidth Tile width in twips
   * @param tileTwipHeight Tile height in twips
   */
  setClientZoom(
    docPtr: number,
    tilePixelWidth: number,
    tilePixelHeight: number,
    tileTwipWidth: number,
    tileTwipHeight: number
  ): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentSetClientZoom) {
      this.module._lok_documentSetClientZoom(docPtr, tilePixelWidth, tilePixelHeight, tileTwipWidth, tileTwipHeight);
      return;
    }

    this.log('setClientZoom: shim not available');
  }

  /**
   * Set visible area for the client
   * @param docPtr Document pointer
   * @param x X position in twips
   * @param y Y position in twips
   * @param width Width in twips
   * @param height Height in twips
   */
  setClientVisibleArea(docPtr: number, x: number, y: number, width: number, height: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentSetClientVisibleArea) {
      this.module._lok_documentSetClientVisibleArea(docPtr, x, y, width, height);
      return;
    }

    this.log('setClientVisibleArea: shim not available');
  }

  // ==========================================
  // Accessibility Methods
  // ==========================================

  /**
   * Get the currently focused paragraph text
   * @param docPtr Document pointer
   * @returns Focused paragraph text
   */
  getA11yFocusedParagraph(docPtr: number): string | null {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetA11yFocusedParagraph) {
      const resultPtr = this.module._lok_documentGetA11yFocusedParagraph(docPtr);
      if (resultPtr === 0) return null;
      const result = this.readString(resultPtr);
      this.module._free(resultPtr);
      return result;
    }

    this.log('getA11yFocusedParagraph: shim not available');
    return null;
  }

  /**
   * Get caret position in focused paragraph
   * @param docPtr Document pointer
   * @returns Caret position or -1
   */
  getA11yCaretPosition(docPtr: number): number {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetA11yCaretPosition) {
      return this.module._lok_documentGetA11yCaretPosition(docPtr);
    }

    this.log('getA11yCaretPosition: shim not available');
    return -1;
  }

  /**
   * Enable/disable accessibility features
   * @param docPtr Document pointer
   * @param viewId View ID
   * @param enabled Whether to enable accessibility
   */
  setAccessibilityState(docPtr: number, viewId: number, enabled: boolean): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentSetAccessibilityState) {
      this.module._lok_documentSetAccessibilityState(docPtr, viewId, enabled ? 1 : 0);
      return;
    }

    this.log('setAccessibilityState: shim not available');
  }

  // ==========================================
  // Spreadsheet-Specific Methods
  // ==========================================

  /**
   * Get data area for a spreadsheet (last used row/column)
   * @param docPtr Document pointer
   * @param part Sheet index
   * @returns Object with col and row counts
   */
  getDataArea(docPtr: number, part: number): { col: number; row: number } {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetDataArea) {
      const colPtr = this.module._malloc(8);
      const rowPtr = this.module._malloc(8);
      try {
        this.module._lok_documentGetDataArea(docPtr, part, colPtr, rowPtr);
        const col = this.HEAP32[colPtr >> 2] ?? 0;
        const row = this.HEAP32[rowPtr >> 2] ?? 0;
        return { col, row };
      } finally {
        this.module._free(colPtr);
        this.module._free(rowPtr);
      }
    }

    this.log('getDataArea: shim not available');
    return { col: 0, row: 0 };
  }

  // ==========================================
  // Edit Mode Methods
  // ==========================================

  /**
   * Get current edit mode
   * @param docPtr Document pointer
   * @returns Edit mode value
   */
  getEditMode(docPtr: number): number {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetEditMode) {
      return this.module._lok_documentGetEditMode(docPtr);
    }

    this.log('getEditMode: shim not available');
    return 0;
  }

  // ==========================================
  // High-Level Convenience Methods
  // ==========================================

  /**
   * Click at a position and get text at that location
   * @param docPtr Document pointer
   * @param x X coordinate in twips
   * @param y Y coordinate in twips
   * @returns Text at the clicked position
   */
  clickAndGetText(docPtr: number, x: number, y: number): string | null {
    // Click down and up to select
    this.postMouseEvent(docPtr, LOK_MOUSEEVENT_BUTTONDOWN, x, y, 1, 1, 0);
    this.postMouseEvent(docPtr, LOK_MOUSEEVENT_BUTTONUP, x, y, 1, 1, 0);
    
    // Get selected text
    return this.getTextSelection(docPtr, 'text/plain');
  }

  /**
   * Double-click to select a word and get it
   * @param docPtr Document pointer
   * @param x X coordinate in twips
   * @param y Y coordinate in twips
   * @returns Selected word
   */
  doubleClickAndGetWord(docPtr: number, x: number, y: number): string | null {
    // Double click to select word
    this.postMouseEvent(docPtr, LOK_MOUSEEVENT_BUTTONDOWN, x, y, 2, 1, 0);
    this.postMouseEvent(docPtr, LOK_MOUSEEVENT_BUTTONUP, x, y, 2, 1, 0);
    
    // Get selected text
    return this.getTextSelection(docPtr, 'text/plain');
  }

  /**
   * Select all content in the document
   * @param docPtr Document pointer
   */
  selectAll(docPtr: number): void {
    this.postUnoCommand(docPtr, '.uno:SelectAll');
  }

  /**
   * Get all text content from the document
   * @param docPtr Document pointer
   * @returns All text content
   */
  getAllText(docPtr: number): string | null {
    this.selectAll(docPtr);
    const text = this.getTextSelection(docPtr, 'text/plain');
    this.resetSelection(docPtr);
    return text;
  }

  /**
   * Parse page rectangles string into array of objects
   * @param rectanglesStr String from getPartPageRectangles
   * @returns Array of rectangle objects
   */
  parsePageRectangles(rectanglesStr: string): Array<{ x: number; y: number; width: number; height: number }> {
    if (!rectanglesStr) return [];
    
    return rectanglesStr.split(';').filter(s => s.trim()).map(rect => {
      const parts = rect.split(',').map(Number);
      return { 
        x: parts[0] ?? 0, 
        y: parts[1] ?? 0, 
        width: parts[2] ?? 0, 
        height: parts[3] ?? 0 
      };
    });
  }
}

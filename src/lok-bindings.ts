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
}

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
}

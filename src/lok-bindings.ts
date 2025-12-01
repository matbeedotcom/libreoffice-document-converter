/**
 * LibreOfficeKit Low-Level Bindings
 *
 * This module provides direct access to the LibreOfficeKit C API
 * through the WASM module.
 *
 * Struct layouts for WASM32 (4-byte pointers):
 *
 * LibreOfficeKitClass:
 *   offset 0: nSize (size_t)
 *   offset 4: destroy (function pointer)
 *   offset 8: documentLoad (function pointer)
 *   offset 12: getError (function pointer)
 *   offset 16: documentLoadWithOptions (function pointer)
 *   offset 20: freeError (function pointer)
 *   ...
 *
 * LibreOfficeKitDocumentClass:
 *   offset 0: nSize (size_t)
 *   offset 4: destroy (function pointer)
 *   offset 8: saveAs (function pointer)
 *   ... more methods
 */

import type { EmscriptenModule } from './types.js';

// Offsets for WASM32 (4-byte pointers)
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

export class LOKBindings {
  private module: EmscriptenModule;
  private lokPtr: number = 0;
  private verbose: boolean;

  constructor(module: EmscriptenModule, verbose = false) {
    this.module = module;
    this.verbose = verbose;
  }

  private log(...args: unknown[]): void {
    if (this.verbose) {
      console.log('[LOK]', ...args);
    }
  }

  /**
   * Allocate a null-terminated string in WASM memory
   */
  allocString(str: string): number {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str + '\0');
    const ptr = this.module._malloc(bytes.length);
    this.module.HEAPU8.set(bytes, ptr);
    return ptr;
  }

  /**
   * Read a null-terminated string from WASM memory
   */
  readString(ptr: number): string | null {
    if (ptr === 0) return null;
    const heap = this.module.HEAPU8;
    let end = ptr;
    while (heap[end] !== 0) end++;
    return new TextDecoder().decode(heap.subarray(ptr, end));
  }

  /**
   * Read a 32-bit pointer from memory
   */
  readPtr(addr: number): number {
    return this.module.HEAP32[addr >> 2];
  }

  /**
   * Get a function from the WASM table
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
      // Call libreofficekit_hook to get LOK instance
      // Note: Do NOT call _lok_preinit - it causes issues with the optimized build
      this.lokPtr = this.module._libreofficekit_hook(pathPtr);

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
    // This would need the getFilterTypes or similar method
    // For now, return a placeholder
    return 'LibreOffice WASM';
  }

  /**
   * Load a document from the virtual filesystem
   */
  documentLoad(path: string): number {
    if (this.lokPtr === 0) {
      throw new Error('LOK not initialized');
    }

    console.log('[LOK] documentLoad: path =', path);
    const lokClassPtr = this.readPtr(this.lokPtr);
    const documentLoadPtr = this.readPtr(lokClassPtr + LOK_CLASS.documentLoad);
    const documentLoad = this.getFunc<(lok: number, path: number) => number>(documentLoadPtr);

    const pathPtr = this.allocString(path);
    console.log('[LOK] documentLoad: Calling native function...');

    try {
      const startTime = Date.now();
      const docPtr = documentLoad(this.lokPtr, pathPtr);
      console.log('[LOK] documentLoad: Returned in', Date.now() - startTime, 'ms, docPtr =', docPtr);

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

    const lokClassPtr = this.readPtr(this.lokPtr);
    const loadWithOptsPtr = this.readPtr(lokClassPtr + LOK_CLASS.documentLoadWithOptions);

    if (loadWithOptsPtr === 0) {
      // Fall back to regular load
      return this.documentLoad(path);
    }

    const loadWithOpts = this.getFunc<(lok: number, path: number, opts: number) => number>(loadWithOptsPtr);

    // Use raw path for WASM virtual filesystem
    this.log('Loading document with options:', path, options);
    const pathPtr = this.allocString(path);
    const optsPtr = this.allocString(options);

    try {
      const docPtr = loadWithOpts(this.lokPtr, pathPtr, optsPtr);

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

    const docClassPtr = this.readPtr(docPtr);
    const saveAsPtr = this.readPtr(docClassPtr + DOC_CLASS.saveAs);

    const saveAs = this.getFunc<(doc: number, url: number, format: number, opts: number) => number>(saveAsPtr);

    // Use raw path for WASM virtual filesystem
    this.log('Saving document to:', outputPath, 'format:', format, 'options:', filterOptions);

    const urlPtr = this.allocString(outputPath);
    const formatPtr = this.allocString(format);
    const optsPtr = this.allocString(filterOptions);

    try {
      const result = saveAs(docPtr, urlPtr, formatPtr, optsPtr);
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

    const docClassPtr = this.readPtr(docPtr);
    const destroyPtr = this.readPtr(docClassPtr + DOC_CLASS.destroy);

    if (destroyPtr !== 0) {
      const destroy = this.getFunc<(doc: number) => void>(destroyPtr);
      destroy(docPtr);
      this.log('Document destroyed');
    }
  }

  /**
   * Destroy the LOK instance
   */
  destroy(): void {
    if (this.lokPtr === 0) return;

    try {
      const lokClassPtr = this.readPtr(this.lokPtr);
      const destroyPtr = this.readPtr(lokClassPtr + LOK_CLASS.destroy);

      if (destroyPtr !== 0) {
        const destroy = this.getFunc<(lok: number) => void>(destroyPtr);
        destroy(this.lokPtr);
        this.log('LOK destroyed');
      }
    } catch (error) {
      // Ignore cleanup errors - WASM may have already been unloaded
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
}

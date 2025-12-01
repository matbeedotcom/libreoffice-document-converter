/**
 * LibreOfficeKit Low-Level Bindings
 *
 * This module provides direct access to the LibreOfficeKit C API
 * through the WASM module using the stable lok_* shim exports.
 *
 * The shim functions are defined in desktop/source/lib/init.cxx:
 *   - lok_documentLoad(pKit, pPath)
 *   - lok_documentLoadWithOptions(pKit, pPath, pOptions)
 *   - lok_documentSaveAs(pDoc, pUrl, pFormat, pFilterOptions)
 *   - lok_documentDestroy(pDoc)
 *   - lok_getError(pKit)
 */

import type { EmscriptenModule } from './types.js';

// Extended module type with our LOK shim exports
interface LOKModule extends EmscriptenModule {
  _lok_documentLoad?: (lok: number, path: number) => number;
  _lok_documentLoadWithOptions?: (lok: number, path: number, options: number) => number;
  _lok_documentSaveAs?: (doc: number, url: number, format: number, opts: number) => number;
  _lok_documentDestroy?: (doc: number) => void;
  _lok_getError?: (lok: number) => number;
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

export class LOKBindings {
  private module: LOKModule;
  private lokPtr: number = 0;
  private verbose: boolean;
  private useShims: boolean = false;

  constructor(module: EmscriptenModule, verbose = false) {
    this.module = module as LOKModule;
    this.verbose = verbose;
    
    // Check if the new shim exports are available
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
   * Load a document from the virtual filesystem
   */
  documentLoad(path: string): number {
    if (this.lokPtr === 0) {
      throw new Error('LOK not initialized');
    }

    this.log('Loading document:', path);
    const pathPtr = this.allocString(path);

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

    this.log('Loading document with options:', path, options);
    const pathPtr = this.allocString(path);
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
          this.module._free(optsPtr);
          return this.documentLoad(path);
        }

        const loadWithOpts = this.getFunc<(lok: number, path: number, opts: number) => number>(loadWithOptsPtr);
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

    this.log('Saving document to:', outputPath, 'format:', format);

    const urlPtr = this.allocString(outputPath);
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
        const saveAs = this.getFunc<(doc: number, url: number, format: number, opts: number) => number>(saveAsPtr);
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
      // LOK destroy is always via vtable (no shim for this)
      const lokClassPtr = this.readPtr(this.lokPtr);
      const destroyPtr = this.readPtr(lokClassPtr + LOK_CLASS.destroy);

      if (destroyPtr !== 0) {
        const destroy = this.getFunc<(lok: number) => void>(destroyPtr);
        destroy(this.lokPtr);
        this.log('LOK destroyed');
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
}

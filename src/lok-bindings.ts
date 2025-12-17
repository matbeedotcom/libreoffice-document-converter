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
  // Abort API shims
  _lok_abortOperation?: () => void;
  _lok_setOperationTimeout?: (timeoutMs: number) => void;
  _lok_getOperationState?: () => number;
  _lok_resetAbort?: () => void;
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
  _lok_documentSetEditMode?: (doc: number, mode: number) => void;
  // View management shims
  _lok_documentCreateView?: (doc: number) => number;
  _lok_documentCreateViewWithOptions?: (doc: number, options: number) => number;
  _lok_documentDestroyView?: (doc: number, viewId: number) => void;
  _lok_documentSetView?: (doc: number, viewId: number) => void;
  _lok_documentGetView?: (doc: number) => number;
  _lok_documentGetViewsCount?: (doc: number) => number;
  // Event loop and callback shims
  _lok_enableSyncEvents?: () => void;
  _lok_disableSyncEvents?: () => void;
  _lok_runLoop?: (lok: number, pollCallback: number, wakeCallback: number, data: number) => void;
  // Callback queue shims
  _lok_documentRegisterCallback?: (doc: number) => void;
  _lok_documentUnregisterCallback?: (doc: number) => void;
  _lok_hasCallbackEvents?: () => number;
  _lok_getCallbackEventCount?: () => number;
  _lok_pollCallback?: (payloadBuffer: number, bufferSize: number, payloadLengthPtr: number) => number;
  _lok_clearCallbackQueue?: () => void;
  _lok_flushCallbacks?: (doc: number) => void;
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

// LOK Callback Types (from LibreOfficeKitEnums.h)
export const LOK_CALLBACK_INVALIDATE_TILES = 0;
export const LOK_CALLBACK_INVALIDATE_VISIBLE_CURSOR = 1;
export const LOK_CALLBACK_TEXT_SELECTION = 2;
export const LOK_CALLBACK_TEXT_SELECTION_START = 3;
export const LOK_CALLBACK_TEXT_SELECTION_END = 4;
export const LOK_CALLBACK_CURSOR_VISIBLE = 5;
export const LOK_CALLBACK_GRAPHIC_SELECTION = 6;
export const LOK_CALLBACK_HYPERLINK_CLICKED = 7;
export const LOK_CALLBACK_STATE_CHANGED = 8;
export const LOK_CALLBACK_STATUS_INDICATOR_START = 9;
export const LOK_CALLBACK_STATUS_INDICATOR_SET_VALUE = 10;
export const LOK_CALLBACK_STATUS_INDICATOR_FINISH = 11;
export const LOK_CALLBACK_SEARCH_NOT_FOUND = 12;
export const LOK_CALLBACK_DOCUMENT_SIZE_CHANGED = 13;
export const LOK_CALLBACK_SET_PART = 14;
export const LOK_CALLBACK_SEARCH_RESULT_SELECTION = 15;
export const LOK_CALLBACK_UNO_COMMAND_RESULT = 16;
export const LOK_CALLBACK_CELL_CURSOR = 17;
export const LOK_CALLBACK_MOUSE_POINTER = 18;
export const LOK_CALLBACK_CELL_FORMULA = 19;
export const LOK_CALLBACK_DOCUMENT_PASSWORD = 20;
export const LOK_CALLBACK_DOCUMENT_PASSWORD_TO_MODIFY = 21;
export const LOK_CALLBACK_CONTEXT_MENU = 22;
export const LOK_CALLBACK_INVALIDATE_VIEW_CURSOR = 23;
export const LOK_CALLBACK_TEXT_VIEW_SELECTION = 24;
export const LOK_CALLBACK_CELL_VIEW_CURSOR = 25;
export const LOK_CALLBACK_GRAPHIC_VIEW_SELECTION = 26;
export const LOK_CALLBACK_VIEW_CURSOR_VISIBLE = 27;
export const LOK_CALLBACK_VIEW_LOCK = 28;
export const LOK_CALLBACK_REDLINE_TABLE_SIZE_CHANGED = 29;
export const LOK_CALLBACK_REDLINE_TABLE_ENTRY_MODIFIED = 30;
export const LOK_CALLBACK_COMMENT = 31;
export const LOK_CALLBACK_INVALIDATE_HEADER = 32;
export const LOK_CALLBACK_CELL_ADDRESS = 33;

// Callback event interface
export interface LOKCallbackEvent {
  type: number;
  typeName: string;
  payload: string;
}

// Map callback type to name
export function getCallbackTypeName(type: number): string {
  const names: Record<number, string> = {
    [LOK_CALLBACK_INVALIDATE_TILES]: 'INVALIDATE_TILES',
    [LOK_CALLBACK_INVALIDATE_VISIBLE_CURSOR]: 'INVALIDATE_VISIBLE_CURSOR',
    [LOK_CALLBACK_TEXT_SELECTION]: 'TEXT_SELECTION',
    [LOK_CALLBACK_TEXT_SELECTION_START]: 'TEXT_SELECTION_START',
    [LOK_CALLBACK_TEXT_SELECTION_END]: 'TEXT_SELECTION_END',
    [LOK_CALLBACK_CURSOR_VISIBLE]: 'CURSOR_VISIBLE',
    [LOK_CALLBACK_GRAPHIC_SELECTION]: 'GRAPHIC_SELECTION',
    [LOK_CALLBACK_HYPERLINK_CLICKED]: 'HYPERLINK_CLICKED',
    [LOK_CALLBACK_STATE_CHANGED]: 'STATE_CHANGED',
    [LOK_CALLBACK_STATUS_INDICATOR_START]: 'STATUS_INDICATOR_START',
    [LOK_CALLBACK_STATUS_INDICATOR_SET_VALUE]: 'STATUS_INDICATOR_SET_VALUE',
    [LOK_CALLBACK_STATUS_INDICATOR_FINISH]: 'STATUS_INDICATOR_FINISH',
    [LOK_CALLBACK_SEARCH_NOT_FOUND]: 'SEARCH_NOT_FOUND',
    [LOK_CALLBACK_DOCUMENT_SIZE_CHANGED]: 'DOCUMENT_SIZE_CHANGED',
    [LOK_CALLBACK_SET_PART]: 'SET_PART',
    [LOK_CALLBACK_SEARCH_RESULT_SELECTION]: 'SEARCH_RESULT_SELECTION',
    [LOK_CALLBACK_UNO_COMMAND_RESULT]: 'UNO_COMMAND_RESULT',
    [LOK_CALLBACK_CELL_CURSOR]: 'CELL_CURSOR',
    [LOK_CALLBACK_MOUSE_POINTER]: 'MOUSE_POINTER',
    [LOK_CALLBACK_CELL_FORMULA]: 'CELL_FORMULA',
    [LOK_CALLBACK_DOCUMENT_PASSWORD]: 'DOCUMENT_PASSWORD',
    [LOK_CALLBACK_DOCUMENT_PASSWORD_TO_MODIFY]: 'DOCUMENT_PASSWORD_TO_MODIFY',
    [LOK_CALLBACK_CONTEXT_MENU]: 'CONTEXT_MENU',
    [LOK_CALLBACK_INVALIDATE_VIEW_CURSOR]: 'INVALIDATE_VIEW_CURSOR',
    [LOK_CALLBACK_TEXT_VIEW_SELECTION]: 'TEXT_VIEW_SELECTION',
    [LOK_CALLBACK_CELL_VIEW_CURSOR]: 'CELL_VIEW_CURSOR',
    [LOK_CALLBACK_GRAPHIC_VIEW_SELECTION]: 'GRAPHIC_VIEW_SELECTION',
    [LOK_CALLBACK_VIEW_CURSOR_VISIBLE]: 'VIEW_CURSOR_VISIBLE',
    [LOK_CALLBACK_VIEW_LOCK]: 'VIEW_LOCK',
    [LOK_CALLBACK_REDLINE_TABLE_SIZE_CHANGED]: 'REDLINE_TABLE_SIZE_CHANGED',
    [LOK_CALLBACK_REDLINE_TABLE_ENTRY_MODIFIED]: 'REDLINE_TABLE_ENTRY_MODIFIED',
    [LOK_CALLBACK_COMMENT]: 'COMMENT',
    [LOK_CALLBACK_INVALIDATE_HEADER]: 'INVALIDATE_HEADER',
    [LOK_CALLBACK_CELL_ADDRESS]: 'CELL_ADDRESS',
  };
  return names[type] || `UNKNOWN(${type})`;
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
    // Copy the data to avoid SharedArrayBuffer issues in browsers
    // TextDecoder.decode() doesn't accept SharedArrayBuffer views in some browsers
    const slice = heap.slice(ptr, end);
    return textDecoder.decode(slice);
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
   * @param installPath - Path to LibreOffice installation (default: /instdir/program)
   * @param userProfilePath - Path to writable user profile directory (default: null, uses install path).
   *                          On serverless environments like Vercel, set this to a /tmp path.
   */
  initialize(installPath: string = '/instdir/program', userProfilePath?: string): void {
    this.log('Initializing with path:', installPath, userProfilePath ? `(user profile: ${userProfilePath})` : '');
    const pathPtr = this.allocString(installPath);
    let userProfilePtr = 0;

    try {
      // Try hook_2 first if userProfilePath is provided (allows custom user profile location)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      const hook2 = (this.module as any)._libreofficekit_hook_2 as
        | ((pathPtr: number, userProfilePtr: number) => number)
        | undefined;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      const hook = (this.module as any)._libreofficekit_hook as
        | ((pathPtr: number) => number)
        | undefined;

      if (userProfilePath && typeof hook2 === 'function') {
        userProfilePtr = this.allocString(userProfilePath);
        this.log('Using libreofficekit_hook_2 with custom user profile');
        this.lokPtr = hook2(pathPtr, userProfilePtr);
      } else if (typeof hook === 'function') {
        this.lokPtr = hook(pathPtr);
      } else {
        throw new Error('libreofficekit_hook export not found on module');
      }

      if (this.lokPtr === 0) {
        throw new Error('Failed to initialize LibreOfficeKit');
      }

      this.log('LOK initialized, ptr:', this.lokPtr);
    } finally {
      this.module._free(pathPtr);
      if (userProfilePtr !== 0) {
        this.module._free(userProfilePtr);
      }
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
  // Abort API Methods
  // ==========================================

  /**
   * Operation states returned by getOperationState()
   */
  static readonly OPERATION_STATE = {
    IDLE: 'idle',
    RUNNING: 'running',
    ABORTED: 'aborted',
    TIMED_OUT: 'timed_out',
    COMPLETED: 'completed',
    ERROR: 'error',
  } as const;

  /**
   * Abort the currently running operation.
   * Call this from another thread/worker to cancel a long-running operation.
   * The operation will throw an error when it detects the abort.
   * 
   * NOTE: Only aborts if an operation is actually running. Calling abort when
   * idle is a no-op to prevent WASM corruption.
   */
  abortOperation(): void {
    if (!this.module._lok_abortOperation) {
      this.log('abortOperation: shim not available');
      return;
    }

    // Check if there's actually an operation running before aborting
    // Aborting when idle can corrupt WASM state
    const state = this.getOperationState();
    if (state !== 'running' && state !== 'load' && state !== 'save') {
      this.log(`abortOperation: no operation running (state: ${state}), skipping abort`);
      return;
    }

    this.log('abortOperation: aborting current operation');
    this.module._lok_abortOperation();
  }

  /**
   * Set a timeout for operations in milliseconds.
   * Must be called BEFORE starting an operation (when idle).
   * After the timeout, the operation will be automatically aborted.
   * @param timeoutMs Timeout in milliseconds (0 = no timeout)
   * 
   * NOTE: Only sets timeout when idle. Setting during an operation is a no-op.
   */
  setOperationTimeout(timeoutMs: number): void {
    if (!this.module._lok_setOperationTimeout) {
      this.log('setOperationTimeout: shim not available');
      return;
    }

    // Only set timeout when idle to prevent WASM state issues
    const state = this.getOperationState();
    if (state !== 'idle' && state !== 'none' && state !== 'unknown' && state !== 'completed') {
      this.log(`setOperationTimeout: operation in progress (state: ${state}), skipping`);
      return;
    }

    this.log(`setOperationTimeout: setting timeout to ${timeoutMs}ms`);
    this.module._lok_setOperationTimeout(timeoutMs);
  }

  /**
   * Get the current operation state.
   * @returns One of: 'idle', 'running', 'aborted', 'timed_out', 'completed', 'error'
   */
  getOperationState(): string {
    if (this.module._lok_getOperationState) {
      const statePtr = this.module._lok_getOperationState();
      const state = this.readString(statePtr);
      return state || 'unknown';
    }
    this.log('getOperationState: shim not available');
    return 'unknown';
  }

  /**
   * Reset the abort state before starting a new operation.
   * Must be called before each operation to clear any previous abort/timeout state.
   */
  resetAbort(): void {
    if (this.module._lok_resetAbort) {
      this.log('resetAbort: resetting abort state');
      this.module._lok_resetAbort();
    } else {
      this.log('resetAbort: shim not available');
    }
  }

  /**
   * Check if the abort API is available
   */
  hasAbortSupport(): boolean {
    return !!(
      this.module._lok_abortOperation &&
      this.module._lok_setOperationTimeout &&
      this.module._lok_getOperationState &&
      this.module._lok_resetAbort
    );
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
    this.log(`documentGetDocumentSize called with docPtr: ${docPtr}`);
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
        this.log(`documentGetDocumentSize: ${width}x${height} twips`);
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

      if (bufferPtr === 0) {
        throw new Error(`Failed to allocate ${bufferSize} bytes for tile buffer`);
      }

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
    height: number = 0,
    editMode: boolean = false
  ): { data: Uint8Array; width: number; height: number } {
    // Initialize for rendering if not already done
    this.documentInitializeForRendering(docPtr);

    // Get document type to determine rendering strategy
    const docType = this.documentGetDocumentType(docPtr);

    // For presentations and drawings, use setPart to select the slide/page
    // For text documents, we need to use page rectangles
    if (docType === 2 || docType === 3) { // PRESENTATION or DRAWING
      console.log(`[LOK] Setting part to ${pageIndex} for presentation/drawing`);
      this.documentSetPart(docPtr, pageIndex);
      const currentPart = this.documentGetPart(docPtr);
      console.log(`[LOK] Current part after setPart: ${currentPart}`);

      // Set view mode (0) for presentations to avoid showing edit UI elements
      // unless explicitly requested
      if (!editMode) {
        this.setEditMode(docPtr, 0);
        console.log(`[LOK] Set edit mode to 0 (view mode) for presentation rendering`);
      }
    }

    // Get document/page size in twips
    const docSize = this.documentGetDocumentSize(docPtr);
    this.log('Document size (twips):', docSize);

    if (docSize.width === 0 || docSize.height === 0) {
      throw new Error('Failed to get document size');
    }

    // For text documents, get page rectangles to find the specific page
    let tilePosX = 0;
    let tilePosY = 0;
    let tileWidth = docSize.width;
    let tileHeight = docSize.height;

    if (docType === 0 || docType === 1) { // TEXT or SPREADSHEET
      // Get page rectangles to find the Y offset for this page
      const pageRectsStr = this.getPartPageRectangles(docPtr);
      if (pageRectsStr) {
        const pageRects = this.parsePageRectangles(pageRectsStr);
        const pageRect = pageRects[pageIndex];
        if (pageRect) {
          tilePosX = pageRect.x;
          tilePosY = pageRect.y;
          tileWidth = pageRect.width;
          tileHeight = pageRect.height;
          this.log(`Page ${pageIndex} rectangle:`, pageRect);
        }
      }
    }

    // Calculate output dimensions maintaining aspect ratio
    const aspectRatio = tileHeight / tileWidth;
    const outputWidth = width;
    const outputHeight = height > 0 ? height : Math.round(width * aspectRatio);

    console.log(`[LOK] Calling paintTile: ${outputWidth}x${outputHeight} from tile pos (${tilePosX}, ${tilePosY}) size (${tileWidth}x${tileHeight})`);

    // Paint the tile for this specific page
    const data = this.documentPaintTile(
      docPtr,
      outputWidth,
      outputHeight,
      tilePosX,
      tilePosY,
      tileWidth,
      tileHeight
    );

    console.log(`[LOK] paintTile returned ${data.length} bytes`);
    return { data, width: outputWidth, height: outputHeight };
  }

  /**
   * Render a page/slide at full quality (native resolution based on DPI)
   *
   * Unlike renderPage which scales to a fixed width, this method renders
   * at the document's native resolution converted to pixels at the specified DPI.
   *
   * @param docPtr Document pointer
   * @param pageIndex Page/slide index (0-based)
   * @param dpi Dots per inch for rendering (default 150, use 300 for print quality)
   * @param maxDimension Optional maximum dimension (width or height) to prevent memory issues
   * @returns RGBA pixel data and dimensions
   *
   * @example
   * // Render at 150 DPI (good for screen)
   * const preview = lokBindings.renderPageFullQuality(docPtr, 0, 150);
   *
   * // Render at 300 DPI (print quality)
   * const highRes = lokBindings.renderPageFullQuality(docPtr, 0, 300);
   *
   * // Render with max dimension cap to prevent memory issues
   * const capped = lokBindings.renderPageFullQuality(docPtr, 0, 300, 4096);
   */
  renderPageFullQuality(
    docPtr: number,
    pageIndex: number,
    dpi: number = 150,
    maxDimension?: number,
    editMode: boolean = false
  ): { data: Uint8Array; width: number; height: number; dpi: number } {
    // Initialize for rendering if not already done
    this.documentInitializeForRendering(docPtr);

    // Get document type to determine rendering strategy
    const docType = this.documentGetDocumentType(docPtr);

    // For presentations and drawings, use setPart to select the slide/page
    if (docType === 2 || docType === 3) { // PRESENTATION or DRAWING
      this.log(`Setting part to ${pageIndex} for presentation/drawing`);
      this.documentSetPart(docPtr, pageIndex);

      // Set view mode (0) for presentations to avoid showing edit UI elements
      // unless explicitly requested
      if (!editMode) {
        this.setEditMode(docPtr, 0);
        this.log(`Set edit mode to 0 (view mode) for presentation rendering`);
      }
    }

    // Get document/page size in twips
    const docSize = this.documentGetDocumentSize(docPtr);
    this.log('Document size (twips):', docSize);

    if (docSize.width === 0 || docSize.height === 0) {
      throw new Error('Failed to get document size');
    }

    // For text documents, get page rectangles to find the specific page
    let tilePosX = 0;
    let tilePosY = 0;
    let tileWidth = docSize.width;
    let tileHeight = docSize.height;

    if (docType === 0 || docType === 1) { // TEXT or SPREADSHEET
      const pageRectsStr = this.getPartPageRectangles(docPtr);
      if (pageRectsStr) {
        const pageRects = this.parsePageRectangles(pageRectsStr);
        const pageRect = pageRects[pageIndex];
        if (pageRect) {
          tilePosX = pageRect.x;
          tilePosY = pageRect.y;
          tileWidth = pageRect.width;
          tileHeight = pageRect.height;
          this.log(`Page ${pageIndex} rectangle:`, pageRect);
        }
      }
    }

    // Convert twips to pixels at the specified DPI
    // 1 inch = 1440 twips, so pixels = twips * dpi / 1440
    const TWIPS_PER_INCH = 1440;
    let outputWidth = Math.round(tileWidth * dpi / TWIPS_PER_INCH);
    let outputHeight = Math.round(tileHeight * dpi / TWIPS_PER_INCH);
    let effectiveDpi = dpi;

    // Apply max dimension cap if specified
    if (maxDimension && (outputWidth > maxDimension || outputHeight > maxDimension)) {
      const scale = maxDimension / Math.max(outputWidth, outputHeight);
      outputWidth = Math.round(outputWidth * scale);
      outputHeight = Math.round(outputHeight * scale);
      effectiveDpi = Math.round(dpi * scale);
      this.log(`Capped dimensions to ${outputWidth}x${outputHeight} (effective DPI: ${effectiveDpi})`);
    }

    console.log(`[LOK] renderPageFullQuality: ${outputWidth}x${outputHeight} at ${effectiveDpi} DPI from tile (${tilePosX}, ${tilePosY}) size (${tileWidth}x${tileHeight}) twips`);

    // Paint the tile
    const data = this.documentPaintTile(
      docPtr,
      outputWidth,
      outputHeight,
      tilePosX,
      tilePosY,
      tileWidth,
      tileHeight
    );

    console.log(`[LOK] renderPageFullQuality returned ${data.length} bytes`);
    return { data, width: outputWidth, height: outputHeight, dpi: effectiveDpi };
  }

  // ==========================================
  // Text Selection and Content Methods
  // ==========================================

  /**
   * Get currently selected text
   * @param docPtr Document pointer
   * @param mimeType Desired MIME type. Must include charset, e.g., 'text/plain;charset=utf-8'
   *                 Note: 'text/plain' without charset is NOT supported by LOK
   * @returns Selected text or null
   */
  getTextSelection(docPtr: number, mimeType: string = 'text/plain;charset=utf-8'): string | null {
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
    this.log(`getPartPageRectangles called with docPtr: ${docPtr}`);
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetPartPageRectangles) {
      this.log('getPartPageRectangles: using shim');
      const resultPtr = this.module._lok_documentGetPartPageRectangles(docPtr);
      this.log(`getPartPageRectangles: resultPtr=${resultPtr}`);
      if (resultPtr === 0) return null;
      const result = this.readString(resultPtr);
      this.log(`getPartPageRectangles: result="${result?.slice(0, 100)}..."`);
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

  /**
   * Set edit mode for the document
   * @param docPtr Document pointer
   * @param mode 0 for view mode, 1 for edit mode
   */
  setEditMode(docPtr: number, mode: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentSetEditMode) {
      this.log(`setEditMode: setting mode to ${mode}`);
      this.module._lok_documentSetEditMode(docPtr, mode);
      return;
    }

    this.log('setEditMode: shim not available');
  }

  // ==========================================
  // View Management Methods
  // ==========================================

  /**
   * Create a new view for the document
   * @param docPtr Document pointer
   * @returns View ID
   */
  createView(docPtr: number): number {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentCreateView) {
      const viewId = this.module._lok_documentCreateView(docPtr);
      this.log(`createView: created view ${viewId}`);
      return viewId;
    }

    this.log('createView: shim not available');
    return -1;
  }

  /**
   * Create a new view with options
   * @param docPtr Document pointer
   * @param options Options string (JSON)
   * @returns View ID
   */
  createViewWithOptions(docPtr: number, options: string): number {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentCreateViewWithOptions) {
      const optionsPtr = this.allocString(options);
      try {
        const viewId = this.module._lok_documentCreateViewWithOptions(docPtr, optionsPtr);
        this.log(`createViewWithOptions: created view ${viewId}`);
        return viewId;
      } finally {
        this.module._free(optionsPtr);
      }
    }

    this.log('createViewWithOptions: shim not available');
    return -1;
  }

  /**
   * Destroy a view
   * @param docPtr Document pointer
   * @param viewId View ID to destroy
   */
  destroyView(docPtr: number, viewId: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentDestroyView) {
      this.log(`destroyView: destroying view ${viewId}`);
      this.module._lok_documentDestroyView(docPtr, viewId);
      return;
    }

    this.log('destroyView: shim not available');
  }

  /**
   * Set the current active view
   * @param docPtr Document pointer
   * @param viewId View ID to make active
   */
  setView(docPtr: number, viewId: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentSetView) {
      this.log(`setView: setting active view to ${viewId}`);
      this.module._lok_documentSetView(docPtr, viewId);
      return;
    }

    this.log('setView: shim not available');
  }

  /**
   * Get the current active view ID
   * @param docPtr Document pointer
   * @returns Current view ID
   */
  getView(docPtr: number): number {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetView) {
      return this.module._lok_documentGetView(docPtr);
    }

    this.log('getView: shim not available');
    return -1;
  }

  /**
   * Get the number of views
   * @param docPtr Document pointer
   * @returns Number of views
   */
  getViewsCount(docPtr: number): number {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentGetViewsCount) {
      return this.module._lok_documentGetViewsCount(docPtr);
    }

    this.log('getViewsCount: shim not available');
    return 0;
  }

  // ==========================================
  // Event Loop and Callback Methods
  // ==========================================

  /**
   * Enable synchronous event dispatch (Unipoll mode).
   * This must be called before using postKeyEvent, postMouseEvent, etc.
   * to ensure events are processed immediately instead of being queued.
   *
   * Without this, events posted via postKeyEvent/postMouseEvent are queued
   * via Application::PostUserEvent() and never processed in headless mode.
   */
  enableSyncEvents(): void {
    if (this.useShims && this.module._lok_enableSyncEvents) {
      this.module._lok_enableSyncEvents();
      this.log('enableSyncEvents: Unipoll mode enabled');
    } else {
      this.log('enableSyncEvents: shim not available');
    }
  }

  /**
   * Disable synchronous event dispatch.
   * Call this when done with event-based operations.
   */
  disableSyncEvents(): void {
    if (this.useShims && this.module._lok_disableSyncEvents) {
      this.module._lok_disableSyncEvents();
      this.log('disableSyncEvents: Unipoll mode disabled');
    } else {
      this.log('disableSyncEvents: shim not available');
    }
  }

  // ==========================================
  // Callback Queue Methods
  // ==========================================

  /**
   * Register a callback handler for the document.
   * Events are queued and can be retrieved via pollCallback().
   * @param docPtr Document pointer
   */
  registerCallback(docPtr: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentRegisterCallback) {
      this.module._lok_documentRegisterCallback(docPtr);
      this.log('registerCallback: callback registered');
    } else {
      this.log('registerCallback: shim not available');
    }
  }

  /**
   * Unregister the callback handler for the document.
   * @param docPtr Document pointer
   */
  unregisterCallback(docPtr: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    if (this.useShims && this.module._lok_documentUnregisterCallback) {
      this.module._lok_documentUnregisterCallback(docPtr);
      this.log('unregisterCallback: callback unregistered');
    } else {
      this.log('unregisterCallback: shim not available');
    }
  }

  /**
   * Check if there are any pending callback events.
   * @returns true if events are pending
   */
  hasCallbackEvents(): boolean {
    if (this.useShims && this.module._lok_hasCallbackEvents) {
      return this.module._lok_hasCallbackEvents() !== 0;
    }
    return false;
  }

  /**
   * Get the number of pending callback events.
   * @returns Number of events in the queue
   */
  getCallbackEventCount(): number {
    if (this.useShims && this.module._lok_getCallbackEventCount) {
      return this.module._lok_getCallbackEventCount();
    }
    return 0;
  }

  /**
   * Poll and retrieve the next callback event from the queue.
   * @returns The next event, or null if queue is empty
   */
  pollCallback(): LOKCallbackEvent | null {
    if (!this.useShims || !this.module._lok_pollCallback) {
      return null;
    }

    const bufferSize = 4096;
    const payloadBuffer = this.module._malloc(bufferSize);
    const payloadLengthPtr = this.module._malloc(4);

    try {
      const eventType = this.module._lok_pollCallback(payloadBuffer, bufferSize, payloadLengthPtr);

      if (eventType === -1) {
        return null; // Queue is empty
      }

      // Read the payload length
      const payloadLength = this.module.HEAP32[payloadLengthPtr >> 2] ?? 0;

      // Read the payload string
      let payload = '';
      if (payloadLength > 0) {
        // Copy bytes from HEAPU8 to avoid SharedArrayBuffer issues in browsers
        // TextDecoder.decode() doesn't accept SharedArrayBuffer views in some browsers
        const len = Math.min(payloadLength, bufferSize - 1);
        const bytes = this.module.HEAPU8.slice(payloadBuffer, payloadBuffer + len);
        payload = textDecoder.decode(bytes);
      }

      return {
        type: eventType,
        typeName: getCallbackTypeName(eventType),
        payload,
      };
    } finally {
      this.module._free(payloadBuffer);
      this.module._free(payloadLengthPtr);
    }
  }

  /**
   * Poll all pending callback events.
   * @returns Array of all pending events
   */
  pollAllCallbacks(): LOKCallbackEvent[] {
    const events: LOKCallbackEvent[] = [];
    let event = this.pollCallback();
    while (event !== null) {
      events.push(event);
      event = this.pollCallback();
    }
    return events;
  }

  /**
   * Clear all pending callback events.
   */
  clearCallbackQueue(): void {
    if (this.useShims && this.module._lok_clearCallbackQueue) {
      this.module._lok_clearCallbackQueue();
      this.log('clearCallbackQueue: queue cleared');
    }
  }

  /**
   * Force flush pending LOK callbacks for a document.
   * This is needed in WASM because callbacks are queued via PostUserEvent
   * but the event loop doesn't run automatically.
   * Call this after operations that trigger callbacks (e.g., postUnoCommand)
   * to ensure the callback queue is populated.
   * @param docPtr Document pointer
   */
  flushCallbacks(docPtr: number): void {
    if (docPtr === 0) throw new Error('Invalid document pointer');

    const hasShim = !!this.module._lok_flushCallbacks;
    this.log(`flushCallbacks: useShims=${this.useShims}, _lok_flushCallbacks exists=${hasShim}`);

    if (this.useShims && this.module._lok_flushCallbacks) {
      this.module._lok_flushCallbacks(docPtr);
      this.log('flushCallbacks: callbacks flushed');
    } else {
      this.log('flushCallbacks: shim not available');
    }
  }

  /**
   * Poll for STATE_CHANGED callbacks and parse them into a map.
   * STATE_CHANGED payloads are in format: ".uno:CommandName=value"
   * @returns Map of command names to values
   */
  pollStateChanges(): Map<string, string> {
    const states = new Map<string, string>();
    const events = this.pollAllCallbacks();

    for (const event of events) {
      if (event.type === LOK_CALLBACK_STATE_CHANGED) {
        // Parse ".uno:Bold=true" format
        const eqIndex = event.payload.indexOf('=');
        if (eqIndex !== -1) {
          const key = event.payload.substring(0, eqIndex);
          const value = event.payload.substring(eqIndex + 1);
          states.set(key, value);
        } else {
          // Some state changes are just the command name (enabled/disabled toggle)
          states.set(event.payload, '');
        }
      }
    }

    return states;
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
    return this.getTextSelection(docPtr, 'text/plain;charset=utf-8');
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
    return this.getTextSelection(docPtr, 'text/plain;charset=utf-8');
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
    this.log(`getAllText called with docPtr: ${docPtr}`);
    this.selectAll(docPtr);
    const text = this.getTextSelection(docPtr, 'text/plain;charset=utf-8');
    this.log(`getAllText: text="${text?.slice(0, 100)}..."`);
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

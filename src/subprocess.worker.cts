/**
 * Subprocess Worker for LibreOffice WASM
 *
 * This worker runs in a completely separate Node.js process and owns the
 * entire LibreOffice WASM module. It communicates with the main process
 * via IPC message passing.
 *
 * Uses LibreOfficeConverter directly for all operations - same implementation
 * as the main thread and worker thread converters.
 */

import * as path from 'path';
import * as fs from 'fs';
import { Worker } from 'worker_threads';

const wasmPath = process.env.WASM_PATH || './wasm';
const verbose = process.env.VERBOSE === 'true';
const wasmDir = path.resolve(wasmPath);

// Change to wasm directory for soffice.data path resolution
process.chdir(wasmDir);

function log(...args: unknown[]) {
  if (verbose) console.error('[SubprocessWorker]', ...args);
}

// XMLHttpRequest polyfill for Emscripten
class NodeXHR {
  readyState = 0;
  status = 0;
  responseType = '';
  response: unknown = null;
  responseText = '';
  onload: (() => void) | null = null;
  onerror: ((err: Error) => void) | null = null;
  onreadystatechange: (() => void) | null = null;
  private _url = '';

  open(_method: string, url: string) {
    this._url = url;
    this.readyState = 1;
  }

  overrideMimeType() {}
  setRequestHeader() {}

  send() {
    try {
      const data = fs.readFileSync(this._url);
      this.status = 200;
      this.readyState = 4;
      if (this.responseType === 'arraybuffer') {
        this.response = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      } else {
        this.responseText = data.toString('utf8');
        this.response = this.responseText;
      }
      if (this.onload) this.onload();
      if (this.onreadystatechange) this.onreadystatechange();
    } catch (err) {
      this.status = 404;
      this.readyState = 4;
      if (this.onerror) this.onerror(err as Error);
    }
  }
}

// Set up global polyfills
(global as any).XMLHttpRequest = NodeXHR;
(global as any).Worker = Worker;

// Import converter and editor - these will be bundled by tsup
import { LibreOfficeConverter } from './converter.js';
import { createEditor, OfficeEditor } from './editor/index.js';
import type { ConversionOptions, InputFormatOptions } from './types.js';
import type { OperationResult } from './editor/types.js';

// Converter state
let converter: LibreOfficeConverter | null = null;

// Editor session tracking
interface EditorSession {
  sessionId: string;
  docPtr: number;
  filePath: string;
  editor: OfficeEditor;
  documentType: string;
}

const editorSessions = new Map<string, EditorSession>();
let sessionCounter = 0;

function getRecentOutput(): string {
  return ''; // Reserved for future error capture
}

// Message payload types
interface ConvertPayload {
  inputData: number[];
  inputExt: string;
  outputFormat: string;
  filterOptions: string;
}

interface DocumentPayload {
  inputData: number[];
  inputFormat: string;
}

interface RenderPagePayload {
  inputData: number[];
  inputFormat: string;
  pageIndex: number;
  width: number;
  height?: number;
}

interface RenderPagePreviewsPayload {
  inputData: number[];
  inputFormat: string;
  width: number;
  height?: number;
  pageIndices?: number[];
}

interface RenderPageFullQualityPayload {
  inputData: number[];
  inputFormat: string;
  pageIndex: number;
  dpi: number;
  maxDimension?: number;
  editMode?: boolean;
}

interface OpenDocumentPayload {
  inputData: number[];
  inputFormat: string;
}

interface EditorOperationPayload {
  sessionId: string;
  method: string;
  args?: unknown[];
}

interface CloseDocumentPayload {
  sessionId: string;
}

interface WorkerMessage {
  type: string;
  id: string;
  payload?: unknown;
}

/**
 * Handle convert request
 */
async function handleConvert(payload: ConvertPayload): Promise<number[]> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const inputData = new Uint8Array(payload.inputData);
  const result = await converter.convert(
    inputData,
    {
      inputFormat: payload.inputExt,
      outputFormat: payload.outputFormat,
    } as ConversionOptions,
    'document'
  );

  return Array.from(result.data);
}

/**
 * Handle getPageCount request
 */
async function handleGetPageCount(payload: DocumentPayload): Promise<number> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const inputData = new Uint8Array(payload.inputData);
  return converter.getPageCount(inputData, {
    inputFormat: payload.inputFormat,
    outputFormat: 'pdf',
  } as ConversionOptions);
}

/**
 * Handle getDocumentInfo request
 */
async function handleGetDocumentInfo(payload: DocumentPayload): Promise<unknown> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const inputData = new Uint8Array(payload.inputData);
  return converter.getDocumentInfo(inputData, {
    inputFormat: payload.inputFormat,
    outputFormat: 'pdf',
  } as ConversionOptions);
}

/**
 * Handle renderPage request
 */
async function handleRenderPage(payload: RenderPagePayload): Promise<{
  data: number[];
  width: number;
  height: number;
}> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const inputData = new Uint8Array(payload.inputData);
  const previews = await converter.renderPagePreviews(
    inputData,
    { inputFormat: payload.inputFormat as InputFormatOptions['inputFormat'] },
    {
      width: payload.width,
      height: payload.height || 0,
      pageIndices: [payload.pageIndex],
    }
  );

  if (previews.length === 0) {
    throw new Error(`Page ${payload.pageIndex} not found`);
  }

  const preview = previews[0]!;
  return {
    data: Array.from(preview.data),
    width: preview.width,
    height: preview.height,
  };
}

/**
 * Handle renderPagePreviews request
 */
async function handleRenderPagePreviews(payload: RenderPagePreviewsPayload): Promise<Array<{
  page: number;
  data: number[];
  width: number;
  height: number;
}>> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const inputData = new Uint8Array(payload.inputData);
  const previews = await converter.renderPagePreviews(
    inputData,
    { inputFormat: payload.inputFormat as InputFormatOptions['inputFormat'] },
    {
      width: payload.width,
      height: payload.height || 0,
      pageIndices: payload.pageIndices,
    }
  );

  return previews.map((preview: { page: number; data: Uint8Array; width: number; height: number }) => ({
    page: preview.page,
    data: Array.from(preview.data),
    width: preview.width,
    height: preview.height,
  }));
}

/**
 * Handle renderPageFullQuality request
 */
async function handleRenderPageFullQuality(payload: RenderPageFullQualityPayload): Promise<{
  page: number;
  data: number[];
  width: number;
  height: number;
  dpi: number;
}> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const inputData = new Uint8Array(payload.inputData);
  const preview = await converter.renderPageFullQuality(
    inputData,
    { inputFormat: payload.inputFormat as InputFormatOptions['inputFormat'] },
    payload.pageIndex,
    {
      dpi: payload.dpi,
      maxDimension: payload.maxDimension,
      editMode: payload.editMode ?? false,
    }
  );

  return {
    page: preview.page,
    data: Array.from(preview.data),
    width: preview.width,
    height: preview.height,
    dpi: preview.dpi,
  };
}

/**
 * Handle getDocumentText request
 */
async function handleGetDocumentText(payload: DocumentPayload): Promise<string | null> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const inputData = new Uint8Array(payload.inputData);
  return converter.getDocumentText(inputData, {
    inputFormat: payload.inputFormat,
    outputFormat: 'pdf',
  } as ConversionOptions);
}

/**
 * Handle getPageNames request
 */
async function handleGetPageNames(payload: DocumentPayload): Promise<string[]> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const inputData = new Uint8Array(payload.inputData);
  return converter.getPageNames(inputData, {
    inputFormat: payload.inputFormat,
    outputFormat: 'pdf',
  } as ConversionOptions);
}

/**
 * Handle openDocument request - opens document for editing
 */
async function handleOpenDocument(payload: OpenDocumentPayload): Promise<{
  sessionId: string;
  documentType: string;
  pageCount: number;
}> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const lokBindings = converter.getLokBindings();
  const module = converter.getModule();

  if (!lokBindings || !module) {
    throw new Error('LOK bindings not available');
  }

  // Generate unique session ID
  const sessionId = `session_${++sessionCounter}_${Date.now()}`;
  const filePath = `/tmp/edit_${sessionId}.${payload.inputFormat}`;

  // Write file to virtual FS
  const inputData = new Uint8Array(payload.inputData);
  module.FS.writeFile(filePath, inputData);

  // Load document
  const docPtr = lokBindings.documentLoad(filePath);
  if (docPtr === 0) {
    const error = lokBindings.getError();
    module.FS.unlink(filePath);
    throw new Error(`Failed to load document: ${String(error)}`);
  }

  // Initialize for rendering/editing
  lokBindings.documentInitializeForRendering(docPtr);

  // Create a view and register callback
  const viewId = lokBindings.createView(docPtr);
  lokBindings.setView(docPtr, viewId);
  lokBindings.registerCallback(docPtr);

  // Enable edit mode
  lokBindings.postUnoCommand(docPtr, '.uno:Edit');

  // Create the appropriate editor using factory
  const editor = createEditor(lokBindings, docPtr);
  const documentType = editor.getDocumentType();

  // Get page count
  const pageCount = lokBindings.documentGetParts(docPtr);

  // Store session
  editorSessions.set(sessionId, {
    sessionId,
    docPtr,
    filePath,
    editor,
    documentType,
  });

  return {
    sessionId,
    documentType,
    pageCount,
  };
}

/**
 * Handle editorOperation request
 */
async function handleEditorOperation(payload: EditorOperationPayload): Promise<OperationResult<unknown>> {
  const session = editorSessions.get(payload.sessionId);
  if (!session) {
    throw new Error(`Session not found: ${payload.sessionId}`);
  }

  const { editor } = session;
  const args = payload.args || [];

  // Call the method on the editor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const method = (editor as any)[payload.method];
  if (typeof method !== 'function') {
    throw new Error(`Unknown editor method: ${payload.method}`);
  }

  // Execute the method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = method.apply(editor, args) as OperationResult<any>;

  // Convert Map to object for serialization if needed
  let serializedData = result.data;
  if (result.data instanceof Map) {
    serializedData = Object.fromEntries(result.data);
  }

  return {
    success: result.success,
    verified: result.verified,
    data: serializedData,
    error: result.error,
    suggestion: result.suggestion,
  };
}

/**
 * Handle closeDocument request
 */
async function handleCloseDocument(payload: CloseDocumentPayload): Promise<number[] | undefined> {
  const session = editorSessions.get(payload.sessionId);
  if (!session) {
    throw new Error(`Session not found: ${payload.sessionId}`);
  }

  const lokBindings = converter?.getLokBindings();
  const module = converter?.getModule();
  const { docPtr, filePath } = session;

  // Get the modified document data before closing
  let modifiedData: number[] | undefined;
  if (module && lokBindings) {
    try {
      // Save to original path first
      const ext = filePath.split('.').pop() || 'docx';
      lokBindings.documentSaveAs(docPtr, filePath, ext, '');
      const data = module.FS.readFile(filePath) as Uint8Array;
      modifiedData = Array.from(data);
    } catch (e) {
      console.warn('[Worker] Could not save document:', e);
    }
  }

  // Cleanup
  if (lokBindings && docPtr !== 0) {
    try { lokBindings.unregisterCallback(docPtr); } catch { /* ignore */ }
    try { lokBindings.documentDestroy(docPtr); } catch { /* ignore */ }
  }
  if (module) {
    try { module.FS.unlink(filePath); } catch { /* ignore */ }
  }

  // Remove session
  editorSessions.delete(payload.sessionId);

  return modifiedData;
}

/**
 * Handle destroy request
 */
async function handleDestroy(): Promise<void> {
  // Close all editor sessions first
  for (const [, session] of editorSessions) {
    try {
      const lokBindings = converter?.getLokBindings();
      const module = converter?.getModule();
      if (lokBindings && session.docPtr !== 0) {
        try { lokBindings.unregisterCallback(session.docPtr); } catch { /* ignore */ }
        try { lokBindings.documentDestroy(session.docPtr); } catch { /* ignore */ }
      }
      if (module) {
        try { module.FS.unlink(session.filePath); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
  }
  editorSessions.clear();

  if (converter) {
    await converter.destroy();
    converter = null;
  }
}

/**
 * Handle init message - initialize the converter
 */
async function handleInit(): Promise<void> {
  if (converter?.isReady()) {
    return;
  }

  log('Creating LibreOfficeConverter...');
  converter = new LibreOfficeConverter({
    wasmPath: wasmDir,
    verbose,
  });

  log('Initializing converter...');
  await converter.initialize();
  log('Converter initialized successfully');
}

// Handle incoming messages
process.on('message', async (msg: WorkerMessage) => {
  try {
    let result: unknown;

    switch (msg.type) {
      case 'init':
        await handleInit();
        break;

      case 'convert':
        result = await handleConvert(msg.payload as ConvertPayload);
        break;

      case 'getPageCount':
        result = await handleGetPageCount(msg.payload as DocumentPayload);
        break;

      case 'getDocumentInfo':
        result = await handleGetDocumentInfo(msg.payload as DocumentPayload);
        break;

      case 'renderPage':
        result = await handleRenderPage(msg.payload as RenderPagePayload);
        break;

      case 'renderPagePreviews':
        result = await handleRenderPagePreviews(msg.payload as RenderPagePreviewsPayload);
        break;

      case 'renderPageFullQuality':
        result = await handleRenderPageFullQuality(msg.payload as RenderPageFullQualityPayload);
        break;

      case 'getDocumentText':
        result = await handleGetDocumentText(msg.payload as DocumentPayload);
        break;

      case 'getPageNames':
        result = await handleGetPageNames(msg.payload as DocumentPayload);
        break;

      case 'openDocument':
        result = await handleOpenDocument(msg.payload as OpenDocumentPayload);
        break;

      case 'editorOperation':
        result = await handleEditorOperation(msg.payload as EditorOperationPayload);
        break;

      case 'closeDocument':
        result = await handleCloseDocument(msg.payload as CloseDocumentPayload);
        break;

      case 'destroy':
        await handleDestroy();
        break;

      default:
        throw new Error(`Unknown message type: ${msg.type}`);
    }

    process.send?.({ type: 'response', id: msg.id, success: true, data: result });
  } catch (err) {
    const errorMsg = (err as Error).message;
    log('Error:', errorMsg);
    const recentOutput = getRecentOutput();
    const fullError = recentOutput ? `${errorMsg}\n\nRecent LibreOffice output:\n${recentOutput}` : errorMsg;
    process.send?.({ type: 'response', id: msg.id, success: false, error: fullError });
  }
});

log('Subprocess worker started, waiting for init message...');

// Signal that we're ready to receive init
process.send?.({ type: 'ready' });

// Keep process alive
setInterval(() => {}, 60000);

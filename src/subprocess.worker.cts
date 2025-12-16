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

// atob polyfill for Node.js < 16
if (typeof globalThis.atob !== 'function') {
  globalThis.atob = (data: string) => Buffer.from(data, 'base64').toString('binary');
}

const wasmPath = process.env.WASM_PATH || './wasm';
const verbose = process.env.VERBOSE === 'true';
const userProfilePath = process.env.USER_PROFILE_PATH || undefined;
const wasmDir = path.resolve(wasmPath);
// Note: No need for process.chdir() - locateFile in wasmLoader uses absolute paths

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
import { LibreOfficeConverter } from './converter-node.js';
import { createEditor, OfficeEditor } from './editor/index.js';
import type { ConversionOptions, InputFormatOptions, WasmLoaderModule, EmscriptenModule } from './types.js';
import type { OperationResult } from './editor/types.js';

// Import createSofficeModule from ESM - marked as external in tsup.config.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - soffice.mjs is in wasm/ directory at runtime
import createSofficeModule from '../wasm/soffice.mjs';

// Create wasmLoader compatible interface using soffice.mjs
const wasmLoader: WasmLoaderModule = {
  async createModule(config: Record<string, unknown>): Promise<EmscriptenModule> {
    const moduleConfig: Record<string, unknown> = {
      locateFile: (filename: string) => path.join(wasmDir, filename),
      print: verbose ? (msg: string) => console.log('[LO]', msg) : () => {},
      printErr: verbose ? (msg: string) => console.error('[LO ERR]', msg) : () => {},
      ...config,
    };
    
    if (typeof config.onProgress === 'function') {
      (config.onProgress as (phase: string, percent: number, message: string) => void)('loading', 0, 'Starting WASM load...');
    }
    
    const module = await (createSofficeModule as (config: Record<string, unknown>) => Promise<EmscriptenModule>)(moduleConfig);
    
    if (typeof config.onProgress === 'function') {
      (config.onProgress as (phase: string, percent: number, message: string) => void)('loading', 100, 'WASM loaded');
    }
    
    return module;
  },
  clearCache() {
    // No caching with ES modules
  },
};

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
// With serialization: 'advanced', Uint8Array is transferred efficiently via V8 serialization
interface ConvertPayload {
  inputData: Uint8Array;
  inputExt: string;
  outputFormat: string;
  filterOptions: string;
}

interface DocumentPayload {
  inputData: Uint8Array;
  inputFormat: string;
}

interface RenderPagePayload {
  inputData: Uint8Array;
  inputFormat: string;
  pageIndex: number;
  width: number;
  height?: number;
}

interface RenderPagePreviewsPayload {
  inputData: Uint8Array;
  inputFormat: string;
  width: number;
  height?: number;
  pageIndices?: number[];
}

interface RenderPageFullQualityPayload {
  inputData: Uint8Array;
  inputFormat: string;
  pageIndex: number;
  dpi: number;
  maxDimension?: number;
  editMode?: boolean;
}

interface OpenDocumentPayload {
  inputData: Uint8Array;
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
async function handleConvert(payload: ConvertPayload): Promise<Uint8Array> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const result = await converter.convert(
    payload.inputData,
    {
      inputFormat: payload.inputExt,
      outputFormat: payload.outputFormat,
    } as ConversionOptions,
    'document'
  );

  return result.data;
}

/**
 * Handle getPageCount request
 */
async function handleGetPageCount(payload: DocumentPayload): Promise<number> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  return converter.getPageCount(payload.inputData, {
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

  return converter.getDocumentInfo(payload.inputData, {
    inputFormat: payload.inputFormat,
    outputFormat: 'pdf',
  } as ConversionOptions);
}

/**
 * Handle renderPage request
 */
async function handleRenderPage(payload: RenderPagePayload): Promise<{
  data: Uint8Array;
  width: number;
  height: number;
}> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const previews = await converter.renderPagePreviews(
    payload.inputData,
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
    data: preview.data,
    width: preview.width,
    height: preview.height,
  };
}

/**
 * Handle renderPagePreviews request
 */
async function handleRenderPagePreviews(payload: RenderPagePreviewsPayload): Promise<Array<{
  page: number;
  data: Uint8Array;
  width: number;
  height: number;
}>> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const previews = await converter.renderPagePreviews(
    payload.inputData,
    { inputFormat: payload.inputFormat as InputFormatOptions['inputFormat'] },
    {
      width: payload.width,
      height: payload.height || 0,
      pageIndices: payload.pageIndices,
    }
  );

  return previews.map((preview: { page: number; data: Uint8Array; width: number; height: number }) => ({
    page: preview.page,
    data: preview.data,
    width: preview.width,
    height: preview.height,
  }));
}

/**
 * Handle renderPageFullQuality request
 */
async function handleRenderPageFullQuality(payload: RenderPageFullQualityPayload): Promise<{
  page: number;
  data: Uint8Array;
  width: number;
  height: number;
  dpi: number;
}> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const preview = await converter.renderPageFullQuality(
    payload.inputData,
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
    data: preview.data,
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

  return converter.getDocumentText(payload.inputData, {
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

  return converter.getPageNames(payload.inputData, {
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
  module.FS.writeFile(filePath, payload.inputData);

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
async function handleCloseDocument(payload: CloseDocumentPayload): Promise<Uint8Array | undefined> {
  const session = editorSessions.get(payload.sessionId);
  if (!session) {
    throw new Error(`Session not found: ${payload.sessionId}`);
  }

  const lokBindings = converter?.getLokBindings();
  const module = converter?.getModule();
  const { docPtr, filePath } = session;

  // Get the modified document data before closing
  let modifiedData: Uint8Array | undefined;
  if (module && lokBindings) {
    try {
      // Save to original path first
      const ext = filePath.split('.').pop() || 'docx';
      lokBindings.documentSaveAs(docPtr, filePath, ext, '');
      modifiedData = module.FS.readFile(filePath) as Uint8Array;
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

interface ListDirectoryPayload {
  path: string;
}

/**
 * Handle listDirectory request - list files in virtual filesystem directory
 */
function handleListDirectory(payload: ListDirectoryPayload): string[] {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const module = converter.getModule();
  if (!module?.FS) {
    throw new Error('Module FS not available');
  }

  try {
    const entries = module.FS.readdir(payload.path) as string[];
    // Filter out . and ..
    return entries.filter((e: string) => e !== '.' && e !== '..');
  } catch (e) {
    // Directory doesn't exist or can't be read
    return [];
  }
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
async function handleInit(prewarm = false): Promise<void> {
  if (converter?.isReady()) {
    // If already initialized but prewarm requested, do prewarm
    if (prewarm) {
      await doPrewarm();
    }
    return;
  }

  log('Creating LibreOfficeConverter...');
  converter = new LibreOfficeConverter({
    wasmPath: wasmDir,
    verbose,
    wasmLoader,
    userProfilePath,
  });

  log('Initializing converter...');
  await converter.initialize();
  log('Converter initialized successfully');

  // Pre-warm font cache by loading a minimal document
  // This triggers fontconfig to scan all fonts during initialization
  // rather than during the first conversion (which may have a shorter timeout)
  if (prewarm) {
    await doPrewarm();
  }
}

/**
 * Pre-warm the converter by loading a minimal document
 * This triggers font scanning which can be slow on first load
 */
async function doPrewarm(): Promise<void> {
  if (!converter?.isReady()) {
    log('Cannot prewarm: converter not ready');
    return;
  }

  log('Pre-warming font cache...');
  const startTime = Date.now();

  const module = converter.getModule();
  const lokBindings = converter.getLokBindings();

  if (!module || !lokBindings) {
    log('Cannot prewarm: module or lokBindings not available');
    return;
  }

  // Create a minimal ODT document (smallest valid document format)
  // This is a minimal valid ODT that LibreOffice can parse
  const minimalOdt = createMinimalOdt();

  const prewarmPath = '/tmp/prewarm.odt';
  try {
    // Write minimal document
    module.FS.writeFile(prewarmPath, minimalOdt);

    // Load document - this triggers font scanning
    const docPtr = lokBindings.documentLoad(prewarmPath);
    if (docPtr !== 0) {
      // Clean up
      lokBindings.documentDestroy(docPtr);
      log(`Font cache pre-warmed in ${Date.now() - startTime}ms`);
    } else {
      log('Prewarm document load failed (this is often OK)');
    }
  } catch (e) {
    // Font scanning still happens even if document load fails
    log(`Prewarm completed with error (fonts still scanned): ${(e as Error).message}`);
  } finally {
    try {
      module.FS.unlink(prewarmPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Create a minimal ODT document for pre-warming
 * ODT is a ZIP containing XML files - this is the smallest valid structure
 */
function createMinimalOdt(): Uint8Array {
  // Pre-computed minimal ODT file (ZIP with mimetype, content.xml, META-INF/manifest.xml)
  // This was generated from a minimal LibreOffice Writer document
  // Base64-encoded to avoid binary issues in source code
  const minimalOdtBase64 = 
    'UEsDBBQAAAAIAAAAAACKIYEgHwAAAB0AAAAIAAAAbWltZXR5cGVhcHBsaWNhdGlvbi92bmQu' +
    'b2FzaXMub3BlbmRvY3VtZW50LnRleHRQSwMEFAAAAAAAAAAAgAAAAAAAAAAAAAAAABIAAABN' +
    'RVRBLUlORi9tYW5pZmVzdC54bWyNzk0KwCAMBOC9p5Dc3578Iz2BV+kZxKiVgKaNevxq6aKb' +
    'Lob5mOz05N5KJEsIKzTJLhqRIXJl0AqpB+IRcqtdSXx0o/qg5N1C5Y+xX+wF5j0xeXrM8gJQ' +
    'SwMEFAAAAAgAAAAAAKwVJJY8AAAAQQAAAAsAAABjb250ZW50LnhtbE2OSw6AIAwA956C9AZi' +
    'Nxj3PoD7hxKkRvpCAer1BRN1N5OZbPakYMNQpRz7gZ7GUvZk5Vz8pLIZ7tDkfELV8j9BRLWD' +
    'VAcwz6O3FaJ2LxBQSwECPwAUAAAACAAAAAAAgAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAA' +
    'AAAG1pbWV0eXBlUEsBAj8AFAAAAAAAAACAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAEAAA' +
    'AABNRVRBLUlORi9tYW5pZmVzdC54bWxQSwECPwAUAAAACAAAAAAArBUkljwAAABBAAAACwAA' +
    'AAAAAAAAAAAAAACOAAAAAAAAAAAAEAAAAABjb250ZW50LnhtbFBLBQYAAAAAAwADAK0AAACP' +
    'AAAAAAA=';

  // Decode base64
  const binaryString = atob(minimalOdtBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

interface InitPayload {
  prewarm?: boolean;
}

// Handle incoming messages
process.on('message', async (msg: WorkerMessage) => {
  try {
    let result: unknown;

    switch (msg.type) {
      case 'init':
        await handleInit((msg.payload as InitPayload)?.prewarm ?? false);
        break;

      case 'prewarm':
        await doPrewarm();
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

      case 'listDirectory':
        result = handleListDirectory(msg.payload as ListDirectoryPayload);
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

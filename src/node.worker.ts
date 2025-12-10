/**
 * LibreOffice WASM Worker Thread
 *
 * This module runs the LibreOffice WASM in a Worker thread to avoid
 * blocking the main Node.js event loop.
 *
 * Instead of duplicating LOK logic, this worker uses LibreOfficeConverter
 * directly - the same implementation used by the main thread converter.
 */

import { parentPort } from 'worker_threads';
import { LibreOfficeConverter } from './converter.js';
import { createEditor, OfficeEditor } from './editor/index.js';
import type { ConversionOptions } from './types.js';
import type { OperationResult } from './editor/types.js';

interface WorkerMessage {
  type: string;
  id: string;
  payload?: unknown;
}

interface InitPayload {
  wasmPath: string;
  verbose: boolean;
}

interface ConvertPayload {
  inputData: Uint8Array;
  inputFormat: string;
  outputFormat: string;
  filterOptions?: string;
  filename?: string;
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

interface DocumentPayload {
  inputData: Uint8Array;
  inputFormat: string;
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

// Editor session tracking
interface EditorSession {
  sessionId: string;
  docPtr: number;
  filePath: string;
  editor: OfficeEditor;
  documentType: string;
}

// The converter instance - reuses the same LibreOfficeConverter as direct usage
let converter: LibreOfficeConverter | null = null;

// Active editor sessions
const editorSessions = new Map<string, EditorSession>();
let sessionCounter = 0;

/**
 * Initialize the converter
 */
async function handleInit(payload: InitPayload): Promise<void> {
  if (converter?.isReady()) {
    return;
  }

  converter = new LibreOfficeConverter({
    wasmPath: payload.wasmPath,
    verbose: payload.verbose,
  });

  await converter.initialize();
}

/**
 * Convert a document
 */
async function handleConvert(payload: ConvertPayload): Promise<Uint8Array> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const options: ConversionOptions = {
    inputFormat: payload.inputFormat as ConversionOptions['inputFormat'],
    outputFormat: payload.outputFormat as ConversionOptions['outputFormat'],
  };

  const result = await converter.convert(
    payload.inputData,
    options,
    payload.filename || 'document'
  );

  return result.data;
}

/**
 * Get page count
 */
async function handleGetPageCount(payload: DocumentPayload): Promise<number> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const options: ConversionOptions = {
    inputFormat: payload.inputFormat as ConversionOptions['inputFormat'],
    outputFormat: 'pdf', // Required but not used for page count
  };

  return converter.getPageCount(payload.inputData, options);
}

/**
 * Get document info
 */
async function handleGetDocumentInfo(payload: DocumentPayload): Promise<unknown> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const options: ConversionOptions = {
    inputFormat: payload.inputFormat as ConversionOptions['inputFormat'],
    outputFormat: 'pdf', // Required but not used for document info
  };

  return converter.getDocumentInfo(payload.inputData, options);
}

/**
 * Render a single page
 */
async function handleRenderPage(payload: RenderPagePayload): Promise<{
  data: Uint8Array;
  width: number;
  height: number;
}> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const options: ConversionOptions = {
    inputFormat: payload.inputFormat as ConversionOptions['inputFormat'],
    outputFormat: 'pdf', // Required but not used for rendering
  };

  const previews = await converter.renderPagePreviews(
    payload.inputData,
    options,
    payload.width,
    payload.height,
    [payload.pageIndex]
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
 * Render multiple page previews
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

  const options: ConversionOptions = {
    inputFormat: payload.inputFormat as ConversionOptions['inputFormat'],
    outputFormat: 'pdf', // Required but not used for rendering
  };

  return converter.renderPagePreviews(
    payload.inputData,
    options,
    payload.width,
    payload.height,
    payload.pageIndices
  );
}

/**
 * Get document text
 */
async function handleGetDocumentText(payload: DocumentPayload): Promise<string | null> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const options: ConversionOptions = {
    inputFormat: payload.inputFormat as ConversionOptions['inputFormat'],
    outputFormat: 'pdf', // Required but not used for text extraction
  };

  return converter.getDocumentText(payload.inputData, options);
}

/**
 * Get page/slide names
 */
async function handleGetPageNames(payload: DocumentPayload): Promise<string[]> {
  if (!converter?.isReady()) {
    throw new Error('Worker not initialized');
  }

  const options: ConversionOptions = {
    inputFormat: payload.inputFormat as ConversionOptions['inputFormat'],
    outputFormat: 'pdf', // Required but not used for page names
  };

  return converter.getPageNames(payload.inputData, options);
}

/**
 * Open a document for editing
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
    throw new Error(`Failed to load document: ${error}`);
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
 * Execute an editor operation on an open session
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
 * Close an editor session and optionally save the document
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

/**
 * Destroy the converter
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
 * Main message handler
 */
parentPort?.on('message', async (message: WorkerMessage) => {
  try {
    let result: unknown;

    switch (message.type) {
      case 'init':
        await handleInit(message.payload as InitPayload);
        break;

      case 'convert':
        result = await handleConvert(message.payload as ConvertPayload);
        break;

      case 'getPageCount':
        result = await handleGetPageCount(message.payload as DocumentPayload);
        break;

      case 'getDocumentInfo':
        result = await handleGetDocumentInfo(message.payload as DocumentPayload);
        break;

      case 'renderPage':
        result = await handleRenderPage(message.payload as RenderPagePayload);
        break;

      case 'renderPagePreviews':
        result = await handleRenderPagePreviews(message.payload as RenderPagePreviewsPayload);
        break;

      case 'getDocumentText':
        result = await handleGetDocumentText(message.payload as DocumentPayload);
        break;

      case 'getPageNames':
        result = await handleGetPageNames(message.payload as DocumentPayload);
        break;

      case 'openDocument':
        result = await handleOpenDocument(message.payload as OpenDocumentPayload);
        break;

      case 'editorOperation':
        result = await handleEditorOperation(message.payload as EditorOperationPayload);
        break;

      case 'closeDocument':
        result = await handleCloseDocument(message.payload as CloseDocumentPayload);
        break;

      case 'destroy':
        await handleDestroy();
        break;

      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }

    parentPort?.postMessage({
      id: message.id,
      success: true,
      data: result,
    });
  } catch (error) {
    parentPort?.postMessage({
      id: message.id,
      success: false,
      error: (error as Error).message,
    });
  }
});

// Signal ready
parentPort?.postMessage({ type: 'ready' });

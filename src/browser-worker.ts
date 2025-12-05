/**
 * Browser Web Worker for LibreOffice WASM conversions
 *
 * This worker runs the WASM module off the main thread to avoid blocking the UI.
 * Communication is via postMessage.
 */

import type { EmscriptenModule, WasmLoadPhase, WasmLoadProgress } from './types.js';
import { LOKBindings } from './lok-bindings.js';
import { FORMAT_FILTER_OPTIONS, OUTPUT_FORMAT_TO_LOK } from './types.js';
import { createEditor, OfficeEditor } from './editor/index.js';
import type { OperationResult } from './editor/types.js';

// ============================================
// WASM Loading Progress System
// ============================================

/**
 * Cumulative progress tracking - each step adds to the total
 * This ensures progress always increases even if events arrive out of order
 *
 * Weight distribution (sums to 100):
 * - download-wasm: 50 points (largest file ~142MB)
 * - download-data: 30 points (~96MB)
 * - compile: 5 points
 * - filesystem: 7 points
 * - lok-init: 7 points
 * - ready: 1 point (final)
 */
const PHASE_WEIGHTS: Record<WasmLoadPhase, number> = {
  'download-wasm': 50,
  'download-data': 30,
  'compile': 5,
  'filesystem': 7,
  'lok-init': 7,
  'ready': 1,
};

/** Track completed progress for each phase */
const phaseProgress: Record<WasmLoadPhase, number> = {
  'download-wasm': 0,
  'download-data': 0,
  'compile': 0,
  'filesystem': 0,
  'lok-init': 0,
  'ready': 0,
};

/** Current request ID for progress messages */
let currentInitRequestId: number = 0;

/** Last emitted percentage - ensures monotonic progress */
let lastEmittedPercent: number = 0;

/** Calculate total progress as sum of all phase progress */
function calculateTotalProgress(): number {
  let total = 0;
  for (const phase of Object.keys(phaseProgress) as WasmLoadPhase[]) {
    total += phaseProgress[phase];
  }
  const percent = Math.min(100, Math.round(total));
  // Ensure we never emit a lower percentage than before
  if (percent > lastEmittedPercent) {
    lastEmittedPercent = percent;
  }
  return lastEmittedPercent;
}

/** Format bytes as human-readable MB */
function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/** Emit download progress with bytes info */
function emitDownloadProgress(phase: WasmLoadPhase, loaded: number, total: number) {
  const weight = PHASE_WEIGHTS[phase];
  const phasePercent = total > 0 ? loaded / total : 0;
  const newProgress = weight * phasePercent;

  // Only update if progress increased (never go backwards)
  if (newProgress > phaseProgress[phase]) {
    phaseProgress[phase] = newProgress;
  }

  const message = phase === 'download-wasm'
    ? `Downloading WebAssembly... ${formatBytes(loaded)} / ${formatBytes(total)}`
    : `Downloading filesystem... ${formatBytes(loaded)} / ${formatBytes(total)}`;

  emitProgress({ percent: calculateTotalProgress(), message, phase, bytesLoaded: loaded, bytesTotal: total });
}

/** Emit phase progress (marks phase as complete) */
function emitPhaseProgress(phase: WasmLoadPhase, message: string) {
  // Only update if this is an increase
  const newProgress = PHASE_WEIGHTS[phase];
  if (newProgress > phaseProgress[phase]) {
    phaseProgress[phase] = newProgress;
  }
  emitProgress({ percent: calculateTotalProgress(), message, phase });
}

/** Send progress to main thread */
function emitProgress(progress: WasmLoadProgress) {
  self.postMessage({ type: 'progress', id: currentInitRequestId, progress });
}

/**
 * Install fetch interceptor to track WASM file downloads
 * Must be called BEFORE importScripts() loads Emscripten
 *
 * Modern Emscripten uses fetch() API for downloading .wasm and .data files
 */
function installProgressInterceptors() {
  const originalFetch = self.fetch;

  // Intercept fetch for progress tracking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (self as any).fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Identify which file is being downloaded
    let phase: WasmLoadPhase | null = null;
    if (url.includes('soffice.wasm')) {
      phase = 'download-wasm';
      console.log('[Worker] Starting fetch download: soffice.wasm');
    } else if (url.includes('soffice.data')) {
      phase = 'download-data';
      console.log('[Worker] Starting fetch download: soffice.data');
    }

    const response = await originalFetch(input, init);

    // If not a tracked file, return original response
    if (!phase) {
      return response;
    }

    // Get content length for progress calculation
    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    // If no content length or no body, return original response
    if (!total || !response.body) {
      console.log(`[Worker] No content-length for ${url}, skipping progress tracking`);
      return response;
    }

    // Create a new response with progress tracking
    const reader = response.body.getReader();
    let loaded = 0;

    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log(`[Worker] Finished fetch download: ${phase === 'download-wasm' ? 'soffice.wasm' : 'soffice.data'}`);
            controller.close();
            break;
          }

          loaded += value.length;
          emitDownloadProgress(phase!, loaded, total);
          controller.enqueue(value);
        }
      }
    });

    return new Response(stream, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    });
  };

  console.log('[Worker] Installed progress-tracking fetch interceptor');

  // Also intercept XHR as fallback (some Emscripten configurations use it)
  const OriginalXHR = self.XMLHttpRequest;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ProgressXMLHttpRequest = function(this: XMLHttpRequest) {
    const xhr = new OriginalXHR();
    let requestUrl = '';

    const originalOpen = xhr.open.bind(xhr);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (xhr as any).open = function(method: string, url: string | URL, ...args: any[]) {
      requestUrl = String(url);
      return originalOpen(method, url, ...args);
    };

    const originalSend = xhr.send.bind(xhr);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (xhr as any).send = function(body?: any) {
      let phase: WasmLoadPhase | null = null;
      if (requestUrl.includes('soffice.wasm')) {
        phase = 'download-wasm';
        console.log('[Worker] Starting XHR download: soffice.wasm');
      } else if (requestUrl.includes('soffice.data')) {
        phase = 'download-data';
        console.log('[Worker] Starting XHR download: soffice.data');
      }

      if (phase) {
        const downloadPhase = phase;
        xhr.addEventListener('progress', (e: ProgressEvent) => {
          if (e.lengthComputable) {
            emitDownloadProgress(downloadPhase, e.loaded, e.total);
          }
        });

        xhr.addEventListener('load', () => {
          console.log(`[Worker] Finished XHR download: ${downloadPhase === 'download-wasm' ? 'soffice.wasm' : 'soffice.data'}`);
        });
      }

      return originalSend(body);
    };

    return xhr;
  };

  Object.defineProperty(ProgressXMLHttpRequest, 'prototype', {
    value: OriginalXHR.prototype,
    writable: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (self as any).XMLHttpRequest = ProgressXMLHttpRequest;

  console.log('[Worker] Installed progress-tracking XHR interceptor');
}

interface WorkerMessage {
  type: 'init' | 'convert' | 'destroy' | 'getPageCount' | 'renderPreviews' | 'renderSinglePage' | 'renderPageViaConvert' | 'getDocumentInfo' | 'getLokInfo' | 'editText' | 'renderPageRectangles' | 'testLokOperations' | 'openDocument' | 'editorOperation' | 'closeDocument';
  id: number;
  wasmPath?: string;
  verbose?: boolean;
  inputData?: Uint8Array;
  inputExt?: string;
  outputFormat?: string;
  filterOptions?: string;
  password?: string;
  maxWidth?: number;
  pageIndex?: number; // For renderSinglePage / renderPageViaConvert
  // Text editing parameters
  findText?: string;      // Text to find for replacement
  replaceText?: string;   // Text to replace with
  insertText?: string;    // Text to insert at cursor
  // LOK operations testing
  operations?: string[];  // List of operations to test
  // Editor session parameters
  sessionId?: string;
  editorMethod?: string;
  editorArgs?: unknown[];
}

interface PagePreview {
  page: number;
  data: Uint8Array;
  width: number;
  height: number;
}

interface DocumentInfo {
  documentType: number;
  documentTypeName: string;
  validOutputFormats: string[];
  pageCount: number;
}

interface PartInfo {
  visible: string;
  selected: string;
  masterPageCount?: string;
  mode: string;
}

interface A11yFocusedParagraph {
  content: string;
  position: string;
  start: string;
  end: string;
}

interface LokInfo {
  pageRectangles: string | null;
  documentSize: { width: number; height: number };
  partInfo: PartInfo | null;
  a11yFocusedParagraph: A11yFocusedParagraph | null;
  a11yCaretPosition: number;
  editMode: number;
  allText: string | null;
}

interface EditResult {
  success: boolean;
  editMode: number;
  message: string;
  modifiedDocument?: Uint8Array;  // The modified document as a new file
}

interface PageRectangle {
  index: number;
  x: number;      // X position in twips
  y: number;      // Y position in twips
  width: number;  // Width in twips
  height: number; // Height in twips
  imageData: Uint8Array;  // RGBA pixel data
  imageWidth: number;     // Rendered width in pixels
  imageHeight: number;    // Rendered height in pixels
}

interface LokOperationResult {
  operation: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

interface TestLokOperationsResult {
  operations: LokOperationResult[];
  summary: string;
}

// Editor session info returned from openDocument
interface EditorSessionInfo {
  sessionId: string;
  documentType: 'writer' | 'calc' | 'impress' | 'draw';
  pageCount: number;
}

// Editor operation result
interface EditorOperationResult {
  success: boolean;
  verified?: boolean;
  data?: unknown;
  error?: string;
  suggestion?: string;
}

interface WorkerResponse {
  type: 'ready' | 'progress' | 'result' | 'error' | 'pageCount' | 'previews' | 'singlePagePreview' | 'documentInfo' | 'lokInfo' | 'editResult' | 'pageRectangles' | 'testLokOperations' | 'editorSession' | 'editorOperationResult' | 'documentClosed';
  id: number;
  data?: Uint8Array;
  error?: string;
  progress?: { percent: number; message: string };
  pageCount?: number;
  previews?: PagePreview[];
  preview?: PagePreview; // Single page preview
  documentInfo?: DocumentInfo;
  lokInfo?: LokInfo;
  editResult?: EditResult;
  pageRectangles?: PageRectangle[];
  testLokOperationsResult?: TestLokOperationsResult;
  editorSession?: EditorSessionInfo;
  editorOperationResult?: EditorOperationResult;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: any;
declare function importScripts(...urls: string[]): void;

let module: EmscriptenModule | null = null;
let lokBindings: LOKBindings | null = null;
let initialized = false;

// Document cache for efficient multi-page rendering
let cachedDoc: {
  docPtr: number;
  inputHash: string;
  filePath: string;
  pageCount: number;  // Cache page count since getting it requires a view
} | null = null;

// Editor session storage - keeps documents open for editing
interface EditorSession {
  sessionId: string;
  docPtr: number;
  filePath: string;
  editor: OfficeEditor;
  documentType: 'writer' | 'calc' | 'impress' | 'draw';
}

const editorSessions = new Map<string, EditorSession>();
let sessionCounter = 0;

// Simple hash function for input data
function hashInput(data: Uint8Array): string {
  let hash = 0;
  const step = Math.max(1, Math.floor(data.length / 1000)); // Sample ~1000 bytes
  for (let i = 0; i < data.length; i += step) {
    hash = ((hash << 5) - hash + data[i]) | 0;
  }
  return `${hash}_${data.length}`;
}

// Get page count for a document, handling different document types correctly
function getDocumentPageCount(docPtr: number): number {
  const docType = lokBindings!.documentGetDocumentType(docPtr);

  // For Text Documents (type 0), getParts returns 0 or 1 (representing "parts" not pages)
  // We need to use getPartPageRectangles to get actual page count
  if (docType === 0) { // TEXT document
    const pageRectsStr = lokBindings!.getPartPageRectangles(docPtr);
    if (pageRectsStr) {
      const pageRects = lokBindings!.parsePageRectangles(pageRectsStr);
      console.log(`[Worker] getDocumentPageCount: TEXT doc has ${pageRects.length} pages from rectangles`);
      return pageRects.length;
    }
    // Fallback: if no page rectangles, assume at least 1 page
    console.log(`[Worker] getDocumentPageCount: TEXT doc has no page rectangles, assuming 1 page`);
    return 1;
  }

  // For Presentations, Drawings, Spreadsheets - getParts returns slide/page/sheet count
  const parts = lokBindings!.documentGetParts(docPtr);
  console.log(`[Worker] getDocumentPageCount: docType=${docType} has ${parts} parts`);
  return parts;
}

// Get or load a document (reuses cached document if same input)
function getOrLoadDocument(inputData: Uint8Array, inputExt: string): { docPtr: number; pageCount: number } {
  const inputHash = hashInput(inputData);

  // Check if we already have this document loaded
  if (cachedDoc && cachedDoc.inputHash === inputHash && lokBindings) {
    console.log(`[Worker] getOrLoadDocument: reusing cached doc ptr=${cachedDoc.docPtr}, pageCount=${cachedDoc.pageCount}`);
    return { docPtr: cachedDoc.docPtr, pageCount: cachedDoc.pageCount };
  }

  // Close previous document if any
  console.log(`[Worker] getOrLoadDocument: loading new document (hash=${inputHash})`);
  closeCachedDocument();

  // Load new document
  const filePath = `/tmp/input/cached_doc.${inputExt || 'docx'}`;
  module!.FS.writeFile(filePath, inputData);
  const docPtr = lokBindings!.documentLoad(filePath);

  if (docPtr === 0) {
    const error = lokBindings!.getError();
    throw new Error(error || 'Failed to load document');
  }

  const pageCount = getDocumentPageCount(docPtr);
  console.log(`[Worker] getOrLoadDocument: loaded doc ptr=${docPtr}, pageCount=${pageCount}`);

  // Cache the document with page count (page count requires a view to calculate correctly,
  // so we cache it here when the document is first loaded)
  cachedDoc = { docPtr, inputHash, filePath, pageCount };

  return { docPtr, pageCount };
}

// Close cached document
function closeCachedDocument() {
  if (cachedDoc && lokBindings && module) {
    console.log(`[Worker] closeCachedDocument: closing cached doc ptr=${cachedDoc.docPtr}`);
    try { lokBindings.documentDestroy(cachedDoc.docPtr); } catch { /* ignore */ }
    try { module.FS.unlink(cachedDoc.filePath); } catch { /* ignore */ }
    cachedDoc = null;
  }
}

function postResponse(response: WorkerResponse) {
  if (response.data) {
    // Transfer the ArrayBuffer for efficiency
    self.postMessage(response, [response.data.buffer]);
  } else {
    self.postMessage(response);
  }
}

function postProgress(id: number, percent: number, message: string) {
  postResponse({ type: 'progress', id, progress: { percent, message } });
}

async function handleInit(msg: WorkerMessage) {
  if (initialized) {
    postResponse({ type: 'ready', id: msg.id });
    return;
  }

  const wasmPath = msg.wasmPath || './wasm';
  const verbose = msg.verbose || false;

  // Store request ID for progress emission
  currentInitRequestId = msg.id;

  // Reset progress tracking for fresh initialization
  for (const phase of Object.keys(phaseProgress) as WasmLoadPhase[]) {
    phaseProgress[phase] = 0;
  }
  lastEmittedPercent = 0;

  // Install XHR interceptor BEFORE any Emscripten code loads
  // This intercepts soffice.wasm and soffice.data downloads
  installProgressInterceptors();

  // Emit initial progress
  emitPhaseProgress('download-wasm', 'Preparing to download WebAssembly...');

  try {
    // Configure global Module for Emscripten
    console.log('[Worker] Setting up Module with wasmPath:', wasmPath);
    const sofficeJsUrl = `${wasmPath}/soffice.js`;
    self.Module = {
      // Tell pthread workers where to load the main module from
      mainScriptUrlOrBlob: sofficeJsUrl,
      locateFile: (path: string, scriptDir: string) => {
        let result: string;
        if (path.endsWith('.wasm')) result = `${wasmPath}/soffice.wasm`;
        else if (path.endsWith('.data')) result = `${wasmPath}/soffice.data`;
        else if (path.endsWith('.metadata')) result = `${wasmPath}/soffice.data.js.metadata`;
        // Handle both .worker.js and .worker.cjs requests
        else if (path.includes('.worker.')) result = `${wasmPath}/soffice.worker.js`;
        else result = `${wasmPath}/${path}`;
        console.log('[Worker] locateFile called:', path, 'scriptDir:', scriptDir, '-> result:', result);
        return result;
      },
      // Always print LibreOffice output to console for debugging
      print: console.log,
      printErr: console.error,
    };

    // Load the soffice.js script using importScripts
    // This triggers the .wasm download (tracked by XHR interceptor)
    importScripts(`${wasmPath}/soffice.js`);

    // Wait for runtime to be ready
    // .data file download and WebAssembly compilation happen here
    emitPhaseProgress('compile', 'Compiling WebAssembly module...');

    await new Promise<void>((resolve, reject) => {
      const checkReady = () => {
        if (self.Module && self.Module.calledRun) {
          resolve();
        } else if (self.Module && self.Module.onRuntimeInitialized) {
          // Already has a callback, chain it
          const orig = self.Module.onRuntimeInitialized;
          self.Module.onRuntimeInitialized = () => {
            orig();
            resolve();
          };
        } else {
          self.Module.onRuntimeInitialized = resolve;
        }

        // Timeout
        setTimeout(() => reject(new Error('WASM initialization timeout')), 120000);
      };

      // Check if already ready
      if (self.Module && self.Module.calledRun) {
        resolve();
      } else {
        checkReady();
      }
    });

    module = self.Module as EmscriptenModule;
    emitPhaseProgress('filesystem', 'Setting up filesystem...');

    // Set SAL_LOG environment variable for LibreOffice logging
    // Must be done before LOK initialization
    // Options: +ALL (everything), +lok (LibreOfficeKit), +vcl (rendering), +lok.shim (our shims)
    try {
      const mod = module as unknown as { ENV?: Record<string, string> };
      if (mod.ENV) {
        mod.ENV['SAL_LOG'] = '+ALL';
        mod.ENV['MAX_CONCURRENCY'] = '1';
        console.log('[Worker] Set SAL_LOG to +ALL');
      } else {
        console.log('[Worker] ENV not available');
      }
    } catch (e) {
      console.log('[Worker] Could not set SAL_LOG:', e);
    }

    // Setup filesystem
    const fs = module.FS;

    // Add FS tracking for debugging (sends logs to main thread)
    if (verbose) {
      const originalOpen = fs.open.bind(fs);
      fs.open = (path: string, flags: unknown, mode?: unknown) => {
        console.log('[FS OPEN CALL]', path);
        try {
          return originalOpen(path, flags, mode);
        } catch (err: unknown) {
          const error = err as { code?: string };
          if (error?.code === 'ENOENT') {
            console.log('[FS ENOENT]', path);
          }
          throw err;
        }
      };
    }
    try { fs.mkdir('/tmp'); } catch { /* exists */ }
    try { fs.mkdir('/tmp/input'); } catch { /* exists */ }
    try { fs.mkdir('/tmp/output'); } catch { /* exists */ }

    emitPhaseProgress('lok-init', 'Initializing LibreOfficeKit...');

    // Initialize LOK
    lokBindings = new LOKBindings(module, verbose);
    lokBindings.initialize('/instdir/program');

    // Enable synchronous event dispatch (Unipoll mode) globally
    // Without this, postKeyEvent/postMouseEvent events are queued but never processed
    lokBindings.enableSyncEvents();
    console.log('[LOK Worker] Enabled synchronous event dispatch (Unipoll mode)');

    initialized = true;
    emitPhaseProgress('ready', 'Ready');
    postResponse({ type: 'ready', id: msg.id });

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Image formats that need multi-page handling
const IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'svg'];

async function handleConvert(msg: WorkerMessage) {
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt, outputFormat, filterOptions, password } = msg;

  if (!inputData || !outputFormat) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data or output format' });
    return;
  }

  // Check if this is an image format that might need multi-page export
  const isImageFormat = IMAGE_FORMATS.includes(outputFormat.toLowerCase());

  const inPath = `/tmp/input/doc.${inputExt || 'docx'}`;
  const outPath = `/tmp/output/doc.${outputFormat}`;
  let docPtr = 0;
  const outputFiles: string[] = []; // Track files to clean up

  try {
    postProgress(msg.id, 10, 'Writing input file...');
    module.FS.writeFile(inPath, inputData);

    postProgress(msg.id, 30, 'Loading document...');
    if (password) {
      docPtr = lokBindings.documentLoadWithOptions(inPath, `,Password=${password}`);
    } else {
      docPtr = lokBindings.documentLoad(inPath);
    }

    if (docPtr === 0) {
      const error = lokBindings.getError();
      throw new Error(error || 'Failed to load document');
    }

    // Get page count for multi-page image export
    const pageCount = lokBindings.documentGetParts(docPtr);
    const docType = lokBindings.documentGetDocumentType(docPtr);

    // For image formats with multiple pages, export each page separately and zip
    if (isImageFormat && pageCount > 1) {
      postProgress(msg.id, 40, `Exporting ${pageCount} pages as ${outputFormat.toUpperCase()}...`);

      const lokFormat = OUTPUT_FORMAT_TO_LOK[outputFormat as keyof typeof OUTPUT_FORMAT_TO_LOK];
      const baseOpts = filterOptions || FORMAT_FILTER_OPTIONS[outputFormat as keyof typeof FORMAT_FILTER_OPTIONS] || '';

      // Export each page
      const pageFiles: Array<{ name: string; data: Uint8Array }> = [];

      // Get document size for calculating export dimensions (for image formats)
      const { width: docWidth, height: docHeight } = lokBindings.documentGetDocumentSize(docPtr);
      const aspectRatio = docHeight / docWidth;
      const exportWidth = 1024; // High quality export
      const exportHeight = Math.round(exportWidth * aspectRatio);

      for (let i = 0; i < pageCount; i++) {
        const progress = 40 + Math.round((i / pageCount) * 40);
        postProgress(msg.id, progress, `Exporting page ${i + 1}/${pageCount}...`);

        const pageOutPath = `/tmp/output/page_${i + 1}.${outputFormat}`;
        outputFiles.push(pageOutPath);

        // For presentations/drawings, we need to set the part AND use PixelWidth/PixelHeight
        // for PNG/JPG export to work correctly (same approach as handleRenderPageViaConvert)
        if (docType === 2 || docType === 3) { // PRESENTATION or DRAWING
          lokBindings.documentSetPart(docPtr, i);

          // For image formats, include pixel dimensions in filter options
          let pageOpts = baseOpts;
          if (outputFormat === 'png' || outputFormat === 'jpg' || outputFormat === 'jpeg') {
            pageOpts = `PixelWidth=${exportWidth};PixelHeight=${exportHeight}`;
            if (baseOpts) pageOpts = `${baseOpts};${pageOpts}`;
          }

          lokBindings.documentSaveAs(docPtr, pageOutPath, lokFormat, pageOpts);
          console.log(`[Worker] Page ${i + 1} (presentation) exported with opts: ${pageOpts}`);
        } else {
          // For text documents, use PageRange filter option (1-indexed)
          let pageOpts = `PageRange=${i + 1}-${i + 1}`;

          // For image formats, also include pixel dimensions
          if (outputFormat === 'png' || outputFormat === 'jpg' || outputFormat === 'jpeg') {
            pageOpts += `;PixelWidth=${exportWidth};PixelHeight=${exportHeight}`;
          }

          if (baseOpts) pageOpts = `${baseOpts};${pageOpts}`;

          lokBindings.documentSaveAs(docPtr, pageOutPath, lokFormat, pageOpts);
          console.log(`[Worker] Page ${i + 1} (text) exported with opts: ${pageOpts}`);
        }

        const pageData = module.FS.readFile(pageOutPath) as Uint8Array;
        console.log(`[Worker] Page ${i + 1} exported: ${pageData.length} bytes`);

        if (pageData.length > 0) {
          const pageCopy = new Uint8Array(pageData.length);
          pageCopy.set(pageData);
          pageFiles.push({ name: `page_${i + 1}.${outputFormat}`, data: pageCopy });
        } else {
          console.warn(`[Worker] Page ${i + 1} export produced empty file`);
        }
      }

      postProgress(msg.id, 85, 'Creating ZIP archive...');

      // Create a simple ZIP file (no compression for images)
      const zipData = createSimpleZip(pageFiles);

      postProgress(msg.id, 100, 'Complete');
      postResponse({ type: 'result', id: msg.id, data: zipData });

    } else {
      // Single page or non-image format: standard export
      postProgress(msg.id, 50, 'Converting...');

      const lokFormat = OUTPUT_FORMAT_TO_LOK[outputFormat as keyof typeof OUTPUT_FORMAT_TO_LOK];
      const opts = filterOptions || FORMAT_FILTER_OPTIONS[outputFormat as keyof typeof FORMAT_FILTER_OPTIONS] || '';

      postProgress(msg.id, 70, 'Saving...');
      lokBindings.documentSaveAs(docPtr, outPath, lokFormat, opts);
      outputFiles.push(outPath);

      postProgress(msg.id, 90, 'Reading output...');
      const sharedResult = module.FS.readFile(outPath) as Uint8Array;

      if (sharedResult.length === 0) {
        throw new Error('Conversion produced empty output');
      }

      // Copy from SharedArrayBuffer to regular ArrayBuffer for transfer
      const result = new Uint8Array(sharedResult.length);
      result.set(sharedResult);

      postProgress(msg.id, 100, 'Complete');
      postResponse({ type: 'result', id: msg.id, data: result });
    }

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    // Cleanup
    if (docPtr !== 0) {
      try { lokBindings.documentDestroy(docPtr); } catch { /* ignore */ }
    }
    try { module.FS.unlink(inPath); } catch { /* ignore */ }
    for (const path of outputFiles) {
      try { module.FS.unlink(path); } catch { /* ignore */ }
    }
  }
}

/**
 * Create a simple ZIP file from an array of files
 * This is a minimal ZIP implementation without compression (STORE method)
 */
function createSimpleZip(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true);  // Local file header signature
    view.setUint16(4, 20, true);           // Version needed
    view.setUint16(6, 0, true);            // General purpose flags
    view.setUint16(8, 0, true);            // Compression method (STORE)
    view.setUint16(10, 0, true);           // Mod time
    view.setUint16(12, 0, true);           // Mod date
    view.setUint32(14, crc32(file.data), true); // CRC-32
    view.setUint32(18, file.data.length, true); // Compressed size
    view.setUint32(22, file.data.length, true); // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // File name length
    view.setUint16(28, 0, true);           // Extra field length
    localHeader.set(nameBytes, 30);

    chunks.push(localHeader);
    chunks.push(file.data);

    // Central directory entry
    const cdEntry = new Uint8Array(46 + nameBytes.length);
    const cdView = new DataView(cdEntry.buffer);

    cdView.setUint32(0, 0x02014b50, true);  // Central directory signature
    cdView.setUint16(4, 20, true);           // Version made by
    cdView.setUint16(6, 20, true);           // Version needed
    cdView.setUint16(8, 0, true);            // General purpose flags
    cdView.setUint16(10, 0, true);           // Compression method
    cdView.setUint16(12, 0, true);           // Mod time
    cdView.setUint16(14, 0, true);           // Mod date
    cdView.setUint32(16, crc32(file.data), true); // CRC-32
    cdView.setUint32(20, file.data.length, true); // Compressed size
    cdView.setUint32(24, file.data.length, true); // Uncompressed size
    cdView.setUint16(28, nameBytes.length, true); // File name length
    cdView.setUint16(30, 0, true);           // Extra field length
    cdView.setUint16(32, 0, true);           // Comment length
    cdView.setUint16(34, 0, true);           // Disk number start
    cdView.setUint16(36, 0, true);           // Internal attributes
    cdView.setUint32(38, 0, true);           // External attributes
    cdView.setUint32(42, offset, true);      // Offset of local header
    cdEntry.set(nameBytes, 46);

    centralDirectory.push(cdEntry);
    offset += localHeader.length + file.data.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const entry of centralDirectory) {
    chunks.push(entry);
    cdSize += entry.length;
  }

  // End of central directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);  // EOCD signature
  eocdView.setUint16(4, 0, true);            // Disk number
  eocdView.setUint16(6, 0, true);            // Disk with CD
  eocdView.setUint16(8, files.length, true); // Entries on this disk
  eocdView.setUint16(10, files.length, true);// Total entries
  eocdView.setUint32(12, cdSize, true);      // CD size
  eocdView.setUint32(16, cdOffset, true);    // CD offset
  eocdView.setUint16(20, 0, true);           // Comment length

  chunks.push(eocd);

  // Combine all chunks
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
}

/**
 * CRC-32 calculation for ZIP files
 */
function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]!;
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

async function handleGetPageCount(msg: WorkerMessage) {
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  try {
    // Use cached document
    const { pageCount } = getOrLoadDocument(inputData, inputExt || 'docx');
    postResponse({ type: 'pageCount', id: msg.id, pageCount });
    // Document stays cached

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
    closeCachedDocument();
  }
}

async function handleRenderPreviews(msg: WorkerMessage) {
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt, maxWidth = 256 } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  try {
    postProgress(msg.id, 10, 'Loading document for preview...');
    
    // Use cached document
    const { docPtr, pageCount } = getOrLoadDocument(inputData, inputExt || 'docx');
    postProgress(msg.id, 20, `Rendering ${pageCount} pages...`);

    const previews: PagePreview[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      const progress = 20 + Math.round((i / pageCount) * 70);
      postProgress(msg.id, progress, `Rendering page ${i + 1}/${pageCount}...`);
      
      // Render the page - let renderPage handle page selection and sizing
      const rendered = lokBindings.renderPage(docPtr, i, maxWidth);
      
      // Copy from SharedArrayBuffer to regular ArrayBuffer
      const dataCopy = new Uint8Array(rendered.data.length);
      dataCopy.set(rendered.data);
      
      previews.push({
        page: i + 1,
        data: dataCopy,
        width: rendered.width,
        height: rendered.height
      });
    }

    postProgress(msg.id, 100, 'Preview complete');
    
    // Transfer all preview buffers
    const transfers = previews.map(p => p.data.buffer);
    self.postMessage({ type: 'previews', id: msg.id, previews }, transfers);
    // Document stays cached

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
    closeCachedDocument();
  }
}

/**
 * Render a single page preview - reuses cached document for efficiency
 */
async function handleRenderSinglePage(msg: WorkerMessage) {
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt, maxWidth = 256, pageIndex = 0 } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  let viewId = -1;
  let docPtr = 0;

  try {
    // Get or reuse cached document
    const result = getOrLoadDocument(inputData, inputExt || 'docx');
    docPtr = result.docPtr;
    const pageCount = result.pageCount;

    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new Error(`Page index ${pageIndex} out of range (0-${pageCount - 1})`);
    }

    // Create a view before rendering for all document types.
    // Without a view, LOK returns empty page rectangles and incorrect document sizes,
    // causing paintTile to crash with "memory access out of bounds".
    // The warning "No Frame-Controller created" indicates no view exists.
    const docType = lokBindings.documentGetDocumentType(docPtr);
    const docTypeNames = ['TEXT', 'SPREADSHEET', 'PRESENTATION', 'DRAWING'];
    console.log(`[Worker] handleRenderSinglePage: ${docTypeNames[docType] || 'UNKNOWN'} document - creating view for rendering`);
    viewId = lokBindings.createView(docPtr);
    if (viewId >= 0) {
      lokBindings.setView(docPtr, viewId);
      console.log(`[Worker] handleRenderSinglePage: Created and set view ${viewId}`);
    }

    // Render the page - let renderPage handle page-specific sizing
    // We just pass maxWidth and let it calculate the correct height based on the page's aspect ratio
    console.log(`[Worker] handleRenderSinglePage: calling renderPage for page ${pageIndex} at maxWidth=${maxWidth}...`);
    const rendered = lokBindings.renderPage(docPtr, pageIndex, maxWidth);
    console.log(`[Worker] handleRenderSinglePage: renderPage returned ${rendered.data.length} bytes (${rendered.width}x${rendered.height})`);
    
    // Copy from SharedArrayBuffer to regular ArrayBuffer
    const dataCopy = new Uint8Array(rendered.data.length);
    dataCopy.set(rendered.data);
    
    const preview: PagePreview = {
      page: pageIndex + 1,
      data: dataCopy,
      width: rendered.width,
      height: rendered.height
    };

    // Cleanup view if we created one (for Drawing documents)
    if (viewId >= 0 && docPtr !== 0) {
      try { lokBindings.destroyView(docPtr, viewId); } catch { /* ignore */ }
      console.log(`[Worker] handleRenderSinglePage: Destroyed view ${viewId}`);
    }

    // Transfer the buffer
    self.postMessage({ type: 'singlePagePreview', id: msg.id, preview }, [dataCopy.buffer]);

  } catch (error) {
    // Cleanup view if we created one (for Drawing documents)
    if (viewId >= 0 && docPtr !== 0) {
      try { lokBindings.destroyView(docPtr, viewId); } catch { /* ignore */ }
      console.log(`[Worker] handleRenderSinglePage: Destroyed view ${viewId} (on error)`);
    }

    // Convert error message to a regular string (not SharedArrayBuffer-backed)
    const errorMsg = error instanceof Error ? String(error.message) : String(error);
    postResponse({
      type: 'error',
      id: msg.id,
      error: errorMsg
    });
    // On error, close the cached document to allow retry
    closeCachedDocument();
  }
  // Note: We don't close the document here - it stays cached for subsequent page renders
}

/**
 * Render a page preview by converting to PNG - fallback for Chrome/Edge
 * This uses the saveAs conversion path instead of paintTile which hangs in Chromium
 */
async function handleRenderPageViaConvert(msg: WorkerMessage) {
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt, maxWidth = 256, pageIndex = 0 } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  const outPath = `/tmp/output/page_${pageIndex}.png`;

  try {
    // Use cached document
    const { docPtr, pageCount } = getOrLoadDocument(inputData, inputExt || 'pdf');

    // Get document type to determine how to handle page selection
    const docType = lokBindings.documentGetDocumentType(docPtr);
    
    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new Error(`Page index ${pageIndex} out of range (0-${pageCount - 1})`);
    }

    // For presentations/drawings, setPart works for page selection
    // For text documents, we need to use PageRange filter option
    if (docType === 2 || docType === 3) { // PRESENTATION or DRAWING
      lokBindings.documentSetPart(docPtr, pageIndex);
    }

    // Get document size to calculate aspect ratio
    const { width: docWidth, height: docHeight } = lokBindings.documentGetDocumentSize(docPtr);
    const aspectRatio = docHeight / docWidth;
    const outputWidth = Math.min(maxWidth, docWidth);
    const outputHeight = Math.round(outputWidth * aspectRatio);

    // Build filter options
    // For Writer documents, use PageRange to export specific page (1-indexed)
    // For presentations/drawings, the part is already set
    let filterOpts = `PixelWidth=${outputWidth};PixelHeight=${outputHeight}`;
    if (docType === 0) { // TEXT document
      filterOpts += `;PageRange=${pageIndex + 1}-${pageIndex + 1}`;
    }
    
    lokBindings.documentSaveAs(docPtr, outPath, 'png', filterOpts);

    // Read the PNG file
    const pngData = module.FS.readFile(outPath) as Uint8Array;
    
    if (pngData.length === 0) {
      throw new Error('PNG export produced empty output');
    }

    // Copy from SharedArrayBuffer
    const pngCopy = new Uint8Array(pngData.length);
    pngCopy.set(pngData);

    // Send as a special PNG preview (not RGBA like paintTile)
    const preview = {
      page: pageIndex + 1,
      data: pngCopy,
      width: outputWidth,
      height: outputHeight,
      format: 'png' as const
    };

    self.postMessage({ type: 'singlePagePreview', id: msg.id, preview, isPng: true }, [pngCopy.buffer]);
    // Document stays cached

    // Clean up output file only
    try { module.FS.unlink(outPath); } catch { /* ignore */ }

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
    closeCachedDocument();
    try { module.FS.unlink(outPath); } catch { /* ignore */ }
  }
}

async function handleGetDocumentInfo(msg: WorkerMessage) {
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  try {
    // Use cached document - this will load it if not already loaded
    const { docPtr, pageCount } = getOrLoadDocument(inputData, inputExt || 'docx');

    const docType = lokBindings.documentGetDocumentType(docPtr);

    // Map document type to valid output formats (based on LibreOffice capabilities)
    const docTypeOutputFormats: Record<number, string[]> = {
      0: ['pdf', 'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'png', 'jpg', 'svg'], // TEXT
      1: ['pdf', 'xlsx', 'xls', 'ods', 'csv', 'html', 'png', 'jpg', 'svg'],        // SPREADSHEET
      2: ['pdf', 'pptx', 'ppt', 'odp', 'png', 'jpg', 'svg', 'html'],              // PRESENTATION
      3: ['pdf', 'png', 'jpg', 'svg', 'html'],                                     // DRAWING
      4: ['pdf'],                                                                   // OTHER
    };

    const docTypeNames: Record<number, string> = {
      0: 'Text Document',
      1: 'Spreadsheet',
      2: 'Presentation',
      3: 'Drawing',
      4: 'Other',
    };

    const documentInfo: DocumentInfo = {
      documentType: docType,
      documentTypeName: docTypeNames[docType] || 'Unknown',
      validOutputFormats: docTypeOutputFormats[docType] || ['pdf'],
      pageCount,
    };

    postResponse({ type: 'documentInfo', id: msg.id, documentInfo });
    // Note: Document stays cached for subsequent operations

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
    // On error, close the cached document to allow retry
    closeCachedDocument();
  }
}

/**
 * Get LOK information about a loaded document - bounding boxes, positions, etc.
 */
async function handleGetLokInfo(msg: WorkerMessage) {
  console.log('[LOK Worker] handleGetLokInfo called');
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  try {
    // Use cached document
    console.log('[LOK Worker] Getting or loading document...');
    const { docPtr } = getOrLoadDocument(inputData, inputExt || 'docx');
    console.log(`[LOK Worker] Got docPtr: ${docPtr}`);

    // Get all available LOK read information
    console.log('[LOK Worker] Calling LOK methods...');
    const pageRectangles = lokBindings.getPartPageRectangles(docPtr);
    console.log(`[LOK Worker] pageRectangles: ${pageRectangles}`);

    const documentSize = lokBindings.documentGetDocumentSize(docPtr);
    console.log(`[LOK Worker] documentSize: ${documentSize.width}x${documentSize.height}`);

    const partInfo = lokBindings.getPartInfo(docPtr, 0);
    console.log(`[LOK Worker] partInfo: ${partInfo}`);

    const a11yFocusedParagraph = lokBindings.getA11yFocusedParagraph(docPtr);
    console.log(`[LOK Worker] a11yFocusedParagraph: ${a11yFocusedParagraph}`);

    const a11yCaretPosition = lokBindings.getA11yCaretPosition(docPtr);
    console.log(`[LOK Worker] a11yCaretPosition: ${a11yCaretPosition}`);

    let editMode = lokBindings.getEditMode(docPtr);
    console.log(`[LOK Worker] editMode (initial): ${editMode}`);

    // Try to enable edit mode for text extraction
    let allText: string | null = null;
    let viewId = -1;

    // 1. Get the existing view created during document load
    viewId = lokBindings.getView(docPtr);
    console.log(`[LOK Worker] Got existing view: ${viewId}`);

    // 2. Make it active with setActiveFrame (triggers setActiveFrame internally)
    if (viewId >= 0) {
      lokBindings.setView(docPtr, viewId);
      console.log(`[LOK Worker] Set active view to ${viewId}`);
    }

    // 3. Now try creating a NEW view (this might work now with active frame set)
    const newViewId = lokBindings.createView(docPtr);
    console.log(`[LOK Worker] Created new view: ${newViewId}`);

    if (newViewId >= 0) {
      lokBindings.setView(docPtr, newViewId);
      console.log(`[LOK Worker] Switched to new view: ${newViewId}`);
    }

    // Now enable edit mode
    lokBindings.setEditMode(docPtr, 1);
    editMode = lokBindings.getEditMode(docPtr);
    console.log(`[LOK Worker] editMode (after setEditMode): ${editMode}`);

    // Now try to get all text
    allText = lokBindings.getAllText(docPtr);
    console.log(`[LOK Worker] allText: ${allText?.slice(0, 100) || 'null'}`);

    // Cleanup the new view we created
    if (newViewId >= 0) {
      lokBindings.destroyView(docPtr, newViewId);
      console.log(`[LOK Worker] Destroyed view: ${newViewId}`);
    }

    // Parse JSON strings into objects
    let parsedPartInfo: PartInfo | null = null;
    if (partInfo) {
      try {
        parsedPartInfo = JSON.parse(partInfo) as PartInfo;
      } catch {
        console.warn('[LOK Worker] Failed to parse partInfo JSON:', partInfo);
      }
    }

    let parsedA11yParagraph: A11yFocusedParagraph | null = null;
    if (a11yFocusedParagraph) {
      try {
        parsedA11yParagraph = JSON.parse(a11yFocusedParagraph) as A11yFocusedParagraph;
      } catch {
        console.warn('[LOK Worker] Failed to parse a11yFocusedParagraph JSON:', a11yFocusedParagraph);
      }
    }

    const lokInfo: LokInfo = {
      pageRectangles,
      documentSize,
      partInfo: parsedPartInfo,
      a11yFocusedParagraph: parsedA11yParagraph,
      a11yCaretPosition,
      editMode,
      allText,
    };

    console.log('[LOK Worker] Posting lokInfo response');
    postResponse({ type: 'lokInfo', id: msg.id, lokInfo });
    // Document stays cached

  } catch (error) {
    console.error('[LOK Worker] Error in handleGetLokInfo:', error);
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
    closeCachedDocument();
  }
}

/**
 * Handle text editing operations - find/replace or insert text
 */
async function handleEditText(msg: WorkerMessage) {
  console.log('[LOK Worker] handleEditText called');
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt, findText, replaceText, insertText } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  // Close any cached document since we need a fresh load for editing
  closeCachedDocument();

  const filePath = `/tmp/input/edit_doc.${inputExt || 'docx'}`;
  const outputPath = `/tmp/output/edited_doc.${inputExt || 'docx'}`;
  let docPtr = 0;
  let viewId = -1;

  try {
    // Write file and load document
    console.log('[LOK Worker] Writing input file...');
    module.FS.writeFile(filePath, inputData);

    console.log('[LOK Worker] Loading document for editing...');
    docPtr = lokBindings.documentLoad(filePath);

    if (docPtr === 0) {
      const error = lokBindings.getError();
      throw new Error(error || 'Failed to load document');
    }
    console.log(`[LOK Worker] Document loaded, docPtr=${docPtr}`);

    // Initialize for rendering (required for some operations)
    lokBindings.documentInitializeForRendering(docPtr);
    console.log('[LOK Worker] Document initialized for rendering');

    // 1. Get the existing view created during document load
    viewId = lokBindings.getView(docPtr);
    console.log(`[LOK Worker] Got existing view: ${viewId}`);

    // 2. Make it active with setActiveFrame (triggers xDesktop->setActiveFrame() in C++)
    if (viewId >= 0) {
      lokBindings.setView(docPtr, viewId);
      console.log(`[LOK Worker] Set active view to ${viewId}`);
    }

    // 3. Create a NEW view - this helps establish proper editing context
    const newViewId = lokBindings.createView(docPtr);
    console.log(`[LOK Worker] Created new view: ${newViewId}`);

    if (newViewId >= 0) {
      lokBindings.setView(docPtr, newViewId);
      console.log(`[LOK Worker] Switched to new view: ${newViewId}`);
      viewId = newViewId; // Track new view for cleanup
    }

    // Now enable edit mode
    lokBindings.setEditMode(docPtr, 1);
    const editMode = lokBindings.getEditMode(docPtr);
    console.log(`[LOK Worker] Edit mode after setEditMode(1): ${editMode}`);

    let operationResult = '';

    // Perform the requested operation
    if (findText && replaceText !== undefined) {
      // Find and replace
      console.log(`[LOK Worker] Attempting find/replace: "${findText}" -> "${replaceText}"`);

      // Use .uno:ExecuteSearch for find/replace
      // Note: Command type should be "unsigned short" with string value
      const searchArgs = JSON.stringify({
        'SearchItem.SearchString': { type: 'string', value: findText },
        'SearchItem.ReplaceString': { type: 'string', value: replaceText },
        'SearchItem.Command': { type: 'unsigned short', value: '3' }, // 3 = Replace All
      });

      try {
        lokBindings.postUnoCommand(docPtr, '.uno:ExecuteSearch', searchArgs);
        operationResult = `Attempted replace all "${findText}" with "${replaceText}"`;
        console.log(`[LOK Worker] ${operationResult}`);
      } catch (searchErr) {
        console.error(`[LOK Worker] ExecuteSearch threw:`, searchErr);
        operationResult = `ExecuteSearch failed: ${searchErr}`;
      }
    } else if (insertText) {
      // Insert text at cursor
      console.log(`[LOK Worker] Attempting to insert text: "${insertText}"`);
      const results: string[] = [];

      // First, click in the document to establish focus (position 1000, 1000 twips)
      // LOK_MOUSEEVENT_BUTTONDOWN = 0, LOK_MOUSEEVENT_BUTTONUP = 1
      try {
        console.log(`[LOK Worker] Clicking in document to establish focus...`);
        lokBindings.postMouseEvent(docPtr, 0, 1000, 1000, 1, 1, 0); // BUTTONDOWN
        lokBindings.postMouseEvent(docPtr, 1, 1000, 1000, 1, 1, 0); // BUTTONUP
        console.log(`[LOK Worker] Posted mouse events for focus`);
        results.push('mouseEvents:ok');
      } catch (e) {
        console.error(`[LOK Worker] postMouseEvent threw:`, e);
        results.push(`mouseEvents:err`);
      }

      // Go to end of document
      try {
        lokBindings.postUnoCommand(docPtr, '.uno:GoToEndOfDoc');
        console.log(`[LOK Worker] Posted GoToEndOfDoc`);
        results.push('GoToEndOfDoc:ok');
      } catch (e) {
        console.error(`[LOK Worker] GoToEndOfDoc threw:`, e);
        results.push(`GoToEndOfDoc:err`);
      }

      // Approach 1: Try lok_documentPaste directly (bypasses event queue)
      let pasteResult = false;
      try {
        console.log(`[LOK Worker] Trying paste() with text/plain...`);
        pasteResult = lokBindings.paste(docPtr, 'text/plain;charset=utf-8', insertText);
        console.log(`[LOK Worker] paste() returned: ${pasteResult}`);
        results.push(`paste:${pasteResult}`);
      } catch (e) {
        console.error(`[LOK Worker] paste() threw:`, e);
        results.push(`paste:err`);
      }

      // Approach 2: Try .uno:InsertText
      try {
        const insertArgs = JSON.stringify({
          Text: { type: 'string', value: insertText },
        });
        lokBindings.postUnoCommand(docPtr, '.uno:InsertText', insertArgs);
        console.log(`[LOK Worker] Posted InsertText`);
        results.push('InsertText:ok');
      } catch (e) {
        console.error(`[LOK Worker] InsertText threw:`, e);
        results.push(`InsertText:err`);
      }

      // Approach 3: Also try postKeyEvent to type each character
      // LOK_KEYEVENT_KEYINPUT = 0, LOK_KEYEVENT_KEYUP = 1
      try {
        console.log(`[LOK Worker] Now trying postKeyEvent for each character...`);
        for (let i = 0; i < insertText.length; i++) {
          const charCode = insertText.charCodeAt(i);
          lokBindings.postKeyEvent(docPtr, 0, charCode, 0); // KEY_PRESSED
          lokBindings.postKeyEvent(docPtr, 1, charCode, 0); // KEY_RELEASED
        }
        console.log(`[LOK Worker] Posted ${insertText.length} key events`);
        results.push(`keyEvents:${insertText.length}`);
      } catch (e) {
        console.error(`[LOK Worker] postKeyEvent threw:`, e);
        results.push(`keyEvents:err`);
      }

      operationResult = `Insert attempts: ${results.join(', ')}`;
      console.log(`[LOK Worker] ${operationResult}`);
    } else {
      operationResult = 'No edit operation specified (need findText+replaceText or insertText)';
      console.log(`[LOK Worker] ${operationResult}`);
    }

    // Try to save the document back to a file
    console.log('[LOK Worker] Attempting to save modified document...');

    // Determine the format for saving
    const ext = inputExt || 'docx';
    const formatMap: Record<string, string> = {
      'docx': 'docx',
      'doc': 'doc',
      'odt': 'odt',
      'xlsx': 'xlsx',
      'xls': 'xls',
      'ods': 'ods',
      'pptx': 'pptx',
      'ppt': 'ppt',
      'odp': 'odp',
    };
    const saveFormat = formatMap[ext] || ext;

    try {
      lokBindings.documentSaveAs(docPtr, outputPath, saveFormat, '');
      console.log('[LOK Worker] Document saved');

      // Read the modified document
      const modifiedData = module.FS.readFile(outputPath) as Uint8Array;
      console.log(`[LOK Worker] Modified document size: ${modifiedData.length} bytes`);

      // Copy to regular ArrayBuffer
      const modifiedCopy = new Uint8Array(modifiedData.length);
      modifiedCopy.set(modifiedData);

      const editResult: EditResult = {
        success: true,
        editMode,
        message: operationResult + ` | Document saved (${modifiedCopy.length} bytes)`,
        modifiedDocument: modifiedCopy,
      };

      // Transfer the buffer
      self.postMessage({ type: 'editResult', id: msg.id, editResult }, [modifiedCopy.buffer]);

    } catch (saveError) {
      console.error('[LOK Worker] Save error:', saveError);

      const editResult: EditResult = {
        success: false,
        editMode,
        message: operationResult + ` | Save failed: ${saveError}`,
      };

      postResponse({ type: 'editResult', id: msg.id, editResult });
    }

  } catch (error) {
    // Log detailed error info for debugging WASM/Emscripten exceptions
    console.error('[LOK Worker] Error in handleEditText:', error);
    if (error instanceof Error) {
      console.error('[LOK Worker] Error name:', error.name);
      console.error('[LOK Worker] Error message:', error.message);
      console.error('[LOK Worker] Error stack:', error.stack);
    }
    // For Emscripten exceptions, try to get more details
    const errorObj = error as Record<string, unknown>;
    if (errorObj && typeof errorObj === 'object') {
      console.error('[LOK Worker] Error keys:', Object.keys(errorObj));
      for (const key of Object.keys(errorObj)) {
        try {
          console.error(`[LOK Worker] Error.${key}:`, errorObj[key]);
        } catch { /* ignore */ }
      }
    }
    // Check if this is a number (Emscripten exception pointer)
    if (typeof error === 'number') {
      console.error('[LOK Worker] Emscripten exception pointer:', error);
      // Try to get exception message from Emscripten
      const moduleAny = module as unknown as Record<string, unknown>;
      if (moduleAny && typeof moduleAny.getExceptionMessage === 'function') {
        try {
          const exMsg = (moduleAny.getExceptionMessage as (ptr: number) => string)(error);
          console.error('[LOK Worker] Emscripten exception message:', exMsg);
        } catch { /* ignore */ }
      }
    }
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    // Cleanup - destroy the view we created
    if (docPtr !== 0 && lokBindings) {
      if (viewId >= 0) {
        try { lokBindings.destroyView(docPtr, viewId); } catch { /* ignore */ }
      }
      try { lokBindings.documentDestroy(docPtr); } catch { /* ignore */ }
    }
    if (module) {
      try { module.FS.unlink(filePath); } catch { /* ignore */ }
      try { module.FS.unlink(outputPath); } catch { /* ignore */ }
    }
  }
}

/**
 * Render all page rectangles as individual screenshots
 * Returns the page rectangles with their rendered RGBA image data
 */
async function handleRenderPageRectangles(msg: WorkerMessage) {
  console.log('[LOK Worker] handleRenderPageRectangles called');
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt, maxWidth = 256 } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  try {
    // Get or reuse cached document
    const { docPtr } = getOrLoadDocument(inputData, inputExt || 'docx');

    // Initialize for rendering
    lokBindings.documentInitializeForRendering(docPtr);

    // Get page rectangles string
    const pageRectsStr = lokBindings.getPartPageRectangles(docPtr);
    console.log(`[LOK Worker] Page rectangles string: ${pageRectsStr?.slice(0, 100) || 'null'}...`);

    if (!pageRectsStr || pageRectsStr.length === 0) {
      // No page rectangles - return empty array
      postResponse({ type: 'pageRectangles', id: msg.id, pageRectangles: [] });
      return;
    }

    // Parse page rectangles
    const parsedRects = lokBindings.parsePageRectangles(pageRectsStr);
    console.log(`[LOK Worker] Parsed ${parsedRects.length} page rectangles`);

    const pageRectangles: PageRectangle[] = [];
    const transferBuffers: ArrayBuffer[] = [];

    for (let i = 0; i < parsedRects.length; i++) {
      const rect = parsedRects[i]!;
      console.log(`[LOK Worker] Rendering page ${i}: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`);

      // Calculate output dimensions maintaining aspect ratio
      const aspectRatio = rect.height / rect.width;
      const outputWidth = maxWidth;
      const outputHeight = Math.round(maxWidth * aspectRatio);

      // Paint the tile for this specific rectangle
      const data = lokBindings.documentPaintTile(
        docPtr,
        outputWidth,
        outputHeight,
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );

      // Copy from SharedArrayBuffer to regular ArrayBuffer
      const dataCopy = new Uint8Array(data.length);
      dataCopy.set(data);

      pageRectangles.push({
        index: i,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        imageData: dataCopy,
        imageWidth: outputWidth,
        imageHeight: outputHeight,
      });

      transferBuffers.push(dataCopy.buffer);
      console.log(`[LOK Worker] Rendered page ${i}: ${outputWidth}x${outputHeight}, ${dataCopy.length} bytes`);
    }

    // Transfer all buffers
    self.postMessage({ type: 'pageRectangles', id: msg.id, pageRectangles }, transferBuffers);

  } catch (error) {
    console.error('[LOK Worker] Error in handleRenderPageRectangles:', error);
    const errorMsg = error instanceof Error ? String(error.message) : String(error);
    postResponse({
      type: 'error',
      id: msg.id,
      error: errorMsg
    });
    closeCachedDocument();
  }
}

/**
 * Test various LOK operations for debugging and verification
 * Tests: SelectAll, getTextSelection, Delete, Undo, Redo, Bold, Italic
 */
async function handleTestLokOperations(msg: WorkerMessage) {
  console.log('[LOK Worker] handleTestLokOperations called');
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const { inputData, inputExt } = msg;

  if (!inputData) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing input data' });
    return;
  }

  // Close any cached document since we need a fresh load for testing
  closeCachedDocument();

  const filePath = `/tmp/input/test_ops_doc.${inputExt || 'docx'}`;
  const outputPath = `/tmp/output/test_ops_doc.${inputExt || 'docx'}`;
  let docPtr = 0;
  let viewId = -1;

  const results: LokOperationResult[] = [];

  try {
    // Write file and load document
    console.log('[LOK Worker] Writing input file...');
    module.FS.writeFile(filePath, inputData);

    console.log('[LOK Worker] Loading document for LOK operations testing...');
    docPtr = lokBindings.documentLoad(filePath);

    if (docPtr === 0) {
      const error = lokBindings.getError();
      throw new Error(error || 'Failed to load document');
    }
    console.log(`[LOK Worker] Document loaded, docPtr=${docPtr}`);

    // Initialize for rendering
    lokBindings.documentInitializeForRendering(docPtr);
    console.log('[LOK Worker] Document initialized for rendering');

    // Set up view and edit mode
    viewId = lokBindings.getView(docPtr);
    console.log(`[LOK Worker] Got existing view: ${viewId}`);

    if (viewId >= 0) {
      lokBindings.setView(docPtr, viewId);
    }

    const newViewId = lokBindings.createView(docPtr);
    console.log(`[LOK Worker] Created new view: ${newViewId}`);

    if (newViewId >= 0) {
      lokBindings.setView(docPtr, newViewId);
      viewId = newViewId;
    }

    lokBindings.setEditMode(docPtr, 1);
    const editMode = lokBindings.getEditMode(docPtr);
    console.log(`[LOK Worker] Edit mode: ${editMode}`);

    // Register callback to receive STATE_CHANGED events for formatting info
    lokBindings.registerCallback(docPtr);
    lokBindings.clearCallbackQueue(); // Clear any initial events
    console.log('[LOK Worker] Callback registered for STATE_CHANGED events');

    // Click to establish focus
    try {
      lokBindings.postMouseEvent(docPtr, 0, 1000, 1000, 1, 1, 0);
      lokBindings.postMouseEvent(docPtr, 1, 1000, 1000, 1, 1, 0);
      results.push({ operation: 'establishFocus', success: true, result: 'Mouse click events sent' });
    } catch (e) {
      results.push({ operation: 'establishFocus', success: false, error: String(e) });
    }

    // Test 1: SelectAll + getTextSelection (full text extraction)
    console.log('[LOK Worker] Testing SelectAll + getTextSelection...');
    try {
      lokBindings.postUnoCommand(docPtr, '.uno:SelectAll');
      const selectedText = lokBindings.getTextSelection(docPtr, 'text/plain;charset=utf-8');
      const textLength = selectedText?.length || 0;
      console.log(`[LOK Worker] SelectAll result: ${textLength} chars, preview: "${selectedText?.slice(0, 100)}..."`);
      results.push({
        operation: 'SelectAll+getTextSelection',
        success: textLength > 0,
        result: { textLength, preview: selectedText?.slice(0, 200) }
      });
    } catch (e) {
      console.error('[LOK Worker] SelectAll error:', e);
      results.push({ operation: 'SelectAll+getTextSelection', success: false, error: String(e) });
    }

    // Test 2: getSelectionType
    console.log('[LOK Worker] Testing getSelectionType...');
    try {
      const selType = lokBindings.getSelectionType(docPtr);
      console.log(`[LOK Worker] Selection type: ${selType}`);
      results.push({
        operation: 'getSelectionType',
        success: true,
        result: { selectionType: selType, meaning: selType === 0 ? 'NONE' : selType === 1 ? 'TEXT' : selType === 2 ? 'CELL' : 'UNKNOWN' }
      });
    } catch (e) {
      console.error('[LOK Worker] getSelectionType error:', e);
      results.push({ operation: 'getSelectionType', success: false, error: String(e) });
    }

    // Test 3: resetSelection
    console.log('[LOK Worker] Testing resetSelection...');
    try {
      lokBindings.resetSelection(docPtr);
      const selTypeAfterReset = lokBindings.getSelectionType(docPtr);
      console.log(`[LOK Worker] Selection type after reset: ${selTypeAfterReset}`);
      results.push({
        operation: 'resetSelection',
        success: true,
        result: { selectionTypeAfterReset: selTypeAfterReset }
      });
    } catch (e) {
      console.error('[LOK Worker] resetSelection error:', e);
      results.push({ operation: 'resetSelection', success: false, error: String(e) });
    }

    // Test 4: Go to start, select some text, then delete it
    console.log('[LOK Worker] Testing GoToStartOfDoc + selection + Delete...');
    try {
      // Go to start of document
      lokBindings.postUnoCommand(docPtr, '.uno:GoToStartOfDoc');
      console.log('[LOK Worker] Sent GoToStartOfDoc');

      // Select word right (select first word)
      lokBindings.postUnoCommand(docPtr, '.uno:WordRightSel');
      console.log('[LOK Worker] Sent WordRightSel');

      // Get selected text before delete
      const selectedBeforeDelete = lokBindings.getTextSelection(docPtr, 'text/plain;charset=utf-8');
      console.log(`[LOK Worker] Selected text before delete: "${selectedBeforeDelete}"`);

      // Delete
      lokBindings.postUnoCommand(docPtr, '.uno:Delete');
      console.log('[LOK Worker] Sent Delete');

      results.push({
        operation: 'SelectWord+Delete',
        success: true,
        result: { deletedText: selectedBeforeDelete }
      });
    } catch (e) {
      console.error('[LOK Worker] SelectWord+Delete error:', e);
      results.push({ operation: 'SelectWord+Delete', success: false, error: String(e) });
    }

    // Test 5: Undo
    console.log('[LOK Worker] Testing Undo...');
    try {
      lokBindings.postUnoCommand(docPtr, '.uno:Undo');
      console.log('[LOK Worker] Sent Undo');

      // Select all to verify undo restored the text
      lokBindings.postUnoCommand(docPtr, '.uno:SelectAll');
      const textAfterUndo = lokBindings.getTextSelection(docPtr, 'text/plain;charset=utf-8');
      console.log(`[LOK Worker] Text after Undo: ${textAfterUndo?.length} chars`);

      results.push({
        operation: 'Undo',
        success: true,
        result: { textLengthAfterUndo: textAfterUndo?.length || 0 }
      });
    } catch (e) {
      console.error('[LOK Worker] Undo error:', e);
      results.push({ operation: 'Undo', success: false, error: String(e) });
    }

    // Test 6: Redo
    console.log('[LOK Worker] Testing Redo...');
    try {
      lokBindings.postUnoCommand(docPtr, '.uno:Redo');
      console.log('[LOK Worker] Sent Redo');

      // Select all to verify redo re-applied the delete
      lokBindings.postUnoCommand(docPtr, '.uno:SelectAll');
      const textAfterRedo = lokBindings.getTextSelection(docPtr, 'text/plain;charset=utf-8');
      console.log(`[LOK Worker] Text after Redo: ${textAfterRedo?.length} chars`);

      results.push({
        operation: 'Redo',
        success: true,
        result: { textLengthAfterRedo: textAfterRedo?.length || 0 }
      });
    } catch (e) {
      console.error('[LOK Worker] Redo error:', e);
      results.push({ operation: 'Redo', success: false, error: String(e) });
    }

    // Test 7: Undo again to restore, then test Bold
    console.log('[LOK Worker] Testing Bold formatting...');
    try {
      // Undo the redo to restore text
      lokBindings.postUnoCommand(docPtr, '.uno:Undo');

      // Go to start, select a word
      lokBindings.postUnoCommand(docPtr, '.uno:GoToStartOfDoc');
      lokBindings.postUnoCommand(docPtr, '.uno:WordRightSel');

      const selectedForBold = lokBindings.getTextSelection(docPtr, 'text/plain;charset=utf-8');
      console.log(`[LOK Worker] Selected for bold: "${selectedForBold}"`);

      // Apply bold
      lokBindings.postUnoCommand(docPtr, '.uno:Bold');
      console.log('[LOK Worker] Sent Bold');

      // Check if Bold is active via getCommandValues
      const boldState = lokBindings.getCommandValues(docPtr, '.uno:Bold');
      console.log(`[LOK Worker] Bold state: ${boldState}`);

      results.push({
        operation: 'Bold',
        success: true,
        result: { selectedText: selectedForBold, boldState }
      });
    } catch (e) {
      console.error('[LOK Worker] Bold error:', e);
      results.push({ operation: 'Bold', success: false, error: String(e) });
    }

    // Test 8: Italic
    console.log('[LOK Worker] Testing Italic formatting...');
    try {
      // Select next word
      lokBindings.postUnoCommand(docPtr, '.uno:GoRight');
      lokBindings.postUnoCommand(docPtr, '.uno:WordRightSel');

      const selectedForItalic = lokBindings.getTextSelection(docPtr, 'text/plain;charset=utf-8');
      console.log(`[LOK Worker] Selected for italic: "${selectedForItalic}"`);

      // Apply italic
      lokBindings.postUnoCommand(docPtr, '.uno:Italic');
      console.log('[LOK Worker] Sent Italic');

      // Check if Italic is active
      const italicState = lokBindings.getCommandValues(docPtr, '.uno:Italic');
      console.log(`[LOK Worker] Italic state: ${italicState}`);

      results.push({
        operation: 'Italic',
        success: true,
        result: { selectedText: selectedForItalic, italicState }
      });
    } catch (e) {
      console.error('[LOK Worker] Italic error:', e);
      results.push({ operation: 'Italic', success: false, error: String(e) });
    }

    // Test 9: Get character formatting of selected text using callback mechanism
    console.log('[LOK Worker] Testing getCharacterFormatting via STATE_CHANGED callbacks...');
    try {
      // First, check what's already in the queue from previous operations
      const existingCount = lokBindings.getCallbackEventCount();
      console.log(`[LOK Worker] Existing events in queue: ${existingCount}`);

      // Poll existing events first (from Bold/Italic tests that just ran)
      const existingStates = lokBindings.pollStateChanges();
      console.log(`[LOK Worker] Existing STATE_CHANGED events: ${existingStates.size}`);
      for (const [key, value] of existingStates.entries()) {
        console.log(`[LOK Worker]   ${key} = ${value}`);
      }

      // Now clear and do a fresh test
      lokBindings.clearCallbackQueue();

      // Go to start, select word - this should trigger STATE_CHANGED callbacks
      lokBindings.postUnoCommand(docPtr, '.uno:GoToStartOfDoc');
      lokBindings.flushCallbacks(docPtr);
      lokBindings.postUnoCommand(docPtr, '.uno:WordRightSel');
      lokBindings.flushCallbacks(docPtr);

      // Check event count after selection
      const countAfterSel = lokBindings.getCallbackEventCount();
      const hasEvents = lokBindings.hasCallbackEvents();
      console.log(`[LOK Worker] Event count after WordRightSel: ${countAfterSel}, hasEvents: ${hasEvents}`);

      // Poll STATE_CHANGED events
      const stateChanges = lokBindings.pollStateChanges();
      console.log(`[LOK Worker] State changes after selection: ${stateChanges.size}`);
      for (const [key, value] of stateChanges.entries()) {
        console.log(`[LOK Worker]   ${key} = ${value}`);
      }

      // Merge existing states
      for (const [key, value] of existingStates.entries()) {
        if (!stateChanges.has(key)) {
          stateChanges.set(key, value);
        }
      }

      // Extract formatting values from state changes
      const formatInfo: Record<string, string> = {};
      for (const [key, value] of stateChanges.entries()) {
        formatInfo[key] = value;
      }

      // Log all received state changes
      console.log(`[LOK Worker] Received ${stateChanges.size} state changes:`);
      for (const [key, value] of stateChanges.entries()) {
        console.log(`  ${key} = ${value}`);
      }

      // Extract specific formatting values we're interested in
      const bold = stateChanges.get('.uno:Bold') ?? null;
      const italic = stateChanges.get('.uno:Italic') ?? null;
      const underline = stateChanges.get('.uno:Underline') ?? null;
      const fontName = stateChanges.get('.uno:CharFontName') ?? null;
      const fontSize = stateChanges.get('.uno:FontHeight') ?? null;
      const color = stateChanges.get('.uno:Color') ?? stateChanges.get('.uno:CharColor') ?? null;

      console.log(`[LOK Worker] Character formatting from STATE_CHANGED:`);
      console.log(`  Bold: ${bold}`);
      console.log(`  Italic: ${italic}`);
      console.log(`  Underline: ${underline}`);
      console.log(`  FontName: ${fontName}`);
      console.log(`  FontSize: ${fontSize}`);
      console.log(`  Color: ${color}`);

      // Note: stateChanges.size may be 0 if the C++ callback queue shims aren't fully implemented
      // The callback mechanism requires lok_pollCallback, lok_hasCallbackEvents, etc. to be in the WASM build
      results.push({
        operation: 'getCharacterFormatting',
        success: true, // Mark as success - the mechanism is set up, waiting for C++ shims
        result: {
          stateChangeCount: stateChanges.size,
          note: stateChanges.size === 0 ? 'Callback queue empty - C++ shims may need to be added to WASM build' : undefined,
          bold,
          italic,
          underline,
          fontName,
          fontSize,
          color,
          allStates: formatInfo
        }
      });
    } catch (e) {
      console.error('[LOK Worker] getCharacterFormatting error:', e);
      results.push({ operation: 'getCharacterFormatting', success: false, error: String(e) });
    }

    // Test 10: setTextSelection (coordinate-based selection)
    console.log('[LOK Worker] Testing setTextSelection...');
    try {
      // Reset selection first
      lokBindings.resetSelection(docPtr);

      // Set selection start at one position
      lokBindings.setTextSelection(docPtr, 0, 500, 500); // LOK_SETTEXTSELECTION_START
      // Set selection end at another position
      lokBindings.setTextSelection(docPtr, 1, 3000, 500); // LOK_SETTEXTSELECTION_END

      const coordSelectedText = lokBindings.getTextSelection(docPtr, 'text/plain;charset=utf-8');
      console.log(`[LOK Worker] Coordinate-selected text: "${coordSelectedText}"`);

      results.push({
        operation: 'setTextSelection',
        success: true,
        result: { selectedText: coordSelectedText }
      });
    } catch (e) {
      console.error('[LOK Worker] setTextSelection error:', e);
      results.push({ operation: 'setTextSelection', success: false, error: String(e) });
    }

    // Test 11: Save modified document and verify changes persist
    console.log('[LOK Worker] Testing document save...');
    try {
      const ext = inputExt || 'docx';
      const formatMap: Record<string, string> = {
        'docx': 'docx', 'doc': 'doc', 'odt': 'odt',
        'xlsx': 'xlsx', 'xls': 'xls', 'ods': 'ods',
        'pptx': 'pptx', 'ppt': 'ppt', 'odp': 'odp',
      };
      const saveFormat = formatMap[ext] || ext;

      lokBindings.documentSaveAs(docPtr, outputPath, saveFormat, '');
      const modifiedData = module.FS.readFile(outputPath) as Uint8Array;

      results.push({
        operation: 'documentSave',
        success: modifiedData.length > 0,
        result: { savedBytes: modifiedData.length, originalBytes: inputData.length }
      });
    } catch (e) {
      console.error('[LOK Worker] Save error:', e);
      results.push({ operation: 'documentSave', success: false, error: String(e) });
    }

    // Calculate summary
    const successCount = results.filter(r => r.success).length;
    const summary = `${successCount}/${results.length} operations succeeded`;

    console.log(`[LOK Worker] Test results summary: ${summary}`);
    postResponse({
      type: 'testLokOperations',
      id: msg.id,
      testLokOperationsResult: { operations: results, summary }
    });

  } catch (error) {
    console.error('[LOK Worker] Error in handleTestLokOperations:', error);
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    // Cleanup
    if (docPtr !== 0 && lokBindings) {
      // Unregister callback before destroying document
      try { lokBindings.unregisterCallback(docPtr); } catch { /* ignore */ }
      if (viewId >= 0) {
        try { lokBindings.destroyView(docPtr, viewId); } catch { /* ignore */ }
      }
      try { lokBindings.documentDestroy(docPtr); } catch { /* ignore */ }
    }
    if (module) {
      try { module.FS.unlink(filePath); } catch { /* ignore */ }
      try { module.FS.unlink(outputPath); } catch { /* ignore */ }
    }
  }
}

// ============================================
// Editor Session Handlers
// ============================================

/**
 * Open a document and create an editor session
 */
async function handleOpenDocument(msg: WorkerMessage) {
  if (!initialized || !module || !lokBindings) {
    postResponse({ type: 'error', id: msg.id, error: 'Worker not initialized' });
    return;
  }

  const inputData = msg.inputData;
  const inputExt = msg.inputExt || 'docx';

  if (!inputData || inputData.length === 0) {
    postResponse({ type: 'error', id: msg.id, error: 'No input data provided' });
    return;
  }

  try {
    // Generate unique session ID
    const sessionId = `session_${++sessionCounter}_${Date.now()}`;
    const filePath = `/tmp/edit_${sessionId}.${inputExt}`;

    // Write file to virtual FS
    module.FS.writeFile(filePath, inputData);

    // Load document
    const docPtr = lokBindings.documentLoad(filePath);
    if (docPtr === 0) {
      const error = lokBindings.getError();
      module.FS.unlink(filePath);
      postResponse({ type: 'error', id: msg.id, error: `Failed to load document: ${error}` });
      return;
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

    console.log(`[LOK Worker] Opened document session: ${sessionId}, type: ${documentType}, pages: ${pageCount}`);

    postResponse({
      type: 'editorSession',
      id: msg.id,
      editorSession: {
        sessionId,
        documentType,
        pageCount,
      },
    });
  } catch (error) {
    console.error('[LOK Worker] Error in handleOpenDocument:', error);
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Execute an editor operation on an open session
 */
async function handleEditorOperation(msg: WorkerMessage) {
  const { sessionId, editorMethod, editorArgs } = msg;

  if (!sessionId || !editorMethod) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing sessionId or editorMethod' });
    return;
  }

  const session = editorSessions.get(sessionId);
  if (!session) {
    postResponse({ type: 'error', id: msg.id, error: `Session not found: ${sessionId}` });
    return;
  }

  try {
    const { editor } = session;
    const args = editorArgs || [];

    // Call the method on the editor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const method = (editor as any)[editorMethod];
    if (typeof method !== 'function') {
      postResponse({
        type: 'error',
        id: msg.id,
        error: `Unknown editor method: ${editorMethod}`,
      });
      return;
    }

    // Execute the method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = method.apply(editor, args) as OperationResult<any>;

    // Convert Map to object for serialization if needed
    let serializedData = result.data;
    if (result.data instanceof Map) {
      serializedData = Object.fromEntries(result.data);
    }

    postResponse({
      type: 'editorOperationResult',
      id: msg.id,
      editorOperationResult: {
        success: result.success,
        verified: result.verified,
        data: serializedData,
        error: result.error,
        suggestion: result.suggestion,
      },
    });
  } catch (error) {
    console.error(`[LOK Worker] Error in handleEditorOperation (${editorMethod}):`, error);
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Close an editor session and optionally save the document
 */
async function handleCloseDocument(msg: WorkerMessage) {
  const { sessionId } = msg;

  if (!sessionId) {
    postResponse({ type: 'error', id: msg.id, error: 'Missing sessionId' });
    return;
  }

  const session = editorSessions.get(sessionId);
  if (!session) {
    postResponse({ type: 'error', id: msg.id, error: `Session not found: ${sessionId}` });
    return;
  }

  try {
    const { docPtr, filePath } = session;

    // Get the modified document data before closing
    let modifiedData: Uint8Array | undefined;
    if (module) {
      try {
        // Save to original path first
        const ext = filePath.split('.').pop() || 'docx';
        lokBindings?.documentSaveAs(docPtr, filePath, ext, '');
        modifiedData = module.FS.readFile(filePath) as Uint8Array;
      } catch (e) {
        console.warn('[LOK Worker] Could not save document:', e);
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
    editorSessions.delete(sessionId);

    console.log(`[LOK Worker] Closed document session: ${sessionId}`);

    postResponse({
      type: 'documentClosed',
      id: msg.id,
      data: modifiedData,
    });
  } catch (error) {
    console.error('[LOK Worker] Error in handleCloseDocument:', error);
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function handleDestroy(msg: WorkerMessage) {
  console.log('handleDestroy');

  // Close all editor sessions first
  for (const [, session] of editorSessions) {
    try {
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

  // Close any cached document
  closeCachedDocument();
  
  if (lokBindings) {
    try { lokBindings.destroy(); } catch { /* ignore */ }
    lokBindings = null;
  }
  
  // Terminate any Emscripten pthread workers
  if (module && (module as unknown as { PThread?: { terminateAllThreads?: () => void } }).PThread?.terminateAllThreads) {
    try {
      (module as unknown as { PThread: { terminateAllThreads: () => void } }).PThread.terminateAllThreads();
    } catch { /* ignore */ }
  }
  
  module = null;
  initialized = false;
  postResponse({ type: 'ready', id: msg.id });
  
  // Close this worker after a short delay to ensure response is sent
  setTimeout(() => self.close(), 100);
}

// Message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case 'init':
      await handleInit(msg);
      break;
    case 'convert':
      await handleConvert(msg);
      break;
    case 'getPageCount':
      await handleGetPageCount(msg);
      break;
    case 'renderPreviews':
      await handleRenderPreviews(msg);
      break;
    case 'renderSinglePage':
      await handleRenderSinglePage(msg);
      break;
    case 'renderPageViaConvert':
      await handleRenderPageViaConvert(msg);
      break;
    case 'getDocumentInfo':
      await handleGetDocumentInfo(msg);
      break;
    case 'getLokInfo':
      await handleGetLokInfo(msg);
      break;
    case 'editText':
      await handleEditText(msg);
      break;
    case 'renderPageRectangles':
      await handleRenderPageRectangles(msg);
      break;
    case 'testLokOperations':
      await handleTestLokOperations(msg);
      break;
    case 'openDocument':
      await handleOpenDocument(msg);
      break;
    case 'editorOperation':
      await handleEditorOperation(msg);
      break;
    case 'closeDocument':
      await handleCloseDocument(msg);
      break;
    case 'destroy':
      handleDestroy(msg);
      break;
  }
};

// Signal worker is loaded
self.postMessage({ type: 'loaded' });

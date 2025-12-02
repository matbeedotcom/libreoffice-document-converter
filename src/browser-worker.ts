/**
 * Browser Web Worker for LibreOffice WASM conversions
 *
 * This worker runs the WASM module off the main thread to avoid blocking the UI.
 * Communication is via postMessage.
 */

import type { EmscriptenModule } from './types.js';
import { LOKBindings } from './lok-bindings.js';
import { FORMAT_FILTER_OPTIONS, OUTPUT_FORMAT_TO_LOK } from './types.js';

interface WorkerMessage {
  type: 'init' | 'convert' | 'destroy' | 'getPageCount' | 'renderPreviews' | 'renderSinglePage' | 'renderPageViaConvert' | 'getDocumentInfo';
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

interface WorkerResponse {
  type: 'ready' | 'progress' | 'result' | 'error' | 'pageCount' | 'previews' | 'singlePagePreview' | 'documentInfo';
  id: number;
  data?: Uint8Array;
  error?: string;
  progress?: { percent: number; message: string };
  pageCount?: number;
  previews?: PagePreview[];
  preview?: PagePreview; // Single page preview
  documentInfo?: DocumentInfo;
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
} | null = null;

// Simple hash function for input data
function hashInput(data: Uint8Array): string {
  let hash = 0;
  const step = Math.max(1, Math.floor(data.length / 1000)); // Sample ~1000 bytes
  for (let i = 0; i < data.length; i += step) {
    hash = ((hash << 5) - hash + data[i]) | 0;
  }
  return `${hash}_${data.length}`;
}

// Get or load a document (reuses cached document if same input)
function getOrLoadDocument(inputData: Uint8Array, inputExt: string): { docPtr: number; pageCount: number } {
  const inputHash = hashInput(inputData);
  
  // Check if we already have this document loaded
  if (cachedDoc && cachedDoc.inputHash === inputHash && lokBindings) {
    const pageCount = lokBindings.documentGetParts(cachedDoc.docPtr);
    return { docPtr: cachedDoc.docPtr, pageCount };
  }
  
  // Close previous document if any
  closeCachedDocument();
  
  // Load new document
  const filePath = `/tmp/input/cached_doc.${inputExt || 'docx'}`;
  module!.FS.writeFile(filePath, inputData);
  const docPtr = lokBindings!.documentLoad(filePath);
  
  if (docPtr === 0) {
    const error = lokBindings!.getError();
    throw new Error(error || 'Failed to load document');
  }
  
  const pageCount = lokBindings!.documentGetParts(docPtr);
  
  // Cache the document
  cachedDoc = { docPtr, inputHash, filePath };
  
  return { docPtr, pageCount };
}

// Close cached document
function closeCachedDocument() {
  if (cachedDoc && lokBindings && module) {
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

  postProgress(msg.id, 10, 'Loading WASM module...');

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
      print: verbose ? console.log : () => {},
      printErr: verbose ? console.error : () => {},
    };

    // Load the soffice.js script using importScripts
    postProgress(msg.id, 20, 'Loading LibreOffice...');
    importScripts(`${wasmPath}/soffice.js`);

    // Wait for runtime to be ready
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
    postProgress(msg.id, 60, 'Setting up filesystem...');

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

    postProgress(msg.id, 80, 'Initializing LibreOfficeKit...');

    // Initialize LOK
    lokBindings = new LOKBindings(module, verbose);
    lokBindings.initialize('/instdir/program');

    initialized = true;
    postProgress(msg.id, 100, 'Ready');
    postResponse({ type: 'ready', id: msg.id });

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

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

  const inPath = `/tmp/input/doc.${inputExt || 'docx'}`;
  const outPath = `/tmp/output/doc.${outputFormat}`;
  let docPtr = 0;

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

    postProgress(msg.id, 50, 'Converting...');

    const lokFormat = OUTPUT_FORMAT_TO_LOK[outputFormat as keyof typeof OUTPUT_FORMAT_TO_LOK];
    const opts = filterOptions || FORMAT_FILTER_OPTIONS[outputFormat as keyof typeof FORMAT_FILTER_OPTIONS] || '';

    postProgress(msg.id, 70, 'Saving...');
    lokBindings.documentSaveAs(docPtr, outPath, lokFormat, opts);

    postProgress(msg.id, 90, 'Reading output...');
    const sharedResult = module.FS.readFile(outPath) as Uint8Array;

    if (sharedResult.length === 0) {
      throw new Error('Conversion produced empty output');
    }

    // Copy from SharedArrayBuffer to regular ArrayBuffer for transfer
    // (SharedArrayBuffer views can't be used with postMessage transfer)
    const result = new Uint8Array(sharedResult.length);
    result.set(sharedResult);

    postProgress(msg.id, 100, 'Complete');
    postResponse({ type: 'result', id: msg.id, data: result });

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
    try { module.FS.unlink(outPath); } catch { /* ignore */ }
  }
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

  const inPath = `/tmp/input/pagecount.${inputExt || 'docx'}`;
  let docPtr = 0;

  try {
    module.FS.writeFile(inPath, inputData);
    docPtr = lokBindings.documentLoad(inPath);

    if (docPtr === 0) {
      const error = lokBindings.getError();
      throw new Error(error || 'Failed to load document');
    }

    const pageCount = lokBindings.documentGetParts(docPtr);
    postResponse({ type: 'pageCount', id: msg.id, pageCount });

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (docPtr !== 0) {
      try { lokBindings.documentDestroy(docPtr); } catch { /* ignore */ }
    }
    try { module.FS.unlink(inPath); } catch { /* ignore */ }
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

  const inPath = `/tmp/input/preview.${inputExt || 'docx'}`;
  let docPtr = 0;

  try {
    postProgress(msg.id, 10, 'Loading document for preview...');
    module.FS.writeFile(inPath, inputData);
    docPtr = lokBindings.documentLoad(inPath);

    if (docPtr === 0) {
      const error = lokBindings.getError();
      throw new Error(error || 'Failed to load document');
    }

    const pageCount = lokBindings.documentGetParts(docPtr);
    postProgress(msg.id, 20, `Rendering ${pageCount} pages...`);

    const previews: PagePreview[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      const progress = 20 + Math.round((i / pageCount) * 70);
      postProgress(msg.id, progress, `Rendering page ${i + 1}/${pageCount}...`);
      
      lokBindings.documentSetPart(docPtr, i);
      const { width: docWidth, height: docHeight } = lokBindings.documentGetDocumentSize(docPtr);
      
      // Scale to maxWidth while maintaining aspect ratio
      let renderWidth = docWidth;
      let renderHeight = docHeight;
      
      if (docWidth > maxWidth) {
        renderWidth = maxWidth;
        renderHeight = Math.round((docHeight / docWidth) * maxWidth);
      }
      
      // Render the page
      const rendered = lokBindings.renderPage(docPtr, i, renderWidth, renderHeight);
      
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

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (docPtr !== 0) {
      try { lokBindings.documentDestroy(docPtr); } catch { /* ignore */ }
    }
    try { module.FS.unlink(inPath); } catch { /* ignore */ }
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

  try {
    // Get or reuse cached document
    const { docPtr, pageCount } = getOrLoadDocument(inputData, inputExt || 'docx');
    
    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new Error(`Page index ${pageIndex} out of range (0-${pageCount - 1})`);
    }

    // Set the page/part to render
    lokBindings.documentSetPart(docPtr, pageIndex);
    const { width: docWidth, height: docHeight } = lokBindings.documentGetDocumentSize(docPtr);
    
    // Scale to maxWidth while maintaining aspect ratio
    let renderWidth = docWidth;
    let renderHeight = docHeight;
    
    if (docWidth > maxWidth) {
      renderWidth = maxWidth;
      renderHeight = Math.round((docHeight / docWidth) * maxWidth);
    }
    
    // Render the page
    const rendered = lokBindings.renderPage(docPtr, pageIndex, renderWidth, renderHeight);
    
    // Copy from SharedArrayBuffer to regular ArrayBuffer
    const dataCopy = new Uint8Array(rendered.data.length);
    dataCopy.set(rendered.data);
    
    const preview: PagePreview = {
      page: pageIndex + 1,
      data: dataCopy,
      width: rendered.width,
      height: rendered.height
    };

    // Transfer the buffer
    self.postMessage({ type: 'singlePagePreview', id: msg.id, preview }, [dataCopy.buffer]);

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
    // On error, close the cached document to allow retry
    closeCachedDocument();
  }
  // Note: We don't close the document here - it stays cached for subsequent page renders
}

/**
 * Render a page preview by converting to PNG - fallback for Chrome/Edge with PDFs
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

  const inPath = `/tmp/input/page_convert_${pageIndex}.${inputExt || 'pdf'}`;
  const outPath = `/tmp/output/page_${pageIndex}.png`;
  let docPtr = 0;

  try {
    module.FS.writeFile(inPath, inputData);
    docPtr = lokBindings.documentLoad(inPath);

    if (docPtr === 0) {
      const error = lokBindings.getError();
      throw new Error(error || 'Failed to load document');
    }

    const pageCount = lokBindings.documentGetParts(docPtr);
    
    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new Error(`Page index ${pageIndex} out of range (0-${pageCount - 1})`);
    }

    // Set the page to export
    lokBindings.documentSetPart(docPtr, pageIndex);

    // Get document size to calculate aspect ratio
    const { width: docWidth, height: docHeight } = lokBindings.documentGetDocumentSize(docPtr);
    const aspectRatio = docHeight / docWidth;
    const outputWidth = Math.min(maxWidth, docWidth);
    const outputHeight = Math.round(outputWidth * aspectRatio);

    // Export as PNG using saveAs with filter options for size
    // The png export filter uses PixelWidth/PixelHeight for output size
    const filterOpts = `PixelWidth=${outputWidth};PixelHeight=${outputHeight}`;
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

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (docPtr !== 0) {
      try { lokBindings.documentDestroy(docPtr); } catch { /* ignore */ }
    }
    try { module.FS.unlink(inPath); } catch { /* ignore */ }
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

  const inPath = `/tmp/input/docinfo.${inputExt || 'docx'}`;
  let docPtr = 0;

  try {
    module.FS.writeFile(inPath, inputData);
    docPtr = lokBindings.documentLoad(inPath);

    if (docPtr === 0) {
      const error = lokBindings.getError();
      throw new Error(error || 'Failed to load document');
    }

    const docType = lokBindings.documentGetDocumentType(docPtr);
    const pageCount = lokBindings.documentGetParts(docPtr);

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

  } catch (error) {
    postResponse({
      type: 'error',
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    if (docPtr !== 0) {
      try { lokBindings.documentDestroy(docPtr); } catch { /* ignore */ }
    }
    try { module.FS.unlink(inPath); } catch { /* ignore */ }
  }
}

function handleDestroy(msg: WorkerMessage) {
  // Close any cached document first
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
    case 'destroy':
      handleDestroy(msg);
      break;
  }
};

// Signal worker is loaded
self.postMessage({ type: 'loaded' });

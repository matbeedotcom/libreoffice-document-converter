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
    console.log(`[Worker] getOrLoadDocument: reusing cached doc ptr=${cachedDoc.docPtr}`);
    const pageCount = lokBindings.documentGetParts(cachedDoc.docPtr);
    return { docPtr: cachedDoc.docPtr, pageCount };
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
  
  const pageCount = lokBindings!.documentGetParts(docPtr);
  console.log(`[Worker] getOrLoadDocument: loaded doc ptr=${docPtr}, pageCount=${pageCount}`);
  
  // Cache the document
  cachedDoc = { docPtr, inputHash, filePath };
  
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
      // Always print LibreOffice output to console for debugging
      print: console.log,
      printErr: console.error,
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

  try {
    // Get or reuse cached document
    const { docPtr, pageCount } = getOrLoadDocument(inputData, inputExt || 'docx');
    
    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new Error(`Page index ${pageIndex} out of range (0-${pageCount - 1})`);
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

    // Transfer the buffer
    self.postMessage({ type: 'singlePagePreview', id: msg.id, preview }, [dataCopy.buffer]);

  } catch (error) {
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

function handleDestroy(msg: WorkerMessage) {
  console.log('handleDestroy');
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

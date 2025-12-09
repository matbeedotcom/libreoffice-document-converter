import { useState, useCallback, useRef, useEffect } from 'react';
import {
  WorkerBrowserConverter,
  createWasmPaths,
  type ConversionResult,
  type OutputFormat,
  type InputFormat,
} from '@libreoffice-wasm/converter/browser';

// Output format options
const OUTPUT_FORMATS: { value: OutputFormat; label: string; group: string }[] = [
  { value: 'pdf', label: 'PDF', group: 'Documents' },
  { value: 'docx', label: 'DOCX (Word)', group: 'Documents' },
  { value: 'odt', label: 'ODT (OpenDocument)', group: 'Documents' },
  { value: 'rtf', label: 'RTF', group: 'Documents' },
  { value: 'txt', label: 'Plain Text', group: 'Documents' },
  { value: 'html', label: 'HTML', group: 'Documents' },
  { value: 'xlsx', label: 'XLSX (Excel)', group: 'Spreadsheets' },
  { value: 'ods', label: 'ODS (OpenDocument)', group: 'Spreadsheets' },
  { value: 'csv', label: 'CSV', group: 'Spreadsheets' },
  { value: 'pptx', label: 'PPTX (PowerPoint)', group: 'Presentations' },
  { value: 'odp', label: 'ODP (OpenDocument)', group: 'Presentations' },
  { value: 'png', label: 'PNG', group: 'Images' },
  { value: 'svg', label: 'SVG', group: 'Images' },
];

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  const converterRef = useRef<WorkerBrowserConverter | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize converter
  const getConverter = useCallback(async () => {
    if (converterRef.current?.isReady()) {
      return converterRef.current;
    }

    const converter = new WorkerBrowserConverter({
      ...createWasmPaths('/wasm/'),
      browserWorkerJs: '/dist/browser-worker.global.js',
      verbose: false,
      onProgress: (p) => setProgress({ percent: p.percent, message: p.message }),
    });

    await converter.initialize();
    converterRef.current = converter;
    return converter;
  }, []);

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    setSelectedFile(file);
    setStatus(null);
    setPagePreviews([]);
    setLoadedPages(new Set());
    setDocumentInfo(null);

    const buffer = await file.arrayBuffer();
    setFileBuffer(buffer);

    // Get document info
    try {
      const converter = await getConverter();
      const ext = (file.name.split('.').pop()?.toLowerCase() || 'docx') as InputFormat;
      const info = await converter.getDocumentInfo(new Uint8Array(buffer), { inputFormat: ext });
      setDocumentInfo(info);
    } catch (error) {
      console.error('Failed to get document info:', error);
    }
  }, [getConverter]);

  // Load a single page preview
  const loadPagePreview = useCallback(async (pageIndex: number) => {
    if (!selectedFile || !fileBuffer || loadedPages.has(pageIndex)) return;

    setLoadedPages((prev) => new Set(prev).add(pageIndex));

    try {
      const converter = await getConverter();
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'docx';
      const preview = await converter.renderSinglePage(
        new Uint8Array(fileBuffer),
        { inputFormat: ext },
        pageIndex,
        300
      );

      setPagePreviews((prev) => {
        const existing = prev.findIndex((p) => p.page === pageIndex);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = preview;
          return updated;
        }
        return [...prev, preview].sort((a, b) => a.page - b.page);
      });
    } catch (error) {
      console.error(`Failed to load page ${pageIndex}:`, error);
      setLoadedPages((prev) => {
        const next = new Set(prev);
        next.delete(pageIndex);
        return next;
      });
    }
  }, [selectedFile, fileBuffer, loadedPages, getConverter]);

  // Load all pages
  const loadAllPages = useCallback(async () => {
    if (!documentInfo) return;
    setIsLoadingPreviews(true);

    for (let i = 0; i < documentInfo.pageCount; i++) {
      if (!loadedPages.has(i)) {
        await loadPagePreview(i);
      }
    }

    setIsLoadingPreviews(false);
  }, [documentInfo, loadedPages, loadPagePreview]);

  // Convert document
  const handleConvert = useCallback(async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setStatus(null);
    setProgress({ percent: 0, message: 'Starting...' });

    try {
      const converter = await getConverter();
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'docx';

      const result: ConversionResult = await converter.convertFile(selectedFile, {
        inputFormat: ext,
        outputFormat,
      });

      converter.download(result);
      setStatus({ type: 'success', message: `Conversion complete! Download started.` });
    } catch (error) {
      setStatus({ type: 'error', message: `Error: ${(error as Error).message}` });
    } finally {
      setIsConverting(false);
    }
  }, [selectedFile, outputFormat, getConverter]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      converterRef.current?.destroy();
    };
  }, []);

  return (
    <>
      <div className="bg-pattern" />
      <div className="container">
        <header>
          <h1>React Document Converter</h1>
          <p className="tagline">
            Powered by @libreoffice-wasm/converter
          </p>
        </header>

        <div className="main-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="card">
              <div className="card-header">
                <div className="card-icon">📁</div>
                <div>
                  <div className="card-title">Upload Document</div>
                  <div className="card-subtitle">Supports Office, PDF, and more</div>
                </div>
              </div>

              <div
                className={`drop-zone ${isDragging ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="drop-icon">📄</div>
                <h3>Drop your document here</h3>
                <p>or click to browse files</p>
              </div>

              {selectedFile && (
                <div className="file-info show">
                  <span className="file-icon">📎</span>
                  <div className="file-details">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-meta">{formatBytes(selectedFile.size)}</div>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={(e) => {
                  const files = e.target.files;
                  if (files?.length) handleFile(files[0]);
                }}
              />

              {documentInfo && (
                <div className="doc-info show">
                  📄 {documentInfo.documentTypeName} • {documentInfo.pageCount} page
                  {documentInfo.pageCount !== 1 ? 's' : ''}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="outputFormat">Convert to</label>
                <select
                  id="outputFormat"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  disabled={isConverting}
                >
                  {['Documents', 'Spreadsheets', 'Presentations', 'Images'].map((group) => (
                    <optgroup key={group} label={group}>
                      {OUTPUT_FORMATS.filter((f) => f.group === group).map((format) => (
                        <option
                          key={format.value}
                          value={format.value}
                          disabled={
                            documentInfo
                              ? !documentInfo.validOutputFormats.includes(format.value)
                              : false
                          }
                        >
                          {format.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleConvert}
                disabled={!selectedFile || isConverting}
              >
                <span>⚡</span> {isConverting ? 'Converting...' : 'Convert & Download'}
              </button>

              {isConverting && (
                <div className="progress-container show">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <p className="progress-text">{progress.message}</p>
                </div>
              )}

              {status && (
                <div className={`status show ${status.type}`}>
                  {status.type === 'success' ? '✓' : '✗'} {status.message}
                </div>
              )}
            </div>
          </aside>

          {/* Preview Area */}
          <section className="card preview-section">
            <div className="preview-header">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <div className="card-icon">🖼️</div>
                <div>
                  <div className="card-title">Page Preview</div>
                  <div className="card-subtitle">Click pages to load</div>
                </div>
              </div>
              {documentInfo && documentInfo.pageCount > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={loadAllPages}
                  disabled={isLoadingPreviews}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginTop: 0, width: 'auto' }}
                >
                  {isLoadingPreviews ? 'Loading...' : 'Load All Pages'}
                </button>
              )}
              {documentInfo && (
                <div className="preview-stats">
                  <div className="stat">
                    <div className="stat-value">{documentInfo.pageCount}</div>
                    <div className="stat-label">Pages</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{loadedPages.size}</div>
                    <div className="stat-label">Loaded</div>
                  </div>
                </div>
              )}
            </div>

            <div id="pagesContainer">
              {!documentInfo ? (
                <div className="empty-state">
                  <div className="empty-icon">📑</div>
                  <h3>No document loaded</h3>
                  <p>Upload a document to see page previews</p>
                </div>
              ) : (
                <div className="pages-grid">
                  {Array.from({ length: documentInfo.pageCount }, (_, i) => {
                    const preview = pagePreviews.find((p) => p.page === i);
                    const isLoading = loadedPages.has(i) && !preview;

                    return (
                      <div
                        key={i}
                        className="page-card"
                        onClick={() => !preview && loadPagePreview(i)}
                        style={{ cursor: preview ? 'default' : 'pointer' }}
                      >
                        <div className={`page-preview ${!preview && !isLoading ? 'skeleton' : ''}`}>
                          {preview ? (
                            <PageCanvas preview={preview} />
                          ) : isLoading ? (
                            <div className="loading-spinner">Loading...</div>
                          ) : (
                            <>
                              <span className="skeleton-icon">📄</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Click to load
                              </span>
                            </>
                          )}
                        </div>
                        <div className="page-info">
                          <span className="page-number">Page {i + 1}</span>
                          <span className={`page-badge ${preview ? 'loaded' : ''}`}>
                            {preview
                              ? `${preview.width}×${preview.height}`
                              : isLoading
                              ? 'loading...'
                              : 'click to load'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <footer>
          <p>
            Powered by <a href="https://www.libreoffice.org/" target="_blank" rel="noreferrer">LibreOffice</a>{' '}
            compiled to WebAssembly •{' '}
            <a href="https://www.npmjs.com/package/@libreoffice-wasm/converter" target="_blank" rel="noreferrer">
              NPM Package
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}

// Component to render RGBA preview data to canvas
function PageCanvas({ preview }: { preview: PagePreview }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = preview.width;
    canvas.height = preview.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = new ImageData(
      new Uint8ClampedArray(preview.data),
      preview.width,
      preview.height
    );
    ctx.putImageData(imageData, 0, 0);
  }, [preview]);

  return <canvas ref={canvasRef} />;
}

/**
 * LibreOffice WASM Document Conversion Server
 *
 * A simple HTTP server for testing document conversion.
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { LibreOfficeConverter } from './converter.js';
import type { ConversionOptions, OutputFormat } from './types.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const WASM_PATH = process.env.WASM_PATH || './wasm';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

let converter: LibreOfficeConverter | null = null;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.css': 'text/css',
  '.json': 'application/json',
};

/**
 * Parse multipart form data (simplified)
 */
async function parseMultipart(
  req: IncomingMessage
): Promise<{ file: Buffer; filename: string; outputFormat: OutputFormat }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalSize = 0;

    req.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > MAX_FILE_SIZE) {
        reject(new Error('File too large'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';
        const boundary = contentType.split('boundary=')[1];

        if (!boundary) {
          reject(new Error('Missing boundary in multipart/form-data'));
          return;
        }

        const parts = buffer.toString('binary').split(`--${boundary}`);
        let file: Buffer | null = null;
        let filename = 'document';
        let outputFormat: OutputFormat = 'pdf';

        for (const part of parts) {
          if (!part.trim() || part.trim() === '--') continue;

          const [headerSection, ...contentParts] = part.split('\r\n\r\n');
          const headers = headerSection || '';
          const content = contentParts.join('\r\n\r\n').replace(/\r\n$/, '');

          const nameMatch = headers.match(/name="([^"]+)"/);
          const filenameMatch = headers.match(/filename="([^"]+)"/);

          if (nameMatch) {
            const fieldName = nameMatch[1];

            if (filenameMatch) {
              filename = filenameMatch[1] || 'document';
              file = Buffer.from(content, 'binary');
            } else if (fieldName === 'outputFormat') {
              outputFormat = content.trim() as OutputFormat;
            }
          }
        }

        if (!file) {
          reject(new Error('No file provided'));
          return;
        }

        resolve({ file, filename, outputFormat });
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

/**
 * Send JSON response
 */
function sendJson(res: ServerResponse, data: object, status = 200): void {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

/**
 * Send error response
 */
function sendError(res: ServerResponse, message: string, status = 500): void {
  sendJson(res, { error: message }, status);
}

/**
 * Serve static files
 */
async function serveStatic(res: ServerResponse, filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) return false;

    const content = await readFile(filePath);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    });
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Handle conversion request
 */
async function handleConvert(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!converter || !converter.isReady()) {
    sendError(res, 'Converter not initialized', 503);
    return;
  }

  try {
    const { file, filename, outputFormat } = await parseMultipart(req);

    const options: ConversionOptions = { outputFormat };
    const result = await converter.convert(new Uint8Array(file), options, filename);

    res.writeHead(200, {
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.data.length,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(Buffer.from(result.data));
  } catch (error) {
    console.error('Conversion error:', error);
    sendError(res, (error as Error).message, 400);
  }
}

/**
 * Handle status request
 */
function handleStatus(res: ServerResponse): void {
  sendJson(res, {
    status: converter?.isReady() ? 'ready' : 'initializing',
    supportedInputFormats: LibreOfficeConverter.getSupportedInputFormats(),
    supportedOutputFormats: LibreOfficeConverter.getSupportedOutputFormats(),
    maxFileSize: MAX_FILE_SIZE,
  });
}

/**
 * Generate demo HTML page
 */
function getDemoHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LibreOffice WASM Converter</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #e0e0e0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(90deg, #00d4ff, #7b2cbf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .container { width: 100%; max-width: 600px; }
    .dropzone {
      border: 2px dashed #444;
      border-radius: 12px;
      padding: 4rem 2rem;
      text-align: center;
      background: rgba(255,255,255,0.02);
      cursor: pointer;
      transition: all 0.3s;
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: #00d4ff;
      background: rgba(0,212,255,0.05);
    }
    .dropzone.has-file { border-color: #00ff88; border-style: solid; }
    .form-group { margin-top: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: #aaa; font-size: 0.85rem; }
    select {
      width: 100%;
      padding: 0.75rem;
      background: #1a1a2e;
      border: 1px solid #333;
      border-radius: 8px;
      color: #e0e0e0;
      font-size: 1rem;
    }
    button {
      width: 100%;
      margin-top: 1.5rem;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      background: linear-gradient(90deg, #00d4ff, #7b2cbf);
      color: white;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover:not(:disabled) { transform: translateY(-2px); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    #status {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      display: none;
    }
    #status.show { display: block; }
    #status.success { background: rgba(0,255,136,0.1); color: #00ff88; }
    #status.error { background: rgba(255,68,68,0.1); color: #ff4444; }
    .formats { margin-top: 2rem; padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 8px; }
    .formats h3 { font-size: 0.8rem; color: #666; margin-bottom: 0.5rem; }
    .tag { display: inline-block; padding: 0.25rem 0.5rem; background: rgba(0,212,255,0.1); border-radius: 4px; font-size: 0.75rem; color: #00d4ff; margin: 0.2rem; }
  </style>
</head>
<body>
  <h1>LibreOffice WASM</h1>
  <p class="subtitle">Document Conversion</p>
  <div class="container">
    <div class="dropzone" id="dropzone">
      <p>📄 Drop your document here or click to select</p>
    </div>
    <input type="file" id="fileInput" hidden>
    <div id="fileInfo" style="margin-top:1rem;display:none;color:#00ff88;"></div>
    <div class="form-group">
      <label>Output Format</label>
      <select id="outputFormat">
        <option value="pdf">PDF</option>
        <option value="docx">DOCX</option>
        <option value="odt">ODT</option>
        <option value="html">HTML</option>
        <option value="txt">Plain Text</option>
      </select>
    </div>
    <button id="convertBtn" disabled>Convert</button>
    <div id="status"></div>
    <div class="formats">
      <h3>Supported Formats</h3>
      <span class="tag">DOC</span><span class="tag">DOCX</span><span class="tag">XLS</span>
      <span class="tag">XLSX</span><span class="tag">PPT</span><span class="tag">PPTX</span>
      <span class="tag">ODT</span><span class="tag">ODS</span><span class="tag">ODP</span>
      <span class="tag">RTF</span><span class="tag">TXT</span><span class="tag">HTML</span>
      <span class="tag">PDF</span>
    </div>
  </div>
  <script>
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const outputFormat = document.getElementById('outputFormat');
    const convertBtn = document.getElementById('convertBtn');
    const status = document.getElementById('status');
    let selectedFile = null;

    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      if (e.target.files.length) selectFile(e.target.files[0]);
    };
    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('dragover'); };
    dropzone.ondragleave = () => dropzone.classList.remove('dragover');
    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) selectFile(e.dataTransfer.files[0]);
    };

    function selectFile(file) {
      selectedFile = file;
      dropzone.classList.add('has-file');
      fileInfo.style.display = 'block';
      fileInfo.textContent = file.name + ' (' + (file.size/1024/1024).toFixed(2) + ' MB)';
      convertBtn.disabled = false;
    }

    convertBtn.onclick = async () => {
      if (!selectedFile) return;
      convertBtn.disabled = true;
      status.className = 'show';
      status.textContent = 'Converting...';
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('outputFormat', outputFormat.value);
        const res = await fetch('/convert', { method: 'POST', body: formData });
        if (!res.ok) throw new Error((await res.json()).error);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name.replace(/\\.[^.]+$/, '.' + outputFormat.value);
        a.click();
        status.className = 'show success';
        status.textContent = 'Done! Download started.';
      } catch (err) {
        status.className = 'show error';
        status.textContent = 'Error: ' + err.message;
      } finally {
        convertBtn.disabled = false;
      }
    };
  </script>
</body>
</html>`;
}

/**
 * Request handler
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const method = req.method?.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    // API routes
    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getDemoHtml());
      return;
    }

    if (url.pathname === '/status' || url.pathname === '/health') {
      handleStatus(res);
      return;
    }

    if (url.pathname === '/convert' && method === 'POST') {
      await handleConvert(req, res);
      return;
    }

    // Serve WASM files
    if (url.pathname.startsWith('/wasm/')) {
      const filePath = join(WASM_PATH, url.pathname.replace('/wasm/', ''));
      if (await serveStatic(res, filePath)) return;
    }

    sendError(res, 'Not found', 404);
  } catch (error) {
    console.error('Request error:', error);
    sendError(res, 'Internal server error', 500);
  }
}

/**
 * Start the server
 */
async function start(): Promise<void> {
  console.log('🚀 LibreOffice WASM Converter Server');
  console.log(`   WASM Path: ${WASM_PATH}`);

  try {
    converter = new LibreOfficeConverter({
      wasmPath: WASM_PATH,
      verbose: process.env.VERBOSE === 'true',
      onProgress: (p) => console.log(`   [${p.phase}] ${p.percent}% - ${p.message}`),
    });

    console.log('   Initializing LibreOffice WASM...');
    await converter.initialize();
    console.log('✅ Ready');
  } catch (error) {
    console.error('⚠️  Init failed:', (error as Error).message);
    console.log('   Server will start but conversion may fail.');
  }

  const server = createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(`\n🌐 http://localhost:${PORT}\n`);
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await converter?.destroy();
    server.close();
    process.exit(0);
  });
}

start().catch(console.error);

export { start };

/**
 * Document Conversion HTTP Server Example
 *
 * A simple HTTP server that accepts document uploads and returns converted files.
 *
 * Usage: node conversion-server.js [port]
 *
 * API:
 *   POST /convert?format=pdf
 *   Body: multipart/form-data with 'file' field
 *   Returns: Converted document
 *
 *   POST /info
 *   Body: multipart/form-data with 'file' field
 *   Returns: JSON with document info
 *
 *   POST /preview?page=0&width=800&height=600
 *   Body: multipart/form-data with 'file' field
 *   Returns: PNG image of the page
 */

import { createServer } from 'http';
import { WorkerConverter } from '@matbee/libreoffice-converter';

const PORT = parseInt(process.argv[2]) || 3000;

// MIME types for responses
const MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  html: 'text/html',
  txt: 'text/plain',
  png: 'image/png',
  csv: 'text/csv',
};

let converter = null;

async function initConverter() {
  console.log('Initializing LibreOffice WASM converter...');
  converter = new WorkerConverter({ verbose: false });
  await converter.initialize();
  console.log('Converter ready!');
}

// Simple multipart parser (for demo purposes)
function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from('--' + boundary);

  let start = buffer.indexOf(boundaryBuffer);
  while (start !== -1) {
    const end = buffer.indexOf(boundaryBuffer, start + boundaryBuffer.length);
    if (end === -1) break;

    const part = buffer.slice(start + boundaryBuffer.length, end);
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd !== -1) {
      const headers = part.slice(0, headerEnd).toString();
      const content = part.slice(headerEnd + 4, part.length - 2); // Remove trailing \r\n

      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const nameMatch = headers.match(/name="([^"]+)"/);

      if (nameMatch) {
        parts.push({
          name: nameMatch[1],
          filename: filenameMatch ? filenameMatch[1] : null,
          data: content,
        });
      }
    }
    start = end;
  }
  return parts;
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Read request body
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);

  // Parse multipart
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(.+)/);
  if (!boundaryMatch) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing multipart boundary' }));
    return;
  }

  const parts = parseMultipart(body, boundaryMatch[1]);
  const filePart = parts.find((p) => p.name === 'file');

  if (!filePart || !filePart.filename) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No file uploaded' }));
    return;
  }

  try {
    const inputBuffer = filePart.data;
    const filename = filePart.filename;

    switch (url.pathname) {
      case '/convert': {
        const format = url.searchParams.get('format') || 'pdf';
        console.log(`Converting ${filename} to ${format}...`);

        const result = await converter.convert(inputBuffer, { outputFormat: format }, filename);

        const mimeType = MIME_TYPES[format] || 'application/octet-stream';
        const outputFilename = filename.replace(/\.[^.]+$/, `.${format}`);

        res.writeHead(200, {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${outputFilename}"`,
        });
        res.end(Buffer.from(result.data));
        console.log(`Converted: ${filename} -> ${outputFilename}`);
        break;
      }

      case '/info': {
        console.log(`Getting info for ${filename}...`);
        const info = await converter.getDocumentInfo(inputBuffer, filename);
        const pageNames = await converter.getPageNames(inputBuffer, filename);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            filename,
            ...info,
            pageNames,
          })
        );
        break;
      }

      case '/preview': {
        const page = parseInt(url.searchParams.get('page')) || 0;
        const width = parseInt(url.searchParams.get('width')) || 800;
        const height = parseInt(url.searchParams.get('height')) || 600;

        console.log(`Rendering page ${page} of ${filename}...`);
        const imageData = await converter.renderPage(inputBuffer, filename, page, {
          width,
          height,
          format: 'png',
        });

        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(Buffer.from(imageData));
        break;
      }

      case '/text': {
        console.log(`Extracting text from ${filename}...`);
        const text = await converter.getDocumentText(inputBuffer, filename);

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(text);
        break;
      }

      default:
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function main() {
  await initConverter();

  const server = createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`\nConversion server running at http://localhost:${PORT}`);
    console.log('\nEndpoints:');
    console.log('  POST /convert?format=pdf   - Convert document');
    console.log('  POST /info                 - Get document info');
    console.log('  POST /preview?page=0       - Render page as PNG');
    console.log('  POST /text                 - Extract text content');
    console.log('\nExample with curl:');
    console.log(`  curl -F "file=@document.docx" http://localhost:${PORT}/convert?format=pdf -o output.pdf`);
  });

  // Cleanup on exit
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await converter.destroy();
    process.exit(0);
  });
}

main();

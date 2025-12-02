import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.cjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.metadata': 'application/json',
};

const server = http.createServer((req, res) => {
  // Required headers for SharedArrayBuffer (WASM threads)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  let filePath = path.join(__dirname, req.url === '/' ? '/examples/browser-demo.html' : req.url);
  const ext = path.extname(filePath);

  // Handle directory requests
  if (!ext) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`404: ${req.url}`);
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.writeHead(200);
    res.end(data);
    console.log(`200: ${req.url} (${mimeType})`);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`   Demo page: http://localhost:${PORT}/examples/browser-demo.html`);
  console.log(`\n   Headers enabled:`);
  console.log(`   - Cross-Origin-Opener-Policy: same-origin`);
  console.log(`   - Cross-Origin-Embedder-Policy: require-corp`);
  console.log(`\n   Press Ctrl+C to stop\n`);
});

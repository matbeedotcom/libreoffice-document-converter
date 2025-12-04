import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, join, extname } from 'path';
import { existsSync, readFileSync } from 'fs';

// Custom plugin to serve parent package files (wasm, dist)
function serveParentPackage(): Plugin {
  const parentDir = resolve(__dirname, '../..');

  const mimeTypes: Record<string, string> = {
    '.js': 'application/javascript',
    '.cjs': 'application/javascript',
    '.wasm': 'application/wasm',
    '.data': 'application/octet-stream',
    '.metadata': 'application/json',
  };

  return {
    name: 'serve-parent-package',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Serve /wasm/* and /dist/* from parent package
        if (url.startsWith('/wasm/') || url.startsWith('/dist/')) {
          const filePath = join(parentDir, url);

          if (existsSync(filePath)) {
            const content = readFileSync(filePath);
            const ext = extname(filePath);

            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            res.end(content);
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveParentPackage()],
  server: {
    headers: {
      // Required for SharedArrayBuffer (WASM threading)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  resolve: {
    alias: {
      // Resolve linked package subpath exports
      '@libreoffice-wasm/converter/browser': resolve(__dirname, '../../dist/browser.js'),
      '@libreoffice-wasm/converter': resolve(__dirname, '../../dist/index.js'),
    },
  },
  optimizeDeps: {
    // Don't pre-bundle the linked package
    exclude: ['@libreoffice-wasm/converter'],
  },
});

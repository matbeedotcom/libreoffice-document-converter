import { defineConfig } from 'tsup';

export default defineConfig([
  // Node.js build (main entry points)
  {
    entry: {
      index: 'src/index.ts',
      server: 'src/server.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'node18',
    platform: 'node',
    splitting: false,
    treeshake: true,
    minify: false,
    outDir: 'dist',
    external: ['path', 'url', 'fs', 'fs/promises', 'http', 'worker_threads', 'crypto', 'module'],
  },
  // Worker thread (separate build, no DTS)
  {
    entry: {
      worker: 'src/worker.ts',
      subprocess: 'src/subprocess.cts',
      'isolate-worker': 'src/isolate-worker.ts',
      'fork-worker': 'src/fork-worker.cts',
      'subprocess-worker': 'src/subprocess-worker.cts',
    },
    format: ['cjs'],
    dts: false,
    sourcemap: true,
    clean: false,
    target: 'node18',
    platform: 'node',
    splitting: false,
    treeshake: true,
    minify: false,
    outDir: 'dist',
    external: ['path', 'url', 'fs', 'fs/promises', 'worker_threads'],
    noExternal: [],
  },
  // Browser build
  {
    entry: {
      browser: 'src/browser.ts',
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    target: 'es2022',
    platform: 'browser',
    splitting: false,
    treeshake: true,
    minify: true,
    outDir: 'dist',
    // Define Node.js globals as undefined for browser
    define: {
      'process.versions': 'undefined',
    },
  },
  // Browser Web Worker build (classic worker, IIFE format)
  {
    entry: {
      'browser-worker': 'src/browser-worker.ts',
    },
    format: ['iife'],
    dts: false,
    sourcemap: true,
    target: 'es2022',
    platform: 'browser',
    splitting: false,
    treeshake: true,
    minify: true,
    outDir: 'dist',
    define: {
      'process.versions': 'undefined',
    },
  },
]);

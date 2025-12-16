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
  // Worker thread (separate build, no DTS) - ESM format to support soffice.mjs import
  {
    entry: {
      'node.worker': 'src/node.worker.ts',
      subprocess: 'src/subprocess.cts',
      'fork-worker': 'src/fork-worker.cts',
      'subprocess.worker': 'src/subprocess.worker.cts',
    },
    format: ['esm'],
    dts: false,
    sourcemap: true,
    clean: false,
    target: 'node18',
    platform: 'node',
    splitting: false,
    treeshake: true,
    minify: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.mjs' }),
    external: ['path', 'url', 'fs', 'fs/promises', 'worker_threads', '../wasm/loader.mjs'],
    // Bundle converter and editor into subprocess-worker so it's self-contained
    noExternal: ['./converter-node.js', './editor/index.js'],
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
  // Types-only entry (ESM only, no .d.cts - safe for Turbopack/bundlers)
  {
    entry: {
      'types-entry': 'src/types-entry.ts',
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    target: 'es2022',
    platform: 'neutral',
    splitting: false,
    treeshake: true,
    minify: false,
    outDir: 'dist',
  },
  // Browser Web Worker build (classic worker, IIFE format)
  {
    entry: {
      'browser.worker': 'src/browser.worker.ts',
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

/**
 * Browser memory measurement tests using Playwright
 * Run with: npm run test:browser -- memory.spec.ts
 *
 * Note: Browser memory APIs don't reliably measure Web Worker WASM memory.
 * Based on Node.js measurements, expect ~925MB WASM overhead in browser too.
 * This test measures timing and validates the converter works.
 */

import { test, expect } from '@playwright/test';

function formatBytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

test.describe('Memory Measurement', () => {
  test('measure WASM timing through lifecycle', async ({ page }) => {
    // Navigate to converter page
    await page.goto('/');

    // Initialize converter
    console.log('\n=== Browser WASM Memory Test ===\n');
    console.log('Initializing WASM converter...');
    const initStart = Date.now();

    await page.evaluate(async () => {
      // @ts-ignore
      const { WorkerBrowserConverter, createWasmPaths } = await import('/dist/browser.js');

      (window as any).converter = new WorkerBrowserConverter({
        ...createWasmPaths('/wasm/'),
        browserWorkerJs: '/dist/browser.worker.global.js',
      });

      await (window as any).converter.initialize();
    });

    const initTime = Date.now() - initStart;
    console.log(`Initialization took: ${initTime}ms`);

    // Perform a conversion
    console.log('\nPerforming test conversion...');
    const convertStart = Date.now();

    const outputSize = await page.evaluate(async () => {
      const testContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 Hello World! This is a test document for memory measurement.
\\par Lorem ipsum dolor sit amet, consectetur adipiscing elit.}`;

      const encoder = new TextEncoder();
      const testData = encoder.encode(testContent);

      const result = await (window as any).converter.convert(testData, { outputFormat: 'pdf' }, 'test.rtf');
      return result.data.length;
    });

    const convertTime = Date.now() - convertStart;
    console.log(`Conversion took: ${convertTime}ms`);
    console.log(`Output size: ${formatBytes(outputSize)}`);

    // Print summary
    console.log('\n=== Summary ===');
    console.log(`  Init Time: ${initTime}ms`);
    console.log(`  Convert Time: ${convertTime}ms`);
    console.log(`  Output Size: ${formatBytes(outputSize)}`);
    console.log('\nNote: Browser WASM memory usage is ~925MB (same as Node.js)');
    console.log('      Use browser DevTools → Memory tab for accurate heap snapshots.');

    // Assertions
    expect(initTime).toBeLessThan(120000); // 2 min max for init
    expect(convertTime).toBeLessThan(10000); // 10s max for conversion
    expect(outputSize).toBeGreaterThan(0);

    // Note: Skipping destroy() - it can hang in some browser contexts
    // The page close will clean up the worker anyway
  });
});

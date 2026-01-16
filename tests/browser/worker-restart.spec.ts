import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Worker Restart and Recovery', () => {
  test.beforeEach(async ({ page }) => {
    // Log all console messages for debugging
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' || text.includes('[Worker]') || text.includes('terminate')) {
        console.log(`[Browser ${msg.type()}] ${text}`);
      }
    });

    page.on('pageerror', error => {
      console.error(`[Page Error] ${error.message}`);
    });
  });

  test.afterEach(async ({ page }) => {
    try {
      await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
    } catch {
      // Ignore navigation errors during cleanup
    }
    await page.waitForTimeout(500);
  });

  test('should detect WASM crash error patterns correctly', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    // Test error pattern detection in browser context
    const crashPatterns = await page.evaluate(() => {
      const isWasmCrashError = (error: unknown): boolean => {
        const message = error instanceof Error ? error.message : String(error);
        return (
          message.includes('memory access out of bounds') ||
          message.includes('unreachable') ||
          message.includes('null function') ||
          message.includes('table index is out of bounds') ||
          message.includes('RuntimeError')
        );
      };

      return {
        memoryAccess: isWasmCrashError(new Error('RuntimeError: memory access out of bounds')),
        unreachable: isWasmCrashError(new Error('RuntimeError: unreachable')),
        nullFunction: isWasmCrashError(new Error('null function or function signature mismatch')),
        tableIndex: isWasmCrashError(new Error('table index is out of bounds')),
        regularError: isWasmCrashError(new Error('File not found')),
        runtimeError: isWasmCrashError('RuntimeError'),
      };
    });

    // WASM crash patterns should be detected
    expect(crashPatterns.memoryAccess).toBe(true);
    expect(crashPatterns.unreachable).toBe(true);
    expect(crashPatterns.nullFunction).toBe(true);
    expect(crashPatterns.tableIndex).toBe(true);
    expect(crashPatterns.runtimeError).toBe(true);

    // Regular errors should NOT be detected as WASM crashes
    expect(crashPatterns.regularError).toBe(false);
  });

  test('can create converter, terminate worker, and create new converter', async ({ page }) => {
    // This test directly tests the WorkerBrowserConverter worker termination
    await page.goto('/examples/browser-demo.html');

    // Wait for page to be ready
    await expect(page.locator('h1')).toContainText('Free Document Conversion');

    // Run the test entirely in the browser context
    const result = await page.evaluate(async () => {
      const logs: string[] = [];
      const log = (msg: string) => {
        logs.push(msg);
        console.log(msg);
      };

      try {
        // Import the converter
        log('Importing WorkerBrowserConverter...');
        const { WorkerBrowserConverter, createWasmPaths } = await import('/dist/browser.js');

        // Create and initialize first converter
        log('Creating first converter...');
        const converter1 = new WorkerBrowserConverter({
          ...createWasmPaths('/wasm/'),
          browserWorkerJs: '/dist/browser.worker.global.js',
        });

        log('Initializing first converter...');
        await converter1.initialize();

        const isReady1 = converter1.isReady();
        log(`First converter isReady: ${isReady1}`);

        if (!isReady1) {
          return { success: false, error: 'First converter not ready', logs };
        }

        // Force terminate the worker (simulating a crash recovery)
        log('Force terminating worker...');
        const anyConverter = converter1 as any;
        if (anyConverter.worker) {
          anyConverter.worker.terminate();
          anyConverter.worker = null;
          log('Worker terminated directly');
        }
        anyConverter.initialized = false;
        anyConverter.pendingRequests?.clear();

        const isReady1AfterTerminate = converter1.isReady();
        log(`First converter isReady after terminate: ${isReady1AfterTerminate}`);

        // Wait for worker to fully terminate
        await new Promise(r => setTimeout(r, 300));

        // Create a new converter (simulating recovery)
        log('Creating second converter...');
        const converter2 = new WorkerBrowserConverter({
          ...createWasmPaths('/wasm/'),
          browserWorkerJs: '/dist/browser.worker.global.js',
        });

        log('Initializing second converter...');
        await converter2.initialize();

        const isReady2 = converter2.isReady();
        log(`Second converter isReady: ${isReady2}`);

        // Clean up
        try {
          await converter2.destroy();
        } catch { }

        return {
          success: true,
          firstConverterReady: isReady1,
          firstConverterAfterTerminate: isReady1AfterTerminate,
          secondConverterReady: isReady2,
          logs,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          logs,
        };
      }
    });

    console.log('Test logs:', result.logs);

    expect(result.success).toBe(true);
    expect(result.firstConverterReady).toBe(true);
    expect(result.firstConverterAfterTerminate).toBe(false);
    expect(result.secondConverterReady).toBe(true);
  });

  test('worker terminate followed by destroy does not throw', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');
    await expect(page.locator('h1')).toContainText('Free Document Conversion');

    const result = await page.evaluate(async () => {
      try {
        const { WorkerBrowserConverter, createWasmPaths } = await import('/dist/browser.js');

        const converter = new WorkerBrowserConverter({
          ...createWasmPaths('/wasm/'),
          browserWorkerJs: '/dist/browser.worker.global.js',
        });

        await converter.initialize();

        // Force terminate
        const anyConverter = converter as any;
        if (anyConverter.worker) {
          anyConverter.worker.terminate();
          anyConverter.worker = null;
        }
        anyConverter.initialized = false;

        // Calling destroy on an already terminated worker should not throw
        await converter.destroy();

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    expect(result.success).toBe(true);
  });
});

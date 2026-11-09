import { test, expect, type Page } from '@playwright/test';

// soffice.js pre-creates its pthread pool as nested Web Workers whose script is
// soffice.js itself, so counting those workers shows the pool size that the
// runtime actually used.
function pthreadWorkers(page: Page) {
  return page.workers().filter((w) => w.url().endsWith('/wasm/soffice.js'));
}

// The demo page preloads its own converter, so use an empty cross-origin
// isolated page to make sure every soffice.js worker belongs to this test.
async function openBlankPage(page: Page) {
  await page.route('**/pthread-pool-test.html', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>pthread pool</title>',
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    })
  );
  await page.goto('/pthread-pool-test.html');
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
}

async function initConverter(page: Page, pthreadPoolSize?: number) {
  await openBlankPage(page);
  await page.evaluate(async (size) => {
    const { WorkerBrowserConverter, createWasmPaths } = await import('/dist/browser.js');
    const options: Record<string, unknown> = {
      ...createWasmPaths('/wasm/'),
      browserWorkerJs: '/dist/browser.worker.global.js',
    };
    if (size !== undefined) options.pthreadPoolSize = size;
    const converter = new WorkerBrowserConverter(options);
    await converter.initialize();
    (window as unknown as { converter: unknown }).converter = converter;
  }, pthreadPoolSize);
}

test.describe('pthread pool size', () => {
  test.afterEach(async ({ page }) => {
    try {
      await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
    } catch {
      // Ignore navigation errors during cleanup
    }
  });

  test('pre-creates 8 pthread workers by default and converts', async ({ page }) => {
    await initConverter(page);
    await expect.poll(() => pthreadWorkers(page).length).toBe(8);

    const size = await page.evaluate(async () => {
      const converter = (window as unknown as { converter: { convert: (d: Uint8Array, o: object, n: string) => Promise<{ data: Uint8Array }> } }).converter;
      const input = new Uint8Array(await (await fetch('/tests/sample_2_page.docx')).arrayBuffer());
      const result = await converter.convert(input, { outputFormat: 'pdf' }, 'sample_2_page.docx');
      return result.data.length;
    });
    expect(size).toBeGreaterThan(1000);
  });

  test('honors the pthreadPoolSize option', async ({ page }) => {
    await initConverter(page, 3);
    await expect.poll(() => pthreadWorkers(page).length).toBe(3);
  });

  test('rejects an invalid pthreadPoolSize', async ({ page }) => {
    await openBlankPage(page);
    const message = await page.evaluate(async () => {
      const { WorkerBrowserConverter } = await import('/dist/browser.js');
      try {
        new WorkerBrowserConverter({ pthreadPoolSize: 0 });
        return 'no error';
      } catch (e) {
        return (e as Error).message;
      }
    });
    expect(message).toContain('pthreadPoolSize must be a positive integer');
  });
});

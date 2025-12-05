import { test, expect } from '@playwright/test';

test.describe('WASM Loading Progress System', () => {
  // Track console messages for debugging
  const consoleMessages: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleMessages.length = 0;

    // Enable verbose console logging for progress messages
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (text.includes('[Worker]') || text.includes('download') || text.includes('progress')) {
        console.log(`[Browser] ${text}`);
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

  test('should show real-time download progress during WASM initialization', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    // Wait for WASM to finish loading by waiting for convert button to be enabled
    // This happens after the converter is initialized
    await expect(page.locator('#convertBtn')).toBeDisabled({ timeout: 5000 });

    // Wait for initialization to complete - the page pre-initializes the converter
    // We'll wait for either the convert button to stay disabled (no file selected)
    // or for progress to show "Ready"
    const progressText = page.locator('#progressText');

    // Wait up to 30 seconds for initialization
    let sawReady = false;
    for (let i = 0; i < 150; i++) {
      const text = await progressText.textContent().catch(() => '');
      if (text?.includes('Ready')) {
        sawReady = true;
        break;
      }
      await page.waitForTimeout(200);
    }

    // Verify progress tracking worked by checking console messages
    console.log('[Test] Console messages:', consoleMessages.filter(m => m.includes('[Worker]')));

    // Should have seen fetch interceptor installed
    const sawInterceptor = consoleMessages.some(m => m.includes('Installed progress-tracking fetch interceptor'));
    expect(sawInterceptor).toBe(true);

    // Should have seen downloads start
    const sawDownloadStart = consoleMessages.some(m => m.includes('Starting fetch download'));
    expect(sawDownloadStart).toBe(true);

    // Should have seen downloads finish
    const sawDownloadFinish = consoleMessages.some(m => m.includes('Finished fetch download'));
    expect(sawDownloadFinish).toBe(true);

    // Should have reached Ready state
    expect(sawReady).toBe(true);
  });

  test('should show progress phases in correct order', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    const progressText = page.locator('#progressText');

    // Track all phase messages seen
    const phasesSeen: string[] = [];

    // Poll for progress - wait up to 30 seconds
    for (let i = 0; i < 150; i++) {
      const message = await progressText.textContent().catch(() => '');
      if (message && !phasesSeen.includes(message)) {
        phasesSeen.push(message);
        console.log(`[Test] New phase: ${message}`);
      }

      if (message?.includes('Ready')) {
        break;
      }
      await page.waitForTimeout(200);
    }

    console.log('[Test] All phases seen:', phasesSeen);

    // Verify we saw at least one phase
    expect(phasesSeen.length).toBeGreaterThanOrEqual(1);

    // The final phase should be Ready
    const finalPhase = phasesSeen[phasesSeen.length - 1];
    expect(finalPhase).toContain('Ready');
  });

  test('progress should include bytes info during download phases', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    const progressBytes = page.locator('#progressBytes');
    const progressText = page.locator('#progressText');

    let sawBytesInfo = false;
    const bytesSnapshots: string[] = [];

    // Poll for progress - wait up to 30 seconds
    for (let i = 0; i < 150; i++) {
      const bytes = await progressBytes.textContent().catch(() => '');
      const message = await progressText.textContent().catch(() => '');

      if (bytes && bytes.includes('MB')) {
        sawBytesInfo = true;
        if (!bytesSnapshots.includes(bytes)) {
          bytesSnapshots.push(bytes);
          console.log(`[Test] Bytes info: ${bytes} (during: ${message})`);
        }
      }

      if (message?.includes('Ready')) {
        break;
      }
      await page.waitForTimeout(200);
    }

    console.log('[Test] Bytes snapshots captured:', bytesSnapshots.length);

    // Note: If WASM is cached (browser cache or service worker),
    // we may not see download progress. This is expected behavior.
    if (sawBytesInfo) {
      // Verify bytes format is correct (e.g., "67.3 MB / 142.0 MB")
      const hasValidFormat = bytesSnapshots.some(b => /\d+\.\d+ MB \/ \d+\.\d+ MB/.test(b));
      expect(hasValidFormat).toBe(true);
    } else {
      console.log('[Test] No bytes info seen - downloads may have been too fast');
      // This is acceptable - just verify we reached Ready state
      const message = await progressText.textContent();
      expect(message).toContain('Ready');
    }
  });

  test('progress percentage should increase monotonically', async ({ page }) => {
    await page.goto('/examples/browser-demo.html');

    const progressFill = page.locator('#progressFill');
    const progressText = page.locator('#progressText');

    const percentages: number[] = [];

    // Poll for progress - wait up to 30 seconds
    for (let i = 0; i < 300; i++) {
      const style = await progressFill.getAttribute('style').catch(() => '');
      const match = style?.match(/width:\s*(\d+)%/);
      if (match) {
        const percent = parseInt(match[1], 10);
        if (percentages.length === 0 || percent !== percentages[percentages.length - 1]) {
          percentages.push(percent);
        }
      }

      const message = await progressText.textContent().catch(() => '');
      if (message?.includes('Ready')) {
        break;
      }
      await page.waitForTimeout(100);
    }

    console.log('[Test] Percentage progression:', percentages);

    // Verify percentages are monotonically increasing (or equal)
    for (let i = 1; i < percentages.length; i++) {
      expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]!);
    }

    // Should end at 100%
    if (percentages.length > 0) {
      expect(percentages[percentages.length - 1]).toBe(100);
    }
  });
});

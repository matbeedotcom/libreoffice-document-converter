import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Browser Benchmarks', () => {
  test.setTimeout(300000); // 5 minutes for full benchmark

  test('benchmark DOCX, XLSX, PPTX conversions', async ({ page }) => {
    // Collect console output for timing
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(msg.text());
      console.log(`[Browser] ${msg.text()}`);
    });

    await page.goto('/examples/browser-demo.html');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Free Document Conversion');

    const results: Record<string, number[]> = {
      init: [],
      docx: [],
      xlsx: [],
      pptx: [],
    };

    // Test files
    const testFiles = [
      { path: path.join(__dirname, '..', 'sample_test_3.docx'), type: 'docx', iterations: 3 },
      { path: path.join(__dirname, '..', 'sample_test_5.xlsx'), type: 'xlsx', iterations: 3 },
      { path: path.join(__dirname, '..', 'sample_test_1.pptx'), type: 'pptx', iterations: 3 },
    ];

    let initTime: number | null = null;

    for (const testFile of testFiles) {
      console.log(`\n--- Testing ${testFile.type.toUpperCase()} ---`);

      for (let i = 0; i < testFile.iterations; i++) {
        // Upload file
        const fileInput = page.locator('#fileInput');
        await fileInput.setInputFiles(testFile.path);

        // Wait for file info
        await expect(page.locator('#fileInfo')).toBeVisible();

        // Select PDF output
        await page.selectOption('#outputFormat', 'pdf');

        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 180000 });

        // Start timing
        const startTime = Date.now();

        // Click convert
        await page.locator('#convertBtn').click();

        // Wait for progress to show (this captures init time on first run)
        await expect(page.locator('#progressContainer')).toBeVisible({ timeout: 10000 });

        // Wait for download
        const download = await downloadPromise;
        const endTime = Date.now();
        const elapsed = endTime - startTime;

        // On first conversion, init time is included
        if (initTime === null) {
          // First conversion includes init - we'll subtract subsequent times to estimate
          initTime = elapsed;
          console.log(`  Run ${i + 1}: ${elapsed}ms (includes initialization)`);
        } else {
          console.log(`  Run ${i + 1}: ${elapsed}ms`);
        }

        results[testFile.type].push(elapsed);

        // Verify download
        expect(download.suggestedFilename()).toMatch(/\.pdf$/);

        // Small delay between runs
        await page.waitForTimeout(500);
      }
    }

    // Calculate statistics
    console.log('\n========== BROWSER BENCHMARK RESULTS ==========\n');

    const formatTime = (ms: number) => ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;

    const calcStats = (times: number[]) => {
      if (times.length === 0) return null;
      const sorted = [...times].sort((a, b) => a - b);
      return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: times.reduce((a, b) => a + b, 0) / times.length,
        median: sorted[Math.floor(sorted.length / 2)],
      };
    };

    console.log('| Operation | Min | Max | Avg | Median |');
    console.log('|-----------|-----|-----|-----|--------|');

    for (const [type, times] of Object.entries(results)) {
      if (times.length > 0) {
        const stats = calcStats(times);
        if (stats) {
          const label = type === 'init' ? 'Initialization' : `${type.toUpperCase()} → PDF`;
          console.log(`| ${label} | ${formatTime(stats.min)} | ${formatTime(stats.max)} | ${formatTime(stats.avg)} | ${formatTime(stats.median)} |`);
        }
      }
    }

    console.log('\n--- README-ready format ---');
    console.log('| Operation | Time |');
    console.log('|-----------|------|');

    // Estimate init time: first DOCX conversion minus average subsequent DOCX
    if (results.docx.length > 1) {
      const firstDocx = results.docx[0];
      const subsequentAvg = results.docx.slice(1).reduce((a, b) => a + b, 0) / (results.docx.length - 1);
      const estimatedInit = firstDocx - subsequentAvg;
      console.log(`| LibreOfficeKit initialization | ~${formatTime(estimatedInit)} |`);
    }

    for (const [type, times] of Object.entries(results)) {
      if (times.length > 1 && type !== 'init') {
        // Use subsequent conversions (skip first which includes warmup)
        const subsequentTimes = times.slice(1);
        const avg = subsequentTimes.reduce((a, b) => a + b, 0) / subsequentTimes.length;
        console.log(`| ${type.toUpperCase()} → PDF | ~${formatTime(avg)} |`);
      }
    }

    // Test passes if we got results
    expect(results.docx.length).toBeGreaterThan(0);
  });
});

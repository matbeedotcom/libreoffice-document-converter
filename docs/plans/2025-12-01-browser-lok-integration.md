# Browser LOK Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make BrowserConverter perform actual document conversions using LibreOfficeKit bindings instead of returning placeholder data.

**Architecture:** Integrate LOKBindings class into browser.ts, following the same pattern used in converter.ts. The browser module will import LOKBindings and use it to load documents, save in different formats, and clean up.

**Tech Stack:** TypeScript, Emscripten WASM, LibreOfficeKit C API bindings

---

## Task 1: Add LOKBindings Import to browser.ts

**Files:**
- Modify: `src/browser.ts:31-42`

**Step 1: Add the new imports**

Add LOKBindings class and format mappings to the imports at line 31-42:

```typescript
import {
  ConversionError,
  ConversionErrorCode,
  ConversionOptions,
  ConversionResult,
  EmscriptenModule,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  FORMAT_FILTER_OPTIONS,
  OUTPUT_FORMAT_TO_LOK,
  LibreOfficeWasmOptions,
  OutputFormat,
  ProgressInfo,
} from './types.js';

import { LOKBindings } from './lok-bindings.js';
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit src/browser.ts`
Expected: No errors (imports exist in types.ts and lok-bindings.ts)

**Step 3: Commit**

```bash
git add src/browser.ts
git commit -m "feat(browser): add LOKBindings and format mapping imports"
```

---

## Task 2: Add LOKBindings Property to BrowserConverter

**Files:**
- Modify: `src/browser.ts:49-62`

**Step 1: Add the lokBindings property**

Add after line 51 (`private _lokInstance: number = 0;`):

```typescript
export class BrowserConverter {
  private module: EmscriptenModule | null = null;
  private _lokInstance: number = 0;
  private lokBindings: LOKBindings | null = null;
  private initialized = false;
  private initializing = false;
  private options: LibreOfficeWasmOptions;
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit src/browser.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/browser.ts
git commit -m "feat(browser): add lokBindings property to BrowserConverter"
```

---

## Task 3: Initialize LOKBindings in initLOK Method

**Files:**
- Modify: `src/browser.ts:148-162`

**Step 1: Replace the initLOK method**

Replace the current initLOK method with one that creates LOKBindings:

```typescript
  private async initLOK(): Promise<void> {
    if (!this.module) throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'No module');

    // Create LOKBindings and initialize
    this.lokBindings = new LOKBindings(this.module, this.options.verbose);
    this.lokBindings.initialize('/instdir/program');

    // Store the LOK instance pointer for backwards compatibility
    this._lokInstance = (this.lokBindings as any).lokPtr || 1;
  }
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit src/browser.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/browser.ts
git commit -m "feat(browser): initialize LOKBindings in initLOK"
```

---

## Task 4: Remove Unused allocString Method

**Files:**
- Modify: `src/browser.ts:164-170`

**Step 1: Remove the allocString method**

Delete lines 164-170 (the allocString method). It's now handled by LOKBindings:

```typescript
  // DELETE THIS ENTIRE METHOD:
  private allocString(str: string): number {
    if (!this.module) throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'No module');
    const bytes = new TextEncoder().encode(str + '\0');
    const ptr = this.module._malloc(bytes.length);
    this.module.HEAPU8.set(bytes, ptr);
    return ptr;
  }
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit src/browser.ts`
Expected: No errors (method was only used in old initLOK)

**Step 3: Commit**

```bash
git add src/browser.ts
git commit -m "refactor(browser): remove unused allocString method"
```

---

## Task 5: Implement Actual Conversion Logic

**Files:**
- Modify: `src/browser.ts:175-225`

**Step 1: Replace the convert method**

Replace the placeholder conversion with actual LOK calls:

```typescript
  /**
   * Convert a document
   */
  async convert(
    input: Uint8Array | ArrayBuffer,
    options: ConversionOptions,
    filename = 'document'
  ): Promise<ConversionResult> {
    if (!this.initialized || !this.module || !this.lokBindings) {
      throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    }

    const startTime = Date.now();
    const inputData = input instanceof Uint8Array ? input : new Uint8Array(input);

    if (inputData.length === 0) {
      throw new ConversionError(ConversionErrorCode.INVALID_INPUT, 'Empty document');
    }

    const ext = this.getExt(filename) || options.inputFormat || 'docx';
    const outputExt = options.outputFormat;

    if (!FORMAT_FILTERS[outputExt]) {
      throw new ConversionError(ConversionErrorCode.UNSUPPORTED_FORMAT, `Unsupported: ${outputExt}`);
    }

    const inPath = `/tmp/input/doc.${ext}`;
    const outPath = `/tmp/output/doc.${outputExt}`;

    let docPtr = 0;

    try {
      // Write input file to virtual filesystem
      this.module.FS.writeFile(inPath, inputData);
      this.emitProgress('converting', 30, 'Loading document...');

      // Load document with LOK
      if (options.password) {
        docPtr = this.lokBindings.documentLoadWithOptions(inPath, `,Password=${options.password}`);
      } else {
        docPtr = this.lokBindings.documentLoad(inPath);
      }

      if (docPtr === 0) {
        const error = this.lokBindings.getError();
        throw new ConversionError(ConversionErrorCode.LOAD_FAILED, error || 'Failed to load document');
      }

      this.emitProgress('converting', 50, 'Converting...');

      // Get LOK format string and filter options
      const lokFormat = OUTPUT_FORMAT_TO_LOK[outputExt];
      let filterOptions = FORMAT_FILTER_OPTIONS[outputExt] || '';

      // Add PDF-specific options
      if (outputExt === 'pdf' && options.pdf) {
        const pdfOpts: string[] = [];
        if (options.pdf.pdfaLevel) {
          const levelMap: Record<string, number> = {
            'PDF/A-1b': 1,
            'PDF/A-2b': 2,
            'PDF/A-3b': 3,
          };
          pdfOpts.push(`SelectPdfVersion=${levelMap[options.pdf.pdfaLevel] || 0}`);
        }
        if (options.pdf.quality !== undefined) {
          pdfOpts.push(`Quality=${options.pdf.quality}`);
        }
        if (pdfOpts.length > 0) {
          filterOptions = pdfOpts.join(',');
        }
      }

      this.emitProgress('converting', 70, 'Saving...');

      // Save document in target format
      this.lokBindings.documentSaveAs(docPtr, outPath, lokFormat, filterOptions);

      this.emitProgress('converting', 90, 'Reading output...');

      // Read the converted output
      const result = this.module.FS.readFile(outPath) as Uint8Array;

      if (result.length === 0) {
        throw new ConversionError(ConversionErrorCode.CONVERSION_FAILED, 'Empty output');
      }

      const baseName = filename.includes('.') ? filename.substring(0, filename.lastIndexOf('.')) : filename;

      this.emitProgress('complete', 100, 'Done');

      return {
        data: result,
        mimeType: FORMAT_MIME_TYPES[outputExt],
        filename: `${baseName}.${outputExt}`,
        duration: Date.now() - startTime,
      };
    } finally {
      // Cleanup document
      if (docPtr !== 0) {
        try {
          this.lokBindings.documentDestroy(docPtr);
        } catch { /* ignore */ }
      }
      // Cleanup temp files
      try { this.module.FS.unlink(inPath); } catch { /* ignore */ }
      try { this.module.FS.unlink(outPath); } catch { /* ignore */ }
    }
  }
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit src/browser.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/browser.ts
git commit -m "feat(browser): implement actual LOK conversion in BrowserConverter"
```

---

## Task 6: Update destroy Method to Cleanup LOKBindings

**Files:**
- Modify: `src/browser.ts:280-284`

**Step 1: Update the destroy method**

Replace the destroy method to properly clean up LOKBindings:

```typescript
  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    if (this.lokBindings) {
      try {
        this.lokBindings.destroy();
      } catch { /* ignore */ }
      this.lokBindings = null;
    }
    this.module = null;
    this._lokInstance = 0;
    this.initialized = false;
  }
```

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit src/browser.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/browser.ts
git commit -m "feat(browser): cleanup LOKBindings in destroy method"
```

---

## Task 7: Build and Test the Browser Module

**Files:**
- Test: Browser build output

**Step 1: Build the project**

Run: `npm run build`
Expected: Build succeeds with browser.js output in dist/

**Step 2: Verify browser bundle exists**

Run: `ls -la dist/browser.*`
Expected: browser.js and browser.d.ts files exist

**Step 3: Run type check on full project**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit build verification**

```bash
git add -A
git commit -m "build: verify browser module builds successfully"
```

---

## Task 8: Update browser-demo.html to Use Real Converter

**Files:**
- Modify: `examples/browser-demo.html:506-534`

**Step 1: Replace simulateConversion with real conversion**

Replace the simulateConversion function (lines 506-534) with:

```javascript
    async function performConversion() {
      // Import the browser module
      // Note: For local testing, serve files with a web server
      // For production: import { BrowserConverter } from '@libreoffice-wasm/converter/browser';

      updateProgress(10, 'Loading LibreOffice WASM...');

      // Dynamically import the browser module
      const { BrowserConverter } = await import('../dist/browser.js');

      const converter = new BrowserConverter({
        wasmPath: '../wasm',
        verbose: true,
        onProgress: (p) => updateProgress(p.percent, p.message),
      });

      try {
        updateProgress(20, 'Initializing...');
        await converter.initialize();

        updateProgress(30, 'Converting document...');
        const result = await converter.convertFile(selectedFile, {
          outputFormat: outputFormat.value,
          pdf: outputFormat.value === 'pdf' ? { quality: parseInt(pdfQuality.value) } : undefined,
        });

        updateProgress(100, 'Complete!');

        // Download the result
        converter.download(result);

        return result;
      } finally {
        await converter.destroy();
      }
    }
```

**Step 2: Update the convertBtn click handler**

Replace the call to `simulateConversion()` (around line 486) with `performConversion()`:

```javascript
        // Use the real converter
        await performConversion();
```

**Step 3: Remove the old simulateConversion function and sleep helper**

Delete the simulateConversion function and sleep helper (lines 506-538).

**Step 4: Commit**

```bash
git add examples/browser-demo.html
git commit -m "feat(demo): connect browser-demo.html to real BrowserConverter"
```

---

## Task 9: Test Browser Demo with Local Server

**Files:**
- Test: examples/browser-demo.html

**Step 1: Start a local web server**

Run: `npx serve . -p 3000`

**Step 2: Open browser and test**

Open: `http://localhost:3000/examples/browser-demo.html`

Test steps:
1. Wait for page to load
2. Drop a .docx file onto the drop zone
3. Click "Convert Document"
4. Verify PDF downloads (or selected format)

Expected: Conversion succeeds and file downloads

**Step 3: Check browser console for errors**

Open DevTools Console (F12)
Expected: No errors, should see verbose LOK output

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: verify browser demo works with real conversion"
```

---

## Summary

This plan integrates LOKBindings into BrowserConverter in 9 bite-sized tasks:

1. Add imports (LOKBindings, format mappings)
2. Add lokBindings property
3. Initialize LOKBindings in initLOK
4. Remove unused allocString
5. Implement real conversion logic
6. Update destroy method
7. Build and verify
8. Update browser-demo.html
9. Test with local server

**Key Changes:**
- browser.ts uses LOKBindings (same as converter.ts)
- Actual LibreOfficeKit calls: documentLoad, documentSaveAs, documentDestroy
- PDF options and password support
- Proper cleanup in destroy()
- browser-demo.html wired to real converter

**Testing Notes:**
- Browser requires serving WASM files over HTTP
- WASM files are large (~175MB total)
- First load takes time to download/compile WASM
- Subsequent conversions are fast

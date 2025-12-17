# LibreOffice WASM Size & Performance Optimization

This document details strategies for reducing file size and improving load times.

## ⚠️ Important: Initialization Time

**The LibreOffice WASM module takes approximately 70-80 seconds to initialize.** This is an inherent characteristic of LibreOffice's architecture - it loads numerous modules, fonts, registries, and resources during startup. 

**This initialization cost is paid only once per converter instance.** Once initialized, individual document conversions are fast (typically 1-5 seconds depending on document complexity).

### Best Practices for Initialization

1. **Initialize once, convert many:** Reuse the same `LibreOfficeConverter` instance for multiple conversions
2. **Background initialization:** Start initialization during idle time or page load
3. **Keep-alive in servers:** Use process pools or keep-warm strategies to avoid cold starts
4. **Progress feedback:** Use the `onProgress` callback to provide user feedback during init

## Current State

| File | Uncompressed | Gzip | Brotli |
|------|-------------|------|--------|
| `soffice.wasm` | 112 MB | 36.6 MB | 24.8 MB |
| `soffice.data` | 80 MB | 26.7 MB | 15.2 MB |
| **Total** | **192 MB** | **63.3 MB** | **40.0 MB** |

**With Brotli compression, transfer size is reduced by 79%!**

---

## 1. Compression (Immediate Win)

### Server Configuration

**Nginx:**
```nginx
# Enable Brotli/Gzip for WASM files
gzip on;
gzip_types application/wasm application/javascript;
gzip_min_length 1000;

# Brotli (if available)
brotli on;
brotli_types application/wasm application/javascript;
```

**Express.js:**
```javascript
import compression from 'compression';
import shrinkRay from 'shrink-ray-current'; // Brotli support

// Use Brotli with gzip fallback
app.use(shrinkRay());

// Or just gzip
app.use(compression());
```

**Pre-compress files:**
```bash
# Brotli (best compression)
brotli -9 soffice.wasm -o soffice.wasm.br
brotli -9 soffice.data -o soffice.data.br

# Gzip (wider compatibility)
gzip -9 -k soffice.wasm
gzip -9 -k soffice.data
```

**Savings: 79% reduction (192MB → 40MB with Brotli)**

---

## 2. Font Optimization

The data file contains 53MB of fonts, many for non-Western languages.

### Current Font Breakdown

| Font Family | Size | Purpose |
|-------------|------|---------|
| Liberation (Sans/Serif/Mono) | 3.0 MB | MS Office compatibility |
| DejaVu (Sans/Serif/Mono) | 8.5 MB | Unicode coverage |
| Noto (Arabic/Hebrew/etc.) | 14 MB | International scripts |
| Linux Libertine/Biolinum | 18 MB | High-quality open fonts |
| Amiri, Scheherazade | 3 MB | Arabic fonts |
| Hebrew fonts | 1 MB | Hebrew script |
| Other | 5 MB | Various |

### Minimal Font Set

For Western-language documents only, keep:

```bash
# Essential fonts (~11MB instead of 53MB)
Liberation*.ttf     # MS Office compatibility (Times, Arial, Courier replacements)
DejaVuSans*.ttf     # Good Unicode coverage
DejaVuSerif*.ttf
DejaVuMono*.ttf
```

### Build with Minimal Fonts

Create a custom font directory and modify the build:

```bash
# Create minimal font set
mkdir -p custom-fonts
cp instdir/share/fonts/truetype/Liberation*.ttf custom-fonts/
cp instdir/share/fonts/truetype/DejaVu*.ttf custom-fonts/

# Replace in data file (requires rebuild)
```

**Potential savings: ~42MB uncompressed, ~15MB compressed**

---

## 3. Build Optimizations

### Current vs Optimized Build Flags

```bash
# Add to autogen.input or EMSCRIPTEN_INTEL_GCC.mk

# Current
--enable-optimized=yes
--enable-lto

# Additional optimizations
--disable-assert            # Remove runtime assertions
```

### Emscripten Linker Flags

Edit `solenv/gbuild/platform/EMSCRIPTEN_INTEL_GCC.mk`:

```makefile
# Current flags
gb_EMSCRIPTEN_LDFLAGS += -s TOTAL_MEMORY=1GB

# Optimized flags
gb_EMSCRIPTEN_LDFLAGS += -Os                          # Optimize for size
gb_EMSCRIPTEN_LDFLAGS += -s ASSERTIONS=0              # Disable assertions
gb_EMSCRIPTEN_LDFLAGS += -s 'MALLOC="emmalloc"'       # Smaller allocator
gb_EMSCRIPTEN_LDFLAGS += --closure 1                  # Minify JS
gb_EMSCRIPTEN_LDFLAGS += -s EVAL_CTORS=1              # Eval static ctors
```

### Post-Processing with wasm-opt

```bash
# Install Binaryen
apt-get install binaryen

# Optimize WASM binary (5-15% smaller)
wasm-opt -Oz soffice.wasm -o soffice.optimized.wasm
```

**Potential savings: 10-20% on WASM size**

---

## 4. Remove Duplicates

The LibreOffice build creates duplicate files:

```
80M instdir/sdk/bin/soffice.data
80M instdir/program/soffice.data
```

These are **identical files** (same MD5 hash). The build script (`build-wasm.sh`) automatically removes the SDK duplicate to save 80MB.

If distributing the full `instdir/` directory, ensure you remove:
```bash
rm -f instdir/sdk/bin/soffice.data
rm -f instdir/sdk/bin/soffice.data.js.metadata
```

**Savings: 80MB**

---

## 5. Remove Unnecessary Content

### Gallery (8.9MB)

Clipart gallery is not needed for document conversion:

```bash
# Disable in build
--disable-gallery
```

Or remove after build:
```bash
rm -rf instdir/share/gallery/*
```

### Locale Data (7.3MB)

If you only need specific languages:

```bash
# Keep only English
rm -rf instdir/share/registry/res/locale_* 
# Keep: locale_en.xcd
```

### UI Configurations (22MB)

Much of this is for desktop UI - already minimized in headless build but could be further reduced.

---

## 5. Lazy Loading

### Split Data File

Instead of one 80MB data file, create module-specific packages:

```javascript
// Load fonts on-demand
const fontPack = await fetch('/wasm/fonts.data');

// Or by document type
const writerPack = await fetch('/wasm/writer.data');
const calcPack = await fetch('/wasm/calc.data');
```

### Streaming WASM Compilation

```javascript
// Browser: Use streaming compilation
const module = await WebAssembly.compileStreaming(fetch('/wasm/soffice.wasm'));
```

### IndexedDB Caching (Browser)

```javascript
async function loadWithCache() {
  const cache = await caches.open('libreoffice-wasm');
  
  let wasmResponse = await cache.match('/wasm/soffice.wasm');
  if (!wasmResponse) {
    wasmResponse = await fetch('/wasm/soffice.wasm');
    cache.put('/wasm/soffice.wasm', wasmResponse.clone());
  }
  
  return WebAssembly.compileStreaming(wasmResponse);
}
```

---

## 6. Per-Module Builds

Create smaller builds for specific use cases:

### Writer-Only Build (Documents)

```bash
--with-main-module=writer
--disable-calc
--disable-impress
--disable-draw
--disable-math
```

### Calc-Only Build (Spreadsheets)

```bash
--with-main-module=calc
--disable-writer
--disable-impress
--disable-draw
```

**Note:** This requires separate builds for each document type.

---

## Optimization Summary

| Optimization | Savings | Effort | Notes |
|--------------|---------|--------|-------|
| **Brotli compression** | 79% | Low | Immediate, no rebuild |
| **Minimal fonts** | 42MB | Medium | Requires data rebuild |
| **Remove gallery** | 9MB | Low | Simple removal |
| **wasm-opt -Oz** | 10-15% | Low | Post-processing |
| **-Os + ASSERTIONS=0** | 5-10% | Medium | Requires rebuild |
| **Module split** | 50%+ | High | Multiple builds needed |

### Recommended Priority

1. **Immediate:** Enable Brotli compression (79% transfer reduction)
2. **Quick win:** Remove gallery, run wasm-opt (10-15% more)
3. **Medium effort:** Minimal font set (20% more)
4. **Long term:** Module-specific builds (50%+ more)

---

## Optimized File Sizes Target

| Stage | WASM | Data | Total (Brotli) |
|-------|------|------|----------------|
| Current | 112MB | 80MB | ~40MB |
| + Gallery removed | 112MB | 71MB | ~37MB |
| + Minimal fonts | 112MB | 29MB | ~28MB |
| + wasm-opt | 100MB | 29MB | ~25MB |
| + Build flags | 90MB | 29MB | ~22MB |

**Target: ~22MB transfer size with Brotli (89% reduction from original)**

---

## Loading Time Optimization

### Current Load Time Breakdown (First Load / Cold Start)

| Phase | Time |
|-------|------|
| Download (40MB @ 100Mbps) | ~3.2s |
| WASM compilation | ~2-3s |
| Data file parsing | ~1-2s |
| **LibreOfficeKit init** | **~70-80s** |
| **Total (Cold Start)** | **~80s** |

> **Note:** The LibreOfficeKit initialization is the bottleneck. This is the time it takes for LibreOffice core to initialize all its modules, registries, and services. **Subsequent conversions after initialization are fast (1-5 seconds).**

### Subsequent Conversion Time (After Init)

| Phase | Time |
|-------|------|
| File I/O | ~0.1s |
| Document loading | ~0.5-2s |
| Format conversion | ~0.5-3s |
| **Total per conversion** | **1-5s** |

### Optimization Strategies

1. **Preload WASM during page load:**
```html
<link rel="preload" href="/wasm/soffice.wasm" as="fetch" crossorigin>
```

2. **Use WebAssembly streaming:**
```javascript
// Starts compilation while downloading
const module = await WebAssembly.compileStreaming(fetch(wasmUrl));
```

3. **Cache in Service Worker:**
```javascript
// Cache WASM on first load, serve from cache thereafter
```

4. **Lazy init:** Initialize converter on first use, not page load

---

## Quick Implementation: Compression Script

Create `scripts/compress-wasm.sh`:

```bash
#!/bin/bash
# Compress WASM files for deployment

WASM_DIR=${1:-./wasm}

echo "Compressing WASM files..."

# Brotli (best)
if command -v brotli &> /dev/null; then
    echo "Creating Brotli compressed files..."
    brotli -9 -f "$WASM_DIR/soffice.wasm" -o "$WASM_DIR/soffice.wasm.br"
    brotli -9 -f "$WASM_DIR/soffice.data" -o "$WASM_DIR/soffice.data.br"
fi

# Gzip (fallback)
echo "Creating Gzip compressed files..."
gzip -9 -k -f "$WASM_DIR/soffice.wasm"
gzip -9 -k -f "$WASM_DIR/soffice.data"

echo "Compression complete!"
ls -lh "$WASM_DIR"/*.{br,gz} 2>/dev/null
```

Make executable and run:
```bash
chmod +x scripts/compress-wasm.sh
./scripts/compress-wasm.sh
```

---

## 7. Serverless Optimization (Vercel, AWS Lambda, etc.)

Serverless environments like Vercel have specific constraints that require additional optimization.

### Challenge: Font Cache Initialization

LibreOffice uses fontconfig to discover available fonts. On the **first document load**, fontconfig scans all fonts (70+ font files) to build a cache. This font scanning:
- Happens synchronously during document load (not during WASM init)
- Can take 10-30+ seconds on serverless environments with slower I/O
- May exceed Vercel's function execution timeout (10s hobby, 60s pro)

### Solution: Pre-warming

Use the `prewarm` option to trigger font scanning during initialization (which has a longer timeout) instead of during the first conversion:

```typescript
import { createSubprocessConverter } from '@matbee/libreoffice-converter';

// Recommended for Vercel/serverless
const converter = await createSubprocessConverter({
  wasmPath: './wasm',
  userProfilePath: '/tmp/libreoffice-user',
  prewarm: true,  // <-- Pre-warm font cache during init
  verbose: true,
});

// First conversion will be fast because fonts are already scanned
const result = await converter.convert(docBuffer, { outputFormat: 'pdf' });
```

### Additional Options

```typescript
const converter = await createSubprocessConverter({
  wasmPath: './wasm',
  userProfilePath: '/tmp/libreoffice-user',
  
  // Pre-warm font cache during initialization
  prewarm: true,
  
  // Skip LibreOffice preload operations (slightly faster init)
  skipPreload: true,
  
  // Increase timeout for slower serverless I/O
  conversionTimeout: 120000, // 2 minutes
  
  // Retry on memory errors (common in constrained environments)
  maxConversionRetries: 3,
  restartOnMemoryError: true,
});
```

### Manual Pre-warming

If you can't use the `prewarm` option during initialization, you can call it manually:

```typescript
const converter = await createSubprocessConverter({
  wasmPath: './wasm',
  userProfilePath: '/tmp/libreoffice-user',
});

// Pre-warm after initialization
await converter.prewarm();

// Now convert
const result = await converter.convert(docBuffer, { outputFormat: 'pdf' });
```

### Vercel Configuration

For Vercel, ensure you have adequate memory and timeout:

```json
// vercel.json
{
  "functions": {
    "api/*": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

### Keep-Alive Strategy

For best performance on serverless, keep the converter initialized:

```typescript
// api/convert.ts
let converter: SubprocessConverter | null = null;

async function getConverter() {
  if (!converter || !converter.isReady()) {
    converter = await createSubprocessConverter({
      wasmPath: process.env.WASM_PATH || './wasm',
      userProfilePath: '/tmp/libreoffice-user',
      prewarm: true,
    });
  }
  return converter;
}

export default async function handler(req, res) {
  const conv = await getConverter();
  const result = await conv.convert(req.body.data, { outputFormat: 'pdf' });
  res.send(result.data);
}
```

### Timing Breakdown (Serverless)

| Phase | Cold Start | Warm Start |
|-------|------------|------------|
| WASM Load | ~3-5s | 0 (cached) |
| LibreOffice Init | ~2-3s | 0 |
| **Font Scanning** | **10-30s** | 0 |
| Document Convert | 1-5s | 1-5s |
| **Total** | **16-43s** | **1-5s** |

With `prewarm: true`, font scanning happens during the initialization phase (covered by the 3-minute timeout), ensuring document conversion doesn't unexpectedly take 30+ seconds.


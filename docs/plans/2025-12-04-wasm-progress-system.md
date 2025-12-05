# WASM Download/Loading Progress System

**Date:** 2025-12-04
**Status:** Approved

## Overview

Implement real-time progress tracking for WASM file downloads (~238MB total) and LibreOffice initialization phases in the browser. Users will see actual download progress (bytes loaded/total) and meaningful phase messages throughout the ~80 second startup.

## Goals

- Track real download progress for soffice.wasm (142MB) and soffice.data (96MB)
- Show initialization phases (compile, filesystem, LOK init)
- Backward compatible API - existing `onProgress` callbacks continue to work
- Design to be cache-aware for future caching implementation

## API Design

### New Types (`src/types.ts`)

```typescript
/** Loading phases for WASM initialization */
export type WasmLoadPhase =
  | 'download-wasm'    // Downloading soffice.wasm (142MB)
  | 'download-data'    // Downloading soffice.data (96MB)
  | 'compile'          // WebAssembly compilation
  | 'filesystem'       // Emscripten filesystem setup
  | 'lok-init'         // LibreOfficeKit initialization
  | 'ready';           // Complete

/** Extended progress info */
export interface WasmLoadProgress {
  percent: number;           // 0-100, overall progress
  message: string;           // Human-readable (backward compat)
  phase: WasmLoadPhase;      // Current phase
  bytesLoaded?: number;      // Present during download phases
  bytesTotal?: number;       // Present during download phases
}
```

### Phase Percentage Ranges

| Phase | Range | Size/Duration |
|-------|-------|---------------|
| download-wasm | 0-50% | 142MB |
| download-data | 50-80% | 96MB |
| compile | 80-85% | ~2-5s |
| filesystem | 85-92% | ~5-10s |
| lok-init | 92-99% | ~60s |
| ready | 100% | - |

## Implementation

### 1. XHR Interceptor (`browser-worker.ts`)

Override `XMLHttpRequest` before Emscripten loads to intercept WASM file downloads:

```typescript
class ProgressXMLHttpRequest extends XMLHttpRequest {
  private _url: string = '';

  open(method: string, url: string, ...args: any[]) {
    this._url = url;
    return super.open(method, url, ...args);
  }

  send(body?: any) {
    if (this._url.includes('soffice.wasm')) {
      currentDownload = { file: 'soffice.wasm', phase: 'download-wasm' };
    } else if (this._url.includes('soffice.data')) {
      currentDownload = { file: 'soffice.data', phase: 'download-data' };
    }

    if (currentDownload) {
      this.addEventListener('progress', (e: ProgressEvent) => {
        if (e.lengthComputable) {
          emitDownloadProgress(currentDownload!.phase, e.loaded, e.total);
        }
      });
    }

    return super.send(body);
  }
}

(self as any).XMLHttpRequest = ProgressXMLHttpRequest;
```

### 2. Progress Helpers (`browser-worker.ts`)

```typescript
const PHASE_RANGES: Record<WasmLoadPhase, [number, number]> = {
  'download-wasm': [0, 50],
  'download-data': [50, 80],
  'compile': [80, 85],
  'filesystem': [85, 92],
  'lok-init': [92, 99],
  'ready': [100, 100],
};

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function emitDownloadProgress(phase: WasmLoadPhase, loaded: number, total: number) {
  const [start, end] = PHASE_RANGES[phase];
  const phaseProgress = total > 0 ? loaded / total : 0;
  const percent = Math.round(start + (end - start) * phaseProgress);

  const message = phase === 'download-wasm'
    ? `Downloading WebAssembly... ${formatBytes(loaded)} / ${formatBytes(total)}`
    : `Downloading filesystem... ${formatBytes(loaded)} / ${formatBytes(total)}`;

  emitProgress({ percent, message, phase, bytesLoaded: loaded, bytesTotal: total });
}

function emitPhaseProgress(phase: WasmLoadPhase, message: string) {
  const [start] = PHASE_RANGES[phase];
  emitProgress({ percent: start, message, phase });
}
```

### 3. Updated handleInit() Flow

1. Install XHR interceptor BEFORE `importScripts()`
2. `importScripts(sofficeJsUrl)` triggers download-wasm (0-50%)
3. Emscripten loads .data file → download-data (50-80%)
4. Emit compile phase (80-85%)
5. Wait for runtime → emit filesystem phase (85-92%)
6. Initialize LOK → emit lok-init phase (92-99%)
7. Emit ready (100%)

### 4. Browser Demo Updates

```javascript
onProgress: (p) => {
  progressBar.style.width = `${p.percent}%`;
  progressBar.textContent = `${p.percent}%`;
  statusText.textContent = p.message;

  if (p.bytesLoaded !== undefined && p.bytesTotal !== undefined) {
    const mb = (p.bytesLoaded / 1024 / 1024).toFixed(1);
    const totalMb = (p.bytesTotal / 1024 / 1024).toFixed(1);
    bytesText.textContent = `${mb} MB / ${totalMb} MB`;
  }
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/types.ts` | Add `WasmLoadPhase`, `WasmLoadProgress` types |
| `src/browser-worker.ts` | XHR interceptor, progress helpers, update `handleInit()` |
| `examples/browser-demo.html` | Enhanced progress display |

## Future Work (Not This PR)

- **Caching**: Use Cache API to store downloaded WASM files
- **Version checking**: Invalidate cache when WASM version changes
- **Offline support**: Load from cache when offline

## User Experience

**Before:** Static percentages (10%, 20%, 60%, 80%, 100%) with generic messages

**After:**
- "Downloading WebAssembly... 67.3 MB / 142.0 MB" (smooth 0-50%)
- "Downloading filesystem... 45.2 MB / 96.0 MB" (smooth 50-80%)
- "Compiling WebAssembly module..." (80-85%)
- "Setting up filesystem..." (85-92%)
- "Initializing LibreOfficeKit..." (92-99%)
- "Ready" (100%)

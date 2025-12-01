/**
 * Forked Process LibreOffice Converter
 * 
 * Runs the WASM module in a completely separate Node.js process.
 */

import { fork, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { randomUUID } from 'crypto';
import {
  ConversionError,
  ConversionErrorCode,
  ConversionOptions,
  ConversionResult,
  FORMAT_MIME_TYPES,
  OUTPUT_FORMAT_TO_LOK,
  FORMAT_FILTER_OPTIONS,
  LibreOfficeWasmOptions,
} from './types.js';

interface WorkerMessage {
  type: 'ready' | 'error' | 'response';
  id?: string;
  success?: boolean;
  error?: string;
  data?: number[];
}

export class SubprocessConverter {
  private child: ChildProcess | null = null;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private options: LibreOfficeWasmOptions;
  private initialized = false;
  private initializing = false;

  constructor(options: LibreOfficeWasmOptions = {}) {
    this.options = { wasmPath: './wasm', verbose: false, ...options };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing) {
      while (this.initializing) await new Promise(r => setTimeout(r, 100));
      return;
    }
    this.initializing = true;

    try {
      let workerPath: string;
      try {
        workerPath = join(dirname(fileURLToPath(import.meta.url)), 'fork-worker.cjs');
      } catch {
        workerPath = join(__dirname, 'fork-worker.cjs');
      }

      const wasmPath = resolve(this.options.wasmPath || './wasm');

      this.child = fork(workerPath, [], {
        env: { ...process.env, WASM_PATH: wasmPath, VERBOSE: String(this.options.verbose || false) },
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      });

      this.child.stdout?.on('data', (d: Buffer) => { if (this.options.verbose) process.stdout.write(d); });
      this.child.stderr?.on('data', (d: Buffer) => { if (this.options.verbose) process.stderr.write(d); });

      this.child.on('message', (msg: WorkerMessage) => {
        if (msg.type === 'response' && msg.id) {
          const p = this.pending.get(msg.id);
          if (p) {
            this.pending.delete(msg.id);
            msg.success ? p.resolve(msg.data) : p.reject(new ConversionError(ConversionErrorCode.CONVERSION_FAILED, msg.error || 'Error'));
          }
        }
      });

      this.child.on('error', (e) => { for (const p of this.pending.values()) p.reject(e); this.pending.clear(); });
      this.child.on('exit', (code) => {
        if (code !== 0) { for (const p of this.pending.values()) p.reject(new Error(`Exit ${code}`)); this.pending.clear(); }
        this.child = null; this.initialized = false;
      });

      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Init timeout')), 300000);
        const h = (msg: WorkerMessage) => {
          if (msg.type === 'ready') { clearTimeout(t); this.child?.off('message', h); resolve(); }
          else if (msg.type === 'error') { clearTimeout(t); this.child?.off('message', h); reject(new Error(msg.error)); }
        };
        this.child?.on('message', h);
      });

      this.initialized = true;
      this.options.onReady?.();
    } catch (e) {
      const err = e instanceof ConversionError ? e : new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, `Init failed: ${e}`);
      this.options.onError?.(err);
      throw err;
    } finally {
      this.initializing = false;
    }
  }

  private send(type: string, payload?: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.child) { reject(new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'No process')); return; }
      const id = randomUUID();
      this.pending.set(id, { resolve, reject });
      this.child.send({ type, id, payload });
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new ConversionError(ConversionErrorCode.CONVERSION_FAILED, 'Timeout')); } }, 600000);
    });
  }

  async convert(input: Uint8Array | ArrayBuffer | Buffer, options: ConversionOptions, filename = 'document'): Promise<ConversionResult> {
    if (!this.initialized || !this.child) throw new ConversionError(ConversionErrorCode.WASM_NOT_INITIALIZED, 'Not initialized');
    const start = Date.now();
    const data = input instanceof Uint8Array ? input : new Uint8Array(input as ArrayBuffer);
    if (data.length === 0) throw new ConversionError(ConversionErrorCode.INVALID_INPUT, 'Empty');
    const ext = options.inputFormat || (filename.includes('.') ? filename.slice(filename.lastIndexOf('.') + 1).toLowerCase() : 'docx');
    let filter = FORMAT_FILTER_OPTIONS[options.outputFormat] || '';
    if (options.outputFormat === 'pdf' && options.pdf) {
      const o: string[] = [];
      if (options.pdf.pdfaLevel) o.push(`SelectPdfVersion=${{ 'PDF/A-1b': 1, 'PDF/A-2b': 2, 'PDF/A-3b': 3 }[options.pdf.pdfaLevel] || 0}`);
      if (options.pdf.quality !== undefined) o.push(`Quality=${options.pdf.quality}`);
      if (o.length) filter = o.join(',');
    }
    const r = await this.send('convert', { inputData: Array.from(data), inputExt: ext, outputFormat: OUTPUT_FORMAT_TO_LOK[options.outputFormat], filterOptions: filter }) as number[];
    const base = filename.includes('.') ? filename.slice(0, filename.lastIndexOf('.')) : filename;
    return { data: new Uint8Array(r), mimeType: FORMAT_MIME_TYPES[options.outputFormat], filename: `${base}.${options.outputFormat}`, duration: Date.now() - start };
  }

  async destroy(): Promise<void> {
    if (this.child) { try { await this.send('destroy'); } catch {} this.child.kill(); this.child = null; }
    this.initialized = false; this.pending.clear();
  }

  isReady(): boolean { return this.initialized && this.child !== null; }
}

export async function createSubprocessConverter(options: LibreOfficeWasmOptions = {}): Promise<SubprocessConverter> {
  const c = new SubprocessConverter(options);
  await c.initialize();
  return c;
}

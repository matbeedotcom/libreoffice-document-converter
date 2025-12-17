/**
 * Example: Converter Pool for Parallel Execution
 *
 * This demonstrates how to create a pool of WorkerConverters
 * for true parallel document conversion.
 */

import { WorkerConverter } from '../src/node.worker-converter.js';
import type { ConversionOptions, ConversionResult } from '../src/types.js';

interface PooledConverter {
  converter: WorkerConverter;
  busy: boolean;
}

export class ConverterPool {
  private pool: PooledConverter[] = [];
  private queue: Array<{
    input: Uint8Array;
    options: ConversionOptions;
    filename: string;
    resolve: (result: ConversionResult) => void;
    reject: (error: Error) => void;
  }> = [];
  private poolSize: number;
  private wasmPath: string;
  private initialized = false;

  constructor(options: { poolSize?: number; wasmPath?: string } = {}) {
    this.poolSize = options.poolSize ?? 4;
    this.wasmPath = options.wasmPath ?? './wasm';
  }

  /**
   * Initialize the pool with WorkerConverters
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log(`[Pool] Initializing ${this.poolSize} worker converters...`);

    const initPromises = Array.from({ length: this.poolSize }, async (_, i) => {
      const converter = new WorkerConverter({
        wasmPath: this.wasmPath,
        verbose: false,
      });
      console.log(`[Pool] Worker ${i + 1}/${this.poolSize} ready`);
      return { converter, busy: false };
    });

    this.pool = await Promise.all(initPromises);
    this.initialized = true;
    console.log(`[Pool] All ${this.poolSize} workers ready`);
  }

  /**
   * Convert a document using an available worker
   */
  async convert(
    input: Uint8Array | ArrayBuffer | Buffer,
    options: ConversionOptions,
    filename = 'document'
  ): Promise<ConversionResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const inputData = input instanceof Uint8Array
      ? input
      : new Uint8Array(input);

    return new Promise((resolve, reject) => {
      // Try to find an available converter
      const available = this.pool.find((p) => !p.busy);

      if (available) {
        this.runConversion(available, inputData, options, filename, resolve, reject);
      } else {
        // Queue the request
        this.queue.push({ input: inputData, options, filename, resolve, reject });
      }
    });
  }

  private async runConversion(
    pooled: PooledConverter,
    input: Uint8Array,
    options: ConversionOptions,
    filename: string,
    resolve: (result: ConversionResult) => void,
    reject: (error: Error) => void
  ): Promise<void> {
    pooled.busy = true;

    try {
      const result = await pooled.converter.convert(input, options, filename);
      resolve(result);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      pooled.busy = false;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    const available = this.pool.find((p) => !p.busy);
    if (!available) return;

    const next = this.queue.shift()!;
    this.runConversion(
      available,
      next.input,
      next.options,
      next.filename,
      next.resolve,
      next.reject
    );
  }

  /**
   * Get pool statistics
   */
  getStats(): { total: number; busy: number; queued: number } {
    return {
      total: this.pool.length,
      busy: this.pool.filter((p) => p.busy).length,
      queued: this.queue.length,
    };
  }

  /**
   * Destroy all workers in the pool
   */
  async destroy(): Promise<void> {
    await Promise.all(this.pool.map((p) => p.converter.destroy()));
    this.pool = [];
    this.queue = [];
    this.initialized = false;
  }
}

// Example usage
async function main() {
  const pool = new ConverterPool({ poolSize: 4 });

  try {
    await pool.initialize();

    // Simulate converting 10 documents in parallel
    const documents = Array.from({ length: 10 }, (_, i) =>
      new TextEncoder().encode(`Document ${i + 1} content`)
    );

    console.log('\n[Main] Converting 10 documents in parallel...');
    const startTime = Date.now();

    const results = await Promise.all(
      documents.map((doc, i) =>
        pool.convert(doc, { outputFormat: 'pdf' }, `doc${i + 1}.txt`)
      )
    );

    const duration = Date.now() - startTime;
    console.log(`\n[Main] Converted ${results.length} documents in ${duration}ms`);
    console.log(`[Main] Average: ${(duration / results.length).toFixed(0)}ms per document`);

    results.forEach((r, i) => {
      console.log(`  Document ${i + 1}: ${r.data.length} bytes`);
    });

  } finally {
    await pool.destroy();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

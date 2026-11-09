import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_PTHREAD_POOL_SIZE, resolvePthreadPoolSize } from '../src/pthread-pool.js';
import { ConversionError } from '../src/types.js';

const wasmDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'wasm');

describe('resolvePthreadPoolSize', () => {
  it('defaults to DEFAULT_PTHREAD_POOL_SIZE', () => {
    expect(resolvePthreadPoolSize(undefined)).toBe(DEFAULT_PTHREAD_POOL_SIZE);
    expect(DEFAULT_PTHREAD_POOL_SIZE).toBeGreaterThan(4);
  });

  it('accepts positive integers', () => {
    expect(resolvePthreadPoolSize(1)).toBe(1);
    expect(resolvePthreadPoolSize(16)).toBe(16);
  });

  it.each([0, -1, 2.5, NaN, Infinity, '4' as unknown as number])('rejects %s', (value) => {
    expect(() => resolvePthreadPoolSize(value)).toThrow(ConversionError);
  });
});

/**
 * Run the pool setup from the shipped Emscripten glue against a stub runtime
 * and return how many pthread workers it pre-creates.
 */
function poolWorkersCreated(glueFile: string, moduleConfig: Record<string, unknown>): number {
  const src = fs.readFileSync(path.join(wasmDir, glueFile), 'utf8');
  const match = src.match(/initMainThread\(\)\{(var pthreadPoolSize=[^;]+;)while\(pthreadPoolSize--\)\{PThread\.allocateUnusedWorker\(\)\}/);
  expect(match, `${glueFile} should pre-create pthread workers in initMainThread`).not.toBeNull();
  let created = 0;
  const PThread = { allocateUnusedWorker: () => { created++; } };
  new Function('Module', 'PThread', `${match![1]}while(pthreadPoolSize--){PThread.allocateUnusedWorker()}`)(moduleConfig, PThread);
  return created;
}

describe.each(['soffice.js', 'soffice.cjs'])('%s pthread pool', (glueFile) => {
  it('uses Module.pthreadPoolSize when set', () => {
    expect(poolWorkersCreated(glueFile, { pthreadPoolSize: 3 })).toBe(3);
    expect(poolWorkersCreated(glueFile, { pthreadPoolSize: 12 })).toBe(12);
  });

  it('falls back to the default pool size', () => {
    expect(poolWorkersCreated(glueFile, {})).toBe(DEFAULT_PTHREAD_POOL_SIZE);
  });
});

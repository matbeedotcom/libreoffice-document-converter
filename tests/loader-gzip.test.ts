/**
 * Tests for gzip decompression in the WASM loader
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

describe('Loader gzip support', () => {
  const wasmDir = path.join(__dirname, '../wasm');
  const testGzPath = path.join(wasmDir, 'test-compressed.gz');
  const testContent = Buffer.from('test content for gzip');

  beforeAll(() => {
    // Create a test .gz file
    const compressed = zlib.gzipSync(testContent);
    fs.writeFileSync(testGzPath, compressed);
  });

  afterAll(() => {
    // Cleanup test file
    if (fs.existsSync(testGzPath)) {
      fs.unlinkSync(testGzPath);
    }
  });

  it('should detect gzip magic bytes', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loader = require('../wasm/loader.cjs');

    const gzipData = fs.readFileSync(testGzPath);
    const plainData = Buffer.from('not gzipped');

    expect(loader.isGzipped(gzipData)).toBe(true);
    expect(loader.isGzipped(plainData)).toBe(false);
  });

  it('should decompress gzipped data', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loader = require('../wasm/loader.cjs');

    const gzipData = fs.readFileSync(testGzPath);
    const result = loader.decompressIfGzipped(gzipData);

    expect(result.toString()).toBe(testContent.toString());
  });

  it('should pass through non-gzipped data unchanged', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loader = require('../wasm/loader.cjs');

    const plainData = Buffer.from('not gzipped');
    const result = loader.decompressIfGzipped(plainData);

    expect(result.toString()).toBe(plainData.toString());
  });
});

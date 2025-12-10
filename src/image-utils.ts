/**
 * Image encoding utilities for converting raw RGBA pixel data to image formats.
 * Uses sharp when available for high performance, falls back to pure JS implementation.
 */

import { deflateSync } from 'zlib';

/** Sharp function type for creating sharp instances */
type SharpFunction = (
  input: Buffer | Uint8Array,
  options?: { raw?: { width: number; height: number; channels: number } }
) => SharpInstance;

/** Sharp instance with chained methods */
interface SharpInstance {
  png(options?: { compressionLevel?: number }): SharpInstance;
  jpeg(options?: { quality?: number }): SharpInstance;
  webp(options?: { quality?: number }): SharpInstance;
  toBuffer(): Promise<Buffer>;
}

/** Cached sharp module (or null if not available) */
let sharpModule: SharpFunction | null | undefined = undefined;

/**
 * Check if sharp is available
 */
export async function isSharpAvailable(): Promise<boolean> {
  if (sharpModule === undefined) {
    try {
      // Dynamic import with type assertion
      const mod = await import('sharp');
      sharpModule = mod.default as unknown as SharpFunction;
    } catch {
      sharpModule = null;
    }
  }
  return sharpModule !== null;
}

/**
 * Get the sharp module if available
 * @returns sharp function or null if not installed
 */
export async function getSharp(): Promise<SharpFunction | null> {
  if (sharpModule === undefined) {
    await isSharpAvailable();
  }
  return sharpModule ?? null;
}

/**
 * Image format options for encoding
 */
export interface ImageEncodeOptions {
  /** Output format */
  format: 'png' | 'jpeg' | 'webp';
  /** Quality for lossy formats (1-100), default 90 */
  quality?: number;
  /** Compression level for PNG (0-9), default 6 */
  compressionLevel?: number;
}

/**
 * Convert raw RGBA pixel data to an encoded image format.
 * Uses sharp when available for high performance, falls back to pure JS PNG encoder.
 *
 * @param rgbaData - Raw RGBA pixel data (4 bytes per pixel)
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param options - Encoding options (format, quality)
 * @returns Encoded image data as Buffer
 *
 * @example
 * ```typescript
 * import { encodeImage } from '@matbee/libreoffice-converter';
 *
 * const preview = await converter.renderPage(docBuffer, 'docx', 0, 800);
 * const pngBuffer = await encodeImage(preview.data, preview.width, preview.height, { format: 'png' });
 * fs.writeFileSync('page.png', pngBuffer);
 * ```
 */
export async function encodeImage(
  rgbaData: Uint8Array,
  width: number,
  height: number,
  options: ImageEncodeOptions = { format: 'png' }
): Promise<Buffer> {
  const sharp = await getSharp();

  if (sharp) {
    return encodeWithSharp(sharp, rgbaData, width, height, options);
  }

  // Fallback to pure JS implementation (PNG only)
  if (options.format !== 'png') {
    throw new Error(
      `Format '${options.format}' requires sharp to be installed. ` +
      `Install it with: npm install sharp`
    );
  }

  return encodePngFallback(rgbaData, width, height);
}

/**
 * Encode image using sharp (high performance)
 */
async function encodeWithSharp(
  sharp: SharpFunction,
  rgbaData: Uint8Array,
  width: number,
  height: number,
  options: ImageEncodeOptions
): Promise<Buffer> {
  let pipeline: SharpInstance = sharp(Buffer.from(rgbaData), {
    raw: {
      width,
      height,
      channels: 4,
    },
  });

  switch (options.format) {
    case 'png':
      pipeline = pipeline.png({
        compressionLevel: options.compressionLevel ?? 6,
      });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({
        quality: options.quality ?? 90,
      });
      break;
    case 'webp':
      pipeline = pipeline.webp({
        quality: options.quality ?? 90,
      });
      break;
  }

  return pipeline.toBuffer();
}

/**
 * Pure JS PNG encoder (fallback when sharp is not available)
 * Creates a valid PNG file from raw RGBA data using zlib compression.
 */
function encodePngFallback(
  rgbaData: Uint8Array,
  width: number,
  height: number
): Buffer {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // CRC32 table (pre-computed)
  const crcTable: number[] = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(data: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      const tableIndex = (crc ^ data[i]!) & 0xff;
      crc = crcTable[tableIndex]! ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function createChunk(type: string, data: Buffer): Buffer {
    const typeBytes = Buffer.from(type);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crcData = Buffer.concat([typeBytes, data]);
    const crcValue = Buffer.alloc(4);
    crcValue.writeUInt32BE(crc32(crcData));
    return Buffer.concat([length, typeBytes, data, crcValue]);
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk - raw image data with filter bytes
  // Add filter byte (0 = none) at start of each row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const srcOffset = (y * width + x) * 4;
      const dstOffset = rowOffset + 1 + x * 4;
      rawData[dstOffset] = rgbaData[srcOffset] ?? 0; // R
      rawData[dstOffset + 1] = rgbaData[srcOffset + 1] ?? 0; // G
      rawData[dstOffset + 2] = rgbaData[srcOffset + 2] ?? 0; // B
      rawData[dstOffset + 3] = rgbaData[srcOffset + 3] ?? 0; // A
    }
  }

  // Compress with zlib
  const compressed = deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Convenience function to encode RGBA data to PNG
 * @param rgbaData - Raw RGBA pixel data
 * @param width - Image width
 * @param height - Image height
 * @returns PNG encoded Buffer
 */
export async function rgbaToPng(
  rgbaData: Uint8Array,
  width: number,
  height: number
): Promise<Buffer> {
  return encodeImage(rgbaData, width, height, { format: 'png' });
}

/**
 * Convenience function to encode RGBA data to JPEG (requires sharp)
 * @param rgbaData - Raw RGBA pixel data
 * @param width - Image width
 * @param height - Image height
 * @param quality - JPEG quality (1-100), default 90
 * @returns JPEG encoded Buffer
 */
export async function rgbaToJpeg(
  rgbaData: Uint8Array,
  width: number,
  height: number,
  quality = 90
): Promise<Buffer> {
  return encodeImage(rgbaData, width, height, { format: 'jpeg', quality });
}

/**
 * Convenience function to encode RGBA data to WebP (requires sharp)
 * @param rgbaData - Raw RGBA pixel data
 * @param width - Image width
 * @param height - Image height
 * @param quality - WebP quality (1-100), default 90
 * @returns WebP encoded Buffer
 */
export async function rgbaToWebp(
  rgbaData: Uint8Array,
  width: number,
  height: number,
  quality = 90
): Promise<Buffer> {
  return encodeImage(rgbaData, width, height, { format: 'webp', quality });
}

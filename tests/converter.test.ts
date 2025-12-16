/**
 * LibreOffice Converter Tests
 *
 * Note: These tests require the WASM build to be present.
 * Run `npm run build:wasm` first to build the WASM files.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { LibreOfficeConverter } from '../src/converter-node.js';
import {
  ConversionError,
  ConversionErrorCode,
  FORMAT_FILTERS,
  FORMAT_MIME_TYPES,
  WasmLoaderModule,
} from '../src/types.js';

// Import the test WASM loader (uses createSofficeModule directly)
import testWasmLoader from './test-wasm-loader.mjs';
const wasmLoader = testWasmLoader as unknown as WasmLoaderModule;

describe('LibreOfficeConverter', () => {
  describe('Static methods', () => {
    it('should return supported input formats', () => {
      const formats = LibreOfficeConverter.getSupportedInputFormats();
      expect(formats).toContain('docx');
      expect(formats).toContain('xlsx');
      expect(formats).toContain('pptx');
      expect(formats).toContain('odt');
      expect(formats).toContain('pdf');
    });

    it('should return supported output formats', () => {
      const formats = LibreOfficeConverter.getSupportedOutputFormats();
      expect(formats).toContain('pdf');
      expect(formats).toContain('docx');
      expect(formats).toContain('html');
      expect(formats).toContain('png');
    });
  });

  describe('Instance methods', () => {
    it('should create a converter instance', () => {
      const converter = new LibreOfficeConverter({
        wasmPath: './wasm',
      });
      expect(converter).toBeInstanceOf(LibreOfficeConverter);
      expect(converter.isReady()).toBe(false);
    });

    it('should throw error when converting without initialization', async () => {
      const converter = new LibreOfficeConverter();
      const testData = new Uint8Array([1, 2, 3, 4]);

      await expect(
        converter.convert(testData, { outputFormat: 'pdf' })
      ).rejects.toThrow(ConversionError);
    });
  });

  describe('Format mappings', () => {
    it('should have filter for all output formats', () => {
      const outputFormats = LibreOfficeConverter.getSupportedOutputFormats();
      for (const format of outputFormats) {
        expect(FORMAT_FILTERS[format]).toBeDefined();
        expect(typeof FORMAT_FILTERS[format]).toBe('string');
      }
    });

    it('should have MIME type for all output formats', () => {
      const outputFormats = LibreOfficeConverter.getSupportedOutputFormats();
      for (const format of outputFormats) {
        expect(FORMAT_MIME_TYPES[format]).toBeDefined();
        expect(typeof FORMAT_MIME_TYPES[format]).toBe('string');
      }
    });
  });

  describe('Error handling', () => {
    it('should create proper ConversionError', () => {
      const error = new ConversionError(
        ConversionErrorCode.INVALID_INPUT,
        'Test error message',
        'Additional details'
      );

      expect(error.name).toBe('ConversionError');
      expect(error.code).toBe(ConversionErrorCode.INVALID_INPUT);
      expect(error.message).toBe('Test error message');
      expect(error.details).toBe('Additional details');
    });

    it('should have all error codes defined', () => {
      expect(ConversionErrorCode.UNKNOWN).toBeDefined();
      expect(ConversionErrorCode.INVALID_INPUT).toBeDefined();
      expect(ConversionErrorCode.UNSUPPORTED_FORMAT).toBeDefined();
      expect(ConversionErrorCode.CORRUPTED_DOCUMENT).toBeDefined();
      expect(ConversionErrorCode.PASSWORD_REQUIRED).toBeDefined();
      expect(ConversionErrorCode.WASM_NOT_INITIALIZED).toBeDefined();
      expect(ConversionErrorCode.CONVERSION_FAILED).toBeDefined();
    });
  });

  describe('Options handling', () => {
    it('should apply default options', () => {
      const converter = new LibreOfficeConverter();
      // The converter should be created without errors
      expect(converter).toBeDefined();
    });

    it('should accept custom options', () => {
      const onProgress = vi.fn();
      const onReady = vi.fn();
      const onError = vi.fn();

      const converter = new LibreOfficeConverter({
        wasmPath: '/custom/path',
        verbose: false,
        onProgress,
        onReady,
        onError,
      });

      expect(converter).toBeDefined();
    });
  });

  // Integration tests (require WASM build)
  describe('Integration tests (requires WASM build)', () => {
    let converter: LibreOfficeConverter;

    beforeAll(async () => {
      converter = new LibreOfficeConverter({
        wasmPath: './wasm',
        verbose: false,
        wasmLoader,
      });
      await converter.initialize();
    }, 120000); // 2 minute timeout for initialization

    afterAll(async () => {
      await converter.destroy();
    });

    it('should initialize successfully', () => {
      expect(converter.isReady()).toBe(true);
    });

    it('should convert a simple text document to PDF', async () => {
      // Create a minimal ODT document
      const textContent = new TextEncoder().encode('Hello, World!');
      
      const result = await converter.convert(
        textContent,
        { outputFormat: 'pdf' },
        'test.txt'
      );

      expect(result.data).toBeInstanceOf(Uint8Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.mimeType).toBe('application/pdf');
      expect(result.filename).toBe('test.pdf');
    });
  });
});

describe('Format constants', () => {
  it('should have correct PDF MIME type', () => {
    expect(FORMAT_MIME_TYPES.pdf).toBe('application/pdf');
  });

  it('should have correct DOCX MIME type', () => {
    expect(FORMAT_MIME_TYPES.docx).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  });

  it('should have correct filter for PDF export', () => {
    expect(FORMAT_FILTERS.pdf).toBe('writer_pdf_Export');
  });
});

describe('Destroy and reinitialize (requires WASM build)', () => {
  // Helper to initialize with a timeout
  const initializeWithTimeout = async (converter: LibreOfficeConverter, timeoutMs = 5000) => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Initialization timed out after ${timeoutMs}ms - likely hung on PThread reuse`)), timeoutMs);
    });
    return Promise.race([converter.initialize(), timeoutPromise]);
  };

  it('should allow creating a new converter after destroy', async () => {
    // First converter - initialize and use
    const converter1 = new LibreOfficeConverter({
      wasmPath: './wasm',
      verbose: false,
      wasmLoader,
    });

    // First init can take longer (cold start)
    await converter1.initialize();
    expect(converter1.isReady()).toBe(true);

    // Do a conversion to ensure it's working
    const textContent = new TextEncoder().encode('Test document 1');
    const result1 = await converter1.convert(
      textContent,
      { outputFormat: 'pdf' },
      'test1.txt'
    );
    expect(result1.data.length).toBeGreaterThan(0);

    // Destroy the first converter
    await converter1.destroy();
    expect(converter1.isReady()).toBe(false);

    // Second converter - should initialize successfully after first was destroyed
    // This is the critical test: if destroy() doesn't clean up properly,
    // this will hang trying to reuse the corrupted PThread state
    const converter2 = new LibreOfficeConverter({
      wasmPath: './wasm',
      verbose: false,
      wasmLoader,
    });

    // Second init should be fast since WASM binary is cached, but module is fresh
    // If this hangs, destroy() didn't clean up properly
    await initializeWithTimeout(converter2, 5000);
    expect(converter2.isReady()).toBe(true);

    // Do a conversion with the second converter
    const textContent2 = new TextEncoder().encode('Test document 2');
    const result2 = await converter2.convert(
      textContent2,
      { outputFormat: 'pdf' },
      'test2.txt'
    );
    expect(result2.data.length).toBeGreaterThan(0);
    expect(result2.mimeType).toBe('application/pdf');

    // Clean up
    await converter2.destroy();
    expect(converter2.isReady()).toBe(false);
  }, 120000); // 2 minute total timeout (mostly for first cold init)

  it('should allow reinitializing the same converter instance after destroy', async () => {
    const converter = new LibreOfficeConverter({
      wasmPath: './wasm',
      verbose: false,
      wasmLoader,
    });

    // First initialization (cold start)
    await converter.initialize();
    expect(converter.isReady()).toBe(true);

    const textContent1 = new TextEncoder().encode('First conversion');
    const result1 = await converter.convert(
      textContent1,
      { outputFormat: 'pdf' },
      'first.txt'
    );
    expect(result1.data.length).toBeGreaterThan(0);

    // Destroy
    await converter.destroy();
    expect(converter.isReady()).toBe(false);

    // Reinitialize the same instance - this should NOT hang
    // If destroy() didn't clean up, this will hang on PThread abort
    await initializeWithTimeout(converter, 5000);
    expect(converter.isReady()).toBe(true);

    // Convert again
    const textContent2 = new TextEncoder().encode('Second conversion');
    const result2 = await converter.convert(
      textContent2,
      { outputFormat: 'pdf' },
      'second.txt'
    );
    expect(result2.data.length).toBeGreaterThan(0);
    expect(result2.mimeType).toBe('application/pdf');

    // Final cleanup
    await converter.destroy();
  }, 120000); // 2 minute total timeout (mostly for first cold init)
});


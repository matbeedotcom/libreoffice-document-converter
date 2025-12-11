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

// Import the WASM loader for tests
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wasmLoader = require('../wasm/loader.cjs') as WasmLoaderModule;

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


import { describe, it, expect } from 'vitest';
import { buildPdfFilterOptions } from '../src/types.js';

describe('buildPdfFilterOptions', () => {
  it('returns empty string when no PDF options are provided', () => {
    expect(buildPdfFilterOptions()).toBe('');
    expect(buildPdfFilterOptions({})).toBe('');
  });

  it('builds JSON FilterData for PDF/A levels', () => {
    expect(buildPdfFilterOptions({ pdfaLevel: 'PDF/A-1b' })).toBe(
      JSON.stringify({ SelectPdfVersion: { type: 'long', value: '1' } })
    );
    expect(buildPdfFilterOptions({ pdfaLevel: 'PDF/A-2b' })).toBe(
      JSON.stringify({ SelectPdfVersion: { type: 'long', value: '2' } })
    );
    expect(buildPdfFilterOptions({ pdfaLevel: 'PDF/A-3b' })).toBe(
      JSON.stringify({ SelectPdfVersion: { type: 'long', value: '3' } })
    );
  });

  it('builds JSON FilterData for quality', () => {
    expect(buildPdfFilterOptions({ quality: 90 })).toBe(
      JSON.stringify({ Quality: { type: 'long', value: '90' } })
    );
  });

  it('combines PDF/A level and quality in one JSON object', () => {
    const result = buildPdfFilterOptions({ pdfaLevel: 'PDF/A-2b', quality: 85 });
    expect(JSON.parse(result)).toEqual({
      SelectPdfVersion: { type: 'long', value: '2' },
      Quality: { type: 'long', value: '85' },
    });
  });
});

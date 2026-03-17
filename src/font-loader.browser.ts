/**
 * Font loading utilities for LibreOffice WASM (Browser)
 *
 * Browser-compatible helper to load font files from zip archives
 * served over HTTP for injection into the WASM virtual filesystem.
 */

import type { FontData } from './types.js';

/** Valid font file extensions */
const FONT_EXTENSIONS = ['.ttf', '.otf', '.ttc', '.woff', '.woff2'];

function isFontFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return FONT_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function getBasename(filepath: string): string {
  return filepath.split('/').pop() || filepath;
}

/**
 * Load fonts from a zip file URL (Browser).
 *
 * Fetches a zip archive from a URL and extracts all font files
 * as FontData entries ready for the `fonts` converter option.
 *
 * Requires `jszip` as an optional peer dependency.
 *
 * @param url - URL to the font zip file
 * @returns Array of FontData entries
 *
 * @example
 * ```typescript
 * import { loadFontsFromUrl, WorkerBrowserConverter } from '@matbee/libreoffice-converter/browser';
 *
 * const fonts = await loadFontsFromUrl('/fonts/libreoffice-fonts-cjk.zip');
 * const converter = new WorkerBrowserConverter({ fonts });
 * await converter.initialize();
 * ```
 */
export async function loadFontsFromUrl(url: string): Promise<FontData[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let JSZipModule: any;
  try {
    JSZipModule = await import('jszip');
  } catch {
    throw new Error('jszip is required for loadFontsFromUrl. Install it: npm install jszip');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const JSZip = JSZipModule.default || JSZipModule;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font zip: ${response.status} ${response.statusText}`);
  }

  const zipData = await response.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const zip = await JSZip.loadAsync(zipData);

  const fonts: FontData[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  for (const [filePath, entry] of Object.entries(zip.files)) {
    const zipEntry = entry as { dir: boolean; async: (type: string) => Promise<Uint8Array> };
    if (zipEntry.dir) continue;
    if (!isFontFile(filePath)) continue;

    const data = await zipEntry.async('uint8array');
    fonts.push({
      filename: getBasename(filePath),
      data,
    });
  }

  return fonts;
}

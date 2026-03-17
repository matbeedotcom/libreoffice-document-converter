/**
 * Font loading utilities for LibreOffice WASM (Node.js)
 *
 * Helpers to load font files from zip archives or directories
 * for injection into the WASM virtual filesystem.
 */

import * as fs from 'fs';
import * as path from 'path';
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
 * Load fonts from a zip file (Node.js).
 *
 * Reads a zip archive and extracts all font files (.ttf, .otf, .ttc)
 * as FontData entries ready for the `fonts` converter option.
 *
 * Requires `jszip` as an optional peer dependency.
 *
 * @param zipPath - Path to the zip file on disk
 * @returns Array of FontData entries
 *
 * @example
 * ```typescript
 * import { loadFontsFromZip, createSubprocessConverter } from '@matbee/libreoffice-converter';
 *
 * const fonts = await loadFontsFromZip('./fonts/libreoffice-fonts-cjk.zip');
 * const converter = await createSubprocessConverter({ fonts });
 * ```
 */
export async function loadFontsFromZip(zipPath: string): Promise<FontData[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let JSZipModule: any;
  try {
    JSZipModule = await import('jszip');
  } catch {
    throw new Error('jszip is required for loadFontsFromZip. Install it: npm install jszip');
  }

  const JSZip = JSZipModule.default || JSZipModule;
  const zipData = fs.readFileSync(zipPath);
  const zip = await JSZip.loadAsync(zipData);

  const fonts: FontData[] = [];

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

/**
 * Load fonts from a directory (Node.js).
 *
 * Reads all font files from a directory as FontData entries.
 *
 * @param dirPath - Path to directory containing font files
 * @returns Array of FontData entries
 *
 * @example
 * ```typescript
 * import { loadFontsFromDirectory, createSubprocessConverter } from '@matbee/libreoffice-converter';
 *
 * const fonts = await loadFontsFromDirectory('./my-fonts/');
 * const converter = await createSubprocessConverter({ fonts });
 * ```
 */
export async function loadFontsFromDirectory(dirPath: string): Promise<FontData[]> {
  const files = fs.readdirSync(dirPath);
  const fonts: FontData[] = [];

  for (const file of files) {
    if (!isFontFile(file)) continue;
    const fullPath = path.join(dirPath, file);
    const data = fs.readFileSync(fullPath);
    fonts.push({
      filename: file,
      data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    });
  }

  return fonts;
}

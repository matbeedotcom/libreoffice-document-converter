/**
 * Font loading utilities for LibreOffice WASM (Node.js)
 *
 * Helpers to load font files from zip archives, directories,
 * npm packages, and system fonts for injection into the WASM virtual filesystem.
 */

import { createRequire } from 'module';
import * as fs from 'fs';
import * as os from 'os';
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const JSZip = JSZipModule.default || JSZipModule;
  const zipData = fs.readFileSync(zipPath);
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

/** Platform-specific system font directories */
const SYSTEM_FONT_DIRS: Record<string, string[]> = {
  linux: [
    '/usr/share/fonts',
    '/usr/local/share/fonts',
    path.join(os.homedir(), '.fonts'),
    path.join(os.homedir(), '.local/share/fonts'),
  ],
  darwin: [
    '/System/Library/Fonts',
    '/Library/Fonts',
    path.join(os.homedir(), 'Library/Fonts'),
  ],
  win32: [
    path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts'),
  ],
};

/**
 * Recursively collect all font files from a directory.
 */
function collectFontsRecursive(dirPath: string, fonts: FontData[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    // Directory doesn't exist or isn't readable — skip silently
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFontsRecursive(fullPath, fonts);
    } else if (entry.isFile() && isFontFile(entry.name)) {
      try {
        const data = fs.readFileSync(fullPath);
        fonts.push({
          filename: entry.name,
          data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
        });
      } catch {
        // File not readable — skip
      }
    }
  }
}

/**
 * Load all system-installed fonts for the current OS (Node.js only).
 *
 * Automatically detects the platform and recursively scans standard
 * system font directories for .ttf, .otf, .ttc, .woff, and .woff2 files.
 *
 * @returns Array of FontData entries from system font directories
 *
 * @example
 * ```typescript
 * import { loadSystemFonts, createSubprocessConverter } from '@matbee/libreoffice-converter';
 *
 * const fonts = await loadSystemFonts();
 * const converter = await createSubprocessConverter({ fonts });
 * ```
 */
export async function loadSystemFonts(): Promise<FontData[]> {
  const platform = os.platform();
  const dirs = SYSTEM_FONT_DIRS[platform];
  if (!dirs) {
    throw new Error(`Unsupported platform for system font loading: ${platform}`);
  }

  const fonts: FontData[] = [];
  for (const dir of dirs) {
    collectFontsRecursive(dir, fonts);
  }

  // Deduplicate by filename (first occurrence wins)
  const seen = new Set<string>();
  return fonts.filter(f => {
    const lower = f.filename.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

/**
 * Load fonts from an npm package's files/ directory (Node.js only).
 *
 * Resolves the package from node_modules and scans its `files/` subdirectory
 * for font files. Works with `@fontsource/*` packages and any package that
 * stores font files in a `files/` directory.
 *
 * @param packageName - npm package name (e.g., '@fontsource/noto-sans-jp')
 * @param options - Optional settings
 * @param options.formats - Font file extensions to include (default: all font types)
 * @returns Array of FontData entries
 *
 * @example
 * ```typescript
 * import { loadFontsFromPackage, createSubprocessConverter } from '@matbee/libreoffice-converter';
 *
 * // npm install @fontsource/noto-sans-jp
 * const fonts = await loadFontsFromPackage('@fontsource/noto-sans-jp');
 * const converter = await createSubprocessConverter({ fonts });
 * ```
 */
export async function loadFontsFromPackage(
  packageName: string,
  options?: { formats?: string[] }
): Promise<FontData[]> {
  const formats = (options?.formats ?? FONT_EXTENSIONS).map(f => f.toLowerCase());

  // Resolve package root via its package.json
  const require = createRequire(import.meta.url);
  let pkgJsonPath: string;
  try {
    pkgJsonPath = require.resolve(packageName + '/package.json');
  } catch {
    throw new Error(
      `Cannot find package '${packageName}'. Install it first: npm install ${packageName}`
    );
  }

  const pkgRoot = path.dirname(pkgJsonPath);
  const filesDir = path.join(pkgRoot, 'files');

  if (!fs.existsSync(filesDir)) {
    throw new Error(
      `Package '${packageName}' has no files/ directory at ${filesDir}`
    );
  }

  const fonts: FontData[] = [];
  const entries = fs.readdirSync(filesDir);

  for (const entry of entries) {
    const ext = path.extname(entry).toLowerCase();
    if (!formats.includes(ext)) continue;

    const fullPath = path.join(filesDir, entry);
    try {
      const data = fs.readFileSync(fullPath);
      fonts.push({
        filename: entry,
        data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
      });
    } catch {
      // File not readable — skip
    }
  }

  return fonts;
}

/**
 * Load fonts from multiple npm packages (Node.js only).
 *
 * Convenience wrapper around `loadFontsFromPackage` that loads from
 * multiple packages and deduplicates by filename.
 *
 * @param packageNames - Array of npm package names
 * @param options - Optional settings passed to loadFontsFromPackage
 * @returns Array of FontData entries
 *
 * @example
 * ```typescript
 * import { loadFontsFromPackages, createSubprocessConverter } from '@matbee/libreoffice-converter';
 *
 * const fonts = await loadFontsFromPackages([
 *   '@fontsource/noto-sans-jp',
 *   '@fontsource/noto-sans-kr',
 *   '@fontsource/noto-sans-sc',
 * ]);
 * const converter = await createSubprocessConverter({ fonts });
 * ```
 */
export async function loadFontsFromPackages(
  packageNames: string[],
  options?: { formats?: string[] }
): Promise<FontData[]> {
  const allFonts: FontData[] = [];
  for (const pkg of packageNames) {
    const fonts = await loadFontsFromPackage(pkg, options);
    allFonts.push(...fonts);
  }

  // Deduplicate by filename (first occurrence wins)
  const seen = new Set<string>();
  return allFonts.filter(f => {
    const lower = f.filename.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

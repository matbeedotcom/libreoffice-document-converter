#!/usr/bin/env node
/**
 * LibreOffice headless data bundler for WASM
 *
 * Usage:
 *   node bundle-lo-data.mjs --instdir /path/to/libreoffice/instdir --out ./wasm-root
 *
 * This will create:
 *   ./wasm-root/instdir/program/...
 *   ./wasm-root/instdir/share/...
 *
 * Which you can then use with:
 *   - Emscripten --preload-file wasm-root/instdir@/instdir
 *   - Or your own packing / .data creation
 */

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  let instdir = null;
  let outDir = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--instdir') {
      instdir = args[++i];
    } else if (a === '--out' || a === '--outdir') {
      outDir = args[++i];
    }
  }

  if (!instdir || !outDir) {
    console.error('Usage: node bundle-lo-data.mjs --instdir /path/to/instdir --out ./wasm-root');
    process.exit(1);
  }

  return {
    instdir: path.resolve(instdir),
    outDir: path.resolve(outDir),
  };
}

async function rmrf(p) {
  if (!fs.existsSync(p)) return;
  await fsp.rm(p, { recursive: true, force: true });
}

async function mkdirp(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function copyFile(src, dest) {
  await mkdirp(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

async function copyDir(srcRoot, destRoot, options = {}) {
  const { filter } = options;
  const entries = await fsp.readdir(srcRoot, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcRoot, entry.name);
    const relPath = path.relative(srcRoot, srcPath);
    const destPath = path.join(destRoot, entry.name);

    if (filter && !filter(srcPath, relPath, entry)) {
      continue;
    }

    if (entry.isDirectory()) {
      await mkdirp(destPath);
      await copyDir(srcPath, destPath, options);
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * Main bundling logic
 */
async function main() {
  const { instdir, outDir } = parseArgs();

  const srcProgram = path.join(instdir, 'program');
  const srcShare   = path.join(instdir, 'share');

  if (!fs.existsSync(srcProgram)) {
    console.error('ERROR: instdir/program does not exist:', srcProgram);
    process.exit(1);
  }
  if (!fs.existsSync(srcShare)) {
    console.error('ERROR: instdir/share does not exist:', srcShare);
    process.exit(1);
  }

  const destRoot      = outDir;
  const destInstDir   = path.join(destRoot, 'instdir');
  const destProgram   = path.join(destInstDir, 'program');
  const destShareRoot = path.join(destInstDir, 'share');

  console.log('Bundling LibreOffice data:');
  console.log('  Source instdir:', instdir);
  console.log('  Output root   :', destRoot);
  console.log('');

  await rmrf(destRoot);
  await mkdirp(destRoot);
  await mkdirp(destInstDir);

  // ---------------------------------------------------------------------------
  // 1) program/
  //
  // We copy the entire program/ dir except obviously useless executables and
  // platform-specific stuff. If you want to get more aggressive, add more
  // excludes here. For WASM, program/ mostly contains:
  //   - services.rdb
  //   - fundamental.ini / unorc / bootstraprc
  //   - type libraries
  //   - internal cfg
  // ---------------------------------------------------------------------------
  console.log('→ Copying program/ ...');

  const PROGRAM_EXCLUDES = [
    // Native executables / launch scripts (desktop only)
    /^soffice(\.bin)?$/i,
    /^soffice\.exe$/i,
    /^unopkg(\.bin)?$/i,
    /^python(\.exe)?$/i,
    /^.*_test[^.]*$/i,
    // Platform libs that make no sense in WASM (optional)
    /^libvclplug_/,
  ];

  const programFilter = (srcPath, rel, entry) => {
    if (!entry.isFile()) return true;
    const name = entry.name;
    return !PROGRAM_EXCLUDES.some((re) => re.test(name));
  };

  await copyDir(srcProgram, destProgram, { filter: programFilter });

  // ---------------------------------------------------------------------------
  // 2) share/
  //
  // We whitelist the subtrees that matter for headless IO:
  //   - registry      → type/filter definitions (crucial)
  //   - filter        → filter registration (.xcu)
  //   - config/...    → soffice.cfg + module configs (Impress/Draw/etc)
  //   - fonts/truetype → basic font set for layout
  //   - xsl, numbertext, wordbook, autocorr → layout, numbering, etc.
  //
  // You can add/remove dirs as needed, but DO NOT exclude:
  //   - registry
  //   - filter
  //   - config/soffice.cfg
  // or you will lose formats (PPTX, XLSX, etc).
  // ---------------------------------------------------------------------------
  console.log('→ Copying share/ ...');

  const SHARE_WHITELIST_DIRS = [
    'registry',
    'filter',
    path.join('config', 'soffice.cfg'),
    path.join('fonts', 'truetype'),
    'xsl',
    'numbertext',
    'wordbook',
    'autocorr',
    'autotext',
    // optional, but often useful:
    'psprint_config',
    'xml',
  ];

  const shareFilter = (srcPath, rel, entry) => {
    // Top-level share subdirectories
    const relFromShare = path.relative(srcShare, srcPath).split(path.sep);

    if (relFromShare.length === 1 && entry.isDirectory()) {
      const top = relFromShare[0];
      // e.g. "registry", "filter", "config", "fonts"...
      const allowed = SHARE_WHITELIST_DIRS.some((wh) => {
        const parts = wh.split(path.sep);
        return parts[0] === top;
      });
      return allowed;
    }

    // For nested paths, allow them only if their top segment is whitelisted.
    const top = relFromShare[0];
    const allowed = SHARE_WHITELIST_DIRS.some((wh) => {
      const parts = wh.split(path.sep);
      return parts[0] === top;
    });

    return allowed;
  };

  await mkdirp(destShareRoot);
  await copyDir(srcShare, destShareRoot, { filter: shareFilter });

  console.log('');
  console.log('✅ Bundle complete.');
  console.log('You now have a WASM-friendly tree at:', destRoot);
  console.log('Expected layout:');
  console.log('  ', path.join(destRoot, 'instdir/program/...'));
  console.log('  ', path.join(destRoot, 'instdir/share/...'));
  console.log('');
  console.log('Example Emscripten usage:');
  console.log('  --preload-file', destRoot + '/instdir@/instdir');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});

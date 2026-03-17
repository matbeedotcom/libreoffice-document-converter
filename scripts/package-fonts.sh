#!/bin/bash
# Package optional font bundles for LibreOffice WASM
#
# Uses @fontsource npm packages to build regional font zip bundles.
# Output: fonts/ directory with zip files ready for GitHub releases.
#
# Usage:
#   ./scripts/package-fonts.sh              # Build all bundles
#   ./scripts/package-fonts.sh cjk indic    # Build specific bundles
#   ./scripts/package-fonts.sh --list       # Show available bundles

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FONTS_DIR="$PROJECT_DIR/fonts"

mkdir -p "$FONTS_DIR"

log() { echo "[fonts] $*"; }

# ============================================
# Bundle definitions: name -> fontsource packages
# ============================================
declare -A BUNDLE_PACKAGES
declare -A BUNDLE_DESC

BUNDLE_PACKAGES[core]="@fontsource/noto-sans @fontsource/noto-serif"
BUNDLE_DESC[core]="Latin, Cyrillic, Greek (Noto Sans/Serif)"

BUNDLE_PACKAGES[cjk]="@fontsource/noto-sans-jp @fontsource/noto-sans-kr @fontsource/noto-sans-sc @fontsource/noto-sans-tc @fontsource/noto-serif-jp @fontsource/noto-serif-kr @fontsource/noto-serif-sc @fontsource/noto-serif-tc"
BUNDLE_DESC[cjk]="Chinese, Japanese, Korean (Noto Sans/Serif CJK)"

BUNDLE_PACKAGES[arabic]="@fontsource/noto-sans-arabic @fontsource/noto-sans-hebrew @fontsource/noto-naskh-arabic"
BUNDLE_DESC[arabic]="Arabic, Hebrew (Noto Sans/Naskh Arabic, Hebrew)"

BUNDLE_PACKAGES[indic]="@fontsource/noto-sans-devanagari @fontsource/noto-sans-bengali @fontsource/noto-sans-tamil @fontsource/noto-sans-telugu @fontsource/noto-sans-kannada @fontsource/noto-sans-malayalam @fontsource/noto-sans-gujarati @fontsource/noto-sans-sinhala @fontsource/noto-sans-gurmukhi @fontsource/noto-sans-oriya"
BUNDLE_DESC[indic]="South Asian scripts (Devanagari, Bengali, Tamil, etc.)"

BUNDLE_PACKAGES[southeast-asian]="@fontsource/noto-sans-thai @fontsource/noto-sans-myanmar @fontsource/noto-sans-khmer @fontsource/noto-sans-lao"
BUNDLE_DESC[southeast-asian]="Thai, Myanmar, Khmer, Lao"

BUNDLE_PACKAGES[african]="@fontsource/noto-sans-ethiopic"
BUNDLE_DESC[african]="Ethiopic (Amharic, Tigrinya)"

BUNDLE_NAMES="core cjk arabic indic southeast-asian african"

# ============================================
# Build a single bundle
# ============================================
build_bundle() {
  local name="$1"
  local packages="${BUNDLE_PACKAGES[$name]}"
  local desc="${BUNDLE_DESC[$name]}"

  log "Building $name bundle ($desc)..."

  # Install fontsource packages (temporarily)
  log "  Installing fontsource packages..."
  # shellcheck disable=SC2086
  npm install --no-save $packages 2>/dev/null || {
    log "  WARNING: Some packages failed to install"
  }

  # Use our own loadFontsFromPackage to extract fonts and create zip
  local out="$FONTS_DIR/fonts-${name}.zip"
  node -e "
    const { loadFontsFromPackages } = require('./dist/index.cjs');
    const fs = require('fs');
    const packages = '${packages}'.split(' ');

    (async () => {
      const fonts = await loadFontsFromPackages(packages, { formats: ['.woff2'] });
      console.log('  Extracted ' + fonts.length + ' font files');

      // Use jszip to create the zip
      const JSZip = require('jszip');
      const zip = new JSZip();
      for (const font of fonts) {
        zip.file(font.filename, font.data);
      }
      const zipData = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      fs.writeFileSync('${out}', zipData);
      const sizeMB = (zipData.length / 1024 / 1024).toFixed(1);
      console.log('  -> fonts-${name}.zip (' + sizeMB + ' MB, ' + fonts.length + ' fonts)');
    })().catch(e => { console.error('  ERROR:', e.message); process.exit(1); });
  "

  # Clean up installed packages
  # shellcheck disable=SC2086
  npm uninstall --no-save $packages 2>/dev/null || true
}

# ============================================
# Show available bundles
# ============================================
show_list() {
  echo "Available font bundles:"
  echo ""
  for name in $BUNDLE_NAMES; do
    printf "  %-18s %s\n" "$name" "${BUNDLE_DESC[$name]}"
  done
  echo "  all                All of the above combined"
  echo ""
  echo "Usage: $0 [bundle...]    Build specific bundles"
  echo "       $0                Build all bundles"
  echo "       $0 --list         Show this list"
}

# ============================================
# Main
# ============================================
if [ "${1:-}" = "--list" ] || [ "${1:-}" = "-l" ]; then
  show_list
  exit 0
fi

# Determine which bundles to build
if [ $# -eq 0 ]; then
  targets="$BUNDLE_NAMES"
else
  targets="$*"
fi

# Handle 'all' target — build individual bundles then combine
build_all_combined=false
resolved_targets=""
for target in $targets; do
  if [ "$target" = "all" ]; then
    resolved_targets="$BUNDLE_NAMES"
    build_all_combined=true
  else
    if [ -z "${BUNDLE_PACKAGES[$target]+x}" ]; then
      echo "Unknown bundle: $target"
      echo "Run '$0 --list' for available bundles"
      exit 1
    fi
    resolved_targets="$resolved_targets $target"
  fi
done

for target in $resolved_targets; do
  build_bundle "$target"
done

# Build combined all-in-one bundle
if [ "$build_all_combined" = true ] || [ "$targets" = "$BUNDLE_NAMES" ]; then
  log "Building all-in-one bundle..."
  # Collect all packages
  all_packages=""
  for name in $BUNDLE_NAMES; do
    all_packages="$all_packages ${BUNDLE_PACKAGES[$name]}"
  done

  log "  Installing all fontsource packages..."
  # shellcheck disable=SC2086
  npm install --no-save $all_packages 2>/dev/null || true

  local_out="$FONTS_DIR/fonts-all.zip"
  node -e "
    const { loadFontsFromPackages } = require('./dist/index.cjs');
    const fs = require('fs');
    const packages = '${all_packages}'.trim().split(/\s+/);

    (async () => {
      const fonts = await loadFontsFromPackages(packages, { formats: ['.woff2'] });
      console.log('  Extracted ' + fonts.length + ' font files (deduplicated)');

      const JSZip = require('jszip');
      const zip = new JSZip();
      for (const font of fonts) {
        zip.file(font.filename, font.data);
      }
      const zipData = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      fs.writeFileSync('${local_out}', zipData);
      const sizeMB = (zipData.length / 1024 / 1024).toFixed(1);
      console.log('  -> fonts-all.zip (' + sizeMB + ' MB, ' + fonts.length + ' fonts)');
    })().catch(e => { console.error('  ERROR:', e.message); process.exit(1); });
  "

  # shellcheck disable=SC2086
  npm uninstall --no-save $all_packages 2>/dev/null || true
fi

log ""
log "Font bundles ready in $FONTS_DIR/"
ls -lh "$FONTS_DIR"/*.zip 2>/dev/null || true
log ""
log "Upload these to GitHub releases for users to download."
log "Users load them with loadFontsFromZip():"
log ""
log "  import { loadFontsFromZip, createSubprocessConverter } from '@matbee/libreoffice-converter';"
log "  const fonts = await loadFontsFromZip('./fonts/fonts-cjk.zip');"
log "  const converter = await createSubprocessConverter({ fonts });"

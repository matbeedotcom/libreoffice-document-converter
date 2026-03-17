#!/bin/bash
# Package optional font sets for LibreOffice WASM
#
# Downloads Google Noto fonts and packages them into zip files
# that users can optionally include for non-Latin script support.
#
# Output: fonts/ directory with zip files ready for GitHub releases
#
# Usage:
#   ./scripts/package-fonts.sh           # Build all font packs
#   ./scripts/package-fonts.sh cjk       # Build only CJK pack
#   ./scripts/package-fonts.sh extended   # Build only extended pack

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FONTS_DIR="$PROJECT_DIR/fonts"
TEMP_DIR="$(mktemp -d)"

trap "rm -rf $TEMP_DIR" EXIT

log() { echo "[fonts] $*"; }

# Noto font download base URL (GitHub releases)
NOTO_BASE="https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf"
NOTO_CJK_BASE="https://github.com/notofonts/noto-cjk/releases/download/Sans2.004"
NOTO_CJK_SERIF_BASE="https://github.com/notofonts/noto-cjk/releases/download/Serif2.002"

mkdir -p "$FONTS_DIR"

download() {
  local url="$1"
  local dest="$2"
  if [ -f "$dest" ]; then
    log "  cached: $(basename "$dest")"
    return
  fi
  log "  downloading: $(basename "$dest")"
  curl -sL "$url" -o "$dest" || {
    log "  FAILED: $url"
    rm -f "$dest"
    return 1
  }
}

# ============================================
# CJK Font Pack (~45MB compressed)
# Chinese, Japanese, Korean
# ============================================
build_cjk() {
  log "Building CJK font pack..."
  local dir="$TEMP_DIR/cjk"
  mkdir -p "$dir"

  # NotoSansCJK - Variable weight OTC (all CJK in one file)
  download "$NOTO_CJK_BASE/05_NotoSansCJKsc-Regular.otf" "$dir/NotoSansCJKsc-Regular.otf"
  download "$NOTO_CJK_BASE/05_NotoSansCJKsc-Bold.otf" "$dir/NotoSansCJKsc-Bold.otf"
  download "$NOTO_CJK_BASE/09_NotoSansCJKtc-Regular.otf" "$dir/NotoSansCJKtc-Regular.otf"
  download "$NOTO_CJK_BASE/09_NotoSansCJKtc-Bold.otf" "$dir/NotoSansCJKtc-Bold.otf"
  download "$NOTO_CJK_BASE/13_NotoSansCJKjp-Regular.otf" "$dir/NotoSansCJKjp-Regular.otf"
  download "$NOTO_CJK_BASE/13_NotoSansCJKjp-Bold.otf" "$dir/NotoSansCJKjp-Bold.otf"
  download "$NOTO_CJK_BASE/17_NotoSansCJKkr-Regular.otf" "$dir/NotoSansCJKkr-Regular.otf"
  download "$NOTO_CJK_BASE/17_NotoSansCJKkr-Bold.otf" "$dir/NotoSansCJKkr-Bold.otf"

  # NotoSerifCJK
  download "$NOTO_CJK_SERIF_BASE/05_NotoSerifCJKsc-Regular.otf" "$dir/NotoSerifCJKsc-Regular.otf"
  download "$NOTO_CJK_SERIF_BASE/05_NotoSerifCJKsc-Bold.otf" "$dir/NotoSerifCJKsc-Bold.otf"
  download "$NOTO_CJK_SERIF_BASE/09_NotoSerifCJKtc-Regular.otf" "$dir/NotoSerifCJKtc-Regular.otf"
  download "$NOTO_CJK_SERIF_BASE/09_NotoSerifCJKtc-Bold.otf" "$dir/NotoSerifCJKtc-Bold.otf"
  download "$NOTO_CJK_SERIF_BASE/13_NotoSerifCJKjp-Regular.otf" "$dir/NotoSerifCJKjp-Regular.otf"
  download "$NOTO_CJK_SERIF_BASE/13_NotoSerifCJKjp-Bold.otf" "$dir/NotoSerifCJKjp-Bold.otf"
  download "$NOTO_CJK_SERIF_BASE/17_NotoSerifCJKkr-Regular.otf" "$dir/NotoSerifCJKkr-Regular.otf"
  download "$NOTO_CJK_SERIF_BASE/17_NotoSerifCJKkr-Bold.otf" "$dir/NotoSerifCJKkr-Bold.otf"

  local out="$FONTS_DIR/libreoffice-fonts-cjk.zip"
  (cd "$dir" && zip -q "$out" *.otf)
  local size=$(du -sh "$out" | cut -f1)
  log "  -> $out ($size)"
}

# ============================================
# Extended Font Pack (~15MB compressed)
# Thai, Devanagari, Bengali, Tamil, Telugu,
# Kannada, Malayalam, Myanmar, Khmer, Ethiopic, Tibetan
# ============================================
build_extended() {
  log "Building extended font pack..."
  local dir="$TEMP_DIR/extended"
  mkdir -p "$dir"

  # South/Southeast Asian scripts
  NOTO_SANS="https://github.com/notofonts"

  for script in Thai Devanagari Bengali Tamil Telugu Kannada Malayalam Myanmar Khmer Ethiopic Tibetan Sinhala Gujarati; do
    local lower=$(echo "$script" | tr '[:upper:]' '[:lower:]')
    # Try the notofonts org release pattern
    download "https://github.com/notofonts/${lower}/releases/latest/download/NotoSans${script}-Regular.ttf" \
      "$dir/NotoSans${script}-Regular.ttf" 2>/dev/null || true
    download "https://github.com/notofonts/${lower}/releases/latest/download/NotoSans${script}-Bold.ttf" \
      "$dir/NotoSans${script}-Bold.ttf" 2>/dev/null || true
  done

  # Remove any empty/failed downloads
  find "$dir" -maxdepth 1 -name "*.ttf" -size 0 -delete

  local count=$(ls "$dir"/*.ttf 2>/dev/null | wc -l)
  if [ "$count" -eq 0 ]; then
    log "  WARNING: No extended fonts downloaded. Trying alternate URLs..."
    # Fallback: try the old noto-fonts repo
    for script in Thai Devanagari Bengali Tamil Telugu Kannada Malayalam; do
      download "${NOTO_BASE}/NotoSans${script}/NotoSans${script}-Regular.ttf" \
        "$dir/NotoSans${script}-Regular.ttf" 2>/dev/null || true
      download "${NOTO_BASE}/NotoSans${script}/NotoSans${script}-Bold.ttf" \
        "$dir/NotoSans${script}-Bold.ttf" 2>/dev/null || true
    done
    find "$dir" -maxdepth 1 -name "*.ttf" -size 0 -delete
    count=$(ls "$dir"/*.ttf 2>/dev/null | wc -l)
  fi

  if [ "$count" -eq 0 ]; then
    log "  ERROR: No extended fonts could be downloaded"
    return 1
  fi

  local out="$FONTS_DIR/libreoffice-fonts-extended.zip"
  (cd "$dir" && zip -q "$out" *.ttf)
  local size=$(du -sh "$out" | cut -f1)
  log "  -> $out ($size, $count fonts)"
}

# ============================================
# All-in-one pack (CJK + Extended)
# ============================================
build_all() {
  log "Building all-in-one font pack..."
  local dir="$TEMP_DIR/all"
  mkdir -p "$dir"

  # Copy from CJK and extended
  cp "$TEMP_DIR/cjk"/*.otf "$dir/" 2>/dev/null || true
  cp "$TEMP_DIR/extended"/*.ttf "$dir/" 2>/dev/null || true

  local count=$(ls "$dir"/*.{otf,ttf} 2>/dev/null | wc -l)
  local out="$FONTS_DIR/libreoffice-fonts-all.zip"
  (cd "$dir" && zip -q "$out" *.otf *.ttf 2>/dev/null)
  local size=$(du -sh "$out" | cut -f1)
  log "  -> $out ($size, $count fonts)"
}

# ============================================
# Main
# ============================================
case "${1:-all}" in
  cjk)
    build_cjk
    ;;
  extended)
    build_extended
    ;;
  all)
    build_cjk
    build_extended
    build_all
    ;;
  *)
    echo "Usage: $0 [cjk|extended|all]"
    exit 1
    ;;
esac

log ""
log "Font packs ready in $FONTS_DIR/"
ls -lh "$FONTS_DIR"/*.zip 2>/dev/null
log ""
log "Upload these to GitHub releases for users to download."
log "Users load them with loadFontsFromZip():"
log ""
log "  import { loadFontsFromZip, createSubprocessConverter } from '@matbee/libreoffice-converter';"
log "  const fonts = await loadFontsFromZip('./fonts/libreoffice-fonts-cjk.zip');"
log "  const converter = await createSubprocessConverter({ fonts });"

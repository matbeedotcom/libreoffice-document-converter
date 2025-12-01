#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./prune-libreoffice-for-wasm.sh /path/to/full/lo/install /path/to/slim/lo
#
# Example:
#   ./prune-libreoffice-for-wasm.sh \
#       ./instdir \
#       ./instdir-slim
#
# Then use ./instdir-slim as the root when building your Emscripten --preload-file tree.

SRC_ROOT="${1:-}"
DST_ROOT="${2:-}"

if [[ -z "$SRC_ROOT" || -z "$DST_ROOT" ]]; then
  echo "Usage: $0 <SOURCE_INSTALL_DIR> <DEST_SLIM_DIR>"
  exit 1
fi

if [[ ! -d "$SRC_ROOT" ]]; then
  echo "Source dir '$SRC_ROOT' does not exist"
  exit 1
fi

echo "Source: $SRC_ROOT"
echo "Dest  : $DST_ROOT"

rm -rf "$DST_ROOT"
mkdir -p "$DST_ROOT"

# Helper: copy a file or glob, preserving relative path
copy_pattern() {
  local pattern="$1"
  shopt -s nullglob
  local matches=( "$SRC_ROOT"/$pattern )
  shopt -u nullglob
  if ((${#matches[@]} == 0)); then
    echo "  [warn] No match for pattern: $pattern"
    return 0
  fi
  for src in "${matches[@]}"; do
    local rel="${src#$SRC_ROOT/}"
    local dst="$DST_ROOT/$rel"
    mkdir -p "$(dirname "$dst")"
    cp -a "$src" "$dst"
    echo "  [+] $rel"
  done
}

echo "=== Copying core program metadata & bootstrap files ==="
copy_pattern "program/bootstraprc"
copy_pattern "program/bootstrap.ini"
copy_pattern "program/fundamentalrc"
copy_pattern "program/configmgr.ini"
copy_pattern "program/types.rdb"
copy_pattern "program/services.rdb"
copy_pattern "program/fundamental.rdb"
copy_pattern "program/ucb*.uno.rdb"
copy_pattern "program/*oox*.uno.rdb"
copy_pattern "program/*filter*.uno.rdb"
copy_pattern "program/*sfx*.uno.rdb"
copy_pattern "program/*sw*.uno.rdb"
copy_pattern "program/*sc*.uno.rdb"
copy_pattern "program/*sd*.uno.rdb"
copy_pattern "program/*framework*.uno.rdb"
copy_pattern "program/*xml*.uno.rdb"

echo "=== Copying core libraries needed for filters & document models ==="
# Writer / Calc / Impress / Draw / Math / Chart / Framework
copy_pattern "program/libswlo.*"
copy_pattern "program/libsclo.*"
copy_pattern "program/libsdlo.*"
copy_pattern "program/libsmlo.*"
copy_pattern "program/libschartlo.*"
copy_pattern "program/libsvxcorelo.*"
copy_pattern "program/libsfxlo.*"
copy_pattern "program/libsvllo.*"
copy_pattern "program/libooxlo.*"
copy_pattern "program/libxmlfdlo.*"
copy_pattern "program/libpdfliblo.*"
copy_pattern "program/libsvgfilterlo.*"
copy_pattern "program/libgraphiclo.*"
copy_pattern "program/libemfio.*"

# Obscure / legacy import libs (WordPerfect, Works, Apple formats, etc.)
copy_pattern "program/libmwaw*"
copy_pattern "program/libwps*"
copy_pattern "program/libwpd*"
copy_pattern "program/libwpg*"
copy_pattern "program/libodfgen*"
copy_pattern "program/libetonyek*"
copy_pattern "program/libfreehand*"

echo "=== Copying filter + registry configuration ==="
copy_pattern "share/filter/*"
copy_pattern "share/registry/main.xcd"
copy_pattern "share/registry/*.xcd"
copy_pattern "share/registry/res/*"

echo "=== Copying XSLT + schema support (ODF/OOXML/HTML) ==="
copy_pattern "share/xslt/*"
copy_pattern "share/xslt/import/*"
copy_pattern "share/xslt/export/*"

echo "=== Copying minimal configuration needed for modules (no UI) ==="
copy_pattern "share/config/soffice.cfg/filter/*"
copy_pattern "share/config/soffice.cfg/modules/*"
# Some non-UI core config
copy_pattern "share/config/soffice.cfg/registry/*"

echo "=== Copying minimal fonts (fallbacks only) ==="
copy_pattern "share/fonts/truetype/NotoSans-Regular.ttf"
copy_pattern "share/fonts/truetype/NotoSerif-Regular.ttf"
# If you use Liberation as Windows font fallback, uncomment:
# copy_pattern "share/fonts/truetype/LiberationSans-Regular.ttf"
# copy_pattern "share/fonts/truetype/LiberationSerif-Regular.ttf"
# copy_pattern "share/fonts/truetype/LiberationMono-Regular.ttf"

echo "=== Copying any basic graphics resources filters may expect ==="
# These are usually tiny; if they turn out unused, you can delete later.
copy_pattern "share/config/images/*"
copy_pattern "share/config/images_bitmaps/*"

echo "=== Skipping heavy UI / help / templates / dictionaries on purpose ==="
# Intentionally NOT copied:
#   share/help/
#   share/gallery/
#   share/autocorr/
#   share/template/
#   share/basic/
#   share/uno_packages/
#   share/toolbar/
#   share/config/ui/
#   share/config/wizards/
#   share/skins/
#   share/dict/*
#   translations, etc.

echo "=== Done. Slim LibreOffice tree created at: $DST_ROOT ==="

echo
echo "Next steps:"
echo "  1) Point your Emscripten --preload-file at '$DST_ROOT'"
echo "  2) Run a battery of conversions (doc/docx/xls/xlsx/ppt/pptx/odf/pdf/rtf/csv/svg/emf/wmf/etc.)"
echo "  3) If something fails, look at logs and copy more files from \$SRC_ROOT into \$DST_ROOT as needed."

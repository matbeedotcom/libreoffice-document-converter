#!/bin/bash
# Repack the WASM data file after font optimization
# This regenerates soffice.data with the reduced font set

set -e

LO_DIR="${LO_DIR:-$HOME/libreoffice-wasm-build/libreoffice}"
EMSDK_DIR="${EMSDK_DIR:-$HOME/libreoffice-wasm-build/emsdk}"

echo "=== Repacking WASM Data File ==="
echo "LibreOffice dir: $LO_DIR"
echo "EMSDK dir: $EMSDK_DIR"

# Activate emsdk
source "$EMSDK_DIR/emsdk_env.sh"

cd "$LO_DIR"

# The easiest way to regenerate is to run the make target
echo "Regenerating emscripten_fs_image..."

# Clean the old data
rm -f workdir/CustomTarget/static/emscripten_fs_image/soffice.data
rm -f workdir/CustomTarget/static/emscripten_fs_image/soffice.data.js.metadata

# Rebuild just the fs image
make CustomTarget_static/emscripten_fs_image

# Check result
if [ -f "workdir/CustomTarget/static/emscripten_fs_image/soffice.data" ]; then
    NEW_SIZE=$(du -h "workdir/CustomTarget/static/emscripten_fs_image/soffice.data" | cut -f1)
    echo "✓ New soffice.data size: $NEW_SIZE"
else
    echo "ERROR: Failed to generate soffice.data"
    exit 1
fi

echo ""
echo "=== Done! ==="
echo "Now run: ./build/update-wasm-files.sh"


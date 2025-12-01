#!/bin/bash
# Script to copy and patch WASM files from the LibreOffice build

set -e

LO_DIR="${LO_DIR:-$HOME/libreoffice-wasm-build/libreoffice}"
WASM_DIR="$(dirname "$0")/../wasm"

echo "=== Updating WASM files from LibreOffice build ==="
echo "Source: $LO_DIR"
echo "Target: $WASM_DIR"

# Check source files exist
if [ ! -f "$LO_DIR/instdir/program/soffice.wasm" ]; then
    echo "ERROR: soffice.wasm not found in $LO_DIR/instdir/program/"
    exit 1
fi

# Copy files
echo ""
echo "=== Copying files ==="

# WASM binary
cp "$LO_DIR/instdir/program/soffice.wasm" "$WASM_DIR/"
echo "Copied soffice.wasm ($(du -h "$WASM_DIR/soffice.wasm" | cut -f1))"

# JS loader - rename to .cjs for Node.js CommonJS
cp "$LO_DIR/instdir/program/soffice.js" "$WASM_DIR/soffice.cjs"
echo "Copied soffice.js -> soffice.cjs"

# Worker - rename to .cjs
if [ -f "$LO_DIR/instdir/program/soffice.worker.js" ]; then
    cp "$LO_DIR/instdir/program/soffice.worker.js" "$WASM_DIR/soffice.worker.cjs"
    echo "Copied soffice.worker.js -> soffice.worker.cjs"
fi

# Data file - from the fs_image output (has the complete filesystem)
DATA_SRC="$LO_DIR/workdir/CustomTarget/static/emscripten_fs_image/soffice.data"
META_SRC="$LO_DIR/workdir/CustomTarget/static/emscripten_fs_image/soffice.data.js.metadata"

if [ -f "$DATA_SRC" ]; then
    cp "$DATA_SRC" "$WASM_DIR/"
    echo "Copied soffice.data ($(du -h "$WASM_DIR/soffice.data" | cut -f1))"
else
    echo "WARNING: soffice.data not found in workdir, checking instdir/sdk/bin..."
    if [ -f "$LO_DIR/instdir/sdk/bin/soffice.data" ]; then
        cp "$LO_DIR/instdir/sdk/bin/soffice.data" "$WASM_DIR/"
        echo "Copied soffice.data from sdk/bin"
    fi
fi

if [ -f "$META_SRC" ]; then
    cp "$META_SRC" "$WASM_DIR/"
    echo "Copied soffice.data.js.metadata"
else
    echo "WARNING: Using instdir/program metadata"
    cp "$LO_DIR/instdir/program/soffice.data.js.metadata" "$WASM_DIR/"
fi

# Apply patches
echo ""
echo "=== Applying patches ==="

cd "$WASM_DIR"

# 1. Add global.Module for Node.js compatibility
if ! head -c 50 soffice.cjs | grep -q "global.Module"; then
    sed -i '1s/^/if(typeof global!=="undefined"){var Module=global.Module=global.Module||{}}\n/' soffice.cjs
    echo "Added global.Module patch"
fi

# 2. Fix worker filename to .cjs
sed -i 's/soffice\.worker\.js/soffice.worker.cjs/g' soffice.cjs
echo "Fixed worker filename"

# 3. Fix hardcoded PACKAGE_NAME path
sed -i 's|PACKAGE_NAME="[^"]*emscripten_fs_image/soffice\.data"|PACKAGE_NAME="soffice.data"|g' soffice.cjs
echo "Fixed PACKAGE_NAME path"

# 4. Fix datafile_ reference
sed -i 's|datafile_[^"]*emscripten_fs_image/soffice\.data|datafile_soffice.data|g' soffice.cjs
echo "Fixed datafile_ reference"

# Verify
echo ""
echo "=== Verification ==="

# Check for remaining hardcoded paths
if grep -q "libreoffice-wasm-build" soffice.cjs; then
    echo "WARNING: Still has hardcoded paths!"
    grep -o "[^\"]*/libreoffice-wasm-build[^\"]*" soffice.cjs | head -3
else
    echo "✓ No hardcoded paths"
fi

# Check PACKAGE_NAME
PNAME=$(grep -o 'PACKAGE_NAME="[^"]*"' soffice.cjs | head -1)
echo "✓ $PNAME"

# Check sizes match
META_SIZE=$(grep -o 'remote_package_size":[0-9]*' soffice.data.js.metadata | cut -d: -f2)
DATA_SIZE=$(wc -c < soffice.data)
if [ "$META_SIZE" = "$DATA_SIZE" ]; then
    echo "✓ Data file size matches metadata ($DATA_SIZE bytes)"
else
    echo "ERROR: Size mismatch! metadata=$META_SIZE, data=$DATA_SIZE"
    exit 1
fi

echo ""
echo "=== File sizes ==="
ls -lh soffice.wasm soffice.data soffice.cjs

echo ""
echo "=== Done! ==="


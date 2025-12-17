#!/bin/bash
# Script to copy and patch WASM files from the LibreOffice build
# Updated for Emscripten 3.1.74+ which inlines pthread workers automatically

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

# CRITICAL: soffice.js and soffice.data MUST come from the same directory
# The JS file contains metadata offsets that must match the data file
# Priority order:
#   1. instdir/program/ (final build output - preferred)
#   2. workdir/CustomTarget/static/emscripten_fs_image/ (intermediate)

if [ -f "$LO_DIR/instdir/program/soffice.data" ]; then
    # Both files from instdir/program/ (preferred - ensures matching metadata)
    cp "$LO_DIR/instdir/program/soffice.js" "$WASM_DIR/soffice.cjs"
    cp "$LO_DIR/instdir/program/soffice.data" "$WASM_DIR/"
    echo "Copied soffice.js -> soffice.cjs (from instdir/program/)"
    echo "Copied soffice.data ($(du -h "$WASM_DIR/soffice.data" | cut -f1)) (from instdir/program/)"
elif [ -f "$LO_DIR/workdir/CustomTarget/static/emscripten_fs_image/soffice.data" ]; then
    # Fallback: workdir has the data, need matching JS
    FS_IMG_DIR="$LO_DIR/workdir/CustomTarget/static/emscripten_fs_image"
    if [ -f "$FS_IMG_DIR/soffice.js" ]; then
        cp "$FS_IMG_DIR/soffice.js" "$WASM_DIR/soffice.cjs"
        cp "$FS_IMG_DIR/soffice.data" "$WASM_DIR/"
        echo "Copied soffice.js -> soffice.cjs (from workdir fs_image)"
        echo "Copied soffice.data ($(du -h "$WASM_DIR/soffice.data" | cut -f1)) (from workdir fs_image)"
    else
        # Last resort: JS from instdir, data from workdir (may cause offset mismatch!)
        echo "WARNING: Using soffice.js from instdir/program/ but soffice.data from workdir"
        echo "         This may cause metadata offset mismatch errors!"
        cp "$LO_DIR/instdir/program/soffice.js" "$WASM_DIR/soffice.cjs"
        cp "$FS_IMG_DIR/soffice.data" "$WASM_DIR/"
        echo "Copied soffice.js -> soffice.cjs"
        echo "Copied soffice.data ($(du -h "$WASM_DIR/soffice.data" | cut -f1))"
    fi
else
    echo "ERROR: soffice.data not found in either location!"
    exit 1
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

# 2. Fix hardcoded PACKAGE_NAME path
sed -i 's|PACKAGE_NAME="[^"]*emscripten_fs_image/soffice\.data"|PACKAGE_NAME="soffice.data"|g' soffice.cjs
echo "Fixed PACKAGE_NAME path"

# 3. Fix datafile_ reference
sed -i 's|datafile_[^"]*emscripten_fs_image/soffice\.data|datafile_soffice.data|g' soffice.cjs
echo "Fixed datafile_ reference"

# 4. Create browser-compatible copy (.js from .cjs)
# Using copy instead of symlink for better server compatibility
cp soffice.cjs soffice.js
echo "Created browser copy (soffice.js)"

# Verify
echo ""
echo "=== Verification ==="

# Check for remaining hardcoded paths
if grep -q "libreoffice-wasm-build" soffice.cjs; then
    echo "WARNING: Still has hardcoded paths!"
    grep -o "[^\"]*libreoffice-wasm-build[^\"]*" soffice.cjs | head -3
else
    echo "✓ No hardcoded paths"
fi

# Check PACKAGE_NAME
PNAME=$(grep -o 'PACKAGE_NAME="[^"]*"' soffice.cjs | head -1)
echo "✓ $PNAME"

# Check worker inlining (Emscripten 3.1.58+ feature)
if grep -q "new Worker.*new Blob" soffice.cjs || grep -q "createObjectURL(new Blob" soffice.cjs; then
    echo "✓ Pthread worker code inlined (Emscripten 3.1.58+)"
elif grep -q "pthreadMainJs=_scriptName" soffice.cjs; then
    echo "✓ Worker uses self-loading pattern"
else
    echo "INFO: Worker loading method unclear - check Emscripten version"
fi

echo ""
echo "=== File sizes ==="
ls -lh soffice.wasm soffice.data soffice.cjs

echo ""
echo "=== Distribution files ==="
echo "Required files for distribution (3 files total):"
echo "  - soffice.js (or soffice.cjs for Node.js)"
echo "  - soffice.wasm"
echo "  - soffice.data"
echo ""
echo "Note: With Emscripten 3.1.58+, pthread workers are inlined - no separate worker file needed."

echo ""
echo "=== Done! ==="


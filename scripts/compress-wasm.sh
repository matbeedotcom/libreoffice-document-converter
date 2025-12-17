#!/bin/bash
# Compress WASM files for deployment
# Run this after copying uncompressed WASM files to wasm/
#
# Usage:
#   ./scripts/compress-wasm.sh           # Compress files in ./wasm
#   ./scripts/compress-wasm.sh /path     # Compress files in specified directory

set -e

WASM_DIR="${1:-./wasm}"

echo "Compressing WASM files in ${WASM_DIR}..."

cd "${WASM_DIR}"

if [ -f "soffice.wasm" ] && [ ! -f "soffice.wasm.gz" ]; then
    echo "Compressing soffice.wasm..."
    gzip -9 -k soffice.wasm
    ORIG=$(stat -c %s soffice.wasm 2>/dev/null || stat -f %z soffice.wasm)
    COMP=$(stat -c %s soffice.wasm.gz 2>/dev/null || stat -f %z soffice.wasm.gz)
    echo "  Created soffice.wasm.gz ($(numfmt --to=iec $COMP 2>/dev/null || echo "${COMP} bytes"), $(($COMP * 100 / $ORIG))% of original)"
elif [ -f "soffice.wasm.gz" ]; then
    echo "soffice.wasm.gz already exists, skipping"
elif [ ! -f "soffice.wasm" ]; then
    echo "soffice.wasm not found in ${WASM_DIR}"
fi

if [ -f "soffice.data" ] && [ ! -f "soffice.data.gz" ]; then
    echo "Compressing soffice.data..."
    gzip -9 -k soffice.data
    ORIG=$(stat -c %s soffice.data 2>/dev/null || stat -f %z soffice.data)
    COMP=$(stat -c %s soffice.data.gz 2>/dev/null || stat -f %z soffice.data.gz)
    echo "  Created soffice.data.gz ($(numfmt --to=iec $COMP 2>/dev/null || echo "${COMP} bytes"), $(($COMP * 100 / $ORIG))% of original)"
elif [ -f "soffice.data.gz" ]; then
    echo "soffice.data.gz already exists, skipping"
elif [ ! -f "soffice.data" ]; then
    echo "soffice.data not found in ${WASM_DIR}"
fi

echo "Done!"
echo ""
echo "Files in ${WASM_DIR}:"
ls -lh *.wasm* *.data* 2>/dev/null || echo "No WASM files found"

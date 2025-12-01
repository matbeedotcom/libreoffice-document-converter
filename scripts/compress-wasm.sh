#!/bin/bash
# Compress WASM files for deployment

WASM_DIR=${1:-./wasm}

echo "=== Compressing WASM files for deployment ==="
echo ""

# Check original sizes
echo "Original sizes:"
ls -lh "$WASM_DIR/soffice.wasm" "$WASM_DIR/soffice.data" 2>/dev/null
echo ""

# Brotli (best compression)
if command -v brotli &> /dev/null; then
    echo "Creating Brotli compressed files (.br)..."
    brotli -9 -f "$WASM_DIR/soffice.wasm" -o "$WASM_DIR/soffice.wasm.br"
    brotli -9 -f "$WASM_DIR/soffice.data" -o "$WASM_DIR/soffice.data.br"
    brotli -9 -f "$WASM_DIR/soffice.cjs" -o "$WASM_DIR/soffice.cjs.br"
    echo "✓ Brotli compression complete"
else
    echo "⚠ brotli not installed - skipping (install with: apt install brotli)"
fi

# Gzip (wider compatibility)
echo "Creating Gzip compressed files (.gz)..."
gzip -9 -k -f "$WASM_DIR/soffice.wasm"
gzip -9 -k -f "$WASM_DIR/soffice.data"
gzip -9 -k -f "$WASM_DIR/soffice.cjs"
echo "✓ Gzip compression complete"

echo ""
echo "=== Compressed file sizes ==="
echo ""
echo "Brotli (.br) - Best compression:"
ls -lh "$WASM_DIR"/*.br 2>/dev/null || echo "  (not created)"
echo ""
echo "Gzip (.gz) - Wide compatibility:"
ls -lh "$WASM_DIR"/*.gz 2>/dev/null
echo ""

# Calculate totals
if [ -f "$WASM_DIR/soffice.wasm.br" ]; then
    WASM_BR=$(stat -c%s "$WASM_DIR/soffice.wasm.br")
    DATA_BR=$(stat -c%s "$WASM_DIR/soffice.data.br")
    TOTAL_BR=$((WASM_BR + DATA_BR))
    echo "Total with Brotli: $(numfmt --to=iec $TOTAL_BR)"
fi

WASM_GZ=$(stat -c%s "$WASM_DIR/soffice.wasm.gz")
DATA_GZ=$(stat -c%s "$WASM_DIR/soffice.data.gz")
TOTAL_GZ=$((WASM_GZ + DATA_GZ))
echo "Total with Gzip: $(numfmt --to=iec $TOTAL_GZ)"

echo ""
echo "=== Server Configuration ==="
echo ""
echo "For Nginx, add to your config:"
echo '  gzip_static on;'
echo '  brotli_static on;  # if using ngx_brotli module'
echo ""
echo "For Express.js:"
echo '  npm install compression shrink-ray-current'
echo '  app.use(require("shrink-ray-current")());'

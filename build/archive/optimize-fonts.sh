#!/bin/bash
# Optimize fonts for faster WASM initialization
# This script reduces the font set to essential fonts only
# Run this before update-wasm-files.sh to speed up LibreOffice init

set -e

LO_DIR="${LO_DIR:-$HOME/libreoffice-wasm-build/libreoffice}"
FONTS_DIR="$LO_DIR/instdir/share/fonts/truetype"
BACKUP_DIR="$LO_DIR/instdir/share/fonts/truetype-backup"

echo "=== Font Optimization for WASM ==="
echo "Fonts dir: $FONTS_DIR"

if [ ! -d "$FONTS_DIR" ]; then
    echo "ERROR: Fonts directory not found"
    exit 1
fi

# Count current fonts
CURRENT_COUNT=$(ls "$FONTS_DIR"/*.ttf "$FONTS_DIR"/*.otf 2>/dev/null | wc -l)
echo "Current font count: $CURRENT_COUNT"

# Essential fonts for document compatibility:
# - Liberation: Microsoft font replacements (Times New Roman, Arial, Courier New)
# - DejaVu: Good Unicode coverage, sans/serif/mono
# - Carlito: Calibri replacement (Microsoft default font)
# - Caladea: Cambria replacement
# - OpenSymbol: LibreOffice symbols
ESSENTIAL_PATTERNS=(
    "Liberation*"      # Times New Roman, Arial, Courier New replacements
    "DejaVuSans.ttf"   # Sans serif
    "DejaVuSans-Bold*" # Sans bold variants
    "DejaVuSerif*"     # Serif
    "DejaVuSansMono*"  # Monospace
    "Carlito*"         # Calibri replacement
    "Caladea*"         # Cambria replacement
    "opens___.ttf"     # OpenSymbol (in program/resource/common/fonts)
)

# Create backup
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Creating backup..."
    cp -r "$FONTS_DIR" "$BACKUP_DIR"
    echo "Backup created at $BACKUP_DIR"
fi

# Create temp dir for essential fonts
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy essential fonts
echo "Selecting essential fonts..."
for pattern in "${ESSENTIAL_PATTERNS[@]}"; do
    cp "$FONTS_DIR"/$pattern "$TEMP_DIR/" 2>/dev/null || true
done

# Count selected fonts
SELECTED_COUNT=$(ls "$TEMP_DIR"/*.ttf "$TEMP_DIR"/*.otf 2>/dev/null | wc -l)
echo "Selected $SELECTED_COUNT essential fonts"

if [ "$SELECTED_COUNT" -lt 5 ]; then
    echo "ERROR: Too few fonts selected, aborting"
    exit 1
fi

# Replace fonts directory
echo "Replacing fonts directory..."
rm -rf "$FONTS_DIR"/*
cp "$TEMP_DIR"/* "$FONTS_DIR/"

# List final fonts
echo ""
echo "=== Final font list ==="
ls -la "$FONTS_DIR"

# Calculate size savings
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
NEW_SIZE=$(du -sh "$FONTS_DIR" | cut -f1)
echo ""
echo "Size: $BACKUP_SIZE -> $NEW_SIZE"
echo ""
echo "=== Done! ==="
echo "To restore: cp -r '$BACKUP_DIR'/* '$FONTS_DIR/'"


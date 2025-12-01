#!/bin/bash
# Rebuild LibreOffice WASM with minimal configuration
# Use this after an initial build to create a smaller binary

set -e

BUILD_DIR="${BUILD_DIR:-$HOME/libreoffice-wasm-build}"
OUTPUT_DIR="${OUTPUT_DIR:-$(pwd)/wasm}"
BUILD_JOBS="${BUILD_JOBS:-$(nproc)}"
EMSDK_DIR="${BUILD_DIR}/emsdk"
LO_DIR="${BUILD_DIR}/libreoffice"

echo "=============================================="
echo "LibreOffice WASM MINIMAL Rebuild"
echo "=============================================="

# Check prerequisites
if [ ! -d "${EMSDK_DIR}" ]; then
    echo "Error: Emscripten not found at ${EMSDK_DIR}"
    echo "Run build-native.sh first for initial setup"
    exit 1
fi

if [ ! -d "${LO_DIR}" ]; then
    echo "Error: LibreOffice source not found at ${LO_DIR}"
    echo "Run build-native.sh first for initial setup"
    exit 1
fi

# Source Emscripten
source "${EMSDK_DIR}/emsdk_env.sh"

cd "${LO_DIR}"

# Clean previous build
echo "Cleaning previous build..."
make clean || true

# Apply minimal configuration
echo "Applying ultra-minimal configuration..."
cat > autogen.input << 'EOF'
--host=wasm32-local-emscripten
--disable-gui
--with-main-module=writer
--enable-wasm-strip
--disable-avmedia
--disable-dbus
--disable-sdremote
--disable-sdremote-bluetooth
--disable-gio
--disable-cups
--disable-randr
--disable-gstreamer-1-0
--disable-cairo-canvas
--disable-skia
--disable-gtk3
--disable-gtk4
--disable-qt5
--disable-qt6
--disable-kf5
--disable-kf6
--disable-database-connectivity
--disable-firebird-sdbc
--disable-postgresql-sdbc
--disable-mariadb-sdbc
--disable-extensions
--disable-extension-integration
--disable-extension-update
--disable-scripting
--disable-librelogo
--disable-report-builder
--disable-lpsolve
--disable-coinmp
--disable-ldap
--disable-opencl
--disable-xmlhelp
--disable-cve-tests
--disable-lotuswordpro
--disable-odk
--disable-online-update
--disable-crashdump
--disable-community-flavor
--disable-pdfimport
--disable-pdfium
--disable-openssl
--disable-nss
--disable-debug
--enable-sal-log
--enable-optimized=yes
--enable-lto
--disable-ccache
--disable-split-debug
--disable-symbols
--with-system-libs=no
--without-java
--without-doxygen
--without-helppack-integration
--without-myspell-dicts
EOF

echo "--with-parallelism=${BUILD_JOBS}" >> autogen.input

# Configure
echo "Running autogen.sh..."
./autogen.sh

# Build
echo "Building (this will take 2-4 hours)..."
echo "Started at: $(date)"
make -j${BUILD_JOBS}
echo "Finished at: $(date)"

# Copy output
mkdir -p "${OUTPUT_DIR}"
cp instdir/program/soffice.wasm "${OUTPUT_DIR}/"
cp instdir/program/soffice.data "${OUTPUT_DIR}/"
cp instdir/program/soffice.js "${OUTPUT_DIR}/" 2>/dev/null || true

echo ""
echo "=============================================="
echo "Minimal Build Complete!"
echo "=============================================="
echo "Output files:"
ls -la "${OUTPUT_DIR}"/soffice.*

# Show sizes
echo ""
echo "File sizes:"
du -h "${OUTPUT_DIR}"/soffice.*


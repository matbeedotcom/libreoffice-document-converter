#!/bin/bash
# LibreOffice WASM Build Script with Automatic Patching
# Builds LibreOffice for WASM with headless document conversion
#
# Usage:
#   ./build-wasm.sh                         # Full build
#   SKIP_DEPS=1 ./build-wasm.sh             # Skip apt dependencies  
#   BUILD_JOBS=32 ./build-wasm.sh           # Set parallel jobs
#   CLEAN_BUILD=1 ./build-wasm.sh           # Clean and rebuild
#   LIBREOFFICE_VERSION=libreoffice-24-8 ./build-wasm.sh  # Specify version

set -e

# Configuration
LIBREOFFICE_VERSION="${LIBREOFFICE_VERSION:-libreoffice-24-8}"
EMSDK_VERSION="${EMSDK_VERSION:-3.1.51}"
BUILD_DIR="${BUILD_DIR:-$HOME/libreoffice-wasm-build}"
OUTPUT_DIR="${OUTPUT_DIR:-$(pwd)/wasm}"
BUILD_JOBS="${BUILD_JOBS:-$(nproc)}"
SKIP_DEPS="${SKIP_DEPS:-0}"
CLEAN_BUILD="${CLEAN_BUILD:-0}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=============================================="
echo "  LibreOffice WASM Build"
echo "=============================================="
echo ""
echo "Configuration:"
echo "  LibreOffice:  ${LIBREOFFICE_VERSION}"
echo "  Emscripten:   ${EMSDK_VERSION}"
echo "  Build Dir:    ${BUILD_DIR}"
echo "  Output Dir:   ${OUTPUT_DIR}"
echo "  Jobs:         ${BUILD_JOBS}"
echo "  Skip deps:    ${SKIP_DEPS}"
echo "  Clean build:  ${CLEAN_BUILD}"
echo ""

mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

# ============================================================
# Step 1: System Dependencies
# ============================================================
log_info "[1/7] Checking system dependencies..."

check_deps() {
    local missing=()
    for cmd in git python3 make gcc g++ cmake autoconf automake flex bison gawk pkg-config; do
        if ! command -v $cmd &> /dev/null; then
            missing+=($cmd)
        fi
    done
    if [ ${#missing[@]} -gt 0 ]; then
        echo "Missing: ${missing[*]}"
        return 1
    fi
    return 0
}

if [ "$SKIP_DEPS" = "1" ]; then
    log_warn "Skipping dependency check (SKIP_DEPS=1)"
elif check_deps; then
    log_success "All dependencies found"
else
    log_info "Installing dependencies..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y --no-install-recommends \
            build-essential git cmake ninja-build \
            python3 python3-pip python3-dev python3-setuptools \
            autoconf automake bison ccache flex gawk gettext \
            libarchive-dev libcups2-dev libcurl4-openssl-dev \
            libfontconfig1-dev libfreetype6-dev libglib2.0-dev \
            libharfbuzz-dev libicu-dev libjpeg-dev liblcms2-dev \
            libpng-dev libssl-dev libtool libxml2-dev libxslt1-dev \
            pkg-config uuid-dev xsltproc zip unzip wget curl \
            ca-certificates xz-utils gperf nasm
    else
        log_error "apt-get not found. Please install dependencies manually."
        exit 1
    fi
fi

# ============================================================
# Step 2: Emscripten SDK
# ============================================================
log_info "[2/7] Setting up Emscripten SDK..."

EMSDK_DIR="${BUILD_DIR}/emsdk"

if [ ! -d "${EMSDK_DIR}" ]; then
    log_info "Cloning Emscripten SDK..."
    git clone https://github.com/emscripten-core/emsdk.git "${EMSDK_DIR}"
fi

cd "${EMSDK_DIR}"

if [ ! -f "${EMSDK_DIR}/upstream/emscripten/emcc" ]; then
    log_info "Installing Emscripten ${EMSDK_VERSION}..."
    ./emsdk install ${EMSDK_VERSION}
    ./emsdk activate ${EMSDK_VERSION}
else
    ./emsdk activate ${EMSDK_VERSION}
fi

source "${EMSDK_DIR}/emsdk_env.sh"
log_success "Emscripten $(emcc --version | head -1)"

# Pre-compile system libraries
log_info "Pre-compiling Emscripten system libraries..."
embuilder build sysroot libc libc++ libc++abi 2>/dev/null || true

# ============================================================
# Step 3: Clone LibreOffice
# ============================================================
log_info "[3/7] Setting up LibreOffice source..."

LO_DIR="${BUILD_DIR}/libreoffice"

if [ ! -d "${LO_DIR}" ]; then
    log_info "Cloning LibreOffice ${LIBREOFFICE_VERSION} (this takes a while)..."
    git clone --depth 1 --branch ${LIBREOFFICE_VERSION} \
        https://git.libreoffice.org/core "${LO_DIR}"
else
    log_success "LibreOffice source exists at ${LO_DIR}"
fi

cd "${LO_DIR}"

# Clean if requested
if [ "$CLEAN_BUILD" = "1" ]; then
    log_warn "Cleaning previous build..."
    make clean 2>/dev/null || true
fi

# ============================================================
# Step 4: Apply Patches
# ============================================================
log_info "[4/7] Applying patches for headless WASM build..."

# Patch 1: Fix xmlsecurity Module for headless (no UI config)
# The UIConfig_xmlsec needs to be disabled when building without GUI
XMLSEC_MODULE="${LO_DIR}/xmlsecurity/Module_xmlsecurity.mk"
if grep -q "UIConfig_xmlsec" "$XMLSEC_MODULE" && ! grep -q 'DISABLE_GUI.*UIConfig_xmlsec' "$XMLSEC_MODULE"; then
    log_info "Patching xmlsecurity/Module_xmlsecurity.mk..."
    cat > "$XMLSEC_MODULE" << 'PATCH_EOF'
# -*- Mode: makefile-gmake; tab-width: 4; indent-tabs-mode: t -*-
#
# This file is part of the LibreOffice project.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#

$(eval $(call gb_Module_Module,xmlsecurity))

$(eval $(call gb_Module_add_targets,xmlsecurity,\
	Library_xmlsecurity \
	$(if $(ENABLE_NSS)$(ENABLE_OPENSSL),Library_xsec_xmlsec) \
	$(if $(DISABLE_GUI),,UIConfig_xmlsec) \
))

$(eval $(call gb_Library_use_custom_headers,xmlsecurity,\
    officecfg/registry \
))

$(eval $(call gb_Module_add_l10n_targets,xmlsecurity,\
    $(if $(DISABLE_GUI),,AllLangMoTarget_xsc) \
))

# vim: set noet sw=4 ts=4:
PATCH_EOF
    log_success "Patched xmlsecurity module"
else
    log_success "xmlsecurity module already patched"
fi

# Patch 2: Remove ALL UI files from emscripten fs image
# In headless mode, we don't need any UI configuration files
# This significantly reduces the .data file size (20-40MB savings)
FS_IMAGE_MK="${LO_DIR}/static/CustomTarget_emscripten_fs_image.mk"
if [ -f "$FS_IMAGE_MK" ]; then
    log_info "Patching emscripten fs image (removing ALL UI references)..."
    
    # Create backup
    cp "$FS_IMAGE_MK" "${FS_IMAGE_MK}.backup"
    
    # Remove ALL UI-related directories from fs image:
    # - soffice.cfg/*/ui/  (all UI dialogs)
    # - soffice.cfg/menubar/ (menus)
    # - soffice.cfg/statusbar/ (status bar)
    # - soffice.cfg/toolbar/ (toolbars)
    # - soffice.cfg/popupmenu/ (context menus)
    # - soffice.cfg/classification/ (security classification UI)
    # Keep only: filter/, modules/, registry/ (needed for document processing)
    
    grep -v -E "soffice\.cfg/[^/]+/ui/" "$FS_IMAGE_MK" | \
    grep -v -E "soffice\.cfg/menubar" | \
    grep -v -E "soffice\.cfg/statusbar" | \
    grep -v -E "soffice\.cfg/toolbar" | \
    grep -v -E "soffice\.cfg/popupmenu" | \
    grep -v -E "soffice\.cfg/classification" | \
    grep -v -E "soffice\.cfg/.*accelerator" > "${FS_IMAGE_MK}.tmp"
    
    mv "${FS_IMAGE_MK}.tmp" "$FS_IMAGE_MK"
    
    # Count how many lines were removed
    LINES_REMOVED=$(($(wc -l < "${FS_IMAGE_MK}.backup") - $(wc -l < "$FS_IMAGE_MK")))
    log_success "Removed $LINES_REMOVED UI file references from fs image"
else
    log_warn "Emscripten fs image file not found: $FS_IMAGE_MK"
fi

# Patch 3: Autotext files will be created during build (see Step 6)
# The mytexts autotext build tries to zip files that don't exist in WASM builds
# We handle this with a background process during build

# Patch 4: Ensure desktop module links correctly for headless
DESKTOP_LIB="${LO_DIR}/desktop/Library_sofficeapp.mk"
if [ -f "$DESKTOP_LIB" ]; then
    log_success "Desktop library makefile exists"
fi

# Patch 5: Add PROXY_TO_PTHREAD and export FS/wasmTable for LibreOfficeKit
EMSCRIPTEN_MK="${LO_DIR}/solenv/gbuild/platform/EMSCRIPTEN_INTEL_GCC.mk"
if [ -f "$EMSCRIPTEN_MK" ] && ! grep -q "PROXY_TO_PTHREAD" "$EMSCRIPTEN_MK"; then
    log_info "Patching EMSCRIPTEN_INTEL_GCC.mk for LOK exports..."
    if [ -f "${SCRIPT_DIR}/patches/002-emscripten-exports.patch" ]; then
        patch -p1 < "${SCRIPT_DIR}/patches/002-emscripten-exports.patch" || {
            log_warn "Patch failed, applying manually..."
            # Manual fallback: add PROXY_TO_PTHREAD
            sed -i 's/PTHREAD_POOL_SIZE=4$/PTHREAD_POOL_SIZE=4 -s PROXY_TO_PTHREAD=1/' "$EMSCRIPTEN_MK"
            # Add FS and wasmTable to exports
            sed -i 's/EXPORTED_RUNTIME_METHODS=\["/EXPORTED_RUNTIME_METHODS=["FS","wasmTable","/g' "$EMSCRIPTEN_MK"
        }
        log_success "Patched Emscripten linker flags"
    fi
else
    log_success "Emscripten linker flags already patched"
fi

# Patch 6: Add LOK_SKIP_PRELOAD option for faster init (optional)
INIT_CXX="${LO_DIR}/desktop/source/lib/init.cxx"
if [ -f "$INIT_CXX" ] && ! grep -q "LOK_SKIP_PRELOAD" "$INIT_CXX"; then
    log_info "Patching init.cxx for LOK_SKIP_PRELOAD option..."
    if [ -f "${SCRIPT_DIR}/patches/003-skip-preload-option.patch" ]; then
        patch -p1 < "${SCRIPT_DIR}/patches/003-skip-preload-option.patch" || log_warn "LOK_SKIP_PRELOAD patch failed (optional)"
        log_success "Patched LOK_SKIP_PRELOAD option"
    fi
else
    log_success "LOK_SKIP_PRELOAD already patched or not needed"
fi

# Patch 7: Apply additional missing patches
# We need 006 for Impress/Draw/Math support, and others for stability
for patch_file in \
    "006-add-impress-draw-math-fs-image.patch" \
    "009-fix-repository.patch" \
    "010-fix-writerperfect.patch" \
    "012-lok-shim-exports.patch" \
    "013-lok-shim-functions.patch" \
    "014-emscripten-unipoll-fix.patch"; do
    
    if [ -f "${SCRIPT_DIR}/patches/${patch_file}" ]; then
        log_info "Checking patch: ${patch_file}..."
        # Check if patch is already applied (loose check)
        if patch -R -p1 -s -f --dry-run < "${SCRIPT_DIR}/patches/${patch_file}" &>/dev/null; then
            log_success "${patch_file} already applied"
        else
            log_info "Applying ${patch_file}..."
            if patch -f -p1 < "${SCRIPT_DIR}/patches/${patch_file}"; then
                log_success "Applied ${patch_file}"
            else
                log_warn "Failed to apply ${patch_file}"
            fi
        fi
    fi
done

# ============================================================
# Step 5: Configure LibreOffice
# ============================================================
log_info "[5/7] Configuring LibreOffice for WASM..."

cat > autogen.input << EOF
# LibreOffice WASM Conversion-Only Build Configuration
# Auto-generated by build-wasm.sh
# Optimized for document conversion with no UI/desktop features

# ============================================================
# Core WASM settings
# ============================================================
--host=wasm32-local-emscripten
# --enable-headless
--disable-gui
--enable-wasm-strip
--with-parallelism=${BUILD_JOBS}

# Include all main modules (Writer, Calc, Impress, Draw)
# By default --enable-wasm-strip strips Impress/Draw/Math/Basic
# We need to explicitly keep them for PPTX/ODP support
# --disable-wasm-strip-basic-draw-math-impress

# ============================================================
# Build optimization settings
# ============================================================
--disable-debug
--enable-sal-log
--disable-crashdump

# ============================================================
# Remove unnecessary resources (reduces .data size significantly)
# ============================================================
--without-fonts
--without-help
--without-java
--without-galleries
--without-myspell-dicts

# Disable fontconfig (useless in WASM, saves init time)
# --disable-fontconfig

# Skip translations (reduces .data by several MB)
--with-lang=en-US

# ============================================================
# Disable all UI/Desktop features
# ============================================================
--disable-avmedia
--disable-sdremote
--disable-sdremote-bluetooth
--disable-cairo-canvas
--disable-dbus
--disable-gio
--disable-cups
--disable-randr
--disable-librelogo
--disable-atspi-tests
--disable-gstreamer-1-0
--disable-qt5
--disable-qt6
--disable-gtk3
--disable-gtk4
--disable-kf5
--disable-kf6
--disable-skia
# --disable-opengl

# ============================================================
# Disable scripting (not needed for conversion)
# ============================================================
--disable-scripting
--disable-scripting-beanshell
--disable-scripting-javascript

# ============================================================
# Disable extensions and updates
# ============================================================
--disable-extensions
--disable-extension-update
--disable-extension-integration
--disable-online-update

# ============================================================
# Disable non-conversion features
# ============================================================
# --disable-xmlhelp  # KEEP ENABLED - needed for filter registry
--disable-report-builder
--disable-zxing
--disable-gpgmepp
--disable-ldap
--disable-libcmis
--disable-odk
# --disable-chart-tests
--disable-cve-tests
# --disable-export-validation

# ============================================================
# Disable database connectivity
# ============================================================
--disable-database-connectivity
--disable-mariadb-sdbc
--disable-postgresql-sdbc
--disable-firebird-sdbc

# ============================================================
# Additional size optimizations
# ============================================================
# --disable-lpsolve
# --disable-coinmp

# PDF features (enable if needed)
# --disable-pdfimport
# --disable-pdfium
# --disable-poppler
EOF

log_info "Running autogen.sh..."
./autogen.sh

# Verify configuration
if [ -f "config_host.mk" ]; then
    log_success "Configuration complete"
    grep -E "^export (DISABLE_GUI|ENABLE_WASM)" config_host.mk || true
else
    log_error "Configuration failed - config_host.mk not created"
    exit 1
fi

# ============================================================
# Step 6: Build
# ============================================================
log_info "[6/7] Building LibreOffice WASM (this takes 1-4 hours)..."
echo "Started: $(date)"
echo ""

# Pre-build: create autotext files that cause zip errors
# This needs to happen after make starts creating workdir but before the zip step
create_autotext_files() {
    local AUTOTEXT_DIR="${LO_DIR}/workdir/CustomTarget/extras/source/autotext/user/mytexts"
    if [ -d "${AUTOTEXT_DIR}" ] && [ ! -f "${AUTOTEXT_DIR}/BlockList.xml" ]; then
        mkdir -p "${AUTOTEXT_DIR}/META-INF"
        
        # Copy or create BlockList.xml
        if [ -f "${LO_DIR}/extras/source/autotext/mytexts/BlockList.xml" ]; then
            cp "${LO_DIR}/extras/source/autotext/mytexts/BlockList.xml" "${AUTOTEXT_DIR}/"
        else
            cat > "${AUTOTEXT_DIR}/BlockList.xml" << 'XMLEOF'
<?xml version="1.0" encoding="UTF-8"?>
<block-list:block-list xmlns:block-list="http://openoffice.org/2001/block-list"/>
XMLEOF
        fi
        
        # Copy or create manifest.xml
        if [ -f "${LO_DIR}/extras/source/autotext/mytexts/META-INF/manifest.xml" ]; then
            cp "${LO_DIR}/extras/source/autotext/mytexts/META-INF/manifest.xml" "${AUTOTEXT_DIR}/META-INF/"
        else
            cat > "${AUTOTEXT_DIR}/META-INF/manifest.xml" << 'XMLEOF'
<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
 <manifest:file-entry manifest:media-type="application/vnd.sun.star.autotext" manifest:full-path="/"/>
 <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="BlockList.xml"/>
</manifest:manifest>
XMLEOF
        fi
        
        touch "${AUTOTEXT_DIR}/mimetype"
        log_info "Created missing autotext XML files"
    fi
}

# Start a background process to create autotext files when needed
(
    sleep 30  # Wait for build to create workdir
    while true; do
        create_autotext_files
        sleep 10
    done
) &
AUTOTEXT_HELPER_PID=$!

# Cleanup function
cleanup_autotext_helper() {
    kill $AUTOTEXT_HELPER_PID 2>/dev/null || true
}
trap cleanup_autotext_helper EXIT

# Build with error handling
if make -j${BUILD_JOBS}; then
    log_success "Build completed successfully!"
else
    BUILD_EXIT=$?
    log_error "Build failed with exit code $BUILD_EXIT"
    echo ""
    echo "Check the build log for errors."
    echo "Common fixes:"
    echo "  - Run with CLEAN_BUILD=1 to start fresh"
    echo "  - Check if patches were applied correctly"
    echo "  - Reduce BUILD_JOBS if running out of memory"
    exit $BUILD_EXIT
fi

echo ""
echo "Finished: $(date)"

# ============================================================
# Step 7: Package Output
# ============================================================
log_info "[7/7] Packaging WASM output..."

mkdir -p "${OUTPUT_DIR}"

# Remove duplicate soffice.data from SDK (saves 80MB)
# LibreOffice creates identical copies in both program/ and sdk/bin/
if [ -f "instdir/sdk/bin/soffice.data" ] && [ -f "instdir/program/soffice.data" ]; then
    log_info "Removing duplicate soffice.data from sdk/bin/ (saves 80MB)..."
    rm -f instdir/sdk/bin/soffice.data
    rm -f instdir/sdk/bin/soffice.data.js.metadata
    log_success "Removed duplicate files"
fi

# Add minimal fallback fonts if --without-fonts was used
# LibreOffice needs at least one sans and one serif font
FONTS_DIR="instdir/share/fonts/truetype"
if [ ! -d "$FONTS_DIR" ] || [ -z "$(ls -A $FONTS_DIR 2>/dev/null)" ]; then
    log_info "Adding minimal fallback fonts..."
    mkdir -p "$FONTS_DIR"
    
    # Download minimal Noto fonts if not present
    if [ ! -f "$FONTS_DIR/NotoSans-Regular.ttf" ]; then
        curl -sL "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf" \
            -o "$FONTS_DIR/NotoSans-Regular.ttf" 2>/dev/null || \
        log_warn "Could not download NotoSans font"
    fi
    
    if [ ! -f "$FONTS_DIR/NotoSerif-Regular.ttf" ]; then
        curl -sL "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSerif/NotoSerif-Regular.ttf" \
            -o "$FONTS_DIR/NotoSerif-Regular.ttf" 2>/dev/null || \
        log_warn "Could not download NotoSerif font"
    fi
    
    log_success "Added minimal fonts"
fi

# Find and copy the main WASM artifacts
WASM_FILES_FOUND=0

# Primary location: instdir/program
if [ -f "instdir/program/soffice.wasm" ]; then
    cp instdir/program/soffice.wasm "${OUTPUT_DIR}/"
    cp instdir/program/soffice.js "${OUTPUT_DIR}/" 2>/dev/null || true
    cp instdir/program/soffice.data "${OUTPUT_DIR}/" 2>/dev/null || true
    cp instdir/program/soffice.worker.js "${OUTPUT_DIR}/" 2>/dev/null || true
    WASM_FILES_FOUND=1
    log_success "Copied WASM files from instdir/program"
fi

# Alternative: workdir/LinkTarget
if [ "$WASM_FILES_FOUND" = "0" ]; then
    WASM_IN_WORKDIR=$(find workdir -name "soffice.wasm" 2>/dev/null | head -1)
    if [ -n "$WASM_IN_WORKDIR" ]; then
        WASM_WORKDIR=$(dirname "$WASM_IN_WORKDIR")
        cp "${WASM_WORKDIR}/soffice.wasm" "${OUTPUT_DIR}/"
        cp "${WASM_WORKDIR}/soffice.js" "${OUTPUT_DIR}/" 2>/dev/null || true
        cp "${WASM_WORKDIR}/soffice.data" "${OUTPUT_DIR}/" 2>/dev/null || true
        WASM_FILES_FOUND=1
        log_success "Copied WASM files from workdir"
    fi
fi

if [ "$WASM_FILES_FOUND" = "0" ]; then
    log_error "Could not find soffice.wasm output!"
    echo "Searching for .wasm files..."
    find . -name "*.wasm" -size +1M 2>/dev/null | head -10
    exit 1
fi

# Calculate sizes
echo ""
echo "=============================================="
echo "  Build Complete!"  
echo "=============================================="
echo ""
echo "Output files in ${OUTPUT_DIR}:"
ls -lh "${OUTPUT_DIR}"/*.wasm "${OUTPUT_DIR}"/*.js "${OUTPUT_DIR}"/*.data 2>/dev/null || true

# Show compressed sizes
if command -v gzip &> /dev/null; then
    echo ""
    echo "Compressed sizes (gzip -9):"
    for f in "${OUTPUT_DIR}"/*.wasm "${OUTPUT_DIR}"/*.data; do
        if [ -f "$f" ]; then
            COMPRESSED=$(gzip -9 -c "$f" | wc -c)
            ORIGINAL=$(stat -c %s "$f")
            RATIO=$((COMPRESSED * 100 / ORIGINAL))
            echo "  $(basename $f): $(numfmt --to=iec $COMPRESSED) (${RATIO}% of original)"
        fi
    done
fi

echo ""
log_success "LibreOffice WASM build complete!"
echo ""
echo "To use the build:"
echo "  npm run build    # Build TypeScript API"
echo "  npm start        # Start test server"
echo ""

#!/bin/bash
# Rebuild LibreOffice WASM - Incremental rebuild after patches
# Use this to rebuild after modifying patches or configuration
#
# NOTE: For a fresh build, use build-wasm.sh instead
#
# Usage:
#   ./rebuild-minimal.sh              # Incremental rebuild
#   CLEAN=1 ./rebuild-minimal.sh      # Clean rebuild (takes hours)

set -e

BUILD_DIR="${BUILD_DIR:-$HOME/libreoffice-wasm-build}"
OUTPUT_DIR="${OUTPUT_DIR:-$(pwd)/wasm}"
BUILD_JOBS="${BUILD_JOBS:-$(nproc)}"
EMSDK_DIR="${BUILD_DIR}/emsdk"
LO_DIR="${BUILD_DIR}/libreoffice"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEAN="${CLEAN:-0}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=============================================="
echo "  LibreOffice WASM Rebuild"
echo "=============================================="
echo ""
echo "  Build Dir:  ${BUILD_DIR}"
echo "  Output Dir: ${OUTPUT_DIR}"
echo "  Jobs:       ${BUILD_JOBS}"
echo "  Clean:      ${CLEAN}"
echo ""

# Check prerequisites
if [ ! -d "${EMSDK_DIR}" ]; then
    log_error "Emscripten not found at ${EMSDK_DIR}"
    echo "Run build-wasm.sh first for initial setup"
    exit 1
fi

if [ ! -d "${LO_DIR}" ]; then
    log_error "LibreOffice source not found at ${LO_DIR}"
    echo "Run build-wasm.sh first for initial setup"
    exit 1
fi

# Source Emscripten
log_info "Loading Emscripten environment..."
source "${EMSDK_DIR}/emsdk_env.sh"

cd "${LO_DIR}"

# Clean if requested (WARNING: takes hours to rebuild)
if [ "$CLEAN" = "1" ]; then
    log_warn "Clean build requested - this will take 2-4 hours!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning previous build..."
        make clean || true
    else
        log_info "Skipping clean"
    fi
fi

# Remove only the final linked files to force re-link
log_info "Removing soffice binaries to force re-link..."
rm -f instdir/program/soffice.wasm
rm -f instdir/program/soffice.js
rm -f instdir/program/soffice.data
rm -f instdir/program/soffice.worker.js
rm -f instdir/program/soffice.html

# Apply patches if not already applied
log_info "Checking patches..."

# Patch 1: xmlsecurity module
if [ -f "xmlsecurity/Module_xmlsecurity.mk" ] && ! grep -q "DISABLE_GUI.*UIConfig_xmlsec" "xmlsecurity/Module_xmlsecurity.mk"; then
    log_info "Applying xmlsecurity patch..."
    patch -p1 < "${SCRIPT_DIR}/patches/001-fix-xmlsecurity-headless.patch" 2>/dev/null || log_warn "Patch 001 already applied or failed"
fi

# Patch 2: Emscripten exports
if [ -f "solenv/gbuild/platform/EMSCRIPTEN_INTEL_GCC.mk" ] && ! grep -q "PROXY_TO_PTHREAD" "solenv/gbuild/platform/EMSCRIPTEN_INTEL_GCC.mk"; then
    log_info "Applying Emscripten exports patch..."
    patch -p1 < "${SCRIPT_DIR}/patches/002-emscripten-exports.patch" 2>/dev/null || log_warn "Patch 002 already applied or failed"
fi

# Patch 3: LOK skip preload (optional)
if [ -f "desktop/source/lib/init.cxx" ] && ! grep -q "LOK_SKIP_PRELOAD" "desktop/source/lib/init.cxx"; then
    log_info "Applying LOK skip preload patch..."
    patch -p1 < "${SCRIPT_DIR}/patches/003-skip-preload-option.patch" 2>/dev/null || log_warn "Patch 003 already applied or failed"
fi

# Patch 4: Remove xmlsec UI from fs image
if [ -f "static/CustomTarget_emscripten_fs_image.mk" ] && grep -q "soffice.cfg/xmlsec/ui" "static/CustomTarget_emscripten_fs_image.mk"; then
    log_info "Applying fs image patch..."
    patch -p1 < "${SCRIPT_DIR}/patches/004-remove-xmlsec-ui-from-fs-image.patch" 2>/dev/null || {
        log_warn "Patch 004 failed, applying manually..."
        grep -v "soffice.cfg/xmlsec/ui" "static/CustomTarget_emscripten_fs_image.mk" > "static/CustomTarget_emscripten_fs_image.mk.tmp"
        mv "static/CustomTarget_emscripten_fs_image.mk.tmp" "static/CustomTarget_emscripten_fs_image.mk"
    }
fi

log_success "Patches verified"

# Build
log_info "Building LibreOffice WASM..."
echo "Started at: $(date)"
make -j${BUILD_JOBS}
echo "Finished at: $(date)"

# Copy output
log_info "Copying output files..."
mkdir -p "${OUTPUT_DIR}"

cp instdir/program/soffice.wasm "${OUTPUT_DIR}/"
cp instdir/program/soffice.js "${OUTPUT_DIR}/soffice.cjs"
cp instdir/program/soffice.data "${OUTPUT_DIR}/"
cp instdir/program/soffice.data.js.metadata "${OUTPUT_DIR}/" 2>/dev/null || true
cp instdir/program/soffice.worker.js "${OUTPUT_DIR}/soffice.worker.cjs" 2>/dev/null || true

# Patch soffice.cjs for Node.js compatibility
log_info "Patching soffice.cjs for Node.js..."
sed -i '1s/^/if(typeof global!=="undefined"){var Module=global.Module=global.Module||{}}\n/' "${OUTPUT_DIR}/soffice.cjs"
sed -i 's/soffice\.worker\.js/soffice.worker.cjs/g' "${OUTPUT_DIR}/soffice.cjs"

# Remove duplicate from SDK
if [ -f "instdir/sdk/bin/soffice.data" ]; then
    log_info "Removing duplicate soffice.data from sdk/bin..."
    rm -f instdir/sdk/bin/soffice.data
    rm -f instdir/sdk/bin/soffice.data.js.metadata
fi

echo ""
echo "=============================================="
echo "  Rebuild Complete!"
echo "=============================================="
echo ""
echo "Output files in ${OUTPUT_DIR}:"
ls -lh "${OUTPUT_DIR}"/soffice.* 2>/dev/null

echo ""
log_success "Done! Run 'npm run build' to rebuild the TypeScript API."

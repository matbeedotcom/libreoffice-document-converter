#!/bin/bash
# LibreOffice WASM Native Build Script
# Run this on a Linux system without Docker
#
# Requirements:
# - Ubuntu 22.04/24.04 or similar
# - At least 16GB RAM
# - At least 50GB free disk space
# - Several hours of build time
#
# Usage:
#   ./build-native.sh                    # Full build with dependency check
#   SKIP_DEPS=1 ./build-native.sh        # Skip apt-get (if deps already installed)
#   BUILD_JOBS=8 ./build-native.sh       # Override job count

set -e

# Configuration
LIBREOFFICE_VERSION="${LIBREOFFICE_VERSION:-libreoffice-24-8}"
EMSDK_VERSION="${EMSDK_VERSION:-3.1.51}"
BUILD_DIR="${BUILD_DIR:-$HOME/libreoffice-wasm-build}"
OUTPUT_DIR="${OUTPUT_DIR:-$(pwd)/wasm}"
BUILD_JOBS="${BUILD_JOBS:-$(nproc)}"
SKIP_DEPS="${SKIP_DEPS:-0}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=============================================="
echo "LibreOffice WASM Native Build"
echo "=============================================="
echo ""
echo "Configuration:"
echo "  LibreOffice: ${LIBREOFFICE_VERSION}"
echo "  Emscripten:  ${EMSDK_VERSION}"
echo "  Build Dir:   ${BUILD_DIR}"
echo "  Output Dir:  ${OUTPUT_DIR}"
echo "  Jobs:        ${BUILD_JOBS}"
echo "  Skip deps:   ${SKIP_DEPS}"
echo ""

# Create build directory
mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

# ============================================================
# Step 1: Check/Install system dependencies
# ============================================================
echo "[1/6] Checking system dependencies..."

check_deps() {
    local missing=()
    for cmd in git python3 make gcc g++ cmake autoconf automake flex bison gawk pkg-config; do
        if ! command -v $cmd &> /dev/null; then
            missing+=($cmd)
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        echo "Missing commands: ${missing[*]}"
        return 1
    fi
    return 0
}

if [ "$SKIP_DEPS" = "1" ]; then
    echo "Skipping dependency installation (SKIP_DEPS=1)"
elif check_deps; then
    echo "All basic dependencies found"
else
    echo "Installing dependencies requires sudo..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y --no-install-recommends \
            build-essential \
            git \
            cmake \
            ninja-build \
            python3 \
            python3-pip \
            python3-dev \
            python3-setuptools \
            autoconf \
            automake \
            bison \
            ccache \
            flex \
            gawk \
            gettext \
            libarchive-dev \
            libcups2-dev \
            libcurl4-openssl-dev \
            libfontconfig1-dev \
            libfreetype6-dev \
            libglib2.0-dev \
            libharfbuzz-dev \
            libicu-dev \
            libjpeg-dev \
            liblcms2-dev \
            libpng-dev \
            libssl-dev \
            libtool \
            libxml2-dev \
            libxslt1-dev \
            pkg-config \
            uuid-dev \
            xsltproc \
            zip \
            unzip \
            wget \
            curl \
            ca-certificates \
            xz-utils \
            gperf \
            nasm
    else
        echo "Error: apt-get not found and dependencies missing."
        echo "Please install: git python3 make gcc g++ cmake autoconf automake flex bison gawk"
        exit 1
    fi
fi

# ============================================================
# Step 2: Install Emscripten
# ============================================================
echo ""
echo "[2/6] Setting up Emscripten SDK..."

EMSDK_DIR="${BUILD_DIR}/emsdk"

if [ ! -d "${EMSDK_DIR}" ]; then
    echo "Cloning Emscripten SDK..."
    git clone https://github.com/emscripten-core/emsdk.git "${EMSDK_DIR}"
fi

cd "${EMSDK_DIR}"

if [ ! -f "${EMSDK_DIR}/upstream/emscripten/emcc" ]; then
    echo "Installing Emscripten ${EMSDK_VERSION}..."
    ./emsdk install ${EMSDK_VERSION}
    ./emsdk activate ${EMSDK_VERSION}
else
    echo "Emscripten already installed, activating..."
    ./emsdk activate ${EMSDK_VERSION}
fi

# Source Emscripten environment
source "${EMSDK_DIR}/emsdk_env.sh"

echo "Emscripten version:"
emcc --version

# Pre-compile system libraries
echo "Pre-compiling Emscripten system libraries..."
embuilder build sysroot libc libc++ libc++abi 2>/dev/null || echo "Some libs may already exist"

# ============================================================
# Step 3: Clone LibreOffice
# ============================================================
echo ""
echo "[3/6] Cloning LibreOffice source..."

LO_DIR="${BUILD_DIR}/libreoffice"

if [ ! -d "${LO_DIR}" ]; then
    echo "Cloning LibreOffice ${LIBREOFFICE_VERSION}..."
    echo "This may take a while..."
    git clone --depth 1 --branch ${LIBREOFFICE_VERSION} \
        https://git.libreoffice.org/core "${LO_DIR}"
else
    echo "LibreOffice source already exists at ${LO_DIR}"
fi

cd "${LO_DIR}"

# ============================================================
# Step 4: Configure LibreOffice for WASM
# ============================================================
echo ""
echo "[4/6] Configuring LibreOffice for WASM build..."

# Write autogen.input with options from static/README.wasm.md
# for headless WASM build (no Qt, no GUI)
cat > autogen.input << EOF
# LibreOffice WASM Headless Build
# Based on static/README.wasm.md

--disable-debug
--enable-sal-log
--disable-crashdump
--host=wasm32-local-emscripten
--disable-gui
--with-main-module=writer
--with-parallelism=${BUILD_JOBS}
EOF

echo "Running autogen.sh..."
./autogen.sh

# ============================================================
# Step 5: Build LibreOffice
# ============================================================
echo ""
echo "[5/6] Building LibreOffice WASM..."
echo "This will take 2-4 hours depending on your hardware."
echo "Build started at: $(date)"
echo ""

make -j${BUILD_JOBS}

echo ""
echo "Build finished at: $(date)"

# ============================================================
# Step 6: Package output
# ============================================================
echo ""
echo "[6/6] Packaging WASM output..."

mkdir -p "${OUTPUT_DIR}"

# Copy WASM files - the headless build produces soffice.wasm and soffice.data
if [ -d "instdir/program" ]; then
    cp instdir/program/soffice.wasm "${OUTPUT_DIR}/" 2>/dev/null || true
    cp instdir/program/soffice.js "${OUTPUT_DIR}/" 2>/dev/null || true
    cp instdir/program/soffice.data "${OUTPUT_DIR}/" 2>/dev/null || true
    cp instdir/program/soffice.worker.js "${OUTPUT_DIR}/" 2>/dev/null || true
    echo "Copied files from instdir/program"
fi

# Copy any additional WASM artifacts
find workdir -name "*.wasm" -exec cp {} "${OUTPUT_DIR}/" \; 2>/dev/null || true

echo ""
echo "=============================================="
echo "Build Complete!"
echo "=============================================="
echo ""
echo "WASM files are in: ${OUTPUT_DIR}"
if [ -d "${OUTPUT_DIR}" ]; then
    ls -la "${OUTPUT_DIR}" 2>/dev/null || echo "(empty or not accessible)"
fi
echo ""
echo "Note: The soffice.data file contains the in-memory filesystem"
echo "needed by LibreOffice at runtime."

# Building LibreOffice WASM

This document provides detailed instructions for building LibreOffice as a WebAssembly module for document conversion.

## Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Quick Build](#quick-build)
- [Manual Build Steps](#manual-build-steps)
- [Build Configuration](#build-configuration)
- [Troubleshooting Build Issues](#troubleshooting-build-issues)
- [Customizing the Build](#customizing-the-build)

---

## Overview

The build process compiles LibreOffice Core to WebAssembly using Emscripten. This creates a headless document conversion engine that runs in Node.js and browsers without any native dependencies.

**Build Pipeline:**
1. Install system dependencies
2. Set up Emscripten SDK
3. Clone LibreOffice source
4. Apply patches for headless WASM build
5. Configure with `autogen.sh`
6. Build with `make`
7. Package output files

---

## System Requirements

### Hardware

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 16GB | 32GB |
| Disk Space | 30GB | 50GB |
| CPU Cores | 4 | 16-32 |
| Build Time | 4+ hours | 1-2 hours |

### Operating System

- **Recommended:** Ubuntu 22.04 LTS, Debian 12
- **Supported:** Any Linux with apt package manager
- **WSL2:** Fully supported on Windows

### Dependencies

The following packages are required:

```bash
# Build essentials
build-essential git cmake ninja-build

# Python (for build system)
python3 python3-pip python3-dev python3-setuptools

# Build tools
autoconf automake bison ccache flex gawk gettext libtool pkg-config

# Libraries
libarchive-dev libcups2-dev libcurl4-openssl-dev
libfontconfig1-dev libfreetype6-dev libglib2.0-dev
libharfbuzz-dev libicu-dev libjpeg-dev liblcms2-dev
libpng-dev libssl-dev libxml2-dev libxslt1-dev

# Utilities
uuid-dev xsltproc zip unzip wget curl ca-certificates xz-utils gperf nasm
```

---

## Quick Build

The automated build script handles everything:

```bash
# Basic build (uses all CPU cores)
./build/build-wasm.sh

# With 32 cores
BUILD_JOBS=32 ./build/build-wasm.sh

# Skip dependency installation (if already installed)
SKIP_DEPS=1 BUILD_JOBS=32 ./build/build-wasm.sh

# Clean build (removes previous build artifacts)
CLEAN_BUILD=1 ./build/build-wasm.sh
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BUILD_JOBS` | `$(nproc)` | Parallel compilation jobs |
| `BUILD_DIR` | `~/libreoffice-wasm-build` | Build directory |
| `OUTPUT_DIR` | `./wasm` | Output directory |
| `LIBREOFFICE_VERSION` | `libreoffice-24-8` | Git branch to build |
| `EMSDK_VERSION` | `3.1.51` | Emscripten version |
| `SKIP_DEPS` | `0` | Skip apt install |
| `CLEAN_BUILD` | `0` | Clean before building |

---

## Manual Build Steps

### Step 1: Install Dependencies

```bash
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
```

### Step 2: Set Up Emscripten

```bash
# Create build directory
mkdir -p ~/libreoffice-wasm-build
cd ~/libreoffice-wasm-build

# Clone Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install and activate version 3.1.51
./emsdk install 3.1.51
./emsdk activate 3.1.51

# Set up environment (do this in every new terminal)
source ./emsdk_env.sh

# Verify installation
emcc --version
```

### Step 3: Clone LibreOffice

```bash
cd ~/libreoffice-wasm-build

# Clone LibreOffice 24.8 branch (shallow clone for speed)
git clone --depth 1 --branch libreoffice-24-8 \
    https://git.libreoffice.org/core libreoffice

cd libreoffice
```

### Step 4: Apply Patches

Several patches are required for headless WASM builds:

#### Patch 1: Fix xmlsecurity Module

The UIConfig must be disabled for headless builds:

```bash
cat > xmlsecurity/Module_xmlsecurity.mk << 'EOF'
$(eval $(call gb_Module_Module,xmlsecurity))

$(eval $(call gb_Module_add_targets,xmlsecurity,\
    Library_xmlsecurity \
    $(if $(ENABLE_NSS)$(ENABLE_OPENSSL),Library_xsec_xmlsec) \
    $(if $(DISABLE_GUI),,UIConfig_xmlsec) \
))

$(eval $(call gb_Module_add_l10n_targets,xmlsecurity,\
    $(if $(DISABLE_GUI),,AllLangMoTarget_xsc) \
))
EOF
```

#### Patch 2: Add PROXY_TO_PTHREAD

Edit `solenv/gbuild/platform/EMSCRIPTEN_INTEL_GCC.mk`:

```bash
# Find this line:
gb_EMSCRIPTEN_LDFLAGS += -s TOTAL_MEMORY=1GB -s PTHREAD_POOL_SIZE=4

# Change to:
gb_EMSCRIPTEN_LDFLAGS += -s TOTAL_MEMORY=1GB -s PTHREAD_POOL_SIZE=4 -s PROXY_TO_PTHREAD=1
```

#### Patch 3: Export Required Runtime Methods

In the same file, add FS and wasmTable to exports:

```bash
# Find EXPORTED_RUNTIME_METHODS and add "FS","wasmTable" at the start:
EXPORTED_RUNTIME_METHODS=["FS","wasmTable","UTF16ToString","stringToUTF16",...]
```

### Step 5: Configure

Create `autogen.input` with build options:

```bash
cat > autogen.input << 'EOF'
# Core WASM settings
--host=wasm32-local-emscripten
--disable-gui
--with-main-module=writer
--enable-wasm-strip
--with-parallelism=32

# Build settings
--disable-debug
--enable-sal-log

# Disable UI features
--disable-avmedia
--disable-sdremote
--disable-cairo-canvas
--disable-dbus
--disable-cups
--disable-gstreamer-1-0

# Disable scripting
--disable-scripting
--disable-scripting-beanshell
--disable-scripting-javascript

# Disable extensions
--disable-extensions
--disable-extension-update
--disable-online-update

# Disable non-conversion features
--disable-xmlhelp
--disable-report-builder
--disable-database-connectivity
--disable-lpsolve
--disable-coinmp
EOF
```

Run autogen:

```bash
./autogen.sh
```

### Step 6: Build

```bash
# Make sure Emscripten environment is active
source ~/libreoffice-wasm-build/emsdk/emsdk_env.sh

# Build (this takes 1-4 hours)
make -j32
```

### Step 7: Package Output

```bash
# Create output directory
mkdir -p /path/to/project/wasm

# Copy files
cp instdir/program/soffice.wasm /path/to/project/wasm/
cp instdir/program/soffice.js /path/to/project/wasm/soffice.cjs
cp instdir/program/soffice.data /path/to/project/wasm/
cp instdir/program/soffice.worker.js /path/to/project/wasm/soffice.worker.cjs
cp instdir/program/soffice.data.js.metadata /path/to/project/wasm/
```

### Step 8: Apply Node.js Patches

The JavaScript files need patches for Node.js compatibility:

```bash
cd /path/to/project/wasm

# Patch 1: Make soffice.cjs use global.Module
sed -i '1s/^/if(typeof global!=="undefined"){var Module=global.Module=global.Module||{}}\n/' soffice.cjs

# Patch 2: Update worker reference to .cjs
sed -i 's/soffice\.worker\.js/soffice.worker.cjs/g' soffice.cjs
```

---

## Build Configuration

### Minimal Build (Document Conversion Only)

For the smallest possible build with just document conversion:

```bash
# Additional disable flags
--disable-avmedia
--disable-database-connectivity
--disable-firebird-sdbc
--disable-mariadb-sdbc
--disable-postgresql-sdbc
--disable-pdfimport
--disable-pdfium
--disable-poppler
--disable-libcmis
--disable-ldap
--disable-gpgmepp
--disable-zxing
```

### Full Build (All Features)

For maximum format support, don't disable PDF import:

```bash
# Remove these from autogen.input:
# --disable-pdfimport
# --disable-pdfium
```

---

## Troubleshooting Build Issues

### Error: "UIConfig xmlsec must be registered"

**Solution:** Apply the xmlsecurity patch (see Step 4).

### Error: "zip error: Nothing to do!"

**Cause:** Missing autotext XML files.

**Solution:** The build script automatically creates these files. If building manually:

```bash
mkdir -p workdir/CustomTarget/extras/source/autotext/user/mytexts/META-INF

cat > workdir/CustomTarget/extras/source/autotext/user/mytexts/BlockList.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<block-list:block-list xmlns:block-list="http://openoffice.org/2001/block-list"/>
EOF

cat > workdir/CustomTarget/extras/source/autotext/user/mytexts/META-INF/manifest.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
 <manifest:file-entry manifest:media-type="application/vnd.sun.star.autotext" manifest:full-path="/"/>
 <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="BlockList.xml"/>
</manifest:manifest>
EOF

touch workdir/CustomTarget/extras/source/autotext/user/mytexts/mimetype
```

### Error: "Out of memory" during link

**Solution:** Reduce parallel jobs:

```bash
BUILD_JOBS=4 make
```

Or add swap space:

```bash
sudo fallocate -l 16G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Error: "FS was not exported"

**Cause:** Missing runtime export.

**Solution:** Add "FS" to EXPORTED_RUNTIME_METHODS in EMSCRIPTEN_INTEL_GCC.mk.

### Worker file not loading in Node.js

**Cause:** Package.json has `"type": "module"` but worker is CommonJS.

**Solution:** Rename worker to `.cjs`:

```bash
cp soffice.worker.js soffice.worker.cjs
sed -i 's/soffice\.worker\.js/soffice.worker.cjs/g' soffice.cjs
```

### Module blocks event loop

**Cause:** WASM initialization blocks main thread.

**Solution:** Add PROXY_TO_PTHREAD to linker flags:

```bash
gb_EMSCRIPTEN_LDFLAGS += -s PROXY_TO_PTHREAD=1
```

---

## Customizing the Build

### Changing LibreOffice Version

```bash
LIBREOFFICE_VERSION=libreoffice-24-2 ./build/build-wasm.sh
```

Available branches: https://git.libreoffice.org/core/+refs

### Reducing Build Size

To create a smaller build:

1. Disable unused modules in `autogen.input`
2. Enable WASM stripping: `--enable-wasm-strip`
3. Enable LTO (Link-Time Optimization): `--enable-lto`
4. Compress output files: `gzip -9 soffice.wasm`

### Adding Font Support

By default, minimal fonts are included. To add more:

1. Copy TTF files to `extras/source/fonts/`
2. Update `static/CustomTarget_emscripten_fs_image.mk`
3. Rebuild

### Building for Specific Platforms

The build produces portable WASM that works everywhere. Platform-specific optimizations:

**For Node.js servers:**
- Use maximum memory: `-s TOTAL_MEMORY=2GB`
- Enable threading: `-s PTHREAD_POOL_SIZE=8`

**For browsers:**
- Use streaming compilation
- Enable compression (Brotli/gzip)
- Consider splitting soffice.data

---

## Build Artifacts

After a successful build, you'll have:

| File | Size (approx) | Description |
|------|---------------|-------------|
| `soffice.wasm` | 110MB | Main WASM binary |
| `soffice.cjs` | 230KB | JavaScript glue code |
| `soffice.data` | 80MB | Virtual filesystem |
| `soffice.worker.cjs` | 4KB | Web Worker script |
| `soffice.data.js.metadata` | 150KB | Filesystem metadata |

**Compressed sizes (gzip -9):**

| File | Compressed |
|------|------------|
| `soffice.wasm` | ~45MB |
| `soffice.data` | ~25MB |

---

## Incremental Rebuilds

After the initial build, you can make changes faster:

```bash
# Rebuild just the main executable
make Executable_soffice

# Rebuild a specific module
make Module_sw  # Writer module
make Module_sc  # Calc module

# Force re-link (after changing EMSCRIPTEN flags)
rm -f workdir/LinkTarget/Executable/soffice.html instdir/program/soffice.*
make
```

---

## CI/CD Integration

For automated builds, use Docker:

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    build-essential git cmake ninja-build \
    python3 python3-pip autoconf automake \
    bison flex gawk pkg-config libtool \
    libicu-dev libxml2-dev libxslt1-dev \
    zip unzip wget curl xz-utils

# Set up Emscripten
RUN git clone https://github.com/emscripten-core/emsdk.git /opt/emsdk \
    && cd /opt/emsdk \
    && ./emsdk install 3.1.51 \
    && ./emsdk activate 3.1.51

ENV PATH="/opt/emsdk:/opt/emsdk/upstream/emscripten:${PATH}"

WORKDIR /build
COPY . .
RUN ./build/build-wasm.sh
```

Build command:

```bash
docker build -t libreoffice-wasm-builder .
docker run -v $(pwd)/wasm:/output libreoffice-wasm-builder \
    cp -r /build/wasm/* /output/
```


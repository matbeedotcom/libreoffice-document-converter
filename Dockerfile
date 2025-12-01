# LibreOffice WASM Build Environment
# Builds a headless LibreOffice WASM module for document conversion
# No UI support - purely API-based document conversion toolkit

FROM ubuntu:24.04 AS builder

LABEL maintainer="LibreOffice WASM Build"
LABEL description="Headless LibreOffice WASM build environment for document conversion"

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Essential build tools
    build-essential \
    git \
    cmake \
    ninja-build \
    python3 \
    python3-pip \
    python3-dev \
    python3-setuptools \
    # LibreOffice build dependencies
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
    libgstreamer-plugins-base1.0-dev \
    libgstreamer1.0-dev \
    libgtk-3-dev \
    libharfbuzz-dev \
    libicu-dev \
    libjpeg-dev \
    libkrb5-dev \
    liblcms2-dev \
    libldap2-dev \
    libnss3-dev \
    libpng-dev \
    libpoppler-cpp-dev \
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
    # Additional dependencies for WASM build
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /build

# Install Emscripten SDK (latest stable version)
ENV EMSDK_VERSION=3.1.51
ENV EMSDK=/opt/emsdk
ENV PATH="${EMSDK}:${EMSDK}/upstream/emscripten:${PATH}"

RUN git clone https://github.com/emscripten-core/emsdk.git ${EMSDK} \
    && cd ${EMSDK} \
    && ./emsdk install ${EMSDK_VERSION} \
    && ./emsdk activate ${EMSDK_VERSION} \
    && echo "source ${EMSDK}/emsdk_env.sh" >> /etc/bash.bashrc

# Set Emscripten environment variables
ENV EMSCRIPTEN=${EMSDK}/upstream/emscripten
ENV EM_CONFIG=${EMSDK}/.emscripten
ENV EM_CACHE=${EMSDK}/.emscripten_cache

# Clone LibreOffice source (core repository)
ARG LIBREOFFICE_VERSION=libreoffice-24-8
RUN git clone --depth 1 --branch ${LIBREOFFICE_VERSION} \
    https://git.libreoffice.org/core /build/libreoffice

WORKDIR /build/libreoffice

# Copy build configuration
COPY build/autogen.input /build/libreoffice/autogen.input

# Create ccache directory
RUN mkdir -p /ccache
ENV CCACHE_DIR=/ccache

# Build script will be run separately to allow for caching
COPY build/build-wasm.sh /build/build-wasm.sh
RUN chmod +x /build/build-wasm.sh

# Expose the output directory
VOLUME ["/output"]

# Default command
CMD ["/build/build-wasm.sh"]

# ============================================================
# Production stage - minimal image with just the WASM output
# ============================================================
FROM node:20-slim AS runtime

WORKDIR /app

# Copy the built WASM files from builder
# These paths will be created during the build process
COPY --from=builder /build/libreoffice/instdir /app/libreoffice-wasm

# Copy the JavaScript wrapper
COPY src/ /app/src/
COPY package.json package-lock.json* /app/

RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "src/server.js"]


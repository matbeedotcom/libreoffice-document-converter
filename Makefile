# LibreOffice WASM Build Makefile
# Convenience targets for building and running

.PHONY: all build build-docker build-wasm clean dev install lint test help

# Default target
all: help

# Install npm dependencies
install:
	npm ci

# Build TypeScript
build: install
	npm run build

# Build Docker image
build-docker:
	docker build -t libreoffice-wasm-builder --target builder .

# Build WASM (requires Docker)
build-wasm: build-docker
	@echo "Starting LibreOffice WASM build..."
	@echo "This will take 2-4 hours depending on your hardware."
	@echo "Make sure you have at least 16GB RAM and 50GB disk space."
	docker run --rm \
		-v $(PWD)/wasm:/output \
		-e BUILD_JOBS=$$(nproc) \
		libreoffice-wasm-builder

# Full build (Docker + WASM)
build-full: build-wasm build

# Start development server
dev: install
	npm run dev

# Start production server
start: build
	npm start

# Run linter
lint: install
	npm run lint

# Run tests
test: install
	npm run test

# Type check
typecheck: install
	npm run typecheck

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/
	rm -f wasm/*.wasm wasm/*.js wasm/*.data
	docker rmi libreoffice-wasm-builder 2>/dev/null || true

# Clean everything including Docker cache
clean-all: clean
	docker volume rm libreoffice-wasm_libreoffice-ccache 2>/dev/null || true
	docker builder prune -f

# Using docker-compose
up:
	docker-compose up -d dev

down:
	docker-compose down

logs:
	docker-compose logs -f

# Help
help:
	@echo "LibreOffice WASM Build System"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Build Targets:"
	@echo "  install       Install npm dependencies"
	@echo "  build         Build TypeScript"
	@echo "  build-docker  Build Docker image for WASM compilation"
	@echo "  build-wasm    Build LibreOffice WASM (takes 2-4 hours)"
	@echo "  build-full    Full build (Docker + WASM + TypeScript)"
	@echo ""
	@echo "Development:"
	@echo "  dev           Start development server"
	@echo "  start         Start production server"
	@echo "  lint          Run ESLint"
	@echo "  test          Run tests"
	@echo "  typecheck     Run TypeScript type checking"
	@echo ""
	@echo "Docker Compose:"
	@echo "  up            Start services (docker-compose)"
	@echo "  down          Stop services"
	@echo "  logs          View logs"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean         Remove build artifacts"
	@echo "  clean-all     Remove everything including Docker cache"
	@echo ""
	@echo "Note: WASM build requires Docker, 16GB+ RAM, and 50GB+ disk space"


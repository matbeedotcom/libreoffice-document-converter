# LibreOffice WASM Patches

These patches are applied to the LibreOffice source tree during the WASM build process.

## Patch Files

### Core Functionality
- **001-fix-xmlsecurity-headless.patch** - Fix XML security for headless builds
- **002-emscripten-exports.patch** - Add Emscripten-specific exports
- **003-skip-preload-option.patch** - Skip preload options not supported in WASM

### UI/Accessibility Fixes
- **004-remove-xmlsec-ui-from-fs-image.patch** - Remove XML security UI files
- **005-fix-math-accessibility.patch** - Fix Math module accessibility
- **006-add-impress-draw-math-fs-image.patch** - Add Impress/Draw/Math to filesystem image
- **007-fix-sd-annotationwindow-accessibility.patch** - Fix annotation window accessibility
- **008-fix-slidesorter-accessibility.patch** - Fix slide sorter accessibility

### Build System
- **009-fix-repository.patch** - Repository configuration fixes
- **010-emscripten-fs-image-ui-files.patch** - UI files for Emscripten filesystem image
- **010-fix-writerperfect.patch** - WriterPerfect module fixes
- **012-lok-shim-exports.patch** - LibreOfficeKit shim exports (basic)
- **013-lok-shim-functions.patch** - LibreOfficeKit shim function implementations (basic)

### Extended LOK API (Document Inspection & Editing)
- **014-lok-exported-functions.patch** - Extended EXPORTED_FUNCTIONS for WASM linker
  - Adds: text selection, mouse/keyboard events, UNO commands, page info, clipboard, accessibility
- **015-lok-shim-functions-extended.patch** - Extended C++ shim implementations
  - Text selection: `getTextSelection`, `setTextSelection`, `getSelectionType`, `resetSelection`
  - Events: `postMouseEvent`, `postKeyEvent`
  - UNO: `postUnoCommand`, `getCommandValues`
  - Page info: `getPartPageRectangles`, `getPartInfo`, `getPartName`
  - Clipboard: `paste`
  - View: `setClientZoom`, `setClientVisibleArea`
  - Accessibility: `getA11yFocusedParagraph`, `getA11yCaretPosition`, `setAccessibilityState`
  - Spreadsheet: `getDataArea`
  - Edit mode: `getEditMode`

### Platform Configuration
- **014-emscripten-unipoll-fix.patch** - Fix for Emscripten unipoll
- **016-emscripten-platform.patch** - Emscripten platform configuration
- **017-emscripten-fs-image.patch** - Emscripten filesystem image configuration
- **pdfium-emscripten.patch** - PDFium library Emscripten compatibility

## Build Configuration

The `autogen.input` file in the parent directory contains the full build configuration:
- `--with-main-module=all` - Required for full format support (PPTX, etc.)
- `--disable-gui` - Headless build
- All GUI toolkits disabled (GTK, Qt, KF5/6)
- Database connectors disabled
- Scripting disabled

## Applying Patches

Patches are automatically applied by `build-wasm.sh`. To manually apply:

```bash
cd ~/libreoffice-wasm-build/libreoffice
for patch in /path/to/patches/*.patch; do
    git apply "$patch" || echo "Patch may already be applied: $patch"
done
```

## Creating New Patches

After modifying LibreOffice source files:

```bash
cd ~/libreoffice-wasm-build/libreoffice
git diff path/to/modified/file.cxx > /path/to/patches/NNN-description.patch
```


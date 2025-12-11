# LibreOffice Converter Examples

Example applications demonstrating the `@matbee/libreoffice-converter` package.

## Setup

```bash
npm install
```

## Examples

### 1. Basic Document Conversion

Convert documents between formats:

```bash
# Convert DOCX to PDF
npm run convert -- report.docx pdf

# Convert spreadsheet to CSV
npm run convert -- data.xlsx csv

# Convert presentation to PDF
npm run convert -- slides.pptx pdf
```

### 2. Document Inspection

Get document metadata, page count, text content, and page names:

```bash
npm run inspect -- document.docx
```

Output:
```
Inspecting: document.docx

==================================================

--- Document Info ---
Type: text
Page Count: 5

--- Page/Sheet Names ---
  (No named pages)

--- Document Text Preview ---
This is the content of the document...

==================================================
```

### 3. Generate Previews

Render document pages as images:

```bash
# Generate previews for first 5 pages
npm run preview -- presentation.pptx

# Generate previews for first 10 pages
npm run preview -- document.pdf 10
```

Creates a folder with:
- High-resolution page renders (1920x1080)
- Thumbnail previews (300x400)

### 4. Batch Conversion

Convert all documents in a directory to a target format, output as a zip file:

```bash
# Convert all documents in ./documents to PDF
node batch-convert.js ./documents pdf

# Specify output filename
node batch-convert.js ./reports docx output.zip

# Use multiple workers for faster conversion
node batch-convert.js ./large-batch pdf results.zip --workers 4
```

Features:
- Recursively scans subdirectories
- Preserves directory structure in zip output
- Skips files already in target format
- Continues on errors, reports failures at end
- Configurable parallel workers (default: 1)

Output:
```
Scanning ./documents for documents...
Found 15 file(s) to convert, 3 already pdf
Initializing 2 worker(s)...
Workers initialized!
[1/15] Converting reports/q1.docx...
[2/15] Converting reports/q2.docx...
...

Batch conversion complete!
  Converted: 14 files
  Skipped:   3 files (already pdf)
  Failed:    1 file
    - data/corrupted.xlsx: Document load failed

Output: documents.zip (2.4 MB)
```

### 5. Conversion Server

Run an HTTP server for document conversion:

```bash
npm run server
# Server runs on http://localhost:3000
```

API endpoints:

```bash
# Convert document to PDF
curl -F "file=@document.docx" http://localhost:3000/convert?format=pdf -o output.pdf

# Get document info
curl -F "file=@document.docx" http://localhost:3000/info

# Render page as PNG
curl -F "file=@document.docx" http://localhost:3000/preview?page=0 -o page1.png

# Extract text
curl -F "file=@document.docx" http://localhost:3000/text
```

## Supported Formats

### Input Formats
- **Word Processing**: docx, doc, odt, rtf, txt
- **Spreadsheets**: xlsx, xls, ods, csv
- **Presentations**: pptx, ppt, odp
- **Other**: pdf, html

### Output Formats
- **Documents**: pdf, docx, odt, html, txt
- **Spreadsheets**: xlsx, ods, csv
- **Presentations**: pptx, odp
- **Images**: png (for page rendering)

## Performance Notes

- First initialization takes a few seconds to load the WASM module
- Subsequent conversions are fast
- Reuse the converter instance for multiple conversions
- Call `converter.destroy()` when done to free memory

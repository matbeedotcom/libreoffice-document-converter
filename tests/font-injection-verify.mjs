#!/usr/bin/env node
/**
 * Font Injection Verification
 *
 * Creates a DOCX with Lato font baked in, converts to PDF with and without
 * the Lato font injected, and compares embedded fonts in each PDF.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_PATH = '/usr/share/fonts/truetype/lato/Lato-Regular.ttf';
const fontData = fs.readFileSync(FONT_PATH);

const { createSubprocessConverter } = await import(path.join(__dirname, '..', 'dist', 'server.js'));
const JSZip = (await import('jszip')).default;

// Minimal DOCX that explicitly references "Lato" font
// Built from a bare-minimum Open XML structure
function createLatoDocx() {
  const zip = new JSZip();

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:rPr><w:rFonts w:ascii="Lato" w:hAnsi="Lato"/><w:sz w:val="48"/></w:rPr></w:pPr>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Lato" w:hAnsi="Lato"/><w:sz w:val="48"/></w:rPr>
        <w:t>Hello from Lato font!</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Liberation Serif" w:hAnsi="Liberation Serif"/><w:sz w:val="24"/></w:rPr>
        <w:t>This line uses Liberation Serif (always available).</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`);

  return zip.generateAsync({ type: 'nodebuffer' });
}

console.log('=== Font Injection Verification ===\n');

// Create test DOCX
console.log('[0] Creating test DOCX with Lato font reference...');
const docx = await createLatoDocx();
fs.writeFileSync(path.join(__dirname, 'font-test-lato.docx'), docx);
console.log(`    Created ${docx.length} bytes\n`);

function extractPdfFonts(pdfData) {
  const str = Buffer.from(pdfData).toString('latin1');
  const matches = str.match(/\/BaseFont\/[^\s/\]>]+/g) || [];
  return matches.map(f => f.replace('/BaseFont/', ''));
}

// Test 1: WITH Lato font injected
console.log('[1] Converting WITH Lato injected...');
const conv1 = await createSubprocessConverter({
  wasmPath: path.resolve(__dirname, '..', 'wasm'),
  fonts: [{ filename: 'Lato-Regular.ttf', data: new Uint8Array(fontData) }],
});
const result1 = await conv1.convert(docx, { outputFormat: 'pdf' });
fs.writeFileSync(path.join(__dirname, 'font-test-WITH-lato.pdf'), result1.data);
const fonts1 = extractPdfFonts(result1.data);
console.log(`    PDF size: ${(result1.data.length / 1024).toFixed(0)} KB`);
console.log(`    Embedded fonts: ${fonts1.join(', ')}`);
console.log(`    Contains Lato: ${fonts1.some(f => /lato/i.test(f)) ? 'YES' : 'NO'}`);
await conv1.destroy();

// Test 2: WITHOUT Lato font (control)
console.log('\n[2] Converting WITHOUT Lato (control)...');
const conv2 = await createSubprocessConverter({
  wasmPath: path.resolve(__dirname, '..', 'wasm'),
});
const result2 = await conv2.convert(docx, { outputFormat: 'pdf' });
fs.writeFileSync(path.join(__dirname, 'font-test-WITHOUT-lato.pdf'), result2.data);
const fonts2 = extractPdfFonts(result2.data);
console.log(`    PDF size: ${(result2.data.length / 1024).toFixed(0)} KB`);
console.log(`    Embedded fonts: ${fonts2.join(', ')}`);
console.log(`    Contains Lato: ${fonts2.some(f => /lato/i.test(f)) ? 'YES (unexpected!)' : 'NO (expected — falls back)'}`);
await conv2.destroy();

// Verdict
console.log('\n=== Verdict ===');
const hasLato1 = fonts1.some(f => /lato/i.test(f));
const hasLato2 = fonts2.some(f => /lato/i.test(f));
if (hasLato1 && !hasLato2) {
  console.log('PASS: Font injection works! Lato appears only when injected.');
} else if (hasLato1 && hasLato2) {
  console.log('INCONCLUSIVE: Lato in both — font may have been found elsewhere.');
} else if (!hasLato1) {
  console.log('FAIL: Lato not in PDF even with injection. Fontconfig may not scan the dir.');
  console.log('Fallback fonts used:', fonts1.join(', '));
}

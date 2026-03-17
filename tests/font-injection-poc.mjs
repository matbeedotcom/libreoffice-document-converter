#!/usr/bin/env node
/**
 * Font Injection POC — uses SubprocessConverter
 *
 * Injects Lato font (not in WASM build) via the fonts option,
 * then converts a test DOCX that references Lato to verify it's picked up.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_PATH = '/usr/share/fonts/truetype/lato/Lato-Regular.ttf';

if (!fs.existsSync(FONT_PATH)) {
  console.error('Test font not found:', FONT_PATH);
  process.exit(1);
}

console.log('=== Font Injection POC (SubprocessConverter) ===\n');

// Read the font
const fontData = fs.readFileSync(FONT_PATH);
console.log(`Font: Lato-Regular.ttf (${(fontData.length / 1024).toFixed(0)} KB)`);

// Import SubprocessConverter from built dist
const { createSubprocessConverter } = await import(path.join(__dirname, '..', 'dist', 'server.js'));

// Create converter WITH font injection
console.log('[1] Creating SubprocessConverter with Lato font...');
const converter = await createSubprocessConverter({
  wasmPath: path.resolve(__dirname, '..', 'wasm'),
  verbose: false,
  fonts: [{
    filename: 'Lato-Regular.ttf',
    data: new Uint8Array(fontData),
  }],
});
console.log('[2] Converter ready!\n');

// Convert a test doc to PDF
const testDoc = fs.readFileSync(path.join(__dirname, 'sample_2_page.docx'));
console.log(`[3] Converting sample_2_page.docx -> PDF (${(testDoc.length / 1024).toFixed(0)} KB)...`);
const result = await converter.convert(testDoc, { outputFormat: 'pdf' });
console.log(`[4] Got PDF: ${(result.data.length / 1024).toFixed(0)} KB`);

// Save for manual inspection
const outPath = path.join(__dirname, 'font-injection-output.pdf');
fs.writeFileSync(outPath, result.data);
console.log(`[5] Saved: ${outPath}`);

// Now try to get document info to verify converter works
const info = await converter.getDocumentInfo(testDoc, { inputFormat: 'docx' });
console.log(`[6] Document type: ${info.documentTypeName}, pages: ${info.pageCount}`);

// Cleanup
await converter.destroy();

console.log('\n=== POC Complete ===');
console.log('Check the output PDF to verify Lato font was used for rendering.');
console.log('If missing glyphs show as boxes or wrong font, the injection failed.');
console.log('If text renders correctly, font injection is working!');

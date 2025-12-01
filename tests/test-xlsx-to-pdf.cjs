process.on('unhandledRejection', (e) => { console.log('FAIL:', e.message); process.exit(1); });
const { createModule } = require('../wasm/loader.cjs');
const fs = require('fs');

createModule({ print: () => {}, printErr: () => {} }).then(M => {
  console.log('Module loaded');
  
  const pathBuf = new TextEncoder().encode('/instdir/program\0');
  const pathPtr = M._malloc(pathBuf.length);
  M.HEAPU8.set(pathBuf, pathPtr);
  const lok = M._libreofficekit_hook(pathPtr);
  M._free(pathPtr);
  
  const pClass = M.HEAPU32[lok >> 2];
  const documentLoad = M.HEAPU32[(pClass >> 2) + 2];
  
  // Helper to destroy a document
  function destroyDoc(doc) {
    if (doc > 0) {
      const docClass = M.HEAPU32[doc >> 2];
      const destroy = M.HEAPU32[(docClass >> 2) + 1]; // destroy is at offset 1
      M.wasmTable.get(destroy)(doc);
    }
  }
  
  // Load ODS
  const ods = fs.readFileSync('tests/sample_test_4.ods');
  M.FS.writeFile('/tmp/test.ods', new Uint8Array(ods));
  
  let docPathBuf = new TextEncoder().encode('/tmp/test.ods\0');
  let docPathPtr = M._malloc(docPathBuf.length);
  M.HEAPU8.set(docPathBuf, docPathPtr);
  
  let doc = M.wasmTable.get(documentLoad)(lok, docPathPtr);
  M._free(docPathPtr);
  
  // Save as XLSX
  let outBuf = new TextEncoder().encode('/tmp/test.xlsx\0');
  let outPtr = M._malloc(outBuf.length);
  M.HEAPU8.set(outBuf, outPtr);
  
  let formatBuf = new TextEncoder().encode('xlsx\0');
  let formatPtr = M._malloc(formatBuf.length);
  M.HEAPU8.set(formatBuf, formatPtr);
  
  let docClass = M.HEAPU32[doc >> 2];
  const saveAs = M.HEAPU32[(docClass >> 2) + 2];
  let result = M.wasmTable.get(saveAs)(doc, outPtr, formatPtr, 0);
  
  M._free(outPtr);
  M._free(formatPtr);
  
  if (result) {
    const xlsx = M.FS.readFile('/tmp/test.xlsx');
    console.log('ODS -> XLSX: ✅ SUCCESS (' + xlsx.length + ' bytes)');
    fs.writeFileSync('tests/sample_test_5.xlsx', xlsx);
    
    // IMPORTANT: Destroy first document before loading second
    destroyDoc(doc);
    console.log('First document destroyed');
    
    // Now load the XLSX and convert to PDF
    docPathBuf = new TextEncoder().encode('/tmp/test.xlsx\0');
    docPathPtr = M._malloc(docPathBuf.length);
    M.HEAPU8.set(docPathBuf, docPathPtr);
    
    doc = M.wasmTable.get(documentLoad)(lok, docPathPtr);
    M._free(docPathPtr);
    
    if (doc > 0) {
      console.log('XLSX loaded: ✅ YES');
      
      outBuf = new TextEncoder().encode('/tmp/out.pdf\0');
      outPtr = M._malloc(outBuf.length);
      M.HEAPU8.set(outBuf, outPtr);
      
      formatBuf = new TextEncoder().encode('pdf\0');
      formatPtr = M._malloc(formatBuf.length);
      M.HEAPU8.set(formatBuf, formatPtr);
      
      docClass = M.HEAPU32[doc >> 2];
      const saveAs2 = M.HEAPU32[(docClass >> 2) + 2];
      result = M.wasmTable.get(saveAs2)(doc, outPtr, formatPtr, 0);
      
      M._free(outPtr);
      M._free(formatPtr);
      
      if (result) {
        const pdf = M.FS.readFile('/tmp/out.pdf');
        console.log('XLSX -> PDF: ✅ SUCCESS (' + pdf.length + ' bytes)');
        fs.writeFileSync('tests/output/sample_test_5.pdf', pdf);
        console.log('\n=== Calc (XLSX): ✅ WORKING ===');
      } else {
        console.log('XLSX -> PDF: ❌ FAILED');
      }
      
      destroyDoc(doc);
    } else {
      console.log('XLSX loaded: ❌ NO');
    }
  } else {
    console.log('ODS -> XLSX: ❌ FAILED');
  }
  
  process.exit(0);
});
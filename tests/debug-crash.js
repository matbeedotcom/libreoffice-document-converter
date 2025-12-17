
const { Worker } = require('worker_threads');
globalThis.Worker = Worker;

(async () => {
    try {
        const testWasmLoader = (await import('./test-wasm-loader.mjs')).default;
        const { LibreOfficeConverter } = await import('../dist/index.js');

        console.log('Validating imports...');
        if (!LibreOfficeConverter) throw new Error('LibreOfficeConverter not found');

        const converter = new LibreOfficeConverter({
            wasmPath: './wasm',
            verbose: false,
            wasmLoader: testWasmLoader,
        });

        console.log('Initializing converter...');
        await converter.initialize();
        console.log('Initialized.');

        // Test 1: TXT -> PDF
        try {
            console.log('--- Test 1: TXT -> PDF ---');
            const txt = new TextEncoder().encode('Hello World');
            const res1 = await converter.convert(txt, { inputFormat: 'txt', outputFormat: 'pdf' });
            console.log('SUCCESS: TXT -> PDF, Size:', res1.data.length);
        } catch (e) {
            console.error('FAILED: TXT -> PDF', e);
        }

        // Test 2: DOCX -> PDF
        try {
            console.log('--- Test 2: DOCX -> PDF ---');
            const fs = require('fs');
            const docx = fs.readFileSync('./tests/sample_2_page.docx');
            console.log('Read DOCX file, size:', docx.length);
            const res2 = await converter.convert(new Uint8Array(docx), { inputFormat: 'docx', outputFormat: 'pdf' });
            console.log('SUCCESS: DOCX -> PDF, Size:', res2.data.length);
        } catch (e) {
            console.error('FAILED: DOCX -> PDF', e);
        }

        await converter.destroy();

    } catch (err) {
        console.error('Fatal error:', err);
    }
})();

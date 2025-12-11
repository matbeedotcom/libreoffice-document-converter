/**
 * Batch Document Conversion Example
 *
 * Recursively converts all supported documents in a directory to a target format,
 * outputting a zip file with converted files preserving directory structure.
 *
 * Usage: node batch-convert.js <input-directory> <output-format> [output.zip] [--workers N]
 *
 * Examples:
 *   node batch-convert.js ./documents pdf
 *   node batch-convert.js ./reports docx output.zip
 *   node batch-convert.js ./large-batch pdf results.zip --workers 4
 */

import { WorkerConverter } from '@matbee/libreoffice-converter';
import { createWriteStream, readFileSync, statSync } from 'fs';
import { readdir } from 'fs/promises';
import { basename, extname, join, relative } from 'path';
import archiver from 'archiver';

// Supported input formats for conversion
const SUPPORTED_FORMATS = new Set([
  'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt',
  'odt', 'ods', 'odp', 'rtf', 'txt', 'csv', 'html'
]);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node batch-convert.js <input-directory> <output-format> [output.zip] [--workers N]');
    console.log('');
    console.log('Arguments:');
    console.log('  <input-directory>  Directory to scan recursively');
    console.log('  <output-format>    Target format (pdf, docx, xlsx, etc.)');
    console.log('  [output.zip]       Output filename (default: <directory-name>.zip)');
    console.log('  --workers N        Number of parallel converters (default: 1)');
    console.log('');
    console.log('Examples:');
    console.log('  node batch-convert.js ./documents pdf');
    console.log('  node batch-convert.js ./reports docx output.zip');
    console.log('  node batch-convert.js ./large-batch pdf results.zip --workers 4');
    process.exit(1);
  }

  const inputDir = args[0];
  const outputFormat = args[1];
  let outputZip = null;
  let workers = 1;

  // Parse remaining arguments
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--workers' && args[i + 1]) {
      workers = parseInt(args[i + 1], 10);
      if (isNaN(workers) || workers < 1) {
        console.error('Error: --workers must be a positive integer');
        process.exit(1);
      }
      i++; // Skip next arg
    } else if (!args[i].startsWith('--')) {
      outputZip = args[i];
    }
  }

  // Default output zip name
  if (!outputZip) {
    outputZip = basename(inputDir.replace(/\/+$/, '')) + '.zip';
  }

  return { inputDir, outputFormat, outputZip, workers };
}

/**
 * Recursively find all files in a directory
 */
async function findFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase().slice(1);
      files.push({
        fullPath,
        relativePath: relative(baseDir, fullPath),
        extension: ext
      });
    }
  }

  return files;
}

/**
 * Filter files for conversion
 */
function filterFiles(files, targetFormat) {
  const toConvert = [];
  const skipped = [];

  for (const file of files) {
    if (file.extension === targetFormat) {
      skipped.push(file);
    } else if (SUPPORTED_FORMATS.has(file.extension)) {
      toConvert.push(file);
    }
    // Ignore unsupported formats
  }

  return { toConvert, skipped };
}

/**
 * Worker pool for parallel conversion
 */
class WorkerPool {
  constructor(size) {
    this.size = size;
    this.converters = [];
    this.available = [];
  }

  async initialize() {
    console.log(`Initializing ${this.size} worker(s)...`);

    const initPromises = [];
    for (let i = 0; i < this.size; i++) {
      const converter = new WorkerConverter({ verbose: false });
      initPromises.push(
        converter.initialize().then(() => {
          this.converters.push(converter);
          this.available.push(converter);
        })
      );
    }

    await Promise.all(initPromises);
    console.log('Workers initialized!');
  }

  async convert(inputBuffer, options, filename) {
    // Wait for available worker
    while (this.available.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const converter = this.available.pop();
    try {
      const result = await converter.convert(inputBuffer, options, filename);
      return result;
    } finally {
      this.available.push(converter);
    }
  }

  async destroy() {
    await Promise.all(this.converters.map(c => c.destroy()));
  }
}

/**
 * Format file size for display
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Main batch conversion function
 */
async function main() {
  const { inputDir, outputFormat, outputZip, workers } = parseArgs();

  // Validate input directory
  try {
    const stat = statSync(inputDir);
    if (!stat.isDirectory()) {
      console.error(`Error: ${inputDir} is not a directory`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: Cannot access directory ${inputDir}`);
    process.exit(1);
  }

  console.log(`Scanning ${inputDir} for documents...`);

  // Find and filter files
  const allFiles = await findFiles(inputDir);
  const { toConvert, skipped } = filterFiles(allFiles, outputFormat);

  if (toConvert.length === 0) {
    console.log('No files to convert.');
    if (skipped.length > 0) {
      console.log(`  ${skipped.length} file(s) already in ${outputFormat} format`);
    }
    process.exit(0);
  }

  console.log(`Found ${toConvert.length} file(s) to convert, ${skipped.length} already ${outputFormat}`);

  // Initialize worker pool
  const pool = new WorkerPool(workers);
  await pool.initialize();

  // Track results
  const converted = [];
  const failed = [];
  let completed = 0;

  // Process files
  const convertFile = async (file) => {
    const progress = `[${++completed}/${toConvert.length}]`;
    console.log(`${progress} Converting ${file.relativePath}...`);

    try {
      const inputBuffer = readFileSync(file.fullPath);
      const result = await pool.convert(
        inputBuffer,
        { outputFormat },
        basename(file.fullPath)
      );

      // Calculate output path with new extension
      const outputPath = file.relativePath.replace(
        new RegExp(`\\.${file.extension}$`, 'i'),
        `.${outputFormat}`
      );

      converted.push({
        path: outputPath,
        data: Buffer.from(result.data)
      });
    } catch (err) {
      failed.push({
        path: file.relativePath,
        error: err.message
      });
    }
  };

  // Process all files (pool handles concurrency)
  await Promise.all(toConvert.map(convertFile));

  // Clean up converters
  await pool.destroy();

  // Create zip file
  if (converted.length > 0) {
    console.log(`\nCreating ${outputZip}...`);

    await new Promise((resolve, reject) => {
      const output = createWriteStream(outputZip);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);

      for (const file of converted) {
        archive.append(file.data, { name: file.path });
      }

      archive.finalize();
    });

    const zipSize = statSync(outputZip).size;

    // Print summary
    console.log('\nBatch conversion complete!');
    console.log(`  Converted: ${converted.length} file(s)`);
    if (skipped.length > 0) {
      console.log(`  Skipped:   ${skipped.length} file(s) (already ${outputFormat})`);
    }
    if (failed.length > 0) {
      console.log(`  Failed:    ${failed.length} file(s)`);
      for (const f of failed) {
        console.log(`    - ${f.path}: ${f.error}`);
      }
    }
    console.log(`\nOutput: ${outputZip} (${formatSize(zipSize)})`);
  } else {
    console.log('\nNo files were successfully converted.');
    if (failed.length > 0) {
      console.log(`  Failed: ${failed.length} file(s)`);
      for (const f of failed) {
        console.log(`    - ${f.path}: ${f.error}`);
      }
    }
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nInterrupted. Cleaning up...');
  process.exit(130);
});

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

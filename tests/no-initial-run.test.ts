/**
 * The WASM build is linked with PROXY_TO_PTHREAD, so unless `Module.noInitialRun`
 * is set, Emscripten starts LibreOffice's C main() on a pthread while the
 * converter runs the LibreOfficeKit init on the main thread, and the two race.
 *
 * These tests check that the package creates `Module` with `noInitialRun: true`
 * in wasm/loader.cjs, LibreOfficeConverter (Node), the standalone
 * fork-worker and subprocess entries, BrowserConverter and the browser worker,
 * and that the shipped glue honours the flag. They use fake glue and need no
 * WASM binary. That the flag removes the start-up stall itself was verified
 * manually against the real engine, not by these tests.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { fork, spawnSync, type SpawnSyncReturns } from 'child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { build } from 'tsup';
import { LibreOfficeConverter } from '../src/converter-node.js';
import type { WasmLoaderModule } from '../src/types.js';

const repoRoot = join(__dirname, '..');
const CHILD_TIMEOUT_MS = 30_000;

type SeenModule = { noInitialRun?: unknown; onRuntimeInitialized?: () => void };

// Fake glue for entries that only need to show what Module they built:
// report Module.noInitialRun on stdout and exit.
const REPORTING_GLUE = [
  'require("fs").writeSync(1, JSON.stringify({ noInitialRun: global.Module.noInitialRun }));',
  'process.exit(0);',
].join('\n');

function parseChildOutput(res: Pick<SpawnSyncReturns<string>, 'error' | 'status' | 'stdout' | 'stderr'>) {
  expect(res.error, String(res.stderr)).toBeUndefined();
  expect(res.status, String(res.stderr)).toBe(0);
  expect(res.stdout, String(res.stderr)).not.toBe('');
  return JSON.parse(res.stdout) as Record<string, unknown>;
}

describe('shipped Emscripten glue', () => {
  // Canary for a glue rebuild: either the glue checks Module.noInitialRun before
  // it calls main(), or it does not call main() automatically at all (as when
  // linked with -sINVOKE_RUN=0). A regex keeps it independent of minification.
  it.each(['soffice.cjs', 'soffice.js'])('wasm/%s does not start main() when Module.noInitialRun is set', (file) => {
    const glue = readFileSync(join(repoRoot, 'wasm', file), 'utf8');
    const honoursFlag = /if\s*\(\s*Module\s*\[\s*["']noInitialRun["']\s*\]\s*\)\s*shouldRunNow\s*=\s*false/.test(glue);
    const callsMainAutomatically = /if\s*\(\s*shouldRunNow\s*\)\s*callMain/.test(glue);
    expect(honoursFlag || !callsMainAutomatically).toBe(true);
  });
});

describe('wasm/loader.cjs', () => {
  let dir: string;

  beforeAll(() => {
    // The loader chdirs and patches fs.readFile when it loads, so it runs in a
    // child process, next to a fake glue instead of the real soffice.cjs.
    dir = mkdtempSync(join(tmpdir(), 'lo-loader-'));
    copyFileSync(join(repoRoot, 'wasm', 'loader.cjs'), join(dir, 'loader.cjs'));
    writeFileSync(
      join(dir, 'soffice.cjs'),
      [
        'global.__glueSawNoInitialRun = global.Module.noInitialRun;',
        'global.Module.calledRun = true;',
        'global.Module.onRuntimeInitialized();',
      ].join('\n')
    );
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  // One child per call: the loader requires the glue once per process.
  function runLoader(fn: 'createModule' | 'createModuleSync', config: Record<string, unknown>) {
    const script = `
      const loader = require(${JSON.stringify(join(dir, 'loader.cjs'))});
      const config = Object.assign({ wasmBinary: new ArrayBuffer(8) }, ${JSON.stringify(config)});
      Promise.resolve(loader.${fn}(config)).then(
        () => process.stdout.write(JSON.stringify({ noInitialRun: global.__glueSawNoInitialRun })),
        (err) => { console.error(err); process.exit(1); }
      );
    `;
    return parseChildOutput(
      spawnSync(process.execPath, ['-e', script], { encoding: 'utf8', timeout: CHILD_TIMEOUT_MS })
    );
  }

  it.each(['createModule', 'createModuleSync'] as const)('%s creates Module with noInitialRun: true', (fn) => {
    expect(runLoader(fn, {})).toEqual({ noInitialRun: true });
  });

  it.each(['createModule', 'createModuleSync'] as const)('%s respects an explicit noInitialRun: false', (fn) => {
    expect(runLoader(fn, { noInitialRun: false })).toEqual({ noInitialRun: false });
  });
});

describe('LibreOfficeConverter (Node)', () => {
  it('passes noInitialRun: true to the wasmLoader, so a custom loader gets it too', async () => {
    let seen: Record<string, unknown> | undefined;
    const wasmLoader: WasmLoaderModule = {
      createModule: (config) => {
        seen = config;
        return Promise.reject(new Error('fake loader: stop after config is read'));
      },
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(new LibreOfficeConverter({ wasmLoader }).initialize()).rejects.toThrow('fake loader');
    } finally {
      consoleError.mockRestore();
    }
    expect(seen?.noInitialRun).toBe(true);
  });
});

describe('standalone fork-worker and subprocess entries', () => {
  let dir: string;
  let glueDir: string;

  beforeAll(async () => {
    // Build the two .cts entries as tsup builds them for dist/, then run them
    // next to a fake glue.
    dir = mkdtempSync(join(tmpdir(), 'lo-entries-'));
    glueDir = join(dir, 'wasm');
    mkdirSync(glueDir);
    writeFileSync(join(glueDir, 'soffice.cjs'), REPORTING_GLUE);
    await build({
      entry: {
        'fork-worker': join(repoRoot, 'src/fork-worker.cts'),
        subprocess: join(repoRoot, 'src/subprocess.cts'),
      },
      format: ['cjs'],
      outDir: join(dir, 'dist'),
      platform: 'node',
      target: 'node18',
      shims: true,
      config: false,
      dts: false,
      sourcemap: false,
      silent: true,
    });
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('fork-worker creates Module with noInitialRun: true', () => {
    const res = spawnSync(process.execPath, [join(dir, 'dist', 'fork-worker.cjs')], {
      encoding: 'utf8',
      timeout: CHILD_TIMEOUT_MS,
      env: { ...process.env, WASM_PATH: glueDir },
    });
    expect(parseChildOutput(res)).toEqual({ noInitialRun: true });
  });

  it('subprocess creates Module with noInitialRun: true', async () => {
    // subprocess loads the glue from its cwd when it receives an init message.
    const child = fork(join(dir, 'dist', 'subprocess.cjs'), [], { cwd: glueDir, silent: true });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (d: Buffer) => (stdout += d.toString()));
    child.stderr?.on('data', (d: Buffer) => (stderr += d.toString()));
    const timer = setTimeout(() => child.kill('SIGKILL'), CHILD_TIMEOUT_MS);
    const status = await new Promise<number | null>((resolve) => {
      child.on('exit', (code) => resolve(code));
      child.send({ type: 'init', id: '1', payload: { wasmPath: glueDir, verbose: false } });
    });
    clearTimeout(timer);

    expect(parseChildOutput({ error: undefined, status, stdout, stderr })).toEqual({ noInitialRun: true });
  });
});

describe('browser entry points', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('BrowserConverter creates window.Module with noInitialRun: true', async () => {
    vi.useFakeTimers();
    const win: { Module?: SeenModule } = {};
    let seen: SeenModule | undefined;
    vi.stubGlobal('window', win);
    vi.stubGlobal('document', {
      createElement: () => ({}),
      head: {
        // Stands in for the <script> load of soffice.js.
        appendChild: () => {
          seen = { ...win.Module };
          win.Module?.onRuntimeInitialized?.();
        },
      },
    });

    const { BrowserConverter } = await import('../src/browser.js');
    const converter = new BrowserConverter();
    await (converter as unknown as { loadModule(): Promise<unknown> }).loadModule();

    expect(seen?.noInitialRun).toBe(true);
  });

  it('browser worker creates self.Module with noInitialRun: true', async () => {
    const posted: Array<{ type: string; error?: string }> = [];
    let seen: SeenModule | undefined;
    const workerSelf: Record<string, unknown> = {
      postMessage: (msg: { type: string; error?: string }) => posted.push(msg),
      close: () => {},
    };
    // The worker logs its init steps; keep the test output quiet.
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('self', workerSelf);
    vi.stubGlobal('importScripts', () => {
      // Stands in for soffice.js: record what it sees, then stop the init.
      seen = { ...(workerSelf.Module as SeenModule) };
      throw new Error('fake glue: stop after Module is read');
    });

    await import('../src/browser.worker.js');
    const onmessage = workerSelf.onmessage as (event: { data: unknown }) => Promise<void>;
    await onmessage({
      data: {
        type: 'init',
        id: 1,
        sofficeJs: '/wasm/soffice.js',
        sofficeWasm: '/wasm/soffice.wasm',
        sofficeData: '/wasm/soffice.data',
        sofficeWorkerJs: '/wasm/soffice.worker.js',
      },
    });

    expect(seen?.noInitialRun).toBe(true);
    expect(posted.some((m) => m.type === 'error' && m.error?.includes('fake glue'))).toBe(true);
  });
});

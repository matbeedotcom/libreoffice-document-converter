import { ConversionError, ConversionErrorCode } from './types.js';

/**
 * Default number of pthread workers created before LibreOffice starts.
 *
 * Emscripten can only start a new pthread Web Worker when the thread that
 * spawns it returns to its event loop. LibreOffice blocks that thread inside
 * LOK calls (documentLoad, documentSaveAs) while it waits on its own threads,
 * so any thread it needs beyond the pre-created pool can never start and the
 * call hangs. Four workers were enough on fast machines but not on slower
 * CPUs (see issue #19), so the default leaves headroom.
 */
export const DEFAULT_PTHREAD_POOL_SIZE = 8;

/**
 * Validate a user-supplied pthread pool size, falling back to the default.
 */
export function resolvePthreadPoolSize(value: number | undefined): number {
  if (value === undefined) return DEFAULT_PTHREAD_POOL_SIZE;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new ConversionError(
      ConversionErrorCode.INVALID_INPUT,
      `pthreadPoolSize must be a positive integer, got ${String(value)}`
    );
  }
  return value;
}

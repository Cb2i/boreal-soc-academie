import type { Exercise, PathId } from '../content/types.ts';

export interface ProgressLike {
  done: Record<string, unknown>;
}

export const UNLOCK_RATIO = 0.6;

/** Un niveau L s'ouvre quand au moins 60 % du niveau L-1 du même parcours est réussi. */
export function levelUnlocked(exs: Exercise[], path: PathId, level: number, done: Record<string, unknown>): boolean {
  if (level <= 1) return true;
  const prev = exs.filter((e) => e.path === path && e.level === level - 1);
  if (prev.length === 0) return true;
  const ok = prev.filter((e) => done[e.id]).length;
  return ok / prev.length >= UNLOCK_RATIO;
}

export function isUnlocked(ex: Exercise, exs: Exercise[], done: Record<string, unknown>, unlockAll = false): boolean {
  if (unlockAll) return true;
  if (!levelUnlocked(exs, ex.path, ex.level, done)) return false;
  return ex.prerequisites.every((p) => done[p]);
}

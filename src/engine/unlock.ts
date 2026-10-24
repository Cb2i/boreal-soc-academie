import type { Exercise, PathId } from '../content/types.ts';

export interface ProgressLike {
  done: Record<string, unknown>;
}

export const UNLOCK_RATIO = 0.6;

/** Un niveau L s'ouvre quand au moins 60 % du niveau L-1 du même parcours est réussi. */
export function levelUnlocked(exs: Exercise[], path: PathId, level: number, done: Record<string, unknown>, start = 1): boolean {
  if (level <= 1 || level <= start) return true;
  const prev = exs.filter((e) => e.path === path && e.level === level - 1);
  if (prev.length === 0) return true;
  const ok = prev.filter((e) => done[e.id]).length;
  return ok / prev.length >= UNLOCK_RATIO;
}

/**
 * `start` est le niveau de départ choisi (ou obtenu au test de niveau) pour le parcours de l'exercice.
 * Les niveaux jusqu'à `start` sont ouverts et leurs exercices ne servent plus de prérequis bloquants.
 */
export function isUnlocked(ex: Exercise, exs: Exercise[], done: Record<string, unknown>, unlockAll = false, start = 1): boolean {
  if (unlockAll) return true;
  if (!levelUnlocked(exs, ex.path, ex.level, done, start)) return false;
  const level = new Map(exs.map((e) => [e.id, e.level]));
  return ex.prerequisites.every((p) => done[p] || (level.get(p) ?? 99) < start);
}

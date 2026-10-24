import type { Exercise, Lesson, PathId } from '../content/types.ts';
import { isUnlocked } from './unlock.ts';

export interface ProgressForNext {
  done: Record<string, unknown>;
  lessonsDone: string[];
  settings: { unlockAll: boolean };
  startLevel?: Record<string, number>;
  last: { route: string; title: string; at: number } | null;
}

/** Exercices d'un parcours dans l'ordre pédagogique (niveau, puis ordre du catalogue). */
export function orderedPath(exs: Exercise[], path: PathId): Exercise[] {
  return exs
    .map((e, i) => ({ e, i }))
    .filter((x) => x.e.path === path)
    .sort((a, b) => a.e.level - b.e.level || a.i - b.i)
    .map((x) => x.e);
}

/** Premier exercice ouvert et non réussi d'un parcours. */
export function nextInPath(exs: Exercise[], path: PathId, p: ProgressForNext): Exercise | null {
  return orderedPath(exs, path).find((e) => !p.done[e.id] && isUnlocked(e, exs, p.done, p.settings.unlockAll, p.startLevel?.[path] ?? 1)) ?? null;
}

export type Step =
  | { kind: 'lesson'; lesson: Lesson; path: PathId }
  | { kind: 'exercise'; ex: Exercise; path: PathId };

/** Prochaine action suggérée dans un parcours : le cours d'abord si rien n'a été commencé, sinon l'exercice suivant. */
export function nextStep(exs: Exercise[], lessons: Lesson[], path: PathId, p: ProgressForNext): Step | null {
  const started = exs.some((e) => e.path === path && p.done[e.id]);
  if (!started && (p.startLevel?.[path] ?? 1) <= 1) {
    const l = lessons.find((x) => x.path === path && !p.lessonsDone.includes(x.id));
    if (l) return { kind: 'lesson', lesson: l, path };
  }
  const ex = nextInPath(exs, path, p);
  return ex ? { kind: 'exercise', ex, path } : null;
}

/** Parcours à proposer : celui du dernier exercice ouvert s'il reste du travail, sinon le moins avancé commencé, sinon le premier. */
export function recommendedPath(exs: Exercise[], paths: { id: PathId }[], p: ProgressForNext): PathId {
  const lastId = p.last?.route.split('/').pop();
  const lastEx = exs.find((e) => e.id === lastId);
  if (lastEx && nextInPath(exs, lastEx.path, p)) return lastEx.path;
  const started = paths.filter((x) => exs.some((e) => e.path === x.id && p.done[e.id]) && nextInPath(exs, x.id, p));
  if (started.length) return started[0].id;
  const open = paths.find((x) => nextInPath(exs, x.id, p));
  return (open ?? paths[0]).id;
}

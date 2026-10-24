import type { Exercise, ExType, Level, PathId } from '../content/types.ts';
import { COMPETENCIES } from '../content/competencies.ts';
import { PATHS } from '../content/paths.ts';

export interface Coverage {
  total: number;
  kql: number;
  byPath: Record<string, number>;
  byLevel: Record<number, number>;
  byType: Record<string, number>;
  byPathLevel: Record<string, Record<number, number>>;
  byCompetency: Record<string, number>;
  /** Cases (parcours x niveau) sans exercice. */
  emptyCells: string[];
  /** Compétences sans exercice. */
  emptyCompetencies: string[];
}

export function computeCoverage(exs: Exercise[]): Coverage {
  const byPath: Record<string, number> = {};
  const byLevel: Record<number, number> = {};
  const byType: Record<string, number> = {};
  const byPathLevel: Record<string, Record<number, number>> = {};
  const byCompetency: Record<string, number> = {};
  for (const p of PATHS) byPathLevel[p.id] = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const e of exs) {
    byPath[e.path] = (byPath[e.path] ?? 0) + 1;
    byLevel[e.level] = (byLevel[e.level] ?? 0) + 1;
    byType[e.type as ExType] = (byType[e.type] ?? 0) + 1;
    byPathLevel[e.path as PathId][e.level as Level]++;
    byCompetency[e.competency] = (byCompetency[e.competency] ?? 0) + 1;
  }
  const emptyCells: string[] = [];
  for (const p of PATHS) for (const l of [1, 2, 3, 4]) if (byPathLevel[p.id][l] === 0) emptyCells.push(`${p.id}/${l}`);
  return {
    total: exs.length,
    kql: byPath['kql'] ?? 0,
    byPath,
    byLevel,
    byType,
    byPathLevel,
    byCompetency,
    emptyCells,
    emptyCompetencies: COMPETENCIES.filter((c) => !byCompetency[c.id]).map((c) => c.id),
  };
}

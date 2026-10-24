import type { Exercise } from '../content/types.ts';
import { COMPETENCIES } from '../content/competencies.ts';
import type { Progress } from '../state/progress.ts';
import { totalXp } from '../state/progress.ts';

export const RANKS: { name: string; xp: number }[] = [
  { name: 'Recrue', xp: 0 },
  { name: 'Analyste N1', xp: 100 },
  { name: 'Analyste N2', xp: 350 },
  { name: 'Chasseur', xp: 800 },
  { name: 'Ingénieur détection', xp: 1600 },
  { name: 'Architecte', xp: 3000 },
];

export function rankFor(xp: number): { name: string; next: { name: string; xp: number } | null; pct: number } {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k;
  const next = RANKS[i + 1] ?? null;
  const pct = next ? Math.round(((xp - RANKS[i].xp) / (next.xp - RANKS[i].xp)) * 100) : 100;
  return { name: RANKS[i].name, next, pct };
}

export type Tier = 'none' | 'bronze' | 'argent' | 'or';

export interface CompBadge {
  id: string;
  name: string;
  done: number;
  total: number;
  tier: Tier;
}

export function competencyBadges(exs: Exercise[], p: Progress): CompBadge[] {
  return COMPETENCIES.map((c) => {
    const list = exs.filter((e) => e.competency === c.id);
    const done = list.filter((e) => p.done[e.id]).length;
    const total = list.length;
    let tier: Tier = 'none';
    if (total > 0) {
      const r = done / total;
      if (r >= 1 && total >= 2) tier = 'or';
      else if (r >= 0.6 && done >= 2) tier = 'argent';
      else if (done >= 1 && (r >= 0.3 || done >= 2)) tier = 'bronze';
    }
    return { id: c.id, name: c.name, done, total, tier };
  }).filter((b) => b.total > 0);
}

export interface GlobalBadge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export function globalBadges(exs: Exercise[], p: Progress): GlobalBadge[] {
  const doneIds = Object.keys(p.done);
  const types = new Set(exs.filter((e) => p.done[e.id]).map((e) => e.type));
  const noHint = doneIds.filter((id) => p.done[id].hintsUsed === 0).length;
  const missions = exs.filter((e) => e.kind === 'mission' && p.done[e.id]).length;
  return [
    { id: 'first', name: 'Premier signal', description: 'Réussir un premier exercice.', earned: doneIds.length >= 1 },
    { id: 'ten', name: 'Dix exercices', description: 'Réussir 10 exercices.', earned: doneIds.length >= 10 },
    { id: 'fifty', name: 'Cinquante exercices', description: 'Réussir 50 exercices.', earned: doneIds.length >= 50 },
    { id: 'polyvalent', name: 'Polyvalent', description: 'Réussir 4 types d’exercices différents.', earned: types.size >= 4 },
    { id: 'sans-indice', name: 'Sans filet', description: 'Réussir 5 exercices sans aucun indice.', earned: noHint >= 5 },
    { id: 'mission', name: 'Mission accomplie', description: 'Terminer une mission finale.', earned: missions >= 1 },
    { id: 'xp-500', name: '500 XP', description: 'Cumuler 500 points d’expérience.', earned: totalXp(p) >= 500 },
  ];
}

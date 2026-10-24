import type { Exercise } from '../content/types.ts';
import { COMPETENCIES } from '../content/competencies.ts';
import type { Progress } from '../state/progress.ts';
import { totalXp } from '../state/progress.ts';
import { tr } from '../i18n/lang.ts';

export const RANKS: { name: string; xp: number }[] = [
  { name: 'Recrue', xp: 0 },
  { name: 'Analyste N1', xp: 100 },
  { name: 'Analyste N2', xp: 350 },
  { name: 'Chasseur', xp: 800 },
  { name: 'Ingénieur détection', xp: 1600 },
  { name: 'Architecte', xp: 3000 },
];

const RANK_EN = ['Recruit', 'Analyst T1', 'Analyst T2', 'Hunter', 'Detection engineer', 'Architect'];
const rankName = (i: number) => tr(RANKS[i].name, RANK_EN[i]);

export function rankFor(xp: number): { name: string; next: { name: string; xp: number } | null; pct: number } {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k;
  const next = RANKS[i + 1] ? { name: rankName(i + 1), xp: RANKS[i + 1].xp } : null;
  const pct = next ? Math.round(((xp - RANKS[i].xp) / (next.xp - RANKS[i].xp)) * 100) : 100;
  return { name: rankName(i), next, pct };
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
    { id: 'first', name: tr('Premier signal', 'First signal'), description: tr('Réussir un premier exercice.', 'Complete your first exercise.'), earned: doneIds.length >= 1 },
    { id: 'ten', name: tr('Dix exercices', 'Ten exercises'), description: tr('Réussir 10 exercices.', 'Complete 10 exercises.'), earned: doneIds.length >= 10 },
    { id: 'fifty', name: tr('Cinquante exercices', 'Fifty exercises'), description: tr('Réussir 50 exercices.', 'Complete 50 exercises.'), earned: doneIds.length >= 50 },
    { id: 'polyvalent', name: tr('Polyvalent', 'Versatile'), description: tr('Réussir 4 types d’exercices différents.', 'Complete 4 different exercise types.'), earned: types.size >= 4 },
    { id: 'sans-indice', name: tr('Sans filet', 'No safety net'), description: tr('Réussir 5 exercices sans aucun indice.', 'Complete 5 exercises without any hint.'), earned: noHint >= 5 },
    { id: 'mission', name: tr('Cas pratique réussi', 'Practical case completed'), description: tr('Réussir un cas pratique de fin de parcours.', 'Complete an end-of-path practical case.'), earned: missions >= 1 },
    { id: 'xp-500', name: '500 XP', description: tr('Cumuler 500 points d’expérience.', 'Earn 500 experience points.'), earned: totalXp(p) >= 500 },
  ];
}

// Défi du jour : 5 exercices tirés de ce qui est à réviser, échoué ou fragile. Déterministe pour un jour donné.
import { dayKey, dueForReview, type Progress } from '../state/progress.ts';
import { shuffleSeeded } from './shuffle.ts';

export const DAILY_SIZE = 5;

type P = Pick<Progress, 'done' | 'failed'>;

/**
 * Ordre de priorité :
 * 1. échéance de révision passée (la plus en retard d'abord)
 * 2. exercices déjà échoués au moins une fois (ratés puis ou non réussis), dont la boîte est basse
 * 3. exercices réussis avec indices ou en boîte 1 à 2
 * 4. le reste des exercices réussis, tirés selon la date
 * Seuls les exercices réussis au moins une fois peuvent être proposés, car les autres dépendent du déverrouillage.
 */
export function dailyChallenge(p: P, known: (id: string) => boolean, now = Date.now(), size = DAILY_SIZE): string[] {
  const out: string[] = [];
  const add = (ids: string[]) => {
    for (const id of ids) {
      if (out.length >= size) return;
      if (known(id) && p.done[id] && !out.includes(id)) out.push(id);
    }
  };
  const day = dayKey(now);
  add(dueForReview({ done: p.done } as Progress, now));
  const failedDone = Object.keys(p.failed).filter((id) => p.done[id] && p.failed[id] > 0).sort((a, b) => p.failed[b] - p.failed[a] || a.localeCompare(b));
  add(shuffleSeeded(failedDone, `f${day}`));
  const fragile = Object.keys(p.done).filter((id) => p.done[id].box <= 2 || p.done[id].hintsUsed > 0).sort();
  add(shuffleSeeded(fragile, `g${day}`));
  add(shuffleSeeded(Object.keys(p.done).sort(), `r${day}`));
  return out;
}

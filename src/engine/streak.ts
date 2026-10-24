// Série de jours consécutifs et objectif hebdomadaire. Fonctions pures, jours en heure locale.
import { dayKey, type Progress } from '../state/progress.ts';

type P = Pick<Progress, 'activity' | 'done'>;

/** Ensemble des jours actifs. Les anciennes sauvegardes (sans `activity`) sont reconstituées avec firstAt et lastAt. */
export function activeDays(p: P): Set<string> {
  const s = new Set(Object.keys(p.activity ?? {}));
  for (const d of Object.values(p.done)) {
    s.add(dayKey(d.firstAt));
    s.add(dayKey(d.lastAt));
  }
  return s;
}

function shiftDay(ms: number, days: number): number {
  const d = new Date(ms);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export interface Streak {
  current: number;
  best: number;
  /** Vrai si aujourd'hui compte déjà. Sinon la série est « en sursis » jusqu'à minuit. */
  todayDone: boolean;
}

export function streak(p: P, now = Date.now()): Streak {
  const days = activeDays(p);
  const todayDone = days.has(dayKey(now));
  let cursor = todayDone ? now : shiftDay(now, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor = shiftDay(cursor, -1);
  }
  // Meilleure série : parcours des jours triés.
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of sorted) {
    const [y, m, d] = k.split('-').map(Number);
    const t = new Date(y, m - 1, d, 12).getTime();
    run = prev !== null && dayKey(shiftDay(t, -1)) === prev ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  }
  return { current, best: Math.max(best, current), todayDone };
}

/** Lundi (heure locale, 00:00) de la semaine contenant `ms`. */
export function weekStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

/** Réussites enregistrées depuis lundi. */
export function weeklyCount(p: Pick<Progress, 'activity'>, now = Date.now()): number {
  const start = weekStart(now);
  let n = 0;
  for (let i = 0; i < 7; i++) n += p.activity?.[dayKey(shiftDay(start, i))] ?? 0;
  return n;
}

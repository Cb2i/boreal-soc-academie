import { describe, expect, it } from 'vitest';
import { dailyChallenge } from '../src/engine/daily.ts';
import { streak, weekStart, weeklyCount } from '../src/engine/streak.ts';
import { DAY, dayKey, emptyProgress, recordFailure, recordSuccess, sanitize } from '../src/state/progress.ts';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe('série et objectif hebdomadaire', () => {
  it('compte les jours consécutifs jusqu’à aujourd’hui', () => {
    let p = emptyProgress(at(2026, 3, 1));
    for (const d of [2, 3, 4]) p = recordSuccess(p, `e${d}`, 10, 'perfect', 0, 1, at(2026, 3, d));
    expect(streak(p, at(2026, 3, 4, 20))).toEqual({ current: 3, best: 3, todayDone: true });
  });
  it('garde la série en sursis la veille, la casse après un jour manqué', () => {
    let p = emptyProgress(0);
    for (const d of [2, 3]) p = recordSuccess(p, `e${d}`, 10, 'perfect', 0, 1, at(2026, 3, d));
    const s = streak(p, at(2026, 3, 4));
    expect(s.current).toBe(2);
    expect(s.todayDone).toBe(false);
    expect(streak(p, at(2026, 3, 6)).current).toBe(0);
    expect(streak(p, at(2026, 3, 6)).best).toBe(2);
  });
  it('reconstitue les anciennes sauvegardes sans activité', () => {
    const p = sanitize({ v: 1, done: { a: { xp: 5, firstAt: at(2026, 3, 3), lastAt: at(2026, 3, 4), attempts: 1, hintsUsed: 0, status: 'perfect', box: 1, due: 0 } } });
    expect(streak(p, at(2026, 3, 4)).current).toBe(2);
  });
  it('la semaine commence le lundi', () => {
    expect(dayKey(weekStart(at(2026, 3, 8)))).toBe('2026-03-02'); // dimanche
    expect(dayKey(weekStart(at(2026, 3, 2)))).toBe('2026-03-02');
    let p = emptyProgress(0);
    p = recordSuccess(p, 'a', 1, 'perfect', 0, 1, at(2026, 3, 1)); // dimanche précédent
    p = recordSuccess(p, 'b', 1, 'perfect', 0, 1, at(2026, 3, 2));
    p = recordSuccess(p, 'b', 1, 'perfect', 0, 1, at(2026, 3, 4));
    expect(weeklyCount(p, at(2026, 3, 5))).toBe(2);
  });
  it('assainit objectif, nom et activité importés', () => {
    const p = sanitize({ v: 1, settings: { weeklyGoal: 9999 }, certName: 'x'.repeat(200), activity: { '2026-01-01': 3, mauvais: 2, '2026-01-02': -1 } });
    expect(p.settings.weeklyGoal).toBe(50);
    expect(p.certName.length).toBe(60);
    expect(p.activity).toEqual({ '2026-01-01': 3 });
    expect(sanitize({ v: 1 }).settings.weeklyGoal).toBe(5);
  });
});

describe('défi du jour', () => {
  const all = () => true;
  it('est vide sans réussite', () => {
    expect(dailyChallenge(emptyProgress(0), all, 0)).toEqual([]);
  });
  it('priorise ce qui est échu, sans doublon, max 5, stable dans la journée', () => {
    let p = emptyProgress(0);
    for (let i = 0; i < 8; i++) p = recordSuccess(p, `ex${i}`, 10, 'perfect', 0, 1, at(2026, 3, 1) + i);
    p = recordFailure(p, 'ex7');
    const now = at(2026, 3, 3);
    const a = dailyChallenge(p, all, now);
    expect(a).toHaveLength(5);
    expect(new Set(a).size).toBe(5);
    expect(dailyChallenge(p, all, now + 3600_000)).toEqual(a);
    expect(a.every((id) => p.done[id])).toBe(true);
  });
  it('ignore les identifiants inconnus et les exercices jamais réussis', () => {
    let p = recordSuccess(emptyProgress(0), 'ok', 5, 'perfect', 0, 1, 0);
    p = recordFailure(p, 'jamais-reussi');
    expect(dailyChallenge(p, (id) => id === 'ok', 5 * DAY)).toEqual(['ok']);
  });
});

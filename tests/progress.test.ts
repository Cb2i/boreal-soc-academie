import { describe, expect, it } from 'vitest';
import { ALL_EXERCISES } from '../src/content/index.ts';
import { PATHS } from '../src/content/paths.ts';
import { isUnlocked, levelUnlocked, UNLOCK_RATIO } from '../src/engine/unlock.ts';
import { competencyBadges, globalBadges, rankFor, RANKS } from '../src/engine/scoring.ts';
import { computeCoverage } from '../src/engine/coverage.ts';
import {
  dueForReview, emptyProgress, exportProgress, importProgress, recordFailure, recordSuccess, sanitize, toggleFavorite, totalXp, DAY,
} from '../src/state/progress.ts';

describe('progression locale', () => {
  it('enregistre une réussite et planifie une révision', () => {
    const now = 1_000_000;
    const p = recordSuccess(emptyProgress(now), 'kql-001', 12, 'perfect', 0, 1, now);
    expect(p.done['kql-001'].xp).toBe(12);
    expect(p.done['kql-001'].due).toBe(now + DAY);
    expect(totalXp(p)).toBe(12);
    expect(dueForReview(p, now)).toEqual([]);
    expect(dueForReview(p, now + 2 * DAY)).toEqual(['kql-001']);
  });
  it('une seconde réussite avance la boîte de révision et conserve le meilleur XP', () => {
    const p1 = recordSuccess(emptyProgress(0), 'a', 20, 'perfect', 0, 1, 0);
    const p2 = recordSuccess(p1, 'a', 5, 'optimizable', 3, 2, 10);
    expect(p2.done.a.box).toBe(2);
    expect(p2.done.a.xp).toBe(20);
    expect(p2.done.a.hintsUsed).toBe(0);
    expect(p2.done.a.attempts).toBe(3);
  });
  it('un échec ramène un exercice réussi en boîte 1 et compte les échecs', () => {
    let p = recordSuccess(emptyProgress(0), 'a', 10, 'perfect', 0, 1, 0);
    p = recordSuccess(p, 'a', 10, 'perfect', 0, 1, 1);
    p = recordFailure(p, 'a');
    expect(p.done.a.box).toBe(1);
    expect(p.failed.a).toBe(1);
  });
  it('favoris : ajout puis retrait', () => {
    const p1 = toggleFavorite(emptyProgress(), 'x');
    expect(p1.favorites).toEqual(['x']);
    expect(toggleFavorite(p1, 'x').favorites).toEqual([]);
  });
  it('export puis import redonne la même progression', () => {
    let p = recordSuccess(emptyProgress(5), 'kql-002', 10, 'perfect', 1, 1, 5);
    p = toggleFavorite(p, 'kql-003');
    const back = importProgress(exportProgress(p));
    expect(back.done['kql-002'].xp).toBe(10);
    expect(back.favorites).toEqual(['kql-003']);
  });
  it('import : refuse un JSON invalide et une version incompatible', () => {
    expect(() => importProgress('pas du json')).toThrow();
    expect(() => importProgress(JSON.stringify({ v: 99 }))).toThrow();
  });
  it('sanitize : tolère des données corrompues', () => {
    const p = sanitize({ v: 1, done: 'x', favorites: [1, 'a', null], settings: { theme: 'rose', unlockAll: 'oui' } });
    expect(p.done).toEqual({});
    expect(p.favorites).toEqual(['a']);
    expect(p.settings.theme).toBe('auto');
    expect(p.settings.unlockAll).toBe(false);
    expect(sanitize(null).done).toEqual({});
  });
});

describe('déverrouillage', () => {
  it('le niveau 1 est toujours ouvert', () => {
    for (const p of PATHS) expect(levelUnlocked(ALL_EXERCISES, p.id, 1, {})).toBe(true);
  });
  it('le niveau 2 du parcours KQL est fermé au départ puis s’ouvre à 60 % du niveau 1', () => {
    const lvl1 = ALL_EXERCISES.filter((e) => e.path === 'kql' && e.level === 1);
    expect(levelUnlocked(ALL_EXERCISES, 'kql', 2, {})).toBe(false);
    const need = Math.ceil(lvl1.length * UNLOCK_RATIO);
    const done: Record<string, unknown> = {};
    lvl1.slice(0, need - 1).forEach((e) => (done[e.id] = true));
    expect(levelUnlocked(ALL_EXERCISES, 'kql', 2, done)).toBe(false);
    done[lvl1[need - 1].id] = true;
    expect(levelUnlocked(ALL_EXERCISES, 'kql', 2, done)).toBe(true);
  });
  it('un parcours sans niveau 1 ouvre le niveau 2', () => {
    expect(ALL_EXERCISES.some((e) => e.path === 'azure-admin' && e.level === 1)).toBe(false);
    expect(levelUnlocked(ALL_EXERCISES, 'azure-admin', 2, {})).toBe(true);
  });
  it('les prérequis d’exercice bloquent tant qu’ils ne sont pas réussis', () => {
    const e = ALL_EXERCISES.find((x) => x.path === 'azure-foundations' && x.prerequisites.length > 0)!;
    expect(isUnlocked(e, ALL_EXERCISES, {})).toBe(false);
    const done = Object.fromEntries(e.prerequisites.map((p) => [p, true]));
    const levelOk = levelUnlocked(ALL_EXERCISES, e.path, e.level, done);
    expect(isUnlocked(e, ALL_EXERCISES, done)).toBe(levelOk);
  });
  it('le mode « tout déverrouiller » ouvre tout', () => {
    for (const e of ALL_EXERCISES) expect(isUnlocked(e, ALL_EXERCISES, {}, true)).toBe(true);
  });
  it('aucun exercice n’est inatteignable : tout se déverrouille en réussissant dans l’ordre du catalogue', () => {
    const done: Record<string, unknown> = {};
    let progress = true;
    while (progress) {
      progress = false;
      for (const e of ALL_EXERCISES) {
        if (!done[e.id] && isUnlocked(e, ALL_EXERCISES, done)) {
          done[e.id] = true;
          progress = true;
        }
      }
    }
    const stuck = ALL_EXERCISES.filter((e) => !done[e.id]).map((e) => e.id);
    expect(stuck).toEqual([]);
  });
});

describe('rangs, insignes et couverture', () => {
  it('les rangs montent avec l’XP', () => {
    expect(rankFor(0).name).toBe(RANKS[0].name);
    expect(rankFor(RANKS[3].xp).name).toBe(RANKS[3].name);
    expect(rankFor(10_000).next).toBeNull();
  });
  it('insignes de compétence : paliers selon la proportion réussie', () => {
    const comp = ALL_EXERCISES.filter((e) => e.competency === 'kql-filter');
    const p = emptyProgress();
    expect(competencyBadges(ALL_EXERCISES, p).find((b) => b.id === 'kql-filter')!.tier).toBe('none');
    for (const e of comp) p.done[e.id] = { xp: 10, firstAt: 0, lastAt: 0, attempts: 1, hintsUsed: 0, status: 'perfect', box: 1, due: 0 };
    expect(competencyBadges(ALL_EXERCISES, p).find((b) => b.id === 'kql-filter')!.tier).toBe('or');
  });
  it('insignes globaux : aucun au départ', () => {
    expect(globalBadges(ALL_EXERCISES, emptyProgress()).every((b) => !b.earned)).toBe(true);
  });
  it('couverture : le total et le total par parcours concordent', () => {
    const c = computeCoverage(ALL_EXERCISES);
    expect(c.total).toBe(ALL_EXERCISES.length);
    expect(Object.values(c.byPath).reduce((a, b) => a + b, 0)).toBe(c.total);
    expect(c.total).toBeGreaterThanOrEqual(200);
    expect(c.byPath.kql).toBeGreaterThanOrEqual(100);
  });
});

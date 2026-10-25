import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../src/msec/scenarios/index.ts';
import { SOURCE_BY_ID } from '../src/msec/sources.ts';
import { SHEET_FIELDS } from '../src/pages/track/ScenarioPages.tsx';

const dash = String.fromCharCode(0x2014);

describe('fiches de décision des scénarios', () => {
  it('huit scénarios aux identifiants uniques', () => {
    expect(SCENARIOS.length).toBe(8);
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(8);
  });
  it('toutes les rubriques sont remplies, sourcées et sans tiret cadratin', () => {
    for (const s of SCENARIOS) {
      for (const f of SHEET_FIELDS) {
        const v = s.sheet[f.key] as string;
        expect(v.length, `${s.id}.${f.key}`).toBeGreaterThan(20);
        expect(v.includes(dash), `${s.id}.${f.key}`).toBe(false);
      }
      expect(s.sheet.sources.length, s.id).toBeGreaterThanOrEqual(3);
      for (const id of s.sheet.sources) expect(SOURCE_BY_ID[id], `${s.id}:${id}`).toBeDefined();
      expect(new Set(s.components.map((c) => c[1])).size, `${s.id} natures distinctes`).toBe(3);
      expect(s.quiz.length, s.id).toBe(12);
    }
  });
  it('les trois rôles de la fiche ne sont pas confondus', () => {
    for (const s of SCENARIOS) {
      expect(new Set([s.sheet.deciding, s.sheet.enforcing, s.sheet.evidence]).size, s.id).toBe(3);
    }
  });
});

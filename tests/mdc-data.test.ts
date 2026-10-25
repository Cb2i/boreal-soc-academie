import { describe, expect, it } from 'vitest';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { CAPABILITIES } from '../src/msec/mdc/caps/index.ts';
import { SHEETS } from '../src/msec/mdc/sheets/index.ts';
import { SCENARIOS_MDC } from '../src/msec/mdc/scenarios.ts';
import { LIMITS } from '../src/msec/mdc/limits.ts';
import { SCENARIO_FAMILIES, SHEET_POINTS } from '../src/msec/mdc/model.ts';
import { SOURCE_BY_ID } from '../src/msec/sources.ts';

const dash = String.fromCharCode(0x2014);

describe('Defender for Cloud : matrice, fiches et scénarios', async () => {
  const C = await CONTENT_LOADERS.mdc();
  it('capacités : identifiants uniques, module et leçons existants, sources du registre, justification si non rédigée', () => {
    expect(new Set(CAPABILITIES.map((c) => c.id)).size).toBe(CAPABILITIES.length);
    for (const c of CAPABILITIES) {
      expect(C.MODULE_BY_ID[c.module], c.id).toBeDefined();
      expect(c.lessons.length, c.id).toBeGreaterThanOrEqual(1);
      for (const l of c.lessons) expect(C.LESSON_BY_ID[l]?.module, `${c.id} ${l}`).toBe(c.module);
      for (const s of c.sources) expect(SOURCE_BY_ID[`mdc-${s}`], `${c.id} ${s}`).toBeDefined();
      expect(c.sources.length, c.id).toBeGreaterThanOrEqual(1);
      for (const k of ['plan', 'objective', 'risk', 'clouds', 'scope', 'prerequisites', 'permissions', 'costs', 'collection', 'compatibility', 'limits'] as const) expect(c[k].length, `${c.id}.${k}`).toBeGreaterThan(4);
      if (c.status.redaction !== 'redigee') expect(c.note?.length ?? 0, `${c.id} justification`).toBeGreaterThan(20);
      expect(c.status.lab, c.id).toBe('non-realisee');
      expect(JSON.stringify(c).includes(dash), c.id).toBe(false);
    }
  });
  it('fiches : 21 points rédigés plus sources, module et leçons existants', () => {
    expect(new Set(SHEETS.map((s) => s.id)).size).toBe(SHEETS.length);
    expect(SHEET_POINTS.length).toBe(22);
    for (const s of SHEETS) {
      expect(s.points.length, s.id).toBe(21);
      s.points.forEach((p, i) => expect(p.length, `${s.id} point ${i + 1}`).toBeGreaterThan(15));
      expect(C.MODULE_BY_ID[s.module], s.id).toBeDefined();
      for (const l of s.lessons) expect(C.LESSON_BY_ID[l], `${s.id} ${l}`).toBeDefined();
      expect(s.sources.length, s.id).toBeGreaterThanOrEqual(1);
      for (const x of s.sources) expect(SOURCE_BY_ID[`mdc-${x}`], `${s.id} ${x}`).toBeDefined();
      expect(JSON.stringify(s).includes(dash), s.id).toBe(false);
    }
  });
  it('scénarios : famille connue, modules et sources existants', () => {
    expect(new Set(SCENARIOS_MDC.map((s) => s.id)).size).toBe(SCENARIOS_MDC.length);
    for (const s of SCENARIOS_MDC) {
      expect(SCENARIO_FAMILIES as readonly string[], s.id).toContain(s.family);
      for (const m of s.modules) expect(C.MODULE_BY_ID[m], `${s.id} ${m}`).toBeDefined();
      for (const x of s.sources) expect(SOURCE_BY_ID[`mdc-${x}`], `${s.id} ${x}`).toBeDefined();
      for (const k of ['need', 'architecture', 'responsibilities', 'configuration', 'test', 'evidence', 'investigation', 'troubleshooting', 'evaluation'] as const) expect(s[k].length, `${s.id}.${k}`).toBeGreaterThan(20);
      expect(JSON.stringify(s).includes(dash), s.id).toBe(false);
    }
  });
  it('limites : identifiants uniques et sans tiret cadratin', () => {
    expect(new Set(LIMITS.map((l) => l.id)).size).toBe(LIMITS.length);
    expect(JSON.stringify(LIMITS).includes(dash)).toBe(false);
  });
});

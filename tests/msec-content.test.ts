import { describe, expect, it } from 'vitest';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { referenceAnswerAi, validateAi } from '../src/agentic/validate.ts';
import { isEvidence } from '../src/agentic/engine.ts';
import { SOURCES, SOURCE_BY_ID } from '../src/msec/sources.ts';

const dash = String.fromCharCode(0x2014);
const unique = (ids: string[]) => new Set(ids).size === ids.length;
const MSEC = Object.keys(CONTENT_LOADERS).filter((id) => id !== 'ia');

describe('registre des sources', () => {
  it('identifiants uniques, HTTPS, date de consultation, aucun tiret cadratin', () => {
    expect(unique(SOURCES.map((s) => s.id))).toBe(true);
    for (const s of SOURCES) {
      expect(s.url.startsWith('https://'), s.id).toBe(true);
      expect(JSON.stringify(s).includes(dash), s.id).toBe(false);
    }
  });
});

for (const id of MSEC) {
  describe(`parcours ${id} : intégrité du contenu`, async () => {
    const C = await CONTENT_LOADERS[id]();
    it('identifiants uniques et références existantes', () => {
      expect(unique(C.EXERCISES.map((e) => e.id))).toBe(true);
      expect(unique(C.LESSONS.map((l) => l.id))).toBe(true);
      expect(unique(C.PROJECTS.map((p) => p.id))).toBe(true);
      for (const m of C.MODULES) {
        expect(C.LEVELS.some((l) => l.n === m.level), m.id).toBe(true);
        expect(m.evaluation.length, `${m.id} évaluation`).toBe(8);
        expect(m.competencies.length, m.id).toBeGreaterThanOrEqual(2);
        expect(m.projects.length, m.id).toBeGreaterThanOrEqual(1);
        expect(m.remediation.length, m.id).toBeGreaterThanOrEqual(3);
        expect(C.CASE_BY_MODULE[m.id], m.id).toBeDefined();
        for (const x of [...m.evaluation, ...m.remediation]) expect(C.EX_BY_ID[x], x).toBeDefined();
      }
    });
    it('leçons complètes avec liens présents dans le registre', () => {
      for (const l of C.LESSONS) {
        expect(l.objectives.length, l.id).toBeGreaterThanOrEqual(2);
        expect(l.body.length, `${l.id} corps`).toBeGreaterThan(2500);
        expect(l.demo.body.length, l.id).toBeGreaterThan(200);
        expect(l.revision.length, l.id).toBeGreaterThan(200);
        expect(l.quiz.length, l.id).toBe(3);
        expect(l.links.length, l.id).toBeGreaterThanOrEqual(1);
        for (const k of l.links) expect(Object.values(SOURCE_BY_ID).some((s) => s.url === k.url), `${l.id} ${k.url}`).toBe(true);
        for (const x of [l.guided, l.autonomous, ...l.quiz]) expect(C.EX_BY_ID[x]?.module, x).toBe(l.module);
        expect(C.EX_BY_ID[l.guided].role).toBe('guided');
        expect(C.EX_BY_ID[l.autonomous].role).toBe('autonomous');
        for (const q of l.quiz) expect(C.EX_BY_ID[q].role).toBe('quiz');
      }
    });
    it('compétences avec preuves ; exercices résolus par leur réponse de référence', () => {
      for (const c of C.COMPETENCIES) {
        expect(c.criteria.length, c.id).toBeGreaterThanOrEqual(3);
        expect(C.EXERCISES.filter((e) => e.competency === c.id && isEvidence(e)).length, c.id).toBeGreaterThanOrEqual(2);
      }
      for (const e of C.EXERCISES) {
        expect(e.explanation.length, e.id).toBeGreaterThan(40);
        const v = validateAi(e, referenceAnswerAi(e));
        expect(v.correct, `${e.id} : ${v.message} ${v.details.join(' ')}`).toBe(true);
        if (e.type === 'qcm') for (const ch of e.choices) expect(ch.why.length, `${e.id}/${ch.id}`).toBeGreaterThan(5);
      }
    });
    it('cas pratiques et absence de tiret cadratin', () => {
      for (const cs of C.CASES) {
        expect(cs.steps.length, cs.id).toBeGreaterThanOrEqual(3);
        for (const x of cs.steps) expect(C.EX_BY_ID[x]?.role, x).toBe('case');
      }
      expect(JSON.stringify(C).includes(dash)).toBe(false);
    });
  });
}

import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { CASES, COMPETENCIES, EXERCISES, LESSONS, MODULES, PROJECTS, RESOURCES, EX_BY_ID, COMP_BY_ID, LEVELS } from '../src/agentic/content/index.ts';
import { referenceAnswerAi, validateAi } from '../src/agentic/validate.ts';
import { isEvidence } from '../src/agentic/engine.ts';

const dash = String.fromCharCode(0x2014);
const unique = (ids: string[]) => new Set(ids).size === ids.length;

describe('contenu Agentic AI : intégrité', () => {
  it('identifiants uniques', () => {
    expect(unique(EXERCISES.map((e) => e.id))).toBe(true);
    expect(unique(LESSONS.map((l) => l.id))).toBe(true);
    expect(unique(COMPETENCIES.map((c) => c.id))).toBe(true);
    expect(unique(PROJECTS.map((p) => p.id))).toBe(true);
    expect(unique(MODULES.map((m) => m.id))).toBe(true);
  });

  it('chaque module est complet et ses références existent', () => {
    for (const m of MODULES) {
      expect(LEVELS.some((l) => l.n === m.level), m.id).toBe(true);
      expect(m.lessons.length, `${m.id} leçons`).toBeGreaterThanOrEqual(1);
      expect(m.evaluation.length, `${m.id} évaluation`).toBe(8);
      expect(m.competencies.length, `${m.id} compétences`).toBeGreaterThanOrEqual(2);
      expect(m.projects.length, `${m.id} labs`).toBeGreaterThanOrEqual(1);
      expect(m.remediation.length, `${m.id} remédiation`).toBeGreaterThanOrEqual(3);
      expect(CASES.some((c) => c.id === m.caseStudy), `${m.id} cas`).toBe(true);
      for (const id of [...m.evaluation, ...m.remediation]) expect(EX_BY_ID[id], id).toBeDefined();
      for (const id of m.competencies) expect(COMP_BY_ID[id], id).toBeDefined();
      for (const id of m.projects) expect(PROJECTS.some((p) => p.id === id), id).toBe(true);
    }
  });

  it('chaque leçon contient les neuf parties et pointe vers des exercices existants', () => {
    for (const l of LESSONS) {
      expect(l.objectives.length, l.id).toBeGreaterThanOrEqual(2);
      expect(l.body.length, `${l.id} corps`).toBeGreaterThan(2500);
      expect(l.demo.body.length, `${l.id} démo`).toBeGreaterThan(200);
      expect(l.revision.length, `${l.id} fiche`).toBeGreaterThan(200);
      expect(l.links.length, `${l.id} liens`).toBeGreaterThanOrEqual(1);
      expect(l.quiz.length, `${l.id} quiz`).toBe(3);
      for (const id of [l.guided, l.autonomous, ...l.quiz]) {
        expect(EX_BY_ID[id], id).toBeDefined();
        expect(EX_BY_ID[id].module).toBe(l.module);
      }
      expect(EX_BY_ID[l.guided].role).toBe('guided');
      expect(EX_BY_ID[l.autonomous].role).toBe('autonomous');
      for (const q of l.quiz) expect(EX_BY_ID[q].role).toBe('quiz');
    }
  });

  it('chaque compétence a des preuves notées et une grille', () => {
    for (const c of COMPETENCIES) {
      expect(c.criteria.length, c.id).toBeGreaterThanOrEqual(3);
      const ev = EXERCISES.filter((e) => e.competency === c.id && isEvidence(e));
      expect(ev.length, `${c.id} preuves`).toBeGreaterThanOrEqual(2);
    }
  });

  it('chaque exercice a une explication et se résout avec sa réponse de référence', () => {
    for (const e of EXERCISES) {
      expect(e.explanation.length, e.id).toBeGreaterThan(40);
      expect(COMP_BY_ID[e.competency], `${e.id} compétence`).toBeDefined();
      const v = validateAi(e, referenceAnswerAi(e));
      expect(v.correct, `${e.id} : ${v.message} ${v.details.join(' ')}`).toBe(true);
    }
  });

  it('QCM : chaque choix a une explication et au moins une bonne réponse', () => {
    for (const e of EXERCISES) {
      if (e.type !== 'qcm') continue;
      expect(e.choices.some((c) => c.correct), e.id).toBe(true);
      expect(e.choices.some((c) => !c.correct), e.id).toBe(true);
      for (const c of e.choices) expect(c.why.length, `${e.id}/${c.id}`).toBeGreaterThan(5);
    }
  });

  it('une mauvaise réponse n’est pas acceptée (QCM et réponse courte)', () => {
    for (const e of EXERCISES) {
      if (e.type === 'qcm') {
        const wrong = e.choices.filter((c) => !c.correct).map((c) => c.id);
        expect(validateAi(e, { type: 'qcm', ids: wrong }).correct, e.id).toBe(false);
      }
      if (e.type === 'short') expect(validateAi(e, { type: 'short', value: 'zzz qqq' }).correct, e.id).toBe(false);
    }
  });

  it('les cas pratiques ont leurs étapes dans le rôle « case »', () => {
    for (const c of CASES) {
      expect(c.steps.length, c.id).toBeGreaterThanOrEqual(3);
      for (const id of c.steps) expect(EX_BY_ID[id]?.role, id).toBe('case');
      if (c.deliverable) expect(EX_BY_ID[c.deliverable]?.type).toBe('open');
    }
  });

  it('aucun tiret cadratin dans le contenu', () => {
    const all = JSON.stringify({ EXERCISES, LESSONS, COMPETENCIES, PROJECTS, CASES, MODULES, RESOURCES });
    expect(all.includes(dash)).toBe(false);
  });

  it('les ressources annoncées existent sur le disque', () => {
    for (const r of RESOURCES) expect(existsSync(resolve('public/ressources-ia', r.file)), r.file).toBe(true);
  });

  it('18 modules, 9 projets de synthèse et ressources cohérentes', () => {
    expect(MODULES.length).toBe(18);
    expect(PROJECTS.filter((p) => p.module === 'final').length).toBe(9);
    const ids = new Set(RESOURCES.map((r) => r.id));
    expect(ids.size).toBe(RESOURCES.length);
    for (const p of PROJECTS) for (const id of p.resources ?? []) expect(ids.has(id), `${p.id} -> ${id}`).toBe(true);
    for (const r of RESOURCES) {
      expect(['teste', 'a-verifier']).toContain(r.status);
      expect(r.how.length, r.id).toBeGreaterThan(20);
      if (r.kind === 'n8n' || r.kind === 'logicapps') expect(r.status, r.id).toBe('a-verifier');
    }
  });
});

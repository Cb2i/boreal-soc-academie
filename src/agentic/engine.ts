// Calculs de suivi : compétences validées, notions à revoir, recommandation. Fonctions pures sur le contenu et la progression.
import type { AiCompetency, AiExercise, AiLesson, AiModule, Dim } from './types.ts';
import type { AiProgress } from './state.ts';

export const PASS_RATIO = 0.7;

export interface Catalog {
  modules: AiModule[];
  lessons: AiLesson[];
  exercises: AiExercise[];
  competencies: AiCompetency[];
}

/** Un exercice de ce rôle compte comme preuve de compétence. Les travaux ouverts, autoévalués, sont exclus. */
export function isEvidence(e: AiExercise): boolean {
  return (e.role === 'eval' || e.role === 'case') && e.type !== 'open';
}

export type CompStatus = 'non-evaluee' | 'en-cours' | 'validee';

export interface CompResult {
  status: CompStatus;
  /** Moyenne des meilleurs scores sur les preuves déjà tentées. */
  mean: number;
  attempted: number;
  total: number;
}

export function competenceStatus(c: AiCompetency, cat: Catalog, p: AiProgress): CompResult {
  const ev = cat.exercises.filter((e) => e.competency === c.id && isEvidence(e));
  const tried = ev.filter((e) => p.items[e.id]);
  const mean = tried.length ? tried.reduce((a, e) => a + p.items[e.id].best, 0) / tried.length : 0;
  let status: CompStatus = 'non-evaluee';
  if (tried.length > 0) status = 'en-cours';
  if (ev.length > 0 && tried.length === ev.length && mean >= PASS_RATIO) status = 'validee';
  return { status, mean, attempted: tried.length, total: ev.length };
}

export function lessonExercises(l: AiLesson): string[] {
  return [l.guided, l.autonomous, ...l.quiz];
}

export function lessonProgress(l: AiLesson, p: AiProgress): { seen: boolean; passed: number; total: number } {
  const ids = lessonExercises(l);
  return { seen: !!p.lessonsSeen[l.id], passed: ids.filter((id) => p.items[id]?.passed).length, total: ids.length };
}

export interface ModuleStats {
  lessonsSeen: number;
  lessons: number;
  exercisesPassed: number;
  exercises: number;
  evalScore: number | null;
  caseScore: number | null;
  competenciesValidated: number;
  competencies: number;
  projectsDone: number;
  projects: number;
}

export function moduleStats(m: AiModule, cat: Catalog, p: AiProgress, projectIds: string[]): ModuleStats {
  const lessons = cat.lessons.filter((l) => l.module === m.id);
  const exs = lessons.flatMap((l) => lessonExercises(l));
  const caseEx = cat.exercises.filter((e) => e.module === m.id && e.role === 'case' && e.type !== 'open');
  const caseTried = caseEx.filter((e) => p.items[e.id]);
  const comps = cat.competencies.filter((c) => c.module === m.id);
  return {
    lessonsSeen: lessons.filter((l) => p.lessonsSeen[l.id]).length,
    lessons: lessons.length,
    exercisesPassed: exs.filter((id) => p.items[id]?.passed).length,
    exercises: exs.length,
    evalScore: p.evals[m.id] ? p.evals[m.id].score : null,
    caseScore: caseTried.length === caseEx.length && caseEx.length > 0 ? caseTried.reduce((a, e) => a + p.items[e.id].best, 0) / caseEx.length : null,
    competenciesValidated: comps.filter((c) => competenceStatus(c, cat, p).status === 'validee').length,
    competencies: comps.length,
    projectsDone: projectIds.filter((id) => p.projects[id]?.status === 'realise').length,
    projects: projectIds.length,
  };
}

/** Notions à revoir : tags des exercices ratés (score < 1) lors de la dernière évaluation du module ou du cas pratique. */
export function weakTags(moduleId: string, cat: Catalog, p: AiProgress): string[] {
  const tags = new Set<string>();
  const ev = p.evals[moduleId];
  if (ev) {
    for (const [id, s] of Object.entries(ev.items)) {
      const ex = cat.exercises.find((e) => e.id === id);
      if (ex && s < 1) ex.tags.forEach((t) => tags.add(t));
    }
  }
  for (const ex of cat.exercises) {
    if (ex.module === moduleId && ex.role === 'case' && p.items[ex.id] && p.items[ex.id].last < 1) ex.tags.forEach((t) => tags.add(t));
  }
  return [...tags];
}

export function remediationFor(moduleId: string, tags: string[], cat: Catalog): { lessons: AiLesson[]; exercises: AiExercise[] } {
  const t = new Set(tags);
  const lessons = cat.lessons.filter((l) => l.module === moduleId && l.teaches.some((x) => t.has(x)));
  const exercises = cat.exercises.filter((e) => e.module === moduleId && e.role === 'remediation' && e.tags.some((x) => t.has(x)));
  return { lessons, exercises };
}

export type Next =
  | { kind: 'lesson'; id: string; title: string; reason: string }
  | { kind: 'evaluation'; module: string; title: string; reason: string }
  | { kind: 'case'; module: string; title: string; reason: string }
  | { kind: 'remediation'; module: string; title: string; reason: string }
  | { kind: 'done'; reason: string };

/** Recommandation : leçon non consultée, puis évaluation, puis remédiation si besoin, puis cas pratique, puis module suivant. */
export function recommend(cat: Catalog, p: AiProgress): Next {
  for (const m of cat.modules) {
    const lessons = cat.lessons.filter((l) => l.module === m.id);
    const l = lessons.find((x) => !p.lessonsSeen[x.id]);
    if (l) return { kind: 'lesson', id: l.id, title: l.title, reason: `Module ${m.n} : ${m.title}` };
    if (!p.evals[m.id]) return { kind: 'evaluation', module: m.id, title: `Évaluation du module ${m.n}`, reason: 'Vous avez consulté toutes les leçons : vérifiez vos acquis.' };
    const weak = weakTags(m.id, cat, p);
    const rem = remediationFor(m.id, weak, cat);
    const notDone = rem.exercises.filter((e) => !p.items[e.id]?.passed);
    if (notDone.length > 0) return { kind: 'remediation', module: m.id, title: `Remédiation du module ${m.n}`, reason: `${weak.length} notion(s) à revoir d’après vos erreurs.` };
    const caseEx = cat.exercises.filter((e) => e.module === m.id && e.role === 'case' && e.type !== 'open');
    if (caseEx.some((e) => !p.items[e.id])) return { kind: 'case', module: m.id, title: `Cas pratique du module ${m.n}`, reason: 'Mettez les notions en situation.' };
  }
  return { kind: 'done', reason: 'Tous les modules livrés sont parcourus. Passez aux labs.' };
}

/** Score moyen par dimension sur les exercices notés automatiquement et déjà tentés. */
export function dimScores(cat: Catalog, p: AiProgress): Record<Dim, { mean: number; n: number }> {
  const out: Record<Dim, { sum: number; n: number }> = { comprendre: { sum: 0, n: 0 }, fonctionner: { sum: 0, n: 0 }, securiser: { sum: 0, n: 0 }, maintenir: { sum: 0, n: 0 }, verifier: { sum: 0, n: 0 }, cout: { sum: 0, n: 0 } };
  for (const e of cat.exercises) {
    if (e.type === 'open') continue;
    const r = p.items[e.id];
    if (!r) continue;
    out[e.dim].sum += r.best;
    out[e.dim].n++;
  }
  const res = {} as Record<Dim, { mean: number; n: number }>;
  (Object.keys(out) as Dim[]).forEach((d) => (res[d] = { mean: out[d].n ? out[d].sum / out[d].n : 0, n: out[d].n }));
  return res;
}

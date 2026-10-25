// Raccourcis d'écriture du parcours Defender for Cloud : un module = un fichier de données lisible.
// Les identifiants d'exercices, de blocs et de lignes sont générés ; la validation reste celle du moteur commun.
import type { AiCompetency, AiExercise, AiLesson, AiProject, Dim, FixRule, ConfigField } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const pad = (e: string) => (e.length > 40 ? e : `${e} Relisez la leçon correspondante pour le détail.`);
export const md = (...lines: string[]) => lines.join('\n');
type Role = 'guided' | 'autonomous' | 'quiz' | 'eval' | 'case' | 'remediation';
export interface Ctx { comp: string; lesson: string; tags: string[] }
export type Opt = [text: string, why: string];

export interface LessonSpec {
  title: string; minutes: number; summary: string; objectives: string[]; prerequisites: string[];
  body: string; demo: { title: string; body: string }; revision: string; links: string[]; teaches: string[];
}

export function dsl(m: string) {
  const { a, Q, M } = kit(m);
  const base = (c: Ctx, role: Role, dim: Dim) => ({ comp: c.comp, tags: c.tags, role, dim, lesson: c.lesson });
  const lesson = (n: number, s: LessonSpec): AiLesson => ({
    id: `${m}-l${n}`, module: m, title: s.title, summary: s.summary, minutes: s.minutes, objectives: s.objectives, prerequisites: s.prerequisites,
    body: s.body, demo: s.demo, guided: `${m}-g${n}`, autonomous: `${m}-a${n}`, quiz: [`${m}-q${n}a`, `${m}-q${n}b`, `${m}-q${n}c`],
    revision: s.revision, links: s.links.map((id) => sref(`mdc-${id}`)), teaches: s.teaches,
  });
  /** Association : paires [élément, réponse] ; les réponses sont présentées dans le même ordre que les éléments. */
  const MT = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, pairs: [string, string][], exp: string): AiExercise =>
    a.match({ id, title, ...base(c, role, dim), st, exp: pad(exp), items: pairs.map(([t], i) => [`p${i + 1}`, t]), options: pairs.map(([, o], i) => [`s${i + 1}`, o]), answer: Object.fromEntries(pairs.map((_, i) => [`p${i + 1}`, `s${i + 1}`])) });
  /** Ordre : les étapes sont écrites dans le bon ordre ; `alt` ajoute des ordres équivalents acceptés (indices d'étapes). */
  const OR = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, steps: string[], exp: string, alt?: number[][]): AiExercise =>
    a.order({ id, title, ...base(c, role, dim), st, exp: pad(exp), items: steps.map((t, i) => [`s${i + 1}`, t]), correct: steps.map((_, i) => `s${i + 1}`), alt: alt?.map((o) => o.map((i) => `s${i + 1}`)) });
  /** Configuration : bascules [libellé, 'on'|'off', pourquoi] ou listes [libellé, options[], bonne option, pourquoi]. */
  type Fld = [label: string, on: 'on' | 'off', why: string] | [label: string, options: [string, string][], good: string, why: string] | [label: string, min: number, max: number, unit: string, why: string];
  const CF = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, fl: Fld[], exp: string): AiExercise => {
    const solution: Record<string, string | number> = {};
    const fields: ConfigField[] = fl.map((f, i) => {
      const fid = `f${i + 1}`;
      if (f.length === 3) { solution[fid] = f[1]; return { id: fid, label: f[0], kind: 'toggle', accept: [f[1]], why: f[2] }; }
      if (f.length === 4) { solution[fid] = f[2]; return { id: fid, label: f[0], kind: 'select', options: f[1].map(([oid, label]) => ({ id: oid, label })), accept: [f[2]], why: f[3] }; }
      solution[fid] = Math.round((f[1] + f[2]) / 2);
      return { id: fid, label: f[0], kind: 'number', unit: f[3], accept: { min: f[1], max: f[2] }, why: f[4] };
    });
    return a.config({ id, title, ...base(c, role, dim), st, exp: pad(exp), fields, solution });
  };
  /** Inspection : lignes [texte] ou [texte, bon correctif, mauvais correctif]. */
  const IN = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, language: 'text' | 'json' | 'kql' | 'bash' | 'powershell' | 'yaml' | 'python' | 'http', lines: ([string] | [string, string, string])[], exp: string): AiExercise =>
    a.inspect({ id, title, ...base(c, role, dim), st, exp: pad(exp), language: language as never, lines: lines.map((l, i) => (l.length === 1 ? [`p${i + 1}`, l[0]] : [`p${i + 1}`, l[0], { ok: `a${i + 1}`, fixes: [[`a${i + 1}`, l[1]], [`b${i + 1}`, l[2]]] as [string, string][] }])) });
  /** Workflow : bonnes étapes dans l'ordre, puis pièges [texte, note]. */
  const WF = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, good: string[], bad: [string, string][], exp: string): AiExercise => {
    const gid = good.map((_, i) => `b${i + 1}`);
    const bid = bad.map((_, i) => `x${i + 1}`);
    return a.workflow({ id, title, ...base(c, role, dim), st, exp: pad(exp), blocks: [...good.map((t, i) => [gid[i], t] as [string, string]), ...bad.map(([t], i) => [bid[i], t] as [string, string])], required: gid, forbidden: bid, before: gid.slice(1).map((g, i) => [gid[i], g] as [string, string]), notes: Object.fromEntries(bad.map(([, n], i) => [bid[i], n])), solution: gid });
  };
  /** Correction d'un document JSON : règles [chemin, valeur attendue, message, dimension?]. */
  const FX = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, start: object, solution: object, rules: [string, unknown, string, Dim?][], exp: string): AiExercise =>
    a.fix({ id, title, ...base(c, role, dim), st, exp: pad(exp), language: 'json', starter: JSON.stringify(start, null, 2), solution: JSON.stringify(solution, null, 2), rules: [{ kind: 'parses', message: 'Le document doit rester un JSON valide.' } as FixRule, ...rules.map(([path, value, message, d]) => ({ kind: 'equals', path, value, message, dim: d ?? dim }) as FixRule)] });
  const SH = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, accepted: string[], exp: string, numeric?: number): AiExercise =>
    a.short({ id, title, ...base(c, role, dim), st, exp: pad(exp), accepted, numeric: numeric === undefined ? undefined : { value: numeric }, ph: numeric === undefined ? 'réponse courte' : 'un nombre' });
  const OP = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, deliverable: string, rubric: [string, Dim][], exp: string): AiExercise =>
    a.open({ id, title, ...base(c, role, dim), st, exp: pad(exp), deliverable, rubric: rubric.map(([t, d], i) => [`r${i + 1}`, t, d] as [string, string, Dim]) });
  /** Glisser-déposer (avec alternative clavier du moteur) : éléments [texte, indice de zone] répartis dans des zones [libellé, description?]. */
  const PL = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, zones: [string, string?][], its: [string, number][], exp: string): AiExercise =>
    a.place({ id, title, ...base(c, role, dim), st, exp: pad(exp), zones: zones.map(([l, d], i) => [`z${i + 1}`, l, d] as [string, string, string?]), items: its.map(([t], i) => [`p${i + 1}`, t] as [string, string]), answer: Object.fromEntries(its.map(([, z], i) => [`p${i + 1}`, `z${z + 1}`])) });
  const comps = (list: [name: string, desc: string, criteria: [string, string, string]][]): AiCompetency[] =>
    list.map(([name, description, cr], i) => ({ id: `${m}-c${i + 1}`, module: m, name, description, criteria: cr.map((text, j) => ({ id: `${m}-c${i + 1}-${j + 1}`, text })) }));
  const P = (n: number, level: AiProject['level'], title: string, problem: string, architecture: string, steps: string[], success: string[], risks: string[], extensions: string[], opts: { tools?: string[]; data?: string; connected?: AiProject['connected']; resources?: string[] } = {}): AiProject => ({
    id: `${m}-p${n}`, module: m, level, title, problem, architecture, tools: opts.tools ?? ['Tableur', 'Fiche de configuration à 22 points'], data: opts.data ?? 'Données fictives fournies dans l’énoncé.', steps, success, risks, extensions, ...(opts.resources ? { resources: opts.resources } : {}), ...(opts.connected ? { connected: opts.connected } : {}),
  });
  return { a, Q, M, lesson, MT, OR, CF, IN, WF, FX, PL, SH, OP, comps, P, assemble };
}

import type { AnswerSpec, Exercise, InvestigateEx, InvestigateStep, KqlBlocks, KqlCheck, KqlContext, KqlWrite, Level, PathId, ReadResultsEx, SourceRef } from './types.ts';
import { SENTINEL_TABLES, XDR_TABLES } from '../data/dataset.ts';

const ALL_TABLES: string[] = [...SENTINEL_TABLES, ...XDR_TABLES];

/** Détecte les tables du jeu de données citées dans une requête. */
export function tablesIn(q: string): string[] {
  return ALL_TABLES.filter((t) => new RegExp('\\b' + t + '\\b').test(q));
}

export interface KqlSpec {
  id: string;
  title: string;
  level: Level;
  comp: string;
  pre?: string[];
  obj: string;
  st: string;
  sol: string | string[];
  hints: string[];
  exp: string;
  mistakes: string[];
  src: SourceRef[];
  ctx?: KqlContext;
  tables?: string[];
  starter?: string;
  check?: KqlCheck;
  par?: number;
  type?: 'kql-write' | 'kql-fix';
  kind?: 'exercise' | 'mission' | 'assessment';
  lesson?: string;
  path?: PathId;
  preview?: boolean;
}

export function kw(s: KqlSpec): KqlWrite {
  const solutions = Array.isArray(s.sol) ? s.sol : [s.sol];
  const ctx: KqlContext = s.ctx ?? (/^\s*(Device|Email|Alert|Identity|Cloud)/m.test(solutions[0]) ? 'defender-xdr' : 'sentinel');
  return {
    id: s.id,
    type: s.type ?? 'kql-write',
    title: s.title,
    path: s.path ?? 'kql',
    level: s.level,
    competency: s.comp,
    prerequisites: s.pre ?? [],
    objective: s.obj,
    statement: s.st,
    context: ctx,
    tables: s.tables ?? tablesIn(solutions[0]),
    starter: s.starter,
    solutions,
    check: s.check ?? { columns: 'exact', rows: 'multiset' },
    hints: s.hints,
    explanation: s.exp,
    commonMistakes: s.mistakes,
    sources: s.src,
    parSeconds: s.par,
    kind: s.kind,
    lesson: s.lesson,
    preview: s.preview,
  };
}

export function kfix(s: KqlSpec): KqlWrite {
  return kw({ ...s, type: 'kql-fix' });
}

export interface BlocksSpec extends Omit<KqlSpec, 'sol' | 'starter' | 'type'> {
  /** Lignes de la solution, dans l'ordre. Les blocs sont fabriqués avec des identifiants b1, b2... */
  lines: string[];
  /** Blocs leurres (ne font pas partie de la solution). */
  decoys?: string[];
}

export function kb(s: BlocksSpec): KqlBlocks {
  const blocks = [...s.lines.map((t, i) => ({ id: 'b' + (i + 1), text: t })), ...(s.decoys ?? []).map((t, i) => ({ id: 'd' + (i + 1), text: t }))];
  return {
    id: s.id,
    type: 'kql-blocks',
    title: s.title,
    path: s.path ?? 'kql',
    level: s.level,
    competency: s.comp,
    prerequisites: s.pre ?? [],
    objective: s.obj,
    statement: s.st,
    context: s.ctx ?? 'sentinel',
    tables: s.tables ?? tablesIn(s.lines.join('\n')),
    blocks,
    solution: s.lines.map((_, i) => 'b' + (i + 1)),
    check: s.check ?? { columns: 'exact', rows: 'multiset' },
    hints: s.hints,
    explanation: s.exp,
    commonMistakes: s.mistakes,
    sources: s.src,
    parSeconds: s.par,
    kind: s.kind,
    lesson: s.lesson,
  };
}

export interface ReadSpec extends Omit<KqlSpec, 'sol' | 'starter' | 'type' | 'check'> {
  query: string;
  question: string;
  answer: ReadResultsEx['answer'];
  kind2?: 'number' | 'text';
}

export function kr(s: ReadSpec): ReadResultsEx {
  return {
    id: s.id,
    type: 'read-results',
    title: s.title,
    path: s.path ?? 'kql',
    level: s.level,
    competency: s.comp,
    prerequisites: s.pre ?? [],
    objective: s.obj,
    statement: s.st,
    context: s.ctx ?? 'sentinel',
    tables: s.tables ?? tablesIn(s.query),
    query: s.query,
    question: s.question,
    answerKind: s.kind2 ?? 'number',
    answer: s.answer,
    hints: s.hints,
    explanation: s.exp,
    commonMistakes: s.mistakes,
    sources: s.src,
    parSeconds: s.par,
    kind: s.kind,
    lesson: s.lesson,
  };
}

export type { Exercise };

// ------------------------------------------------------------------ mécaniques non KQL

import type { ChoiceEx, InspectEx, InspectLine, MatchEx, OrderEx, PlaceEx } from './types.ts';

export interface BaseSpec {
  id: string;
  title: string;
  path: PathId;
  level: Level;
  comp: string;
  pre?: string[];
  obj: string;
  st: string;
  hints: string[];
  exp: string;
  mistakes: string[];
  src: SourceRef[];
  par?: number;
  kind?: 'exercise' | 'mission' | 'assessment';
  lesson?: string;
  preview?: boolean;
  resources?: string;
}

function base(s: BaseSpec) {
  return {
    id: s.id,
    title: s.title,
    path: s.path,
    level: s.level,
    competency: s.comp,
    prerequisites: s.pre ?? [],
    objective: s.obj,
    statement: s.st,
    hints: s.hints,
    explanation: s.exp,
    commonMistakes: s.mistakes,
    sources: s.src,
    parSeconds: s.par,
    kind: s.kind,
    lesson: s.lesson,
    preview: s.preview,
    resources: s.resources,
  };
}

/** Remise en ordre : `steps` est donné dans le bon ordre. */
export function ord(s: BaseSpec & { steps: string[]; alt?: number[][] }): OrderEx {
  const items = s.steps.map((t, i) => ({ id: 'o' + (i + 1), text: t }));
  return {
    ...base(s),
    type: 'order',
    items,
    correct: items.map((i) => i.id),
    alternatives: s.alt?.map((perm) => perm.map((n) => 'o' + n)),
  };
}

/** Association : `pairs` = [élément, option correcte]. Des leurres d'options peuvent être ajoutés. */
export function mat(s: BaseSpec & { pairs: [string, string | string[]][]; extraOptions?: string[] }): MatchEx {
  const optTexts: string[] = [];
  const addOpt = (t: string) => {
    if (!optTexts.includes(t)) optTexts.push(t);
  };
  for (const [, o] of s.pairs) for (const t of Array.isArray(o) ? o : [o]) addOpt(t);
  for (const t of s.extraOptions ?? []) addOpt(t);
  const options = optTexts.map((t, i) => ({ id: 'p' + (i + 1), text: t }));
  const optId = (t: string) => options[optTexts.indexOf(t)].id;
  const items = s.pairs.map(([t], i) => ({ id: 'm' + (i + 1), text: t }));
  const answer: Record<string, string[]> = {};
  s.pairs.forEach(([, o], i) => {
    answer['m' + (i + 1)] = (Array.isArray(o) ? o : [o]).map(optId);
  });
  return { ...base(s), type: 'match', items, options, answer };
}

/** Placement : zones [id, libellé, description?], éléments [texte, id de zone]. */
export function plc(s: BaseSpec & { zones: [string, string, string?][]; things: [string, string][] }): PlaceEx {
  const items = s.things.map(([t], i) => ({ id: 'e' + (i + 1), text: t }));
  const answer: Record<string, string> = {};
  s.things.forEach(([, z], i) => {
    answer['e' + (i + 1)] = z;
  });
  return { ...base(s), type: 'place', items, zones: s.zones.map(([id, label, description]) => ({ id, label, description })), answer };
}

export interface InspectSpec extends BaseSpec {
  language: InspectEx['language'];
  /** Chaque ligne : texte seul, ou [texte, {remedes: [...], bon: index}] si défectueuse. */
  lines: (string | [string, { fixes: string[]; ok: number }])[];
}

/** Inspection de configuration : repérer les lignes défectueuses et choisir le correctif. */
export function ins(s: InspectSpec): InspectEx {
  const lines: InspectLine[] = s.lines.map((l, i) => {
    const id = 'l' + (i + 1);
    if (typeof l === 'string') return { id, text: l };
    const remedies = l[1].fixes.map((t, j) => ({ id: `r${i + 1}-${j + 1}`, text: t }));
    return { id, text: l[0], faulty: { remedies, correctRemedy: remedies[l[1].ok].id } };
  });
  return { ...base(s), type: 'inspect', language: s.language, lines };
}

/** Choix : `correct` = indices (0-based) des bonnes réponses. */
export function cho(s: BaseSpec & { choices: string[]; correct: number[] }): ChoiceEx {
  const choices = s.choices.map((t, i) => ({ id: 'c' + (i + 1), text: t }));
  return { ...base(s), type: 'choice', choices, correct: s.correct.map((i) => 'c' + (i + 1)), multi: s.correct.length > 1 };
}

export interface StepSpec {
  id: string;
  prompt: string;
  evidence?: { title: string; query?: string; text?: string }[];
  kind: 'choice' | 'multi' | 'number' | 'kql';
  choices?: string[];
  /** Indices (0-based) des bonnes réponses. */
  correct?: number[];
  answer?: AnswerSpec;
  kql?: { sol: string | string[]; check?: KqlCheck; starter?: string };
  exp: string;
}

/** Enquête multi-étapes : chaque étape est validée séparément, avec des preuves tirées du jeu de données. */
export function inv(s: BaseSpec & { ctx?: KqlContext; tables?: string[]; scenario: string; steps: StepSpec[] }): InvestigateEx {
  const steps: InvestigateStep[] = s.steps.map((t) => ({
    id: t.id,
    prompt: t.prompt,
    evidence: t.evidence,
    kind: t.kind,
    choices: t.choices?.map((c, i) => ({ id: 'c' + (i + 1), text: c })),
    correct: t.correct?.map((i) => 'c' + (i + 1)),
    answer: t.answer,
    kql: t.kql
      ? { solutions: Array.isArray(t.kql.sol) ? t.kql.sol : [t.kql.sol], check: t.kql.check ?? { columns: 'exact', rows: 'multiset' }, starter: t.kql.starter }
      : undefined,
    explanation: t.exp,
  }));
  const all = [s.scenario, ...steps.flatMap((t) => [t.kql?.solutions.join(' ') ?? '', ...(t.evidence ?? []).map((e) => e.query ?? '')])].join(' ');
  return {
    ...base(s),
    type: 'investigate',
    context: s.ctx ?? 'sentinel',
    tables: s.tables ?? tablesIn(all),
    scenario: s.scenario,
    steps,
  };
}

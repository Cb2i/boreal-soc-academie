// Validation déterministe des exercices de la section Agentic AI. Aucun appel réseau, aucune IA payante.
import type { Exercise, InspectEx, MatchEx, OrderEx, PlaceEx } from '../content/types.ts';
import { validateExercise } from '../engine/validate.ts';
import type { Dim, AiExercise, ConfigEx, FixEx, FixRule, InspectAi, MatchAi, OpenEx, OrderAi, PlaceAi, QcmEx, ShortEx, WorkflowEx } from './types.ts';

export type AiAnswer =
  | { type: 'qcm'; ids: string[] }
  | { type: 'short'; value: string }
  | { type: 'order'; ids: string[] }
  | { type: 'match'; map: Record<string, string> }
  | { type: 'place'; map: Record<string, string> }
  | { type: 'inspect'; faulty: string[]; remedies: Record<string, string> }
  | { type: 'fix'; text: string }
  | { type: 'config'; values: Record<string, string | number> }
  | { type: 'workflow'; ids: string[] }
  | { type: 'open'; checked: string[]; text: string };

export interface AiVerdict {
  correct: boolean;
  /** Part de la réponse juste, de 0 à 1. */
  score: number;
  title: string;
  message: string;
  details: string[];
  /** Retour par élément (choix, ligne, nœud, champ) : vrai si cet élément est correct. */
  itemFeedback?: Record<string, boolean>;
  /** Vrai pour les travaux ouverts : le score vient de l'apprenant, pas d'un calcul automatique. */
  selfAssessed?: boolean;
  /** Dimensions des règles non respectées. */
  failedDims?: Dim[];
}

const verdict = (v: AiVerdict): AiVerdict => v;

// ------------------------------------------------------------------ utilitaires

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'"“”«»()\[\]{}!?;]/g, ' ')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/[\s,]+/g, ' ')
    .replace(/^[\s.]+|[\s.]+$/g, '')
    .trim();
}

/** Lit un chemin de type a.b[0].c dans une valeur JSON. */
export function getPath(root: unknown, path: string): { found: boolean; value: unknown } {
  const parts = path.split(/\.|\[(\d+)\]/).filter((x) => x !== undefined && x !== '');
  let cur: unknown = root;
  for (const p of parts) {
    if (cur === null || typeof cur !== 'object') return { found: false, value: undefined };
    const rec = cur as Record<string, unknown>;
    if (!(p in rec)) return { found: false, value: undefined };
    cur = rec[p];
  }
  return { found: true, value: cur };
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function typeOf(v: unknown): string {
  return Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
}

// ----------------------------------------------------------------------- QCM

function validateQcm(ex: QcmEx, ids: string[]): AiVerdict {
  const chosen = new Set(ids);
  const right = ex.choices.filter((c) => c.correct);
  const feedback: Record<string, boolean> = {};
  let good = 0;
  let bad = 0;
  for (const c of ex.choices) {
    const on = chosen.has(c.id);
    feedback[c.id] = on === c.correct;
    if (on && c.correct) good++;
    if (on && !c.correct) bad++;
  }
  const exact = good === right.length && bad === 0;
  const score = exact ? 1 : Math.max(0, (good - bad) / Math.max(1, right.length));
  if (exact) return verdict({ correct: true, score: 1, title: 'Réponse correcte', message: ex.multi ? 'Vous avez retenu toutes les bonnes réponses et aucune mauvaise.' : 'C’est la bonne réponse.', details: [], itemFeedback: feedback });
  const msg = ex.multi ? `${good} bonne(s) réponse(s) sur ${right.length}, ${bad} réponse(s) fausse(s) cochée(s).` : 'Ce n’est pas la bonne réponse.';
  return verdict({ correct: false, score, title: 'Réponse incorrecte', message: msg, details: [], itemFeedback: feedback });
}

// ------------------------------------------------------------- réponse courte

export function validateShort(ex: ShortEx, value: string): AiVerdict {
  const n = normalizeText(value);
  let ok = false;
  if (n !== '') {
    ok = ex.accepted.some((a) => normalizeText(a) === n);
    if (!ok && ex.patterns) ok = ex.patterns.some((p) => new RegExp(p, 'i').test(n));
    if (!ok && ex.numeric) {
      const num = Number(n.replace(',', '.'));
      ok = Number.isFinite(num) && Math.abs(num - ex.numeric.value) <= (ex.numeric.tol ?? 0);
    }
  }
  if (ok) return verdict({ correct: true, score: 1, title: 'Réponse correcte', message: 'Votre réponse est acceptée.', details: [] });
  return verdict({ correct: false, score: 0, title: 'Réponse incorrecte', message: n === '' ? 'Saisissez une réponse.' : 'Cette réponse n’est pas acceptée. Vérifiez l’orthographe exacte du terme, du code ou de la valeur.', details: [] });
}

// ------------------------------------------------------------ correction de texte

function checkRule(rule: FixRule, text: string, json: { ok: boolean; value: unknown; error?: string }): boolean {
  switch (rule.kind) {
    case 'parses':
      return json.ok;
    case 'text-has':
      return new RegExp(rule.regex, rule.flags ?? 'm').test(text);
    case 'text-lacks':
      return !new RegExp(rule.regex, rule.flags ?? 'm').test(text);
    default: {
      if (!json.ok) return false;
      const r = getPath(json.value, rule.path);
      switch (rule.kind) {
        case 'exists':
          return r.found;
        case 'absent':
          return !r.found;
        case 'equals':
          return r.found && deepEqual(r.value, rule.value);
        case 'oneOf':
          return r.found && rule.values.some((v) => deepEqual(v, r.value));
        case 'type':
          return r.found && typeOf(r.value) === rule.type;
        case 'range':
          return r.found && typeof r.value === 'number' && (rule.min === undefined || r.value >= rule.min) && (rule.max === undefined || r.value <= rule.max);
        case 'contains':
          return r.found && Array.isArray(r.value) && r.value.some((v) => deepEqual(v, rule.value));
        case 'excludes':
          return !r.found || !Array.isArray(r.value) || !r.value.some((v) => deepEqual(v, rule.value));
        case 'matches':
          return r.found && typeof r.value === 'string' && new RegExp(rule.regex).test(r.value);
      }
    }
  }
  return false;
}

export function validateFix(ex: FixEx, text: string): AiVerdict {
  let json: { ok: boolean; value: unknown; error?: string } = { ok: false, value: undefined };
  if (ex.language === 'json') {
    try {
      json = { ok: true, value: JSON.parse(text) };
    } catch (e) {
      json = { ok: false, value: undefined, error: e instanceof Error ? e.message : String(e) };
    }
  } else json = { ok: true, value: undefined };
  const failed: FixRule[] = [];
  for (const r of ex.rules) if (!checkRule(r, text, json)) failed.push(r);
  const score = (ex.rules.length - failed.length) / ex.rules.length;
  if (failed.length === 0) return verdict({ correct: true, score: 1, title: 'Correction valide', message: 'Toutes les vérifications passent. D’autres solutions équivalentes sont acceptées.', details: [] });
  const details = failed.map((r) => r.message);
  if (ex.language === 'json' && !json.ok && json.error) details.unshift(`JSON invalide : ${json.error}`);
  return verdict({ correct: false, score, title: 'Correction incomplète', message: `${ex.rules.length - failed.length} vérification(s) sur ${ex.rules.length} passent.`, details, failedDims: failed.map((r) => r.dim ?? ex.dim) });
}

// ------------------------------------------------------------- configuration

export function validateConfig(ex: ConfigEx, values: Record<string, string | number>): AiVerdict {
  const feedback: Record<string, boolean> = {};
  const details: string[] = [];
  let good = 0;
  for (const f of ex.fields) {
    const v = values[f.id];
    let ok = false;
    if (v !== undefined && v !== '') {
      if (Array.isArray(f.accept)) ok = f.accept.includes(String(v));
      else {
        const n = Number(v);
        ok = Number.isFinite(n) && n >= f.accept.min && n <= f.accept.max;
      }
    }
    feedback[f.id] = ok;
    if (ok) good++;
    else details.push(`${f.label} : ${v === undefined || v === '' ? 'à renseigner' : 'valeur à revoir'}.`);
  }
  let cGood = 0;
  const cons = ex.constraints ?? [];
  for (const c of cons) {
    const filled = ex.fields.every((f) => values[f.id] !== undefined && values[f.id] !== '');
    if (filled && c.check(values)) cGood++;
    else if (filled) details.push(c.message);
  }
  const total = ex.fields.length + cons.length;
  const score = (good + cGood) / total;
  if (good === ex.fields.length && cGood === cons.length) return verdict({ correct: true, score: 1, title: 'Configuration correcte', message: 'Chaque paramètre est acceptable et l’ensemble est cohérent.', details: [], itemFeedback: feedback });
  return verdict({ correct: false, score, title: 'Configuration à revoir', message: `${good} paramètre(s) sur ${ex.fields.length} acceptable(s).`, details, itemFeedback: feedback });
}

// ------------------------------------------------------------------ workflow

export function validateWorkflow(ex: WorkflowEx, ids: string[]): AiVerdict {
  const set = new Set(ids);
  const details: string[] = [];
  const feedback: Record<string, boolean> = {};
  let total = 0;
  let good = 0;
  for (const r of ex.required) {
    total++;
    if (set.has(r)) good++;
    else details.push(`Il manque : ${ex.blocks.find((b) => b.id === r)?.text ?? r}.`);
  }
  for (const f of ex.forbidden) {
    total++;
    if (!set.has(f)) good++;
    else {
      feedback[f] = false;
      details.push(ex.notes?.[f] ?? `À retirer : ${ex.blocks.find((b) => b.id === f)?.text ?? f}.`);
    }
  }
  for (const [a, b] of ex.before) {
    if (!set.has(a) || !set.has(b)) continue;
    total++;
    if (ids.indexOf(a) < ids.indexOf(b)) good++;
    else details.push(ex.notes?.[`${a}>${b}`] ?? `« ${ex.blocks.find((x) => x.id === a)?.text} » doit venir avant « ${ex.blocks.find((x) => x.id === b)?.text} ».`);
  }
  if (ex.maxLength !== undefined) {
    total++;
    if (ids.length <= ex.maxLength) good++;
    else details.push(`Le workflow est trop long (${ids.length} nœuds, maximum ${ex.maxLength}) : retirez ce qui n’est pas nécessaire.`);
  }
  for (const id of ids) if (feedback[id] === undefined) feedback[id] = !ex.forbidden.includes(id);
  const score = total ? good / total : 0;
  if (good === total && ids.length > 0) return verdict({ correct: true, score: 1, title: 'Workflow valide', message: 'Les nœuds nécessaires sont présents, dans un ordre cohérent, sans nœud dangereux ou inutile. D’autres agencements équivalents sont acceptés.', details: [], itemFeedback: feedback });
  return verdict({ correct: false, score, title: 'Workflow à revoir', message: `${good} vérification(s) sur ${total} satisfaites.`, details, itemFeedback: feedback });
}

// -------------------------------------------------------------- travail ouvert

export function validateOpen(ex: OpenEx, checked: string[]): AiVerdict {
  const n = ex.rubric.filter((r) => checked.includes(r.id)).length;
  const score = n / ex.rubric.length;
  return verdict({
    correct: score >= 0.8,
    score,
    selfAssessed: true,
    title: 'Autoévaluation enregistrée',
    message: `${n} critère(s) sur ${ex.rubric.length} cochés. Ce résultat vient de votre propre revue : aucune note automatique n’est calculée.`,
    details: ex.rubric.filter((r) => !checked.includes(r.id)).map((r) => `À améliorer : ${r.text}`),
  });
}

// ------------------------------------------------- types partagés avec la section Azure

type Legacy = OrderAi | MatchAi | PlaceAi | InspectAi;

/** Adapte un exercice aux mécaniques existantes (ordre, association, placement, inspection). Le parcours et le niveau n'y servent à rien. */
export function asLegacy(ex: Legacy): Exercise {
  const base = {
    id: ex.id,
    title: ex.title,
    path: 'kql' as const,
    level: 1 as const,
    competency: ex.competency,
    prerequisites: [],
    objective: '',
    statement: ex.statement,
    hints: ex.hints ?? [],
    explanation: ex.explanation,
    commonMistakes: ex.mistakes ?? [],
    sources: [],
  };
  switch (ex.type) {
    case 'order':
      return { ...base, type: 'order', items: ex.items, correct: ex.correct, alternatives: ex.alternatives } satisfies OrderEx;
    case 'match':
      return { ...base, type: 'match', items: ex.items, options: ex.options, answer: ex.answer } satisfies MatchEx;
    case 'place':
      return { ...base, type: 'place', items: ex.items, zones: ex.zones, answer: ex.answer } satisfies PlaceEx;
    case 'inspect':
      return { ...base, type: 'inspect', language: ex.language === 'bash' ? 'azcli' : ex.language === 'python' || ex.language === 'http' || ex.language === 'yaml' ? 'text' : ex.language, lines: ex.lines } satisfies InspectEx;
  }
}

function fromLegacy(v: ReturnType<typeof validateExercise>, itemCount: number): AiVerdict {
  const fb = v.itemFeedback;
  let score = v.correct ? 1 : 0;
  if (!v.correct && fb) {
    const good = Object.values(fb).filter(Boolean).length;
    score = itemCount ? Math.min(0.99, good / itemCount) : 0;
  }
  return { correct: v.correct, score, title: v.title, message: v.message, details: v.details, itemFeedback: fb };
}

// -------------------------------------------------------------------- entrée

export function validateAi(ex: AiExercise, a: AiAnswer): AiVerdict {
  switch (ex.type) {
    case 'qcm':
      return validateQcm(ex, (a as { ids: string[] }).ids);
    case 'short':
      return validateShort(ex, (a as { value: string }).value);
    case 'order':
      return fromLegacy(validateExercise(asLegacy(ex), { type: 'order', ids: (a as { ids: string[] }).ids }), ex.items.length);
    case 'match':
      return fromLegacy(validateExercise(asLegacy(ex), { type: 'match', map: (a as { map: Record<string, string> }).map }), ex.items.length);
    case 'place':
      return fromLegacy(validateExercise(asLegacy(ex), { type: 'place', map: (a as { map: Record<string, string> }).map }), ex.items.length);
    case 'inspect': {
      const x = a as { faulty: string[]; remedies: Record<string, string> };
      return fromLegacy(validateExercise(asLegacy(ex), { type: 'inspect', faulty: x.faulty, remedies: x.remedies }), ex.lines.filter((l) => l.faulty).length || 1);
    }
    case 'fix':
      return validateFix(ex, (a as { text: string }).text);
    case 'config':
      return validateConfig(ex, (a as { values: Record<string, string | number> }).values);
    case 'workflow':
      return validateWorkflow(ex, (a as { ids: string[] }).ids);
    case 'open':
      return validateOpen(ex, (a as { checked: string[] }).checked);
  }
}

/** Réponse de référence : sert aux tests pour vérifier que chaque exercice se résout. */
export function referenceAnswerAi(ex: AiExercise): AiAnswer {
  switch (ex.type) {
    case 'qcm':
      return { type: 'qcm', ids: ex.choices.filter((c) => c.correct).map((c) => c.id) };
    case 'short':
      return { type: 'short', value: ex.accepted[0] ?? String(ex.numeric?.value ?? '') };
    case 'order':
      return { type: 'order', ids: ex.correct };
    case 'match':
      return { type: 'match', map: Object.fromEntries(Object.entries(ex.answer).map(([k, v]) => [k, v[0]])) };
    case 'place':
      return { type: 'place', map: ex.answer };
    case 'inspect': {
      const faulty = ex.lines.filter((l) => l.faulty).map((l) => l.id);
      const remedies: Record<string, string> = {};
      for (const l of ex.lines) if (l.faulty?.correctRemedy) remedies[l.id] = l.faulty.correctRemedy;
      return { type: 'inspect', faulty, remedies };
    }
    case 'fix':
      return { type: 'fix', text: ex.solution };
    case 'config':
      return { type: 'config', values: ex.solution };
    case 'workflow':
      return { type: 'workflow', ids: ex.solution };
    case 'open':
      return { type: 'open', checked: ex.rubric.map((r) => r.id), text: '' };
  }
}

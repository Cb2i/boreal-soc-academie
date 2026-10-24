import { buildDataset, contextTables, SIM_NOW } from '../data/dataset.ts';
import type { Dataset } from '../data/dataset.ts';
import type {
  AnswerSpec,
  ChoiceEx,
  Exercise,
  InspectEx,
  InvestigateEx,
  InvestigateStep,
  KqlBlocks,
  KqlCheck,
  KqlContext,
  KqlWrite,
  MatchEx,
  OrderEx,
  PlaceEx,
  ReadResultsEx,
} from '../content/types.ts';
import { display, normKey, runQuery } from '../kql/index.ts';
import type { RunResult, Table } from '../kql/index.ts';
import { tr } from '../i18n/lang.ts';

/** Jeu de données visible par l'apprenant. */
export const VISIBLE_SEED = 1;
/** Second jeu (même structure, bruit et variantes différents) : sert à détecter les valeurs codées en dur. */
export const HIDDEN_SEED = 2;

export type VerdictStatus = 'perfect' | 'optimizable' | 'reasoning' | 'wrong' | 'syntax' | 'semantic' | 'unsupported' | 'limit' | 'partial';

export interface Verdict {
  status: VerdictStatus;
  /** Vrai si l'exercice est considéré comme réussi (perfect, optimizable, reasoning). */
  correct: boolean;
  /** Part des points d'expérience accordée. */
  xpFactor: number;
  title: string;
  message: string;
  details: string[];
  /** Exemples concrets de lignes (affichés après plusieurs échecs). */
  examples?: string[];
  hint?: string;
  position?: { line: number; col: number };
  table?: Table;
  totalRows?: number;
  expected?: { rows: number; columns: string[] };
  itemFeedback?: Record<string, boolean>;
  features?: string[];
}

export type Answer =
  | { type: 'kql-write' | 'kql-fix'; query: string }
  | { type: 'kql-blocks'; blockIds: string[] }
  | { type: 'order'; ids: string[] }
  | { type: 'match'; map: Record<string, string> }
  | { type: 'place'; map: Record<string, string> }
  | { type: 'inspect'; faulty: string[]; remedies: Record<string, string> }
  | { type: 'read-results'; value: string; choices?: string[] }
  | { type: 'choice'; ids: string[] };

// ----------------------------------------------------------------- exécution

export function datasetFor(seed: number): Dataset {
  return buildDataset(seed);
}

export function execute(ctx: KqlContext, query: string, seed: number): RunResult {
  const ds = buildDataset(seed);
  const { tables, unavailable } = contextTables(ds, ctx);
  return runQuery(query, { tables, unavailableTables: unavailable, now: SIM_NOW });
}

const refCache = new Map<string, RunResult>();
function executeCached(ctx: KqlContext, query: string, seed: number): RunResult {
  const key = `${seed}|${ctx}|${query}`;
  let r = refCache.get(key);
  if (!r) {
    r = execute(ctx, query, seed);
    refCache.set(key, r);
  }
  return r;
}

// ------------------------------------------------------------------ comparaison

function rowKey(t: Table, r: Table['rows'][number], byPosition: boolean, cols?: string[]): string {
  const c = cols ?? t.columns;
  return byPosition ? c.map((k) => normKey(r[k])).join('\u0001') : [...c].sort().map((k) => `${k}=${normKey(r[k])}`).join('\u0001');
}

function fmtRow(t: Table, r: Table['rows'][number]): string {
  return t.columns.map((c) => `${c} = ${display(r[c]) || '(vide)'}`).join(', ');
}

interface Compare {
  ok: boolean;
  issues: string[];
  examples: string[];
}

function compareTables(expected: Table, actual: Table, check: KqlCheck, universe?: Table): Compare {
  const issues: string[] = [];
  const examples: string[] = [];
  const colMode = check.columns ?? 'exact';
  const rowMode = check.rows ?? 'multiset';

  const eCols = expected.columns;
  const aCols = actual.columns;
  if (colMode === 'ignore-names') {
    if (eCols.length !== aCols.length) issues.push(tr(`Le résultat attendu a ${eCols.length} colonne(s), le vôtre en a ${aCols.length}.`, `The expected result has ${eCols.length} column(s), yours has ${aCols.length}.`));
  } else {
    const missing = eCols.filter((c) => !aCols.includes(c));
    const extra = aCols.filter((c) => !eCols.includes(c));
    if (missing.length) issues.push(`Colonne(s) manquante(s) : ${missing.join(', ')}.`);
    if (extra.length && colMode === 'exact') issues.push(tr(`Colonne(s) en trop : ${extra.join(', ')}. Utilisez project pour ne garder que ce qui est demandé.`, `Extra column(s): ${extra.join(', ')}. Use project to keep only what is requested.`));
  }
  if (issues.length) return { ok: false, issues, examples };

  const byPos = colMode === 'ignore-names';
  const eKeyCols = byPos ? eCols : eCols;
  const aKeyCols = byPos ? aCols : eCols;
  const keyE = (r: Table['rows'][number]) => rowKey(expected, r, byPos, eKeyCols);
  const keyA = (r: Table['rows'][number]) => (byPos ? aKeyCols.map((k) => normKey(r[k])).join('\u0001') : rowKey(actual, r, false, aKeyCols));

  if (rowMode === 'subset') {
    const n = check.n ?? expected.rows.length;
    if (actual.rows.length !== n) issues.push(tr(`Le résultat doit contenir exactement ${n} ligne(s), le vôtre en contient ${actual.rows.length}.`, `The result must contain exactly ${n} row(s), yours contains ${actual.rows.length}.`));
    const uni = new Set((universe ?? expected).rows.map(keyE));
    const bad = actual.rows.filter((r) => !uni.has(keyA(r)));
    if (bad.length) {
      issues.push(tr(`${bad.length} ligne(s) de votre résultat ne correspondent pas à ce qui est demandé.`, `${bad.length} row(s) of your result do not match what is requested.`));
      examples.push(`Exemple de ligne incorrecte : ${fmtRow(actual, bad[0])}`);
    }
    return { ok: issues.length === 0, issues, examples };
  }

  if (rowMode === 'count') {
    if (actual.rows.length !== expected.rows.length) issues.push(tr(`Le résultat doit contenir ${expected.rows.length} ligne(s), le vôtre en contient ${actual.rows.length}.`, `The result must contain ${expected.rows.length} row(s), yours contains ${actual.rows.length}.`));
    return { ok: issues.length === 0, issues, examples };
  }

  if (actual.rows.length !== expected.rows.length) {
    issues.push(tr(`Votre résultat contient ${actual.rows.length} ligne(s), le résultat attendu en contient ${expected.rows.length}.`, `Your result contains ${actual.rows.length} row(s), the expected result contains ${expected.rows.length}.`));
  }
  if (rowMode === 'ordered' && check.orderBy?.length && !byPos) {
    // Tri tolérant aux égalités : mêmes lignes (multiset) et même suite de valeurs sur les colonnes de tri.
    const sub = compareTables(expected, actual, { ...check, rows: 'multiset', orderBy: undefined }, universe);
    if (!sub.ok) return sub;
    const keys = check.orderBy.filter((k) => eCols.includes(k));
    const seq = (t: Table) => t.rows.map((r) => keys.map((k) => normKey(r[k])).join('\u0001'));
    const es = seq(expected);
    const as = seq(actual);
    const d = es.findIndex((k, i) => k !== as[i]);
    if (d >= 0) {
      issues.push(tr(`L’ordre des lignes diffère (première différence à la ligne ${d + 1}). Vérifiez les colonnes et les directions de tri.`, `The row order differs (first difference at row ${d + 1}). Check the columns and sort directions.`));
      examples.push(`Ligne ${d + 1} attendue : ${fmtRow(expected, expected.rows[d])}`);
      examples.push(`Ligne ${d + 1} obtenue : ${fmtRow(actual, actual.rows[d])}`);
    }
    return { ok: issues.length === 0, issues, examples };
  }
  if (rowMode === 'ordered') {
    const ek = expected.rows.map(keyE);
    const ak = actual.rows.map(keyA);
    const n = Math.min(ek.length, ak.length);
    let firstDiff = -1;
    for (let i = 0; i < n; i++) {
      if (ek[i] !== ak[i]) {
        firstDiff = i;
        break;
      }
    }
    if (firstDiff >= 0) {
      issues.push(tr(`Le contenu ou l’ordre des lignes diffère (première différence à la ligne ${firstDiff + 1}).`, `The content or order of the rows differs (first difference at row ${firstDiff + 1}).`));
      examples.push(`Ligne ${firstDiff + 1} attendue : ${fmtRow(expected, expected.rows[firstDiff])}`);
      examples.push(`Ligne ${firstDiff + 1} obtenue : ${fmtRow(actual, actual.rows[firstDiff])}`);
    }
    return { ok: issues.length === 0 && ek.length === ak.length, issues, examples };
  }

  // multiset
  const counts = new Map<string, number>();
  for (const r of expected.rows) counts.set(keyE(r), (counts.get(keyE(r)) ?? 0) + 1);
  const extraRows: Table['rows'] = [];
  for (const r of actual.rows) {
    const k = keyA(r);
    const c = counts.get(k) ?? 0;
    if (c > 0) counts.set(k, c - 1);
    else extraRows.push(r);
  }
  let missingCount = 0;
  const missingRows: Table['rows'] = [];
  for (const r of expected.rows) {
    const k = keyE(r);
    const c = counts.get(k) ?? 0;
    if (c > 0) {
      counts.set(k, c - 1);
      missingCount++;
      missingRows.push(r);
    }
  }
  if (missingCount) {
    issues.push(tr(`${missingCount} ligne(s) attendue(s) manquent dans votre résultat.`, `${missingCount} expected row(s) are missing from your result.`));
    examples.push(`Exemple de ligne manquante : ${fmtRow(expected, missingRows[0])}`);
  }
  if (extraRows.length) {
    issues.push(tr(`${extraRows.length} ligne(s) de votre résultat ne devraient pas s’y trouver.`, `${extraRows.length} row(s) of your result should not be there.`));
    examples.push(`Exemple de ligne en trop : ${fmtRow(actual, extraRows[0])}`);
  }
  return { ok: issues.length === 0, issues, examples };
}

// ---------------------------------------------------------------------- KQL

function errorVerdict(r: Extract<RunResult, { ok: false }>): Verdict {
  const e = r.error;
  const where = e.line ? ` (ligne ${e.line}, colonne ${e.col})` : '';
  const map = {
    syntax: { status: 'syntax' as const, title: tr('Erreur de syntaxe', 'Syntax error') },
    semantic: { status: 'semantic' as const, title: tr('Erreur de sémantique (la requête ne peut pas s’exécuter)', 'Semantic error (the query cannot run)') },
    unsupported: { status: 'unsupported' as const, title: tr('Non évaluable par le moteur local', 'Cannot be evaluated by the local engine') },
    limit: { status: 'limit' as const, title: tr('Limite du moteur local', 'Local engine limit') },
  }[e.kind];
  return {
    status: map.status,
    correct: false,
    xpFactor: 0,
    title: map.title,
    message: `${e.message}${where}`,
    hint: e.hint,
    position: e.line ? { line: e.line, col: e.col ?? 1 } : undefined,
    details:
      e.kind === 'syntax'
        ? [tr('La requête n’a pas pu être analysée : aucun résultat n’est calculé tant que la syntaxe n’est pas valide.', 'The query could not be parsed: no result is computed until the syntax is valid.')]
        : e.kind === 'semantic'
          ? [tr('La syntaxe est valide, mais un nom, un type ou une fonction pose problème au moment de l’exécution.', 'The syntax is valid, but a name, a type or a function causes a problem at run time.')]
          : e.kind === 'unsupported'
            ? [tr('Cette construction est valide en KQL réel mais hors du sous-ensemble implémenté ici. Reformulez avec les opérateurs pris en charge (voir « Limites »).', 'This construct is valid in real KQL but outside the subset implemented here. Rephrase with the supported operators (see “Limits”).')]
            : [],
  };
}

export function validateKqlQuery(ctx: KqlContext, check: KqlCheck, solution: string, query: string): Verdict {
  if (query.trim() === '') {
    return { status: 'syntax', correct: false, xpFactor: 0, title: tr('Requête vide', 'Empty query'), message: tr('Écrivez une requête avant de valider.', 'Write a query before submitting.'), details: [] };
  }
  const user = executeCached(ctx, query, VISIBLE_SEED);
  if (!user.ok) return errorVerdict(user);
  const ref = executeCached(ctx, solution, VISIBLE_SEED);
  if (!ref.ok) throw new Error(tr(`Solution de référence invalide : ${ref.error.message}`, `Invalid reference solution: ${ref.error.message}`));

  const features = user.features;
  const expectedInfo = { rows: ref.table.rows.length, columns: ref.table.columns };
  const base = { table: user.table, totalRows: user.totalRows, features, expected: expectedInfo };

  if (!features.some((f) => f.startsWith('tbl:'))) {
    return {
      ...base,
      status: 'wrong',
      correct: false,
      xpFactor: 0,
      title: tr('Requête exécutable, mais pas sur les données demandées', 'The query runs, but not on the requested data'),
      message: tr('Votre requête n’interroge aucune des tables du jeu de données (datatable et print ne comptent pas ici).', 'Your query does not read any table of the dataset (datatable and print do not count here).'),
      details: [tr('Partez d’une table du contexte (par exemple SigninLogs) puis enchaînez les opérateurs avec « | ».', 'Start from a table of the context (for example SigninLogs) then chain the operators with “|”.')],
    };
  }

  const universe = check.rows === 'subset' && check.universe ? executeCached(ctx, check.universe, VISIBLE_SEED) : undefined;
  if (universe && !universe.ok) throw new Error(`Univers invalide : ${universe.error.message}`);
  const cmp = compareTables(ref.table, user.table, check, universe && universe.ok ? universe.table : undefined);
  if (!cmp.ok) {
    return {
      ...base,
      status: 'wrong',
      correct: false,
      xpFactor: 0,
      title: tr('Requête exécutable, mais le résultat n’est pas celui attendu', 'The query runs, but the result is not the expected one'),
      message: cmp.issues[0] ?? tr('Le résultat diffère du résultat attendu.', 'The result differs from the expected result.'),
      details: cmp.issues.slice(1),
      examples: cmp.examples,
    };
  }

  // Second jeu de données : détecte les valeurs codées en dur
  if (!check.noVariant) {
    const user2 = executeCached(ctx, query, HIDDEN_SEED);
    const ref2 = executeCached(ctx, solution, HIDDEN_SEED);
    if (user2.ok && ref2.ok) {
      const uni2 = check.rows === 'subset' && check.universe ? executeCached(ctx, check.universe, HIDDEN_SEED) : undefined;
      const cmp2 = compareTables(ref2.table, user2.table, check, uni2 && uni2.ok ? uni2.table : undefined);
      if (!cmp2.ok) {
        return {
          ...base,
          status: 'wrong',
          correct: false,
          xpFactor: 0,
          title: tr('Le résultat est juste ici, mais la logique est trop spécifique', 'The result is right here, but the logic is too specific'),
          message: tr('Votre requête donne le bon résultat sur les données visibles, mais pas sur un second jeu de données de même structure.', 'Your query gives the right result on the visible data, but not on a second dataset with the same structure.'),
          details: [
            tr('Une détection ou une recherche doit s’appliquer à de nouvelles données : évitez de coder en dur des valeurs observées (adresses IP, comptes, dates précises) quand l’énoncé demande de les trouver.', 'A detection or a search must apply to new data: avoid hard-coding observed values (IP addresses, accounts, specific dates) when the statement asks you to find them.'),
            ...cmp2.issues,
          ],
        };
      }
    } else if (!user2.ok) {
      return { ...errorVerdict(user2), title: tr('Erreur sur le second jeu de données', 'Error on the second dataset'), details: [tr('Votre requête s’exécute sur les données visibles mais échoue sur un second jeu de même structure.', 'Your query runs on the visible data but fails on a second dataset with the same structure.')] };
    }
  }

  // Règles de raisonnement et d'optimisation
  const rules = check.rules ?? [];
  const reasoning: string[] = [];
  const optimize: string[] = [];
  for (const rule of rules) {
    const has = features.includes(rule.feature);
    if (rule.kind === 'must-use' && !has) reasoning.push(rule.message);
    else if (rule.kind === 'must-not-use' && has) reasoning.push(rule.message);
    else if (rule.kind === 'optimize' && has) optimize.push(rule.message);
  }
  if (reasoning.length) {
    return { ...base, status: 'reasoning', correct: true, xpFactor: 0.6, title: tr('Résultat correct, mais le raisonnement est à revoir', 'Correct result, but the reasoning needs review'), message: reasoning[0], details: [...reasoning.slice(1), ...optimize] };
  }
  if (optimize.length) {
    return { ...base, status: 'optimizable', correct: true, xpFactor: 0.9, title: tr('Correct, et la requête peut être optimisée', 'Correct, and the query can be optimized'), message: optimize[0], details: optimize.slice(1) };
  }
  return { ...base, status: 'perfect', correct: true, xpFactor: 1, title: tr('Correct', 'Correct'), message: tr('Le résultat est exact et la requête est propre.', 'The result is exact and the query is clean.'), details: [] };
}

export function blocksToQuery(blocks: { id: string; text: string }[], ids: string[]): string {
  const byId = new Map(blocks.map((b) => [b.id, b.text]));
  return ids.map((id) => byId.get(id) ?? '').join('\n');
}

// ---------------------------------------------------------------- autres types

function basic(status: Verdict['status'], correct: boolean, title: string, message: string, extra: Partial<Verdict> = {}): Verdict {
  return { status, correct, xpFactor: correct ? 1 : 0, title, message, details: [], ...extra };
}

function validateOrder(ex: OrderEx, ids: string[]): Verdict {
  const candidates = [ex.correct, ...(ex.alternatives ?? [])];
  const exact = candidates.some((c) => c.length === ids.length && c.every((id, i) => id === ids[i]));
  let best = ex.correct;
  let bestScore = -1;
  for (const c of candidates) {
    const s = c.filter((id, i) => ids[i] === id).length;
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }
  const feedback: Record<string, boolean> = {};
  ids.forEach((id, i) => (feedback[id] = best[i] === id));
  if (exact) return basic('perfect', true, tr('Ordre correct', 'Correct order'), tr('Les étapes sont dans le bon ordre.', 'The steps are in the right order.'), { itemFeedback: feedback });
  return basic('wrong', false, tr('Ordre incorrect', 'Incorrect order'), tr(`${bestScore} étape(s) sur ${best.length} sont bien placées.`, `${bestScore} of ${best.length} step(s) are in the right place.`), {
    itemFeedback: feedback,
    details: [tr('Les étapes en vert sont à la bonne position ; réorganisez les autres et validez de nouveau.', 'The green steps are in the right position; reorder the others and submit again.')],
  });
}

function validateMatch(ex: MatchEx, map: Record<string, string>): Verdict {
  const feedback: Record<string, boolean> = {};
  let good = 0;
  for (const it of ex.items) {
    const ok = (ex.answer[it.id] ?? []).includes(map[it.id] ?? '');
    feedback[it.id] = ok;
    if (ok) good++;
  }
  const missing = ex.items.filter((i) => !map[i.id]).length;
  if (good === ex.items.length) return basic('perfect', true, tr('Associations correctes', 'Correct matches'), tr('Toutes les associations sont justes.', 'All matches are correct.'), { itemFeedback: feedback });
  return basic('wrong', false, tr('Associations incorrectes', 'Incorrect matches'), tr(`${good} association(s) sur ${ex.items.length} sont justes.`, `${good} of ${ex.items.length} match(es) are correct.`), {
    itemFeedback: feedback,
    details: missing ? [tr(`${missing} élément(s) n’ont pas encore d’association.`, `${missing} item(s) have no match yet.`)] : [],
  });
}

function validatePlace(ex: PlaceEx, map: Record<string, string>): Verdict {
  const feedback: Record<string, boolean> = {};
  let good = 0;
  for (const it of ex.items) {
    const ok = map[it.id] === ex.answer[it.id];
    feedback[it.id] = ok;
    if (ok) good++;
  }
  const missing = ex.items.filter((i) => !map[i.id]).length;
  if (good === ex.items.length) return basic('perfect', true, tr('Placement correct', 'Correct placement'), tr('Toutes les ressources sont au bon endroit.', 'All resources are in the right place.'), { itemFeedback: feedback });
  return basic('wrong', false, tr('Placement incorrect', 'Incorrect placement'), tr(`${good} élément(s) sur ${ex.items.length} sont bien placés.`, `${good} of ${ex.items.length} item(s) are correctly placed.`), {
    itemFeedback: feedback,
    details: missing ? [tr(`${missing} élément(s) ne sont pas encore placés.`, `${missing} item(s) are not placed yet.`)] : [],
  });
}

function validateInspect(ex: InspectEx, faulty: string[], remedies: Record<string, string>): Verdict {
  const expected = ex.lines.filter((l) => l.faulty).map((l) => l.id);
  const chosen = new Set(faulty);
  const found = expected.filter((id) => chosen.has(id));
  const falsePos = faulty.filter((id) => !expected.includes(id));
  const feedback: Record<string, boolean> = {};
  faulty.forEach((id) => (feedback[id] = expected.includes(id)));
  const details: string[] = [];
  let remedyOk = true;
  for (const id of found) {
    const line = ex.lines.find((l) => l.id === id)!;
    const spec = line.faulty!;
    if (spec.remedies && spec.correctRemedy) {
      const ok = remedies[id] === spec.correctRemedy;
      if (!ok) {
        remedyOk = false;
        feedback[id] = false;
        details.push(remedies[id] ? tr(`Le correctif choisi pour la ligne « ${line.text.trim().slice(0, 50)} » n’est pas le bon.`, `The fix chosen for the line “${line.text.trim().slice(0, 50)}” is not the right one.`) : tr(`Choisissez un correctif pour la ligne « ${line.text.trim().slice(0, 50)} ».`, `Choose a fix for the line “${line.text.trim().slice(0, 50)}”.`));
      }
    }
  }
  if (found.length === expected.length && falsePos.length === 0 && remedyOk) {
    return basic('perfect', true, tr('Inspection correcte', 'Correct inspection'), tr('Toutes les lignes défectueuses sont identifiées avec le bon correctif.', 'All faulty lines are identified with the right fix.'), { itemFeedback: feedback });
  }
  const parts = [tr(`${found.length} ligne(s) défectueuse(s) trouvée(s) sur ${expected.length}`, `${found.length} of ${expected.length} faulty line(s) found`)];
  if (falsePos.length) parts.push(tr(`${falsePos.length} ligne(s) sélectionnée(s) à tort`, `${falsePos.length} line(s) selected wrongly`));
  return basic('wrong', false, tr('Inspection incomplète', 'Incomplete inspection'), `${parts.join(' ; ')}.`, { itemFeedback: feedback, details });
}

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(',', '.');
}

function sameAnswer(user: string, expected: string): boolean {
  const u = normalizeAnswer(user);
  const e = normalizeAnswer(expected);
  if (u === e) return true;
  const nu = Number(u);
  const ne = Number(e);
  return u !== '' && e !== '' && !Number.isNaN(nu) && !Number.isNaN(ne) && Math.abs(nu - ne) < 1e-9;
}

export function expectedAnswers(ctx: KqlContext, defaultQuery: string, spec: AnswerSpec): string[] {
  if (spec.mode === 'static') return spec.accepted;
  const r = executeCached(ctx, spec.query ?? defaultQuery, VISIBLE_SEED);
  if (!r.ok) throw new Error(tr(`Requête de réponse invalide : ${r.error.message}`, `Invalid answer query: ${r.error.message}`));
  if (spec.mode === 'rows') return [String(r.table.rows.length)];
  const row = r.table.rows[spec.row ?? 0];
  if (!row) return [];
  return [display(row[spec.column])];
}

function validateReadResults(ex: ReadResultsEx, value: string, choiceIds?: string[]): Verdict {
  if (ex.answerKind === 'choice') {
    const chosen = [...(choiceIds ?? [])].sort().join(',');
    const ok = chosen === [...(ex.correct ?? [])].sort().join(',');
    return ok ? basic('perfect', true, tr('Bonne lecture', 'Good reading'), tr('Votre interprétation du résultat est correcte.', 'Your interpretation of the result is correct.')) : basic('wrong', false, tr('Interprétation incorrecte', 'Incorrect interpretation'), tr('Relisez le résultat : regardez les colonnes, les valeurs et la requête qui les produit.', 'Read the result again: look at the columns, the values and the query that produces them.'));
  }
  if (value.trim() === '') return basic('wrong', false, tr('Réponse vide', 'Empty answer'), tr('Saisissez une réponse avant de valider.', 'Enter an answer before submitting.'));
  const accepted = ex.answer ? expectedAnswers(ex.context, ex.query, ex.answer) : [];
  const ok = accepted.some((a) => sameAnswer(value, a));
  return ok ? basic('perfect', true, tr('Bonne lecture', 'Good reading'), tr('Votre réponse correspond au résultat.', 'Your answer matches the result.')) : basic('wrong', false, tr('Réponse incorrecte', 'Incorrect answer'), tr('La valeur saisie ne correspond pas au résultat. Revérifiez la colonne et l’unité demandées.', 'The value entered does not match the result. Check the requested column and unit again.'));
}

function validateChoice(ex: ChoiceEx, ids: string[]): Verdict {
  const ok = [...ids].sort().join(',') === [...ex.correct].sort().join(',');
  const feedback: Record<string, boolean> = {};
  ids.forEach((id) => (feedback[id] = ex.correct.includes(id)));
  return ok ? basic('perfect', true, tr('Bonne réponse', 'Good answer'), tr('Votre choix est correct.', 'Your choice is correct.'), { itemFeedback: feedback }) : basic('wrong', false, tr('Réponse incorrecte', 'Incorrect answer'), ex.multi ? tr('Il y a plusieurs bonnes réponses : vérifiez chaque proposition.', 'There are several correct answers: check each option.') : tr('Ce n’est pas la bonne réponse.', 'That is not the right answer.'), { itemFeedback: feedback });
}

export function validateStep(ex: InvestigateEx, step: InvestigateStep, answer: { ids?: string[]; value?: string; query?: string }): Verdict {
  switch (step.kind) {
    case 'choice':
    case 'multi': {
      const ids = answer.ids ?? [];
      const ok = [...ids].sort().join(',') === [...(step.correct ?? [])].sort().join(',');
      return ok ? basic('perfect', true, tr('Étape validée', 'Step validated'), tr('Votre conclusion est correcte.', 'Your conclusion is correct.')) : basic('wrong', false, tr('Conclusion incorrecte', 'Incorrect conclusion'), step.kind === 'multi' ? tr('Plusieurs réponses sont attendues : revoyez les éléments de preuve.', 'Several answers are expected: review the evidence.') : tr('Revoyez les éléments de preuve.', 'Review the evidence.'));
    }
    case 'number': {
      const value = answer.value ?? '';
      if (!step.answer) throw new Error('answer manquant');
      const accepted = expectedAnswers(ex.context, '', step.answer);
      const ok = value.trim() !== '' && accepted.some((a) => sameAnswer(value, a));
      return ok ? basic('perfect', true, tr('Étape validée', 'Step validated'), tr('La valeur saisie est correcte.', 'The value entered is correct.')) : basic('wrong', false, tr('Valeur incorrecte', 'Incorrect value'), tr('Cette valeur ne correspond pas aux données. Relisez les éléments de preuve.', 'This value does not match the data. Read the evidence again.'));
    }
    case 'kql': {
      if (!step.kql) throw new Error('kql manquant');
      return validateKqlQuery(ex.context, step.kql.check, step.kql.solutions[0], answer.query ?? '');
    }
  }
}

// ------------------------------------------------------------------ point d'entrée

export function validateExercise(ex: Exercise, answer: Answer): Verdict {
  switch (ex.type) {
    case 'kql-write':
    case 'kql-fix': {
      const a = answer as Extract<Answer, { type: 'kql-write' | 'kql-fix' }>;
      return validateKqlQuery((ex as KqlWrite).context, (ex as KqlWrite).check, (ex as KqlWrite).solutions[0], a.query);
    }
    case 'kql-blocks': {
      const e = ex as KqlBlocks;
      const a = answer as Extract<Answer, { type: 'kql-blocks' }>;
      if (a.blockIds.length === 0) return basic('wrong', false, tr('Requête vide', 'Empty query'), tr('Ajoutez des blocs à votre requête avant de valider.', 'Add blocks to your query before submitting.'));
      const query = blocksToQuery(e.blocks, a.blockIds);
      const reference = blocksToQuery(e.blocks, e.solution);
      return validateKqlQuery(e.context, e.check, reference, query);
    }
    case 'order':
      return validateOrder(ex, (answer as Extract<Answer, { type: 'order' }>).ids);
    case 'match':
      return validateMatch(ex, (answer as Extract<Answer, { type: 'match' }>).map);
    case 'place':
      return validatePlace(ex, (answer as Extract<Answer, { type: 'place' }>).map);
    case 'inspect': {
      const a = answer as Extract<Answer, { type: 'inspect' }>;
      return validateInspect(ex, a.faulty, a.remedies);
    }
    case 'read-results': {
      const a = answer as Extract<Answer, { type: 'read-results' }>;
      return validateReadResults(ex, a.value, a.choices);
    }
    case 'choice':
      return validateChoice(ex, (answer as Extract<Answer, { type: 'choice' }>).ids);
    case 'investigate':
      throw new Error(tr('Utilisez validateStep pour les enquêtes.', 'Use validateStep for investigations.'));
  }
}

/** Réponse de référence d'un exercice (utile aux tests de contenu). */
export function referenceAnswer(ex: Exercise): Answer | null {
  switch (ex.type) {
    case 'kql-write':
    case 'kql-fix':
      return { type: ex.type, query: ex.solutions[0] };
    case 'kql-blocks':
      return { type: 'kql-blocks', blockIds: ex.solution };
    case 'order':
      return { type: 'order', ids: ex.correct };
    case 'match': {
      const map: Record<string, string> = {};
      for (const it of ex.items) map[it.id] = ex.answer[it.id][0];
      return { type: 'match', map };
    }
    case 'place':
      return { type: 'place', map: { ...ex.answer } };
    case 'inspect': {
      const faulty = ex.lines.filter((l) => l.faulty).map((l) => l.id);
      const remedies: Record<string, string> = {};
      ex.lines.forEach((l) => {
        if (l.faulty?.correctRemedy) remedies[l.id] = l.faulty.correctRemedy;
      });
      return { type: 'inspect', faulty, remedies };
    }
    case 'read-results':
      if (ex.answerKind === 'choice') return { type: 'read-results', value: '', choices: ex.correct };
      return { type: 'read-results', value: ex.answer ? (expectedAnswers(ex.context, ex.query, ex.answer)[0] ?? '') : '' };
    case 'choice':
      return { type: 'choice', ids: ex.correct };
    case 'investigate':
      return null;
  }
}

// -------------------------------------------------------------- XP et score

export const BASE_XP: Record<number, number> = { 1: 10, 2: 20, 3: 35, 4: 50 };

export function computeXp(ex: Exercise, verdict: Verdict, opts: { hintsUsed: number; attempts: number; timedUnderPar?: boolean }): number {
  if (!verdict.correct) return 0;
  let base = BASE_XP[ex.level] ?? 10;
  if (ex.kind === 'mission') base *= 2.5;
  if (ex.kind === 'assessment') base *= 1.5;
  let f = verdict.xpFactor;
  f *= Math.max(0.6, 1 - 0.1 * opts.hintsUsed);
  if (opts.attempts <= 1) f *= 1.1;
  else if (opts.attempts > 4) f *= 0.85;
  if (opts.timedUnderPar) f *= 1.15;
  return Math.max(1, Math.round(base * f));
}

export function solutionOf(ex: Exercise): string[] {
  switch (ex.type) {
    case 'kql-write':
    case 'kql-fix':
      return ex.solutions;
    case 'kql-blocks':
      return [blocksToQuery(ex.blocks, ex.solution)];
    default:
      return [];
  }
}

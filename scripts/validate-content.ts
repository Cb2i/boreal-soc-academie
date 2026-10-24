// Validation du contenu : identifiants, références, indices, sources, caractères interdits, solutions de référence.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_EXERCISES, ALL_LABS, ALL_LESSONS } from '../src/content/index.ts';
import { COMPETENCIES } from '../src/content/competencies.ts';
import { PATHS } from '../src/content/paths.ts';
import { execute, expectedAnswers, referenceAnswer, validateExercise, validateStep } from '../src/engine/validate.ts';
import type { KqlContext } from '../src/content/types.ts';

const runsOk = (ctx: KqlContext, q: string) => execute(ctx, q, 1).ok;

const errors: string[] = [];
const warns: string[] = [];
const err = (m: string) => errors.push(m);

const pathIds = new Set(PATHS.map((p) => p.id));
const compIds = new Set(COMPETENCIES.map((c) => c.id));
const exIds = new Set<string>();
const lessonIds = new Set(ALL_LESSONS.map((l) => l.id));
const DATE = /^\d{4}-\d{2}-\d{2}$/;

for (const ex of ALL_EXERCISES) {
  if (exIds.has(ex.id)) err(`${ex.id}: identifiant en double`);
  exIds.add(ex.id);
}
const titles = new Map<string, string>();
const stmts = new Map<string, string>();

for (const ex of ALL_EXERCISES) {
  const w = (m: string) => err(`${ex.id}: ${m}`);
  if (!/^[a-z]+-[a-z0-9-]*\d{3}$/.test(ex.id)) w('identifiant au format inattendu');
  if (!pathIds.has(ex.path)) w(`parcours inconnu ${ex.path}`);
  if (!compIds.has(ex.competency)) w(`compétence inconnue ${ex.competency}`);
  else if (COMPETENCIES.find((c) => c.id === ex.competency)!.path !== ex.path) w('la compétence n’appartient pas au parcours de l’exercice');
  for (const p of ex.prerequisites) {
    if (!exIds.has(p)) w(`prérequis inconnu ${p}`);
    if (p === ex.id) w('prérequis circulaire');
  }
  if (ex.lesson && !lessonIds.has(ex.lesson)) w(`cours inconnu ${ex.lesson}`);
  if (!ex.title.trim() || !ex.objective.trim() || !ex.statement.trim() || !ex.explanation.trim()) w('champ texte vide');
  if (ex.type !== 'investigate' && ex.hints.length < 2) w('au moins 2 indices graduels requis');
  if (ex.commonMistakes.length < 1) w('erreurs fréquentes manquantes');
  if (ex.sources.length < 1) w('aucune source');
  for (const s of ex.sources) {
    if (!s.url.startsWith('https://learn.microsoft.com/') && !s.url.startsWith('https://')) w(`URL de source invalide ${s.url}`);
    if (!DATE.test(s.verified)) w(`date de vérification invalide ${s.verified}`);
  }
  const t = ex.title.toLowerCase();
  if (titles.has(t)) w(`titre en double avec ${titles.get(t)}`);
  titles.set(t, ex.id);
  const stKey = ex.statement.replace(/\s+/g, ' ').toLowerCase();
  if (stmts.has(stKey)) w(`énoncé en double avec ${stmts.get(stKey)}`);
  stmts.set(stKey, ex.id);

  switch (ex.type) {
    case 'order': {
      const ids = ex.items.map((i) => i.id);
      if (new Set(ids).size !== ids.length) w('items en double');
      if ([...ex.correct].sort().join() !== [...ids].sort().join()) w('correct ne correspond pas aux items');
      for (const alt of ex.alternatives ?? []) if ([...alt].sort().join() !== [...ids].sort().join()) w('alternative incohérente');
      break;
    }
    case 'match': {
      const opt = new Set(ex.options.map((o) => o.id));
      for (const it of ex.items) {
        const a = ex.answer[it.id];
        if (!a || a.length === 0) w(`pas de réponse pour ${it.id}`);
        else for (const o of a) if (!opt.has(o)) w(`option inconnue ${o}`);
      }
      break;
    }
    case 'place': {
      const z = new Set(ex.zones.map((x) => x.id));
      for (const it of ex.items) if (!z.has(ex.answer[it.id])) w(`zone inconnue pour ${it.id}`);
      break;
    }
    case 'inspect': {
      const faulty = ex.lines.filter((l) => l.faulty);
      if (faulty.length === 0) w('aucune ligne défectueuse');
      for (const l of faulty) {
        const f = l.faulty!;
        if (f.remedies && f.correctRemedy && !f.remedies.some((r) => r.id === f.correctRemedy)) w(`correctif inconnu pour ${l.id}`);
      }
      break;
    }
    case 'choice': {
      const ids = new Set(ex.choices.map((c) => c.id));
      for (const c of ex.correct) if (!ids.has(c)) w(`choix correct inconnu ${c}`);
      break;
    }
    case 'kql-blocks': {
      const ids = new Set(ex.blocks.map((b) => b.id));
      for (const b of ex.solution) if (!ids.has(b)) w(`bloc inconnu ${b}`);
      break;
    }
    case 'investigate': {
      if (ex.steps.length < 3) w('une enquête exige au moins 3 étapes');
      const sids = new Set<string>();
      for (const st of ex.steps) {
        if (sids.has(st.id)) w(`étape en double ${st.id}`);
        sids.add(st.id);
        if (!st.explanation.trim() || !st.prompt.trim()) w(`étape ${st.id} : texte vide`);
        try {
          if (st.kind === 'choice' || st.kind === 'multi') {
            const ids = new Set((st.choices ?? []).map((c) => c.id));
            if (ids.size < 3) w(`étape ${st.id} : au moins 3 choix`);
            if (!st.correct?.length || !st.correct.every((c) => ids.has(c))) w(`étape ${st.id} : réponses correctes invalides`);
            if (st.kind === 'choice' && st.correct?.length !== 1) w(`étape ${st.id} : un seul choix attendu`);
            if (st.kind === 'multi' && (st.correct?.length ?? 0) < 2) w(`étape ${st.id} : plusieurs réponses attendues`);
            if (st.correct && !validateStep(ex, st, { ids: st.correct }).correct) w(`étape ${st.id} : la réponse de référence échoue`);
          } else if (st.kind === 'number') {
            if (!st.answer) w(`étape ${st.id} : answer manquant`);
            else {
              const acc = expectedAnswers(ex.context, '', st.answer);
              if (!acc.length || !validateStep(ex, st, { value: acc[0] }).correct) w(`étape ${st.id} : la valeur de référence échoue`);
              if (validateStep(ex, st, { value: '-12345' }).correct) w(`étape ${st.id} : accepte une valeur absurde`);
            }
          } else if (st.kind === 'kql') {
            if (!st.kql) w(`étape ${st.id} : kql manquant`);
            else if (!validateStep(ex, st, { query: st.kql.solutions[0] }).correct) w(`étape ${st.id} : la solution KQL de référence échoue`);
          }
          for (const e of st.evidence ?? []) if (e.query && !runsOk(ex.context, e.query)) w(`étape ${st.id} : requête de preuve invalide`);
        } catch (e) {
          w(`étape ${st.id} : ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      break;
    }
    default:
      break;
  }

  if (ex.type !== 'investigate') {
    try {
      const ans = referenceAnswer(ex);
      if (!ans) w('pas de réponse de référence');
      else {
        const v = validateExercise(ex, ans);
        if (!v.correct) w(`la solution de référence échoue : ${v.title} ${v.message}`);
        if (ex.type === 'kql-fix' && ex.starter && validateExercise(ex, { type: 'kql-fix', query: ex.starter }).correct) w('la requête de départ est déjà correcte');
      }
    } catch (e) {
      w(`erreur à la validation : ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

for (const l of ALL_LESSONS) {
  const w = (m: string) => err(`cours ${l.id}: ${m}`);
  if (!pathIds.has(l.path)) w('parcours inconnu');
  if (!compIds.has(l.competency)) w('compétence inconnue');
  for (const e of l.exercises) if (!exIds.has(e)) w(`exercice inconnu ${e}`);
  if (l.body.length < 400) w('contenu trop court');
  const blocks = [...l.body.matchAll(/```kql\n([\s\S]*?)```/g)].map((m) => m[1]);
  for (const b of blocks) {
    if (b.includes('_GetWatchlist')) continue; // illustre la forme, pas de liste de surveillance dans le terrain de jeu
    const r = execute(l.context ?? 'sentinel', b, 1);
    if (!r.ok) w(`bloc KQL non exécutable : ${b.split('\n')[0]}`);
  }
  if (l.exercises.length < 3) w('au moins 3 exercices associés');
  if (l.sources.length < 1) w('aucune source');
  for (const s of l.sources) if (!DATE.test(s.verified)) w('date de vérification invalide');
}
for (const lab of ALL_LABS) {
  const w = (m: string) => err(`labo ${lab.id}: ${m}`);
  if (lab.steps.length < 3) w('étapes insuffisantes');
  if (lab.cleanup.length < 1) w('nettoyage manquant');
  if (lab.checks.length < 1) w('vérifications manquantes');
  if (!lab.cost.trim() || !lab.licenses.trim()) w('coût ou licences manquants');
  for (const s of lab.sources) if (!DATE.test(s.verified)) w('date de vérification invalide');
}

// Caractère interdit (tiret cadratin) dans tout le code source et le contenu.
const EM = String.fromCharCode(0x2014);
function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    if (f === 'node_modules' || f === 'dist' || f.startsWith('.git')) continue;
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|css|md|html|json|yml|yaml|svg|txt)$/.test(f) && f !== 'package-lock.json') out.push(p);
  }
  return out;
}
for (const root of ['src', 'tests', 'scripts', 'public', '.github']) {
  try {
    for (const file of walk(root)) {
      const txt = readFileSync(file, 'utf8');
      if (txt.includes(EM)) err(`${file}: contient un tiret cadratin`);
    }
  } catch {
    /* dossier absent */
  }
}
for (const file of ['README.md', 'index.html', 'LICENSES.md']) {
  try {
    if (readFileSync(file, 'utf8').includes(EM)) err(`${file}: contient un tiret cadratin`);
  } catch {
    /* absent */
  }
}

console.log(`Exercices : ${ALL_EXERCISES.length} | Cours : ${ALL_LESSONS.length} | Labos : ${ALL_LABS.length}`);
for (const w of warns) console.log('AVERTISSEMENT ' + w);
if (errors.length) {
  console.error(`\n${errors.length} erreur(s) :`);
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log('Contenu valide.');

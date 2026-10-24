// Validation des traductions anglaises : couverture, forme, code préservé, résidus de français, tirets longs.
// Usage : tsx scripts/validate-i18n.ts [--partial]   (--partial tolère les entrées manquantes)
import { ALL_EXERCISES, ALL_LABS, ALL_LESSONS } from '../src/content/index.ts';
import { PATHS } from '../src/content/paths.ts';
import { COMPETENCIES } from '../src/content/competencies.ts';
import { EN } from '../src/content/en/all.ts';
import { applyOverlay } from '../src/i18n/localize.ts';
import { competencyShape, exerciseShape, labShape, lessonShape, pathShape } from './i18n-shape.ts';

const partial = process.argv.includes('--partial');
const errors: string[] = [];
const warns: string[] = [];
let missing = 0;
let total = 0;

type J = unknown;
const isObj = (v: J): v is Record<string, J> => typeof v === 'object' && v !== null && !Array.isArray(v);

// Mots-substituts français dans la syntaxe illustrée en `code` : leur équivalent anglais est accepté.
const PLACEHOLDERS: Record<string, string> = { colonne: 'column', nom: 'name', unité: 'unit', début: 'start', fin: 'end', valeur: 'value', condition: 'condition', expression: 'expression', table: 'table', texte: 'text', séparateur: 'separator', requête: 'query', colonneDeTri: 'sortColumn', colonnesÀRetourner: 'columnsToReturn', valeurParDefaut: 'defaultValue', debut: 'start', nomDuLet: 'letName', groupe: 'group', FOURNISSEUR: 'PROVIDER' };
const mapPlaceholders = (c: string) => c.replace(/[A-Za-zÀ-ÿ]+/g, (w) => PLACEHOLDERS[w] ?? w);

function codeParts(s: string, isFr = false): string[] {
  const out: string[] = [];
  const fences = s.match(/```[\s\S]*?```/g) ?? [];
  out.push(...fences.map((f) => 'F:' + f));
  const rest = s.replace(/```[\s\S]*?```/g, ' ');
  out.push(...(rest.match(/`[^`]+`/g) ?? []).map((c) => 'I:' + (isFr ? mapPlaceholders(c) : c)));
  return out.sort();
}
const stripCode = (s: string) => s.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]+`/g, ' ');
const FR_LEAK = /[àâäçéèêëîïôöùûüÿœÀÂÇÉÈÊÎÔÙÛ]|(?<![-=\w])(le|la|les|des|une|pour|vous|votre|dans|avec|sans|est|sont|pas|ces|cette|aux|sur)(?![-=\w])/i;
const digits = (s: string) => (stripCode(s).match(/\d+/g) ?? []).sort().join(',');

function compare(id: string, path: string, fr: J, en: J): void {
  if (typeof fr === 'string') {
    if (typeof en !== 'string' || en.trim() === '') return void errors.push(`${id}: ${path} manquant`);
    if (en.includes(String.fromCharCode(0x2014))) errors.push(`${id}: ${path} contient un tiret long`);
    if (JSON.stringify(codeParts(fr, true)) !== JSON.stringify(codeParts(en))) errors.push(`${id}: ${path} le code (blocs ou \`code\`) diffère du français`);
    const leak = stripCode(en).match(FR_LEAK);
    if (leak && fr !== en) errors.push(`${id}: ${path} semble contenir du français (« ${leak[0]} »)`);
    if (digits(fr) !== digits(en)) warns.push(`${id}: ${path} les nombres diffèrent (${digits(fr)} / ${digits(en)})`);
    return;
  }
  if (Array.isArray(fr)) {
    if (!Array.isArray(en) || en.length !== fr.length) return void errors.push(`${id}: ${path} tableau de longueur différente (${fr.length} / ${Array.isArray(en) ? en.length : '?'})`);
    fr.forEach((f, i) => {
      const e = isObj(f) && typeof f.id === 'string' ? en.find((x) => isObj(x) && x.id === f.id) : en[i];
      compare(id, `${path}[${isObj(f) && typeof f.id === 'string' ? f.id : i}]`, f, e);
    });
    return;
  }
  if (isObj(fr)) {
    if (!isObj(en)) return void errors.push(`${id}: ${path} objet manquant`);
    for (const k of Object.keys(fr)) if (k !== 'id') compare(id, `${path}.${k}`, fr[k], en[k]);
    for (const k of Object.keys(en)) if (!(k in fr)) errors.push(`${id}: ${path}.${k} champ inattendu dans la traduction`);
  }
}

function checkAll<T extends { id: string }>(kind: string, list: T[], shape: (x: T) => Record<string, J>, ov: Record<string, J>) {
  const ids = new Set(list.map((x) => x.id));
  for (const k of Object.keys(ov)) if (!ids.has(k)) errors.push(`${kind} ${k}: identifiant inconnu dans la traduction`);
  for (const x of list) {
    total++;
    const en = ov[x.id];
    if (en === undefined) {
      missing++;
      if (!partial) errors.push(`${kind} ${x.id}: traduction manquante`);
      continue;
    }
    compare(x.id, '', shape(x), en);
  }
}

checkAll('parcours', PATHS, pathShape, EN.paths);
checkAll('compétence', COMPETENCIES, competencyShape, EN.competencies);
checkAll('cours', ALL_LESSONS, lessonShape, EN.lessons);
checkAll('labo', ALL_LABS, labShape, EN.labs);
checkAll('exercice', ALL_EXERCISES, exerciseShape, EN.exercises);

// la fusion ne doit jamais retomber sur le français pour un exercice traduit
for (const e of ALL_EXERCISES) {
  const ov = EN.exercises[e.id];
  if (!ov) continue;
  const merged = applyOverlay(e, ov);
  if (merged.title === e.title && e.title.length > 3) warns.push(`${e.id}: titre identique au français`);
}

for (const w of warns) console.warn('Avertissement :', w);
for (const e of errors) console.error('ERREUR :', e);
console.log(`Traductions : ${total - missing}/${total} entités traduites (${missing} manquantes). ${errors.length} erreur(s), ${warns.length} avertissement(s).`);
if (errors.length > 0) process.exit(1);

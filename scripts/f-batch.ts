// Aide à la traduction : npx tsx scripts/t-batch.ts <parcours> [maxCaracteres]
// Affiche la prochaine tranche de phrases françaises non révisées (ordre de priorité) et enregistre leurs clés.
// Réponse attendue : /tmp/claude-0/tb/<parcours>.out.json = { "0": "traduction", "1": ... } puis npx tsx scripts/t-apply.ts <parcours>.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { collectProse, h } from '../src/i18n/prose.ts';

const [track, maxArg, tierArg] = process.argv.slice(2);
const tier = Number(tierArg ?? 9);
const max = Number(maxArg ?? 30000);
const dir = `src/i18n/dictfr/${track}`;
import { existsSync } from "node:fs";
const ledgerPath = `scripts/fr-reviewed/${track}.json`;
const reviewed = new Set<string>(existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, "utf8")) : []);
const dict: Record<string, string> = {};
if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith('.json')) Object.assign(dict, JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const C = await CONTENT_LOADERS[track]();
const list: string[] = [];
const add = (v: unknown) => collectProse(v, list);
// Niveau 0 : niveaux, modules, titres et résumés de leçons.
add(C.LEVELS);
for (const m of C.MODULES) add(m);
for (const l of C.LESSONS) add({ title: l.title, summary: l.summary, objectives: l.objectives, prerequisites: l.prerequisites });
for (const c of C.COMPETENCIES) add(c);
for (const c of C.CASES) add(c);
// Niveau 1 : corps des leçons, démonstrations, fiches de révision.
if (tier >= 1) for (const l of C.LESSONS) add({ demo: l.demo, revision: l.revision, body: l.body });
// Niveau 2 : exercices, projets, ressources.
if (tier >= 2) { for (const e of C.EXERCISES) add(e); for (const p of C.PROJECTS) add(p); add(C.RESOURCES); }
const SUSPECT = /à la main|bâtir|bâti\b|tout le monde|à tout prix|règle d’or|se plaint|sans détour|ouvrir un trou|n’importe qu|quelque chose|un peu|en gros|du genre|\bgros\b|\bpetit|bête|soupçon|tomber? en panne|tombe en panne|faire tourner|tourne|planter|plante\b|bricol|\bsuper\b|\btrès\b|vraiment|quand même|en fait|tout simplement|hyper|plein de|\bça\b|\by a\b|il faut pas|de toute façon|bref|piège|\bjuste\b|sauter|coller|aussi bien|autant que possible|pas question|\bon peut\b.*\bon peut\b|!/i;
const seen = new Set<string>();
const todo: { k: string; s: string }[] = [];
let totalChars = 0, doneChars = 0, total = 0;
for (const s of list) {
  const k = h(s);
  if (seen.has(k)) continue;
  seen.add(k);
  if (process.env.FILTER && !SUSPECT.test(s)) continue;
  total++; totalChars += s.length;
  if (dict[k] !== undefined || reviewed.has(k)) { doneChars += s.length; continue; }
  todo.push({ k, s });
}
const batch: { k: string; s: string }[] = [];
let n = 0;
for (const t of todo) { if (n > 0 && n + t.s.length > max) break; batch.push(t); n += t.s.length; }
writeFileSync(`/tmp/claude-0/tb/${track}.fcur.json`, JSON.stringify(batch.map((b) => b.k)));
const from = Number(process.argv[5] ?? 0);
batch.forEach((b, i) => { if (i >= from) { console.log(`@@${i}`); console.log(b.s); } });
console.error(`[${track}] phrases uniques: ${total}, révisées: ${total - todo.length}, caractères traduits: ${Math.round(doneChars / 1000)}k/${Math.round(totalChars / 1000)}k; tranche: ${batch.length} phrases, ${Math.round(n / 1000)}k car.`);

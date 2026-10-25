// Aide à la traduction : npx tsx scripts/t-batch.ts <parcours> [maxCaracteres]
// Affiche la prochaine tranche de phrases françaises non traduites (ordre de priorité) et enregistre leurs clés.
// Réponse attendue : /tmp/claude-0/tb/<parcours>.out.json = { "0": "traduction", "1": ... } puis npx tsx scripts/t-apply.ts <parcours>.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { collectProse, h } from '../src/i18n/prose.ts';

const [track, maxArg, tierArg] = process.argv.slice(2);
const tier = Number(tierArg ?? 9);
const max = Number(maxArg ?? 30000);
const dir = `src/i18n/dict/${track}`;
const dict: Record<string, string> = {};
for (const f of readdirSync(dir)) if (f.endsWith('.json')) Object.assign(dict, JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
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
const seen = new Set<string>();
const todo: { k: string; s: string }[] = [];
let totalChars = 0, doneChars = 0, total = 0;
for (const s of list) {
  const k = h(s);
  if (seen.has(k)) continue;
  seen.add(k);
  total++; totalChars += s.length;
  if (dict[k] !== undefined) { doneChars += s.length; continue; }
  todo.push({ k, s });
}
const batch: { k: string; s: string }[] = [];
let n = 0;
for (const t of todo) { if (n > 0 && n + t.s.length > max) break; batch.push(t); n += t.s.length; }
writeFileSync(`/tmp/claude-0/tb/${track}.cur.json`, JSON.stringify(batch.map((b) => b.k)));
const from = Number(process.argv[5] ?? 0);
batch.forEach((b, i) => { if (i >= from) { console.log(`@@${i}`); console.log(b.s); } });
console.error(`[${track}] phrases uniques: ${total}, traduites: ${total - todo.length}, caractères traduits: ${Math.round(doneChars / 1000)}k/${Math.round(totalChars / 1000)}k; tranche: ${batch.length} phrases, ${Math.round(n / 1000)}k car.`);

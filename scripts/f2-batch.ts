// Relecture rédactionnelle intégrale : npx tsx scripts/f2-batch.ts <parcours> [maxCaracteres] [depuis]
// Affiche le texte courant (révision déjà appliquée, sinon texte d'origine) des phrases pas encore relues.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { collectProse, h } from '../src/i18n/prose.ts';

const [track, maxArg, fromArg] = process.argv.slice(2);
const max = Number(maxArg ?? 24000);
const dir = `src/i18n/dictfr/${track}`;
const ledgerPath = `scripts/fr2-reviewed/${track}.json`;
const reviewed = new Set<string>(existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : []);
const dict: Record<string, string> = {};
if (existsSync(dir)) for (const f of readdirSync(dir).sort()) if (f.endsWith('.json')) Object.assign(dict, JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const C = await CONTENT_LOADERS[track]();
const list: string[] = [];
const add = (v: unknown) => collectProse(v, list);
add(C.LEVELS); for (const m of C.MODULES) add(m);
for (const l of C.LESSONS) add({ title: l.title, summary: l.summary, objectives: l.objectives, prerequisites: l.prerequisites });
for (const c of C.COMPETENCIES) add(c); for (const c of C.CASES) add(c);
for (const l of C.LESSONS) add({ demo: l.demo, revision: l.revision, body: l.body });
for (const e of C.EXERCISES) add(e); for (const p of C.PROJECTS) add(p); add(C.RESOURCES);
const seen = new Set<string>();
const todo: { k: string; s: string }[] = [];
let total = 0;
for (const s of list) {
  const k = h(s);
  if (seen.has(k)) continue;
  seen.add(k); total++;
  if (reviewed.has(k)) continue;
  todo.push({ k, s: dict[k] ?? s });
}
const batch: { k: string; s: string }[] = [];
let n = 0;
for (const t of todo) { if (n > 0 && n + t.s.length > max) break; batch.push(t); n += t.s.length; }
writeFileSync(`/tmp/claude-0/tb/${track}.f2cur.json`, JSON.stringify(batch.map((b) => b.k)));
const from = Number(fromArg ?? 0);
batch.forEach((b, i) => { if (i >= from) { console.log(`@@${i}`); console.log(b.s); } });
console.error(`[${track}] relues: ${total - todo.length}/${total}; tranche: ${batch.length} phrases, ${Math.round(n / 1000)}k car.`);

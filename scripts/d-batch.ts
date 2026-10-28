// npx tsx scripts/d-batch.ts [maxCaracteres] [depuis] : tranche suivante de lignes de schémas à traduire (pseudo-parcours « diag »).
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { FLOWS } from '../src/diagrams/index.ts';
import { flowLines, h } from './d-lib.ts';

const max = Number(process.argv[2] ?? 24000);
const from = Number(process.argv[3] ?? 0);
const dir = 'src/i18n/dict/diag';
mkdirSync(dir, { recursive: true });
const dict: Record<string, string> = {};
for (const f of readdirSync(dir)) if (f.endsWith('.json')) Object.assign(dict, JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const seen = new Set<string>();
const todo: { k: string; s: string }[] = [];
let total = 0;
for (const f of FLOWS) for (const s of flowLines(f)) {
  const k = h(s);
  if (seen.has(k)) continue;
  seen.add(k); total++;
  if (dict[k] === undefined) todo.push({ k, s });
}
const batch: { k: string; s: string }[] = [];
let n = 0;
for (const t of todo) { if (n > 0 && n + t.s.length > max) break; batch.push(t); n += t.s.length; }
writeFileSync('/tmp/claude-0/tb/diag.cur.json', JSON.stringify(batch.map((b) => b.k)));
batch.forEach((b, i) => { if (i >= from) { console.log(`@@${i}`); console.log(b.s); } });
console.error(`[diag] phrases uniques: ${total}, traduites: ${total - todo.length}; tranche: ${batch.length} phrases, ${Math.round(n / 1000)}k car.`);

// npx tsx scripts/f-apply.ts <parcours> : /tmp/claude-0/tb/<parcours>.fout.json = { "indice": "phrase révisée" } (seulement les phrases modifiées).
// Toutes les phrases de la tranche sont marquées comme relues; les phrases modifiées vont dans src/i18n/dictfr/<parcours>/NNN.json.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const [track] = process.argv.slice(2);
const keys: string[] = JSON.parse(readFileSync(`/tmp/claude-0/tb/${track}.fcur.json`, 'utf8'));
const out: Record<string, string> = JSON.parse(readFileSync(`/tmp/claude-0/tb/${track}.fout.json`, 'utf8'));
const dir = `src/i18n/dictfr/${track}`;
mkdirSync(dir, { recursive: true });
const dash = String.fromCharCode(0x2014);
const res: Record<string, string> = {};
let ok = 0, bad = 0;
for (const [i, fr] of Object.entries(out)) {
  const k = keys[Number(i)];
  if (!k || typeof fr !== 'string' || !fr.trim()) { bad++; continue; }
  res[k] = fr.split(dash).join(',');
  ok++;
}
if (ok) {
  const next = String(readdirSync(dir).filter((f) => f.endsWith('.json')).length).padStart(3, '0');
  writeFileSync(`${dir}/${next}.json`, JSON.stringify(res));
}
const ledgerPath = `scripts/fr-reviewed/${track}.json`;
const reviewed = new Set<string>(existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : []);
for (const k of keys) reviewed.add(k);
writeFileSync(ledgerPath, JSON.stringify([...reviewed]));
console.log(`${track}: ${ok} phrases révisées écrites, ${keys.length - ok} laissées telles quelles (${bad} ignorées)`);

await import('./f-gen.ts');

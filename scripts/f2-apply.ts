// npx tsx scripts/f2-apply.ts <parcours> : /tmp/claude-0/tb/<parcours>.f2out.json = { "indice": "phrase révisée" } (seulement les phrases modifiées).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const [track] = process.argv.slice(2);
const keys: string[] = JSON.parse(readFileSync(`/tmp/claude-0/tb/${track}.f2cur.json`, 'utf8'));
const outPath = `/tmp/claude-0/tb/${track}.f2out.json`;
const out: Record<string, string> = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : {};
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
const ledgerPath = `scripts/fr2-reviewed/${track}.json`;
const reviewed = new Set<string>(existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : []);
for (const k of keys) reviewed.add(k);
writeFileSync(ledgerPath, JSON.stringify([...reviewed]));
console.log(`${track}: ${ok} phrases corrigées, ${keys.length - ok} inchangées (${bad} ignorées)`);
await import('./f-gen.ts');

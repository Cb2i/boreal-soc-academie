// Écrit /tmp/claude-0/w/cur.json : texte courant (révision appliquée) de toutes les phrases.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
const all: Record<string, { k: string; s: string }[]> = JSON.parse(readFileSync('/tmp/claude-0/w/all.json', 'utf8'));
const out: Record<string, { k: string; s: string; c: string }[]> = {};
for (const [t, arr] of Object.entries(all)) {
  const dir = `src/i18n/dictfr/${t}`; const d: Record<string, string> = {};
  if (existsSync(dir)) for (const f of readdirSync(dir).sort()) if (f.endsWith('.json')) Object.assign(d, JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
  out[t] = arr.map(({ k, s }) => ({ k, s, c: d[k] ?? s }));
}
writeFileSync('/tmp/claude-0/w/cur.json', JSON.stringify(out));

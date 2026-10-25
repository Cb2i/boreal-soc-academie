// npx tsx scripts/t-apply.ts <parcours> : fusionne /tmp/claude-0/tb/<parcours>.out.json dans un nouveau fichier de dictionnaire.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const [track] = process.argv.slice(2);
const keys: string[] = JSON.parse(readFileSync(`/tmp/claude-0/tb/${track}.cur.json`, 'utf8'));
const out: Record<string, string> = JSON.parse(readFileSync(`/tmp/claude-0/tb/${track}.out.json`, 'utf8'));
const dir = `src/i18n/dict/${track}`;
const res: Record<string, string> = {};
let ok = 0, bad = 0;
const dash = String.fromCharCode(0x2014);
for (const [i, en] of Object.entries(out)) {
  const k = keys[Number(i)];
  if (!k || typeof en !== 'string' || !en.trim()) { bad++; continue; }
  res[k] = en.split(dash).join(',');
  ok++;
}
const next = String(readdirSync(dir).filter((f) => f.endsWith('.json')).length).padStart(3, '0');
writeFileSync(`${dir}/${next}.json`, JSON.stringify(res));
console.log(`${track}: ${ok} traductions écrites dans ${next}.json (${bad} ignorées, ${keys.length - ok} phrases de la tranche restent à faire)`);

// Régénère src/i18n/dicts.ts (liste explicite des fichiers de dictionnaire, sans glob pour rester compatible avec tsx).
const tracks = readdirSync('src/i18n/dict');
let src = `// Fichier généré par scripts/t-apply.ts : ne pas éditer.\n// Chargement différé des dictionnaires anglais des parcours (un dossier par parcours, plusieurs fichiers JSON).\ntype Dict = Record<string, string>;\nconst LOADERS: Record<string, (() => Promise<{ default: Dict }>)[]> = {\n`;
for (const t of tracks) {
  const files = readdirSync(`src/i18n/dict/${t}`).filter((f) => f.endsWith('.json')).sort();
  src += `  ${t}: [${files.map((f) => `() => import('./dict/${t}/${f}')`).join(', ')}],\n`;
}
src += `};\n\nexport async function loadDict(track: string): Promise<Dict> {\n  const parts = await Promise.all((LOADERS[track] ?? []).map((f) => f()));\n  return Object.assign({}, ...parts.map((p) => p.default));\n}\n`;
writeFileSync('src/i18n/dicts.ts', src);

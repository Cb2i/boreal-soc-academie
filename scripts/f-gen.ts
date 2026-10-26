import { readdirSync, writeFileSync } from 'node:fs';
const tracks = readdirSync('src/i18n/dictfr');
let src = `// Fichier généré par scripts/f-apply.ts : ne pas éditer.\n// Révision rédactionnelle du français (registre soutenu) : phrase d'origine -> phrase révisée.\ntype Dict = Record<string, string>;\nconst LOADERS: Record<string, (() => Promise<{ default: Dict }>)[]> = {\n`;
for (const t of tracks) {
  const files = readdirSync(`src/i18n/dictfr/${t}`).filter((f) => f.endsWith('.json')).sort();
  if (files.length) src += `  ${t}: [${files.map((f) => `() => import('./dictfr/${t}/${f}')`).join(', ')}],\n`;
}
src += `};\n\nexport async function loadDictFr(track: string): Promise<Dict> {\n  const parts = await Promise.all((LOADERS[track] ?? []).map((f) => f()));\n  return Object.assign({}, ...parts.map((p) => p.default));\n}\n`;
writeFileSync('src/i18n/dictsFr.ts', src);

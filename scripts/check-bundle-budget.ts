// Budget de taille du chargement initial (accueil) : l'entrée JS et les modulepreload de dist/index.html, en gzip.
// Les parcours, la section Azure, la palette de recherche et les schémas sont chargés à la demande et n'en font pas partie.
// Usage : npm run build && npx tsx scripts/check-bundle-budget.ts   (ou npm run check:bundle)
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const BUDGET_KB = Number(process.env.BUNDLE_BUDGET_KB ?? 100);

const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const files = [...html.matchAll(/(?:<script[^>]*\ssrc|<link[^>]*rel="modulepreload"[^>]*\shref)="[^"]*?(assets\/[^"\/]+\.js)"/g)].map((m) => m[1]);
if (files.length === 0) {
  console.error(`Aucun fichier JS initial trouvé dans ${join(DIST, 'index.html')} : lancer npm run build d'abord.`);
  process.exit(1);
}

let total = 0;
for (const f of [...new Set(files)]) {
  const gz = gzipSync(readFileSync(join(DIST, f))).length;
  total += gz;
  console.log(`  ${(gz / 1024).toFixed(1).padStart(7)} kB gzip  ${f}`);
}
const kb = total / 1024;
console.log(`Chargement initial : ${kb.toFixed(1)} kB gzip (budget ${BUDGET_KB} kB)`);
if (kb > BUDGET_KB) {
  console.error('Budget dépassé : un module lourd est probablement importé de façon statique depuis App.tsx ou l\'accueil.');
  process.exit(1);
}

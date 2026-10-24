// Aide à la traduction : affiche les champs français à traduire, en JSON compact.
// Usage : npx tsx scripts/i18n-extract.ts exercices <préfixe-id>|lessons|labs|paths|competencies [début] [fin]
import { ALL_EXERCISES, ALL_LABS, ALL_LESSONS } from '../src/content/index.ts';
import { PATHS } from '../src/content/paths.ts';
import { COMPETENCIES } from '../src/content/competencies.ts';
import { competencyShape, exerciseShape, labShape, lessonShape, pathShape } from './i18n-shape.ts';

const [kind, a, b, c] = process.argv.slice(2);
const out: Record<string, unknown> = {};
if (kind === 'exercises') {
  const from = Number(b ?? 0);
  const to = Number(c ?? 9999);
  for (const e of ALL_EXERCISES) {
    const m = /^([a-z]+)-(\d+)$/.exec(e.id)!;
    const n = Number(m[2]);
    if (m[1] === a && n >= from && n <= to) out[e.id] = exerciseShape(e);
  }
} else if (kind === 'lessons') for (const l of ALL_LESSONS) { if (!a || l.id === a) out[l.id] = lessonShape(l); }
else if (kind === 'labs') for (const l of ALL_LABS) out[l.id] = labShape(l);
else if (kind === 'paths') for (const p of PATHS) out[p.id] = pathShape(p);
else if (kind === 'competencies') for (const x of COMPETENCIES) out[x.id] = competencyShape(x);
console.log(JSON.stringify(out, null, 1));

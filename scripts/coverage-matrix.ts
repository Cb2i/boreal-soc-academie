// Matrice de couverture : parcours x compétence x difficulté x type. Sert d'inventaire factuel (aucun chiffre écrit à la main).
import { ALL_EXERCISES, ALL_LABS, ALL_LESSONS } from '../src/content/index.ts';
import { COMPETENCIES } from '../src/content/competencies.ts';
import { PATHS } from '../src/content/paths.ts';
import { EX_TYPE_LABELS, LEVEL_NAMES } from '../src/content/types.ts';
import type { Level } from '../src/content/types.ts';

const levels: Level[] = [1, 2, 3, 4];
const pad = (s: string | number, n: number) => String(s).padEnd(n);

console.log(`Exercices : ${ALL_EXERCISES.length} | Cours : ${ALL_LESSONS.length} | Labos : ${ALL_LABS.length}\n`);

console.log('Par parcours et difficulté');
console.log(pad('Parcours', 24) + levels.map((l) => pad(LEVEL_NAMES[l], 15)).join('') + 'Total');
for (const p of PATHS) {
  const exs = ALL_EXERCISES.filter((e) => e.path === p.id);
  console.log(pad(p.id, 24) + levels.map((l) => pad(exs.filter((e) => e.level === l).length, 15)).join('') + exs.length);
}

console.log('\nPar type d’exercice');
const types = [...new Set(ALL_EXERCISES.map((e) => e.type))];
for (const t of types) console.log(pad(EX_TYPE_LABELS[t], 36) + ALL_EXERCISES.filter((e) => e.type === t).length);
const qcm = ALL_EXERCISES.filter((e) => e.type === 'choice').length;
console.log(`\nPart des choix (QCM) : ${((100 * qcm) / ALL_EXERCISES.length).toFixed(1)} %`);

console.log('\nPar compétence');
for (const c of COMPETENCIES) {
  const exs = ALL_EXERCISES.filter((e) => e.competency === c.id);
  console.log(pad(c.id, 20) + pad(c.path, 22) + pad(exs.length, 5) + levels.map((l) => `${l}:${exs.filter((e) => e.level === l).length}`).join(' '));
}
const empty = COMPETENCIES.filter((c) => !ALL_EXERCISES.some((e) => e.competency === c.id));
if (empty.length) console.log(`\nCompétences sans exercice : ${empty.map((c) => c.id).join(', ')}`);

const kql = ALL_EXERCISES.filter((e) => e.type.startsWith('kql') || e.type === 'read-results' || (e.type === 'investigate'));
console.log(`\nExercices KQL (écriture, correction, blocs, lecture, enquêtes) : ${kql.length}`);
console.log(`Exercices du parcours KQL : ${ALL_EXERCISES.filter((e) => e.path === 'kql').length}`);
const xdr = ALL_EXERCISES.filter((e) => 'context' in e && e.context === 'defender-xdr').length;
console.log(`Contexte Defender XDR : ${xdr}`);
console.log(`Missions : ${ALL_EXERCISES.filter((e) => e.kind === 'mission').length} | Évaluations : ${ALL_EXERCISES.filter((e) => e.kind === 'assessment').length}`);

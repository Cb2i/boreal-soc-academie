// Génère src/tracks/stats.json : effectifs de chaque parcours, lus par l'accueil sans charger le contenu.
// Le test tests/tracks.test.ts vérifie que le fichier est à jour.
import { writeFileSync } from 'node:fs';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';

const out: Record<string, { modules: number; lessons: number; exercises: number; projects: number; competencies: number; resources: number }> = {};
for (const [id, load] of Object.entries(CONTENT_LOADERS)) {
  const c = await load();
  out[id] = { modules: c.MODULES.length, lessons: c.LESSONS.length, exercises: c.EXERCISES.length, projects: c.PROJECTS.length, competencies: c.COMPETENCIES.length, resources: c.RESOURCES.length };
}
writeFileSync('src/tracks/stats.json', JSON.stringify(out, null, 2) + '\n');
console.log('stats.json écrit :', Object.keys(out).join(', '));

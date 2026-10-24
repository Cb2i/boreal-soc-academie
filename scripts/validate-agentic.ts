// Validation de la section Agentic AI : références croisées, ressources, liens, interdits.
// Les réponses de référence des exercices sont vérifiées par tests/agentic-content.test.ts ; ce script contrôle le reste.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { COMPETENCIES, EXERCISES, LESSONS, MODULES, PROJECTS, RESOURCES, CASES } from '../src/agentic/content/index.ts';

const errors: string[] = [];
const err = (m: string) => errors.push(m);
const exIds = new Set(EXERCISES.map((e) => e.id));
const lessonIds = new Set(LESSONS.map((l) => l.id));
const compIds = new Set(COMPETENCIES.map((c) => c.id));
const resIds = new Set(RESOURCES.map((r) => r.id));
const projIds = new Set(PROJECTS.map((p) => p.id));

for (const arr of [EXERCISES.map((e) => e.id), LESSONS.map((l) => l.id), COMPETENCIES.map((c) => c.id), PROJECTS.map((p) => p.id), RESOURCES.map((r) => r.id)]) {
  if (new Set(arr).size !== arr.length) err('identifiant en double dans un catalogue');
}
for (const l of LESSONS) {
  for (const id of [l.guided, l.autonomous, ...l.quiz]) if (!id || !exIds.has(id)) err(`${l.id}: exercice inconnu ${id}`);
  if (!l.links.length) err(`${l.id}: aucun lien`);
  for (const k of l.links) if (!/^https:\/\//.test(k.url)) err(`${l.id}: lien non HTTPS ${k.url}`);
}
for (const e of EXERCISES) {
  if (!compIds.has(e.competency)) err(`${e.id}: compétence inconnue ${e.competency}`);
  if (e.lesson && !lessonIds.has(e.lesson)) err(`${e.id}: leçon inconnue ${e.lesson}`);
}
for (const m of MODULES) {
  for (const id of [...m.evaluation, ...m.remediation]) if (!exIds.has(id)) err(`${m.id}: exercice inconnu ${id}`);
  for (const id of m.projects) if (!projIds.has(id)) err(`${m.id}: projet inconnu ${id}`);
  if (!CASES.find((c) => c.module === m.id)) err(`${m.id}: cas pratique absent`);
}
for (const p of PROJECTS) {
  for (const id of p.resources ?? []) if (!resIds.has(id)) err(`${p.id}: ressource inconnue ${id}`);
  if (p.connected && !(p.connected.cleanup && p.connected.costs && p.connected.secrets && p.connected.permissions)) err(`${p.id}: laboratoire connecté incomplet`);
}
for (const r of RESOURCES) {
  const f = resolve('public/ressources-ia', r.file);
  if (!existsSync(f)) { err(`${r.id}: fichier absent ${r.file}`); continue; }
  const txt = readFileSync(f, 'utf8');
  if (txt.includes(String.fromCharCode(8212))) err(`${r.id}: tiret cadratin dans ${r.file}`);
  if (/(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)/.test(txt)) err(`${r.id}: secret probable dans ${r.file}`);
  if (r.file.endsWith('.json')) { try { JSON.parse(txt); } catch { err(`${r.id}: JSON invalide`); } }
  for (const l of r.lessons ?? []) if (!lessonIds.has(l)) err(`${r.id}: leçon inconnue ${l}`);
  for (const p of r.projects ?? []) if (!projIds.has(p)) err(`${r.id}: projet inconnu ${p}`);
}
if (errors.length) {
  console.error(errors.map((e) => 'ERREUR ' + e).join('\n'));
  process.exit(1);
}
console.log(`Section IA valide : ${MODULES.length} modules, ${LESSONS.length} leçons, ${EXERCISES.length} exercices, ${PROJECTS.length} projets, ${RESOURCES.length} ressources.`);

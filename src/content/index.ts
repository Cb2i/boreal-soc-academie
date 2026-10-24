import type { Exercise, Lab, Lesson } from './types.ts';
import { kql1 } from './exercises/kql-1.ts';
import { kql2 } from './exercises/kql-2.ts';
import { kql3 } from './exercises/kql-3.ts';
import { kql4 } from './exercises/kql-4.ts';
import { kql5 } from './exercises/kql-5.ts';
import { kql6 } from './exercises/kql-6.ts';
import { az1 } from './exercises/az-1.ts';
import { az2 } from './exercises/az-2.ts';
import { id1 } from './exercises/id-1.ts';
import { obs1 } from './exercises/obs-1.ts';
import { sen1 } from './exercises/sen-1.ts';
import { soc1 } from './exercises/soc-1.ts';
import { LESSONS } from './lessons.ts';
import { PATHS } from './paths.ts';
import { COMPETENCIES } from './competencies.ts';
import type { EnBundle } from './en/types.ts';
import { applyOverlay } from '../i18n/localize.ts';
import { onBeforeLangChange } from '../i18n/lang.ts';
import { EX_TYPE_LABELS, LEVEL_NAMES } from './types.ts';
import { LABS } from './labs.ts';

const RAW_EXERCISES: Exercise[] = [...kql1, ...kql2, ...kql3, ...kql4, ...kql5, ...kql6, ...az1, ...az2, ...id1, ...obs1, ...sen1, ...soc1];

// Chaque exercice reçoit le cours qui le liste en premier (sauf s'il en déclare déjà un).
const lessonOf = new Map<string, string>();
for (const l of LESSONS) for (const id of l.exercises) if (!lessonOf.has(id)) lessonOf.set(id, l.id);
const FR_EXERCISES: Exercise[] = RAW_EXERCISES.map((e) => (e.lesson || !lessonOf.has(e.id) ? e : ({ ...e, lesson: lessonOf.get(e.id) } as Exercise)));
const FR_LESSONS: Lesson[] = LESSONS;
const FR_LABS: Lab[] = LABS;
const FR_PATHS = PATHS.map((x) => ({ ...x }));
const FR_COMPETENCIES = COMPETENCIES.map((x) => ({ ...x }));

const FR_LEVEL_NAMES = { ...LEVEL_NAMES };
const EN_LEVEL_NAMES = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' } as typeof LEVEL_NAMES;
const FR_TYPE_LABELS = { ...EX_TYPE_LABELS };
const EN_TYPE_LABELS: typeof EX_TYPE_LABELS = {
  'kql-write': 'KQL writing',
  'kql-fix': 'Query fix',
  'kql-blocks': 'KQL blocks (drag and drop)',
  order: 'Reordering',
  match: 'Matching',
  place: 'Placement (drag and drop)',
  inspect: 'Configuration inspection',
  'read-results': 'Reading results',
  investigate: 'Multi-step investigation',
  choice: 'Multiple choice',
};

// Les tableaux et dictionnaires exportés gardent la même identité : on remplace leur contenu en place
// quand la langue change, ce qui évite de modifier chaque page qui les importe.
export const ALL_EXERCISES: Exercise[] = FR_EXERCISES.slice();
export const ALL_LESSONS: Lesson[] = FR_LESSONS.slice();
export const ALL_LABS: Lab[] = FR_LABS.slice();
export const EXERCISE_BY_ID: Record<string, Exercise> = {};
export const LESSON_BY_ID: Record<string, Lesson> = {};

let EN: EnBundle | null = null;
const cache: { en?: { ex: Exercise[]; les: Lesson[]; labs: Lab[]; paths: typeof PATHS; comps: typeof COMPETENCIES } } = {};

function buildEn() {
  const en = EN!;
  return (cache.en ??= {
    ex: FR_EXERCISES.map((e) => applyOverlay(e, en.exercises[e.id])),
    les: FR_LESSONS.map((l) => applyOverlay(l, en.lessons[l.id])),
    labs: FR_LABS.map((l) => applyOverlay(l, en.labs[l.id])),
    paths: FR_PATHS.map((x) => applyOverlay(x, en.paths[x.id])),
    comps: FR_COMPETENCIES.map((x) => applyOverlay(x, en.competencies[x.id])),
  });
}

/** Charge le contenu anglais (chunk séparé) si nécessaire. */
async function loadEn(): Promise<void> {
  if (!EN) EN = (await import('./en/all.ts')).EN;
}

function replaceAll<T>(target: T[], src: T[]): void {
  for (let i = 0; i < src.length; i++) target[i] = src[i];
}
function replaceRecord<T extends object>(target: Record<string, T>, list: T[], key: (x: T) => string): void {
  for (const k of Object.keys(target)) delete target[k];
  for (const x of list) target[key(x)] = x;
}

export function applyContentLanguage(lang: 'fr' | 'en'): void {
  const en = lang === 'en' ? buildEn() : null;
  replaceAll(ALL_EXERCISES, en ? en.ex : FR_EXERCISES);
  replaceAll(ALL_LESSONS, en ? en.les : FR_LESSONS);
  replaceAll(ALL_LABS, en ? en.labs : FR_LABS);
  replaceAll(PATHS, en ? en.paths : FR_PATHS);
  replaceAll(COMPETENCIES, en ? en.comps : FR_COMPETENCIES);
  replaceRecord(EXERCISE_BY_ID, ALL_EXERCISES, (e) => e.id);
  replaceRecord(LESSON_BY_ID, ALL_LESSONS, (l) => l.id);
  for (const p of PATHS) PATH_REF[p.id] = p;
  Object.assign(LEVEL_NAMES, lang === 'en' ? EN_LEVEL_NAMES : FR_LEVEL_NAMES);
  Object.assign(EX_TYPE_LABELS, lang === 'en' ? EN_TYPE_LABELS : FR_TYPE_LABELS);
}

import { PATH_BY_ID as PATH_REF } from './paths.ts';
onBeforeLangChange(async (lang) => {
  if (lang === 'en') await loadEn();
  applyContentLanguage(lang);
});
applyContentLanguage('fr');

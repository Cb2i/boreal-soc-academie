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
import { LABS } from './labs.ts';

const RAW_EXERCISES: Exercise[] = [...kql1, ...kql2, ...kql3, ...kql4, ...kql5, ...kql6, ...az1, ...az2, ...id1, ...obs1, ...sen1, ...soc1];
export const ALL_LESSONS: Lesson[] = LESSONS;

// Chaque exercice reçoit le cours qui le liste en premier (sauf s'il en déclare déjà un).
const lessonOf = new Map<string, string>();
for (const l of ALL_LESSONS) for (const id of l.exercises) if (!lessonOf.has(id)) lessonOf.set(id, l.id);
export const ALL_EXERCISES: Exercise[] = RAW_EXERCISES.map((e) => (e.lesson || !lessonOf.has(e.id) ? e : ({ ...e, lesson: lessonOf.get(e.id) } as Exercise)));
export const ALL_LABS: Lab[] = LABS;

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(ALL_EXERCISES.map((e) => [e.id, e]));
export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, l]));

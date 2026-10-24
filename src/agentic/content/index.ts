import type { AiCaseStudy, AiCompetency, AiExercise, AiLesson, AiModule, AiProject, ModuleContent } from '../types.ts';
import { AI_LEVELS } from './levels.ts';
import { FINAL_PROJECTS } from './final.ts';
import { RESOURCES } from './resources.ts';
import { m01 } from './m01.ts';
import { m02 } from './m02.ts';
import { m03 } from './m03.ts';
import { m04 } from './m04.ts';
import { m05 } from './m05.ts';
import { m06 } from './m06.ts';
import { m07 } from './m07.ts';

/** Tous les modules livrés, dans l'ordre pédagogique. */
export const MODULE_CONTENT: ModuleContent[] = [m01, m02, m03, m04, m05, m06, m07];

export const LEVELS = AI_LEVELS;
export const MODULES: AiModule[] = MODULE_CONTENT.map((m) => m.module);
export const LESSONS: AiLesson[] = MODULE_CONTENT.flatMap((m) => m.lessons);
export const EXERCISES: AiExercise[] = MODULE_CONTENT.flatMap((m) => m.exercises);
export const COMPETENCIES: AiCompetency[] = MODULE_CONTENT.flatMap((m) => m.competencies);
export const CASES: AiCaseStudy[] = MODULE_CONTENT.map((m) => m.caseStudy);
export const PROJECTS: AiProject[] = [...MODULE_CONTENT.flatMap((m) => m.projects), ...FINAL_PROJECTS];
export { RESOURCES };

export const MODULE_BY_ID: Record<string, AiModule> = Object.fromEntries(MODULES.map((m) => [m.id, m]));
export const LESSON_BY_ID: Record<string, AiLesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
export const EX_BY_ID: Record<string, AiExercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const COMP_BY_ID: Record<string, AiCompetency> = Object.fromEntries(COMPETENCIES.map((c) => [c.id, c]));
export const CASE_BY_MODULE: Record<string, AiCaseStudy> = Object.fromEntries(CASES.map((c) => [c.module, c]));
export const PROJECT_BY_ID: Record<string, AiProject> = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

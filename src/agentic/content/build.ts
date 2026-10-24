// Assemble le contenu d'un parcours à partir de ses fichiers de modules. Même forme pour tous les parcours.
import type { AiCaseStudy, AiCompetency, AiExercise, AiLesson, AiLevel, AiModule, AiProject, ModuleContent, ResourceDef } from '../types.ts';

export interface TrackContent {
  LEVELS: AiLevel[];
  MODULE_CONTENT: ModuleContent[];
  MODULES: AiModule[];
  LESSONS: AiLesson[];
  EXERCISES: AiExercise[];
  COMPETENCIES: AiCompetency[];
  CASES: AiCaseStudy[];
  PROJECTS: AiProject[];
  RESOURCES: ResourceDef[];
  MODULE_BY_ID: Record<string, AiModule>;
  LESSON_BY_ID: Record<string, AiLesson>;
  EX_BY_ID: Record<string, AiExercise>;
  COMP_BY_ID: Record<string, AiCompetency>;
  CASE_BY_MODULE: Record<string, AiCaseStudy>;
  PROJECT_BY_ID: Record<string, AiProject>;
}

export function buildContent(levels: AiLevel[], modules: ModuleContent[], finalProjects: AiProject[], resources: ResourceDef[]): TrackContent {
  const MODULES = modules.map((m) => m.module);
  const LESSONS = modules.flatMap((m) => m.lessons);
  const EXERCISES = modules.flatMap((m) => m.exercises);
  const COMPETENCIES = modules.flatMap((m) => m.competencies);
  const CASES = modules.map((m) => m.caseStudy);
  const PROJECTS = [...modules.flatMap((m) => m.projects), ...finalProjects];
  const by = <T extends { id: string }>(a: T[]): Record<string, T> => Object.fromEntries(a.map((x) => [x.id, x]));
  return {
    LEVELS: levels,
    MODULE_CONTENT: modules,
    MODULES,
    LESSONS,
    EXERCISES,
    COMPETENCIES,
    CASES,
    PROJECTS,
    RESOURCES: resources,
    MODULE_BY_ID: by(MODULES),
    LESSON_BY_ID: by(LESSONS),
    EX_BY_ID: by(EXERCISES),
    COMP_BY_ID: by(COMPETENCIES),
    CASE_BY_MODULE: Object.fromEntries(CASES.map((c) => [c.module, c])),
    PROJECT_BY_ID: by(PROJECTS),
  };
}

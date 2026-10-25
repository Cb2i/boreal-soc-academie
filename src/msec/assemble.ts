// Assemble un module à partir de ses leçons, exercices, compétences et projets : les listes d'identifiants
// (évaluation, remédiation, cas pratique) sont déduites des rôles des exercices, pour qu'elles ne divergent jamais.
import type { AiCompetency, AiExercise, AiLesson, AiModule, AiProject, ModuleContent } from '../agentic/types.ts';

export interface ModuleSpec {
  id: string;
  level: number;
  n: number;
  title: string;
  summary: string;
  lessons: AiLesson[];
  exercises: AiExercise[];
  competencies: AiCompetency[];
  projects: AiProject[];
  caseTitle: string;
  caseScenario: string;
  caseMinutes?: number;
}

export function assemble(s: ModuleSpec): ModuleContent {
  const ofRole = (r: AiExercise['role']) => s.exercises.filter((e) => e.role === r);
  const caseSteps = ofRole('case').filter((e) => e.type !== 'open');
  const deliverable = ofRole('case').find((e) => e.type === 'open');
  const module_: AiModule = {
    id: s.id,
    level: s.level,
    n: s.n,
    title: s.title,
    summary: s.summary,
    lessons: s.lessons.map((l) => l.id),
    evaluation: ofRole('eval').map((e) => e.id),
    caseStudy: `${s.id}-case`,
    competencies: s.competencies.map((c) => c.id),
    projects: s.projects.map((p) => p.id),
    remediation: ofRole('remediation').map((e) => e.id),
  };
  return {
    module: module_,
    lessons: s.lessons,
    exercises: s.exercises,
    competencies: s.competencies,
    caseStudy: {
      id: module_.caseStudy,
      module: s.id,
      title: s.caseTitle,
      scenario: s.caseScenario,
      steps: caseSteps.map((e) => e.id),
      deliverable: deliverable?.id,
      minutes: s.caseMinutes ?? 40,
    },
    projects: s.projects,
  };
}

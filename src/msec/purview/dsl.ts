// Raccourcis d'écriture propres au parcours Purview : leçon, compétence et projet à partir de données compactes.
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { sref } from '../sources.ts';

export const md = (...lines: string[]) => lines.join('\n');

export interface LessonSpec {
  n: number;
  title: string;
  minutes: number;
  summary: string;
  objectives: string[];
  prerequisites: string[];
  body: string[];
  demo: { title: string; lines: string[] };
  revision: string[];
  /** Identifiants du registre de sources (sans le préfixe « purview- » pour les sources Purview). */
  links: string[];
  teaches: string[];
}

/** Les identifiants d'exercices suivent le gabarit <leçon>-g, -a, -qa, -qb, -qc. */
export function lesson(mod: string, s: LessonSpec): AiLesson {
  const id = `${mod}-l${s.n}`;
  return {
    id, module: mod, title: s.title, minutes: s.minutes, summary: s.summary, objectives: s.objectives, prerequisites: s.prerequisites,
    body: md(...s.body), demo: { title: s.demo.title, body: md(...s.demo.lines) },
    guided: `${id}-g`, autonomous: `${id}-a`, quiz: [`${id}-qa`, `${id}-qb`, `${id}-qc`],
    revision: md(...s.revision), links: s.links.map((l) => sref(l.includes('-') && !l.startsWith('purview-') && /^(xdr|mdc|intune)-/.test(l) ? l : `purview-${l}`)), teaches: s.teaches,
  };
}

export function comp(mod: string, n: number, name: string, description: string, criteria: [string, string, string]): AiCompetency {
  return { id: `${mod}-c${n}`, module: mod, name, description, criteria: criteria.map((text, i) => ({ id: `${mod}-c${n}-${i + 1}`, text })) };
}

export function project(mod: string, n: number, level: AiProject['level'], title: string, problem: string, architecture: string, steps: string[], success: string[], risks: string[], extensions: string[]): AiProject {
  return { id: `${mod}-p${n}`, module: mod, level, title, problem, architecture, tools: ['Tableur', 'Éditeur de texte'], data: 'Organisation fictive (Nordlys Technologies) : aucune donnée réelle.', steps, success, risks, extensions };
}

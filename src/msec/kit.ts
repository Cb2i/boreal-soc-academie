// Raccourcis d'écriture pour les modules Defender et Intune : un QCM, une réponse courte, etc. sans répéter les métadonnées.
import { author } from '../agentic/content/helpers.ts';
import type { AiExercise } from '../agentic/types.ts';

type Dim = 'comprendre' | 'fonctionner' | 'securiser' | 'maintenir';
type Role = 'guided' | 'autonomous' | 'quiz' | 'eval' | 'case' | 'remediation';
export type Opt = [text: string, why: string];

const fixWhy = (w: string) => (w.length > 5 ? w : `${w.replace(/\.$/, '')} : ce choix est inexact, voir l’explication de la question.`);
const fixExp = (e: string) => (e.length > 40 ? e : `${e} Relisez la leçon correspondante pour le détail.`);

export interface Ctx { comp: string; lesson?: string; tags?: string[] }

/** Fabrique de raccourcis liée à un module. */
export function kit(moduleId: string) {
  const a = author(moduleId);
  /** QCM à bonne réponse unique : `right` = [texte, pourquoi], `wrong` = autres choix avec leur raison. */
  const Q = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, right: Opt, wrong: Opt[], exp: string): AiExercise =>
    a.qcm({ id, title, comp: c.comp, tags: c.tags ?? [], role, dim, lesson: c.lesson, st, exp: fixExp(exp) }, [[right[0], true, fixWhy(right[1])], ...wrong.map((w): [string, boolean, string] => [w[0], false, fixWhy(w[1])])]);
  /** QCM à réponses multiples : `rights` et `wrong` listent les choix. */
  const M = (id: string, role: Role, dim: Dim, c: Ctx, title: string, st: string, rights: Opt[], wrong: Opt[], exp: string): AiExercise =>
    a.qcm({ id, title, comp: c.comp, tags: c.tags ?? [], role, dim, lesson: c.lesson, st, exp: fixExp(exp), multi: true }, [...rights.map((w): [string, boolean, string] => [w[0], true, fixWhy(w[1])]), ...wrong.map((w): [string, boolean, string] => [w[0], false, fixWhy(w[1])])]);
  return { a, Q, M };
}

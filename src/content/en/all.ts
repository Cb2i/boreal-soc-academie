// Contenu anglais, chargé à la demande (import dynamique) quand l'utilisateur choisit l'anglais.
import type { EnBundle } from './types.ts';
import { enPaths } from './paths.ts';
import { enCompetencies } from './competencies.ts';
import { enLabs } from './labs.ts';
import { enLessons } from './lessons.ts';
import { enExKql } from './ex-kql.ts';
import { enExAz } from './ex-az.ts';
import { enExId } from './ex-id.ts';
import { enExObs } from './ex-obs.ts';
import { enExSen } from './ex-sen.ts';
import { enExSoc } from './ex-soc.ts';

export const EN: EnBundle = {
  exercises: { ...enExKql, ...enExAz, ...enExId, ...enExObs, ...enExSen, ...enExSoc },
  lessons: enLessons,
  labs: enLabs,
  paths: enPaths,
  competencies: enCompetencies,
};

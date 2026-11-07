import type { AiLevel } from '../../agentic/types.ts';

export const PURVIEW_LEVELS: AiLevel[] = [
  { n: 1, title: 'Fondations', summary: 'Portail, solutions, rôles, groupes de rôles et licences.', accent: '#7a8cff' },
  { n: 2, title: 'Classifier et protéger', summary: 'Types d’informations sensibles, étiquettes de sensibilité et prévention des pertes de données.', accent: '#35c4a0' },
  { n: 3, title: 'Risques internes et communications', summary: 'Insider Risk Management et Communication Compliance, avec la vie privée comme contrainte.', accent: '#f0a34a' },
  { n: 4, title: 'Preuves et cycle de vie', summary: 'Audit, eDiscovery, rétention, Compliance Manager et exploitation depuis le SOC.', accent: '#ef6f6c' },
  { n: 5, title: 'Projets de synthèse', summary: 'Trois projets qui assemblent le parcours.', accent: '#5fd18d', capstone: true },
];

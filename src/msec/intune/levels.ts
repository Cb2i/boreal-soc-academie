import type { AiLevel } from '../../agentic/types.ts';

export const INTUNE_LEVELS: AiLevel[] = [
  { n: 1, title: 'Fondations', summary: 'Architecture de sécurité, conception des politiques et prérequis d’enrôlement.', accent: '#35c4a0' },
  { n: 2, title: 'Protection du poste', summary: 'Defender Antivirus, réduction de la surface d’attaque, EDR et pare-feu.', accent: '#4aa3ff' },
  { n: 3, title: 'Identités, chiffrement et accès', summary: 'BitLocker, LAPS, comptes, conformité et accès conditionnel.', accent: '#9b8cff' },
  { n: 4, title: 'Applications, correctifs et durcissement', summary: 'Protection des applications, contrôle des exécutables, mises à jour et restrictions.', accent: '#f0a34a' },
  { n: 5, title: 'Plateformes et exploitation', summary: 'Sécurité par plateforme, surveillance et dépannage.', accent: '#ef6f6c' },
  { n: 6, title: 'Projets de synthèse', summary: 'Sept projets qui assemblent le parcours.', accent: '#5fd18d', capstone: true },
];

import type { AiLevel } from '../../agentic/types.ts';

export const XDR_LEVELS: AiLevel[] = [
  { n: 1, title: 'Fondations', summary: 'Architecture, déploiement et cycle de vie de Defender XDR.', accent: '#4aa3ff' },
  { n: 2, title: 'Terminaux', summary: 'Defender for Endpoint, antivirus, ASR, protection web et gestion des vulnérabilités.', accent: '#35c4a0' },
  { n: 3, title: 'Courriel, identités et applications', summary: 'Defender for Office 365, Identity, Cloud Apps et services connexes.', accent: '#9b8cff' },
  { n: 4, title: 'Opérations', summary: 'Incidents, Advanced Hunting en KQL et détections personnalisées.', accent: '#f0a34a' },
  { n: 5, title: 'Intégration et exploitation', summary: 'Automatisation, administration et environnements particuliers.', accent: '#ef6f6c' },
  { n: 6, title: 'Projets de synthèse', summary: 'Six projets qui assemblent le parcours.', accent: '#5fd18d', capstone: true },
];

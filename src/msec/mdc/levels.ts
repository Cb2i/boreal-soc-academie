import type { AiLevel } from '../../agentic/types.ts';

export const MDC_LEVELS: AiLevel[] = [
  { n: 1, title: 'Fondations', summary: 'Architecture CNAPP, plans, licences et coûts, gouvernance, permissions et couverture.', accent: '#8bd450' },
  { n: 2, title: 'Posture et risque', summary: 'CSPM, chemins d’attaque, conformité, recommandations, évaluation des vulnérabilités.', accent: '#4aa3ff' },
  { n: 3, title: 'Protection des charges de travail', summary: 'Serveurs, conteneurs, stockage, bases de données, applications, IA, données et identités.', accent: '#9b8cff' },
  { n: 4, title: 'Multicloud, hybride et DevSecOps', summary: 'AWS, GCP, Azure Arc et sécurité du cycle de développement.', accent: '#f0a34a' },
  { n: 5, title: 'Opérations de sécurité', summary: 'Alertes, XDR et Sentinel, requêtes, automatisation, dépannage.', accent: '#ef6f6c' },
  { n: 6, title: 'Synthèse', summary: 'Architectures complètes et projets de synthèse.', accent: '#5fd18d', capstone: true },
];

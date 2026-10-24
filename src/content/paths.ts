import type { PathDef, PathId } from './types.ts';

export const PATHS: PathDef[] = [
  {
    id: 'azure-foundations',
    title: 'Azure : fondations',
    short: 'Fondations',
    description: 'Hiérarchie des ressources, abonnements, groupes de ressources, régions et outils (portail, CLI, PowerShell, ARM/Bicep).',
    topics: ['Hiérarchie', 'Régions', 'Outils', 'ARM et Bicep'],
    accent: '#3fd0c9',
  },
  {
    id: 'azure-admin',
    title: 'Azure : administration et architecture',
    short: 'Admin et architecture',
    description: 'Réseau (NSG, Bastion, peering, liaison privée), redondance du stockage et gouvernance (Azure Policy, verrous).',
    topics: ['NSG et Bastion', 'Peering', 'Stockage', 'Policy et verrous'],
    accent: '#5aa9ff',
  },
  {
    id: 'identity-security',
    title: 'Identité et sécurité',
    short: 'Identité et sécurité',
    description: 'RBAC et moindre privilège, accès conditionnel (rapport seulement, comptes d’urgence) et accès privilégié avec PIM.',
    topics: ['RBAC', 'Accès conditionnel', 'PIM', 'Comptes d’urgence'],
    accent: '#b79bff',
  },
  {
    id: 'observability',
    title: 'Observabilité et collecte',
    short: 'Collecte de journaux',
    description: 'Espaces de travail Log Analytics, paramètres de diagnostic, agents, règles de collecte et diagnostic des données manquantes.',
    topics: ['Log Analytics', 'Diagnostic', 'Agents', 'DCR'],
    accent: '#ffb54d',
  },
  {
    id: 'sentinel',
    title: 'Microsoft Sentinel',
    short: 'Sentinel',
    description: 'Composants, règles planifiées, triage d’incidents, règles d’automatisation, playbooks et listes de surveillance.',
    topics: ['Règles planifiées', 'Incidents', 'Automatisation', 'Watchlists'],
    accent: '#ff7a7a',
  },
  {
    id: 'kql',
    title: 'Académie KQL',
    short: 'KQL',
    description: 'Le langage de requête de Sentinel et de Log Analytics, du filtre à la jointure, avec un moteur local et des données fictives.',
    topics: ['Filtrer', 'Agréger', 'Temps', 'Jointures'],
    accent: '#5ee08a',
  },
  {
    id: 'soc',
    title: 'Enquêtes SOC',
    short: 'Enquêtes',
    description: 'Scénarios d’enquête à preuves multiples : pulvérisation de mots de passe, exfiltration, hameçonnage, escalade de privilèges.',
    topics: ['Triage', 'Pivot', 'Chronologie', 'Conclusion'],
    accent: '#ff9ad5',
  },
];

export const PATH_BY_ID: Record<PathId, PathDef> = Object.fromEntries(PATHS.map((p) => [p.id, p])) as Record<PathId, PathDef>;

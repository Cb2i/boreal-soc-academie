import type { Competency } from './types.ts';

export const COMPETENCIES: Competency[] = [
  { id: 'az-hierarchy', name: 'Hiérarchie Azure', path: 'azure-foundations', description: 'Groupes d’administration, abonnements, groupes de ressources, ressources.' },
  { id: 'az-core-services', name: 'Services Azure de base', path: 'azure-foundations', description: 'Régions, zones de disponibilité, calcul, stockage et redondance.' },
  { id: 'az-tools', name: 'Outils Azure', path: 'azure-foundations', description: 'Portail, CLI, PowerShell, ARM et Bicep.' },
  { id: 'az-network', name: 'Réseau Azure', path: 'azure-admin', description: 'Réseaux virtuels, sous-réseaux, groupes de sécurité réseau.' },
  { id: 'az-governance', name: 'Gouvernance', path: 'azure-admin', description: 'Étiquettes, verrous, stratégies.' },
  { id: 'id-rbac', name: 'RBAC et moindre privilège', path: 'identity-security', description: 'Rôles, portées et attributions minimales.' },
  { id: 'id-privileged', name: 'Accès privilégié', path: 'identity-security', description: 'PIM, comptes d’urgence, rôles à privilèges.' },
  { id: 'id-entra', name: 'Microsoft Entra ID', path: 'identity-security', description: 'Utilisateurs, groupes, accès conditionnel.' },
  { id: 'obs-collection', name: 'Collecte de journaux', path: 'observability', description: 'Paramètres de diagnostic, agents, DCR.' },
  { id: 'obs-workspace', name: 'Espaces de travail Log Analytics', path: 'observability', description: 'Conception, rétention, tables.' },
  { id: 'sen-onboarding', name: 'Intégration Sentinel', path: 'sentinel', description: 'Connecteurs et mise en service.' },
  { id: 'sen-automation', name: 'Automatisation Sentinel', path: 'sentinel', description: 'Règles d’automatisation, playbooks, watchlists.' },
  { id: 'sen-detection', name: 'Détection Sentinel', path: 'sentinel', description: 'Règles analytiques et incidents.' },
  { id: 'kql-filter', name: 'KQL : filtrer et projeter', path: 'kql', description: 'where, project, extend, take, sort.' },
  { id: 'kql-aggregate', name: 'KQL : agréger', path: 'kql', description: 'summarize, count, dcount, make_set, arg_max.' },
  { id: 'kql-time', name: 'KQL : temps', path: 'kql', description: 'ago, bin, datetime_diff, fenêtres.' },
  { id: 'kql-join', name: 'KQL : jointures et unions', path: 'kql', description: 'join, union, let, datatable.' },
  { id: 'kql-reading', name: 'KQL : lecture et correction', path: 'kql', description: 'Lire un résultat, corriger une erreur.' },
  { id: 'soc-triage', name: 'Triage SOC', path: 'soc', description: 'Distinguer vrai positif et faux positif.' },
  { id: 'soc-investigation', name: 'Enquête SOC', path: 'soc', description: 'Pivoter, reconstituer une chronologie, conclure.' },
];

export const COMP_BY_ID: Record<string, Competency> = Object.fromEntries(COMPETENCIES.map((c) => [c.id, c]));

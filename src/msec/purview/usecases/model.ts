// Catalogue des cas d'usage Microsoft Purview. Chaque cas cite des sources du registre (identifiants sans le prefixe "purview-").
export type UcGroup = 'detection' | 'etiquettes' | 'dlp' | 'endpoint' | 'ia' | 'surpartage' | 'risques' | 'conformite' | 'gouvernance' | 'enquete';
export type UcLevel = 'débutant' | 'intermédiaire' | 'avancé';

export interface UseCase {
  id: string;
  group: UcGroup;
  level: UcLevel;
  title: string;
  /** Objectif en une phrase. */
  goal: string;
  /** Licence ou facturation, telle que documentee. */
  licence: string;
  prereq: string;
  /** Etapes de configuration, dans l'ordre. */
  steps: string[];
  /** Comment verifier que le cas fonctionne. */
  test: string;
  pitfalls: string;
  sources: string[];
}

export const GROUPS: { id: UcGroup; title: string; intro: string }[] = [
  { id: 'detection', title: 'Détecter les données sensibles', intro: 'Cartes de crédit, identifiants canadiens, secrets, clients connus : tout commence par une bonne classification.' },
  { id: 'etiquettes', title: 'Étiquettes de sensibilité', intro: 'Étiquetage manuel, automatique, par défaut, et protection des conteneurs Teams et SharePoint.' },
  { id: 'dlp', title: 'Prévention des pertes de données (Microsoft 365)', intro: 'Courriel, SharePoint, OneDrive et Teams : politiques, modèles, simulation et alertes.' },
  { id: 'endpoint', title: 'DLP point de terminaison, navigateur et réseau', intro: 'USB, collage dans le navigateur, sites non gérés, appareils personnels.' },
  { id: 'ia', title: 'Gouvernance de l’IA', intro: 'Copilot, applications d’IA d’entreprise et IA non autorisée : détection, blocage, conservation, enquête.' },
  { id: 'surpartage', title: 'Surpartage et préparation à Copilot', intro: 'Trouver et réduire l’exposition avant que l’IA ne la rende visible.' },
  { id: 'risques', title: 'Risques internes', intro: 'Départs, fuites, protection adaptative selon le niveau de risque.' },
  { id: 'conformite', title: 'Conformité, rétention, audit et eDiscovery', intro: 'Conserver, supprimer, auditer, chercher et séparer.' },
  { id: 'gouvernance', title: 'Gouvernance des données', intro: 'Data Map, Unified Catalog et qualité des données, y compris pour l’IA.' },
  { id: 'enquete', title: 'Enquête et réponse à incident', intro: 'Data Security Investigations et triage des alertes au SOC.' },
];

export const u = (
  id: string, group: UcGroup, level: UcLevel, title: string, goal: string, licence: string, prereq: string,
  steps: string[], test: string, pitfalls: string, sources: string[],
): UseCase => ({ id, group, level, title, goal, licence, prereq, steps, test, pitfalls, sources });

export const LIC_CHECK = 'Vérifier la description de service Purview pour votre abonnement avant de promettre la fonction.';

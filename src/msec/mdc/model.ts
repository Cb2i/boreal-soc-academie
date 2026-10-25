// Modèle de données propre au parcours Defender for Cloud : matrice de capacités versionnée, fiches de configuration
// à 22 points, catalogue de scénarios transversaux et registre des limites. Aucune donnée n'est synchronisée : tout est local et daté.
import type { DocStatus, ImplStatus, LabStatus, Nature, SimStatus, WriteStatus } from '../types.ts';

/** Version de référence du périmètre : définie après l'inventaire documentaire initial. Toute capacité découverte ensuite est ajoutée avec son impact. */
export const SCOPE_VERSION = 'MDC-2026.10.25-r1';
export const SCOPE_DATE = '2026-10-25';

export interface MdcCapability {
  /** Identifiant stable : dNN.domaine.capacite (le préfixe dNN désigne le module). */
  id: string;
  module: string;
  title: string;
  plan: string;
  objective: string;
  risk: string;
  /** Cloud et workload. */
  clouds: string;
  /** Périmètre de configuration : abonnement, connecteur, ressource, organisation. */
  scope: string;
  prerequisites: string;
  permissions: string;
  costs: string;
  /** Mode de collecte ou de protection : sans agent, capteur, extension, connecteur, API. */
  collection: string;
  compatibility: string;
  limits: string;
  nature: Nature;
  /** Identifiants du registre des sources, sans le préfixe mdc-. */
  sources: string[];
  verified: string;
  status: { doc: DocStatus; redaction: WriteStatus; implementation: ImplStatus; simulation: SimStatus; lab: LabStatus };
  /** Leçons qui enseignent la capacité. Les exercices, évaluations et projets sont ceux de leur module. */
  lessons: string[];
  /** Obligatoire quand la rédaction n'est pas « rédigée » : justification ou impact. */
  note?: string;
}

export interface CapInput {
  plan: string; obj: string; risk: string; clouds: string; scope: string; req: string; perm: string; cost: string; collect: string; compat: string; limits: string;
  nature: Nature; src: string[]; lessons: string[]; doc?: DocStatus; write?: WriteStatus; impl?: ImplStatus; sim?: SimStatus; note?: string;
}

export function cap(id: string, title: string, f: CapInput): MdcCapability {
  return {
    id, module: id.split('.')[0], title, plan: f.plan, objective: f.obj, risk: f.risk, clouds: f.clouds, scope: f.scope, prerequisites: f.req, permissions: f.perm, costs: f.cost,
    collection: f.collect, compatibility: f.compat, limits: f.limits, nature: f.nature, sources: f.src, verified: SCOPE_DATE,
    status: { doc: f.doc ?? 'verifiee', redaction: f.write ?? 'redigee', implementation: f.impl ?? 'implementee', simulation: f.sim ?? 'simulee', lab: 'non-realisee' },
    lessons: f.lessons, ...(f.note ? { note: f.note } : {}),
  };
}

/** Les 22 rubriques de la fiche de configuration, dans l'ordre imposé. */
export const SHEET_POINTS: string[] = [
  'Objectif', 'Risque traité', 'Fonctionnement', 'Plan et coût potentiel', 'Permissions', 'Prérequis', 'Clouds et workloads compatibles', 'Portail et chemin actuels', 'Paramètres et options',
  'Valeurs par défaut documentées', 'Recommandation contextualisée', 'Périmètre, héritage et exceptions', 'Déploiement pilote', 'Dépendances', 'Vérification de l’activation',
  'Vérification de la couverture réelle', 'Test inoffensif', 'Journaux, requêtes et preuves', 'Dépannage', 'Retour arrière', 'Limites', 'Sources datées',
];

export interface MdcSheet {
  id: string;
  title: string;
  module: string;
  lessons: string[];
  plan: string;
  /** Points 1 à 21 ; le point 22 (sources datées) est calculé depuis `sources`. */
  points: string[];
  sources: string[];
}

export function sheet(id: string, title: string, module: string, plan: string, lessons: string[], points: string[], sources: string[]): MdcSheet {
  if (points.length !== 21) throw new Error(`Fiche ${id} : 21 points attendus, ${points.length} fournis`);
  return { id, title, module, plan, lessons, points, sources };
}

export interface MdcScenario {
  id: string;
  title: string;
  family: string;
  clouds: string;
  need: string;
  architecture: string;
  responsibilities: string;
  configuration: string;
  test: string;
  evidence: string;
  investigation: string;
  troubleshooting: string;
  evaluation: string;
  modules: string[];
  sources: string[];
}

export const SCENARIO_FAMILIES = [
  'Nouveau déploiement', 'Environnement existant', 'Mauvaise configuration', 'Prérequis manquant', 'Permissions insuffisantes', 'Couverture partielle',
  'Différences entre clouds', 'Fonctionnalité indisponible', 'Faux positif', 'Remédiation', 'Retour arrière', 'Vérification après changement',
] as const;

export interface Limit {
  id: string;
  kind: 'limite' | 'incertitude' | 'decision';
  text: string;
  impact: string;
}

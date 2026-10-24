// Modèle de contenu de la section « Agentic AI for Cybersecurity ».
// Le contenu pédagogique (src/agentic/content) est séparé des composants (src/agentic/components, src/pages/ia)
// et du moteur de validation (src/agentic/validate.ts).
import type { Item, SourceRef } from '../content/types.ts';

export type { Item, SourceRef };

/** Dimensions évaluées séparément, pour ne pas confondre comprendre, faire fonctionner, sécuriser et maintenir. */
export type Dim = 'comprendre' | 'fonctionner' | 'securiser' | 'maintenir';
export const DIM_LABELS: Record<Dim, string> = {
  comprendre: 'Compréhension',
  fonctionner: 'Fonctionnement',
  securiser: 'Sécurité',
  maintenir: 'Maintenabilité',
};

export type Role = 'guided' | 'autonomous' | 'quiz' | 'eval' | 'case' | 'remediation';
export const ROLE_LABELS: Record<Role, string> = {
  guided: 'Exercice guidé',
  autonomous: 'Exercice autonome',
  quiz: 'Évaluation courte',
  eval: 'Évaluation du module',
  case: 'Cas pratique',
  remediation: 'Remédiation',
};

export interface AiChoice {
  id: string;
  text: string;
  correct: boolean;
  /** Explication propre à ce choix, affichée après la réponse. */
  why: string;
}

export interface Base {
  id: string;
  module: string;
  title: string;
  competency: string;
  /** Notions travaillées : servent à proposer une remédiation ciblée. */
  tags: string[];
  role: Role;
  dim: Dim;
  statement: string;
  hints?: string[];
  /** Correction expliquée, affichée après la réponse. */
  explanation: string;
  mistakes?: string[];
  lesson?: string;
}

export interface QcmEx extends Base {
  type: 'qcm';
  choices: AiChoice[];
  multi?: boolean;
}

export interface ShortEx extends Base {
  type: 'short';
  /** Réponses exactes acceptées (comparées sans casse, sans accents ni ponctuation). */
  accepted: string[];
  /** Variantes acceptées sous forme d'expressions régulières ancrées, appliquées au texte normalisé. */
  patterns?: string[];
  numeric?: { value: number; tol?: number };
  placeholder?: string;
}

export interface OrderAi extends Base {
  type: 'order';
  items: Item[];
  correct: string[];
  alternatives?: string[][];
}

export interface MatchAi extends Base {
  type: 'match';
  items: Item[];
  options: Item[];
  answer: Record<string, string[]>;
}

export interface PlaceAi extends Base {
  type: 'place';
  items: Item[];
  zones: { id: string; label: string; description?: string }[];
  answer: Record<string, string>;
}

export interface InspectLineAi {
  id: string;
  text: string;
  faulty?: { correctRemedy?: string; remedies?: { id: string; text: string }[] };
}

export interface InspectAi extends Base {
  type: 'inspect';
  language: 'json' | 'text' | 'python' | 'bash' | 'http' | 'kql' | 'yaml';
  lines: InspectLineAi[];
}

export type FixRule =
  | { kind: 'parses'; message: string; dim?: Dim }
  | { kind: 'equals'; path: string; value: unknown; message: string; dim?: Dim }
  | { kind: 'oneOf'; path: string; values: unknown[]; message: string; dim?: Dim }
  | { kind: 'type'; path: string; type: 'string' | 'number' | 'boolean' | 'array' | 'object'; message: string; dim?: Dim }
  | { kind: 'exists'; path: string; message: string; dim?: Dim }
  | { kind: 'absent'; path: string; message: string; dim?: Dim }
  | { kind: 'range'; path: string; min?: number; max?: number; message: string; dim?: Dim }
  | { kind: 'contains'; path: string; value: unknown; message: string; dim?: Dim }
  | { kind: 'excludes'; path: string; value: unknown; message: string; dim?: Dim }
  | { kind: 'matches'; path: string; regex: string; message: string; dim?: Dim }
  /** Règles sur le texte brut (code, requêtes HTTP) : `regex` doit être présente / absente. */
  | { kind: 'text-has'; regex: string; flags?: string; message: string; dim?: Dim }
  | { kind: 'text-lacks'; regex: string; flags?: string; message: string; dim?: Dim };

export interface FixEx extends Base {
  type: 'fix';
  language: 'json' | 'python' | 'javascript' | 'http' | 'yaml' | 'bash' | 'text';
  starter: string;
  rules: FixRule[];
  /** Exemple de solution correcte (vérifiée par les tests contre les règles). */
  solution: string;
}

export interface ConfigField {
  id: string;
  label: string;
  kind: 'select' | 'number' | 'toggle';
  options?: { id: string; label: string }[];
  unit?: string;
  /** select : valeurs acceptées ; toggle : "on" ou "off" ; number : intervalle accepté. */
  accept: string[] | { min: number; max: number };
  why: string;
}

export interface ConfigEx extends Base {
  type: 'config';
  fields: ConfigField[];
  /** Contraintes entre champs (cohérence d'ensemble). */
  constraints?: { id: string; message: string; check: (v: Record<string, string | number>) => boolean }[];
  /** Valeurs d'une configuration correcte (vérifiée par les tests). */
  solution: Record<string, string | number>;
}

export interface WorkflowEx extends Base {
  type: 'workflow';
  /** Palette de nœuds, distracteurs compris. */
  blocks: Item[];
  /** Nœuds obligatoires. */
  required: string[];
  /** Nœuds interdits (distracteurs dangereux ou inutiles). */
  forbidden: string[];
  /** Contraintes d'ordre : le premier doit précéder le second. */
  before: [string, string][];
  /** Contrainte de longueur maximale éventuelle. */
  maxLength?: number;
  /** Explications par nœud interdit ou contrainte, affichées après la réponse. */
  notes?: Record<string, string>;
  solution: string[];
}

export interface OpenEx extends Base {
  type: 'open';
  /** Livrable demandé. */
  deliverable: string;
  /** Grille d'autoévaluation : aucune note automatique n'est calculée. */
  rubric: { id: string; text: string; dim: Dim }[];
  model?: string;
}

export type AiExercise = QcmEx | ShortEx | OrderAi | MatchAi | PlaceAi | InspectAi | FixEx | ConfigEx | WorkflowEx | OpenEx;
export type AiExType = AiExercise['type'];

export const AI_TYPE_LABELS: Record<AiExType, string> = {
  qcm: 'QCM',
  short: 'Réponse courte',
  order: 'Remise en ordre',
  match: 'Association',
  place: 'Placement (glisser-déposer)',
  inspect: 'Analyse (journal, configuration, texte)',
  fix: 'Correction (JSON, code, requête)',
  config: 'Configuration de paramètres',
  workflow: 'Construction de workflow (glisser-déposer)',
  open: 'Travail ouvert (autoévaluation)',
};

export interface AiLesson {
  id: string;
  module: string;
  title: string;
  summary: string;
  minutes: number;
  objectives: string[];
  prerequisites: string[];
  /** Explication complète avec exemples (mini-markdown). */
  body: string;
  /** Démonstration commentée (mini-markdown, blocs de code). */
  demo: { title: string; body: string };
  guided: string;
  autonomous: string;
  /** Évaluation courte : trois questions. */
  quiz: string[];
  /** Fiche de révision (mini-markdown). */
  revision: string;
  links: SourceRef[];
  /** Notions enseignées (tags), pour la remédiation. */
  teaches: string[];
}

export interface AiCompetency {
  id: string;
  module: string;
  name: string;
  description: string;
  /** Critères de la grille d'autoévaluation (niveaux : à développer, en cours, acquis, solide). */
  criteria: { id: string; text: string }[];
}

export interface AiProject {
  id: string;
  /** Identifiant du module, ou "final" pour les projets de synthèse. */
  module: string;
  level: 'débutant' | 'intermédiaire' | 'avancé';
  title: string;
  problem: string;
  architecture: string;
  tools: string[];
  data: string;
  steps: string[];
  success: string[];
  risks: string[];
  extensions: string[];
  /** Ressources téléchargeables associées (identifiants du manifeste). */
  resources?: string[];
  /** Laboratoire connecté facultatif : tout reste simulé par défaut. */
  connected?: { accounts: string; permissions: string; costs: string; secrets: string; cleanup: string; limits: string };
}

export interface AiCaseStudy {
  id: string;
  module: string;
  title: string;
  scenario: string;
  /** Identifiants d'exercices (rôle « case »), dans l'ordre. */
  steps: string[];
  /** Livrable ouvert final, avec grille d'autoévaluation (identifiant d'un exercice « open »). */
  deliverable?: string;
  minutes: number;
}

export interface AiModule {
  id: string;
  level: number;
  n: number;
  title: string;
  summary: string;
  lessons: string[];
  /** Identifiants d'exercices de rôle « eval ». */
  evaluation: string[];
  caseStudy: string;
  competencies: string[];
  projects: string[];
  remediation: string[];
}

export interface AiLevel {
  n: number;
  title: string;
  summary: string;
  accent: string;
}

export interface ResourceDef {
  id: string;
  title: string;
  /** Chemin relatif sous public/ressources-ia/. */
  file: string;
  kind: 'json' | 'python' | 'prompt' | 'n8n' | 'config' | 'grille' | 'schema' | 'donnees' | 'logicapps' | 'markdown';
  description: string;
  module: string;
  /** Statut honnête : testé (et comment) ou à vérifier avant usage. */
  status: 'teste' | 'a-verifier';
  how: string;
  /** Pour les workflows : credentials et adaptations à prévoir. */
  needs?: string;
  /** Leçons et projets qui s'appuient sur cette ressource. */
  lessons?: string[];
  projects?: string[];
}

/** Contenu d'un module tel qu'écrit dans src/agentic/content/mNN.ts. */
export interface ModuleContent {
  module: AiModule;
  lessons: AiLesson[];
  exercises: AiExercise[];
  competencies: AiCompetency[];
  caseStudy: AiCaseStudy;
  projects: AiProject[];
}

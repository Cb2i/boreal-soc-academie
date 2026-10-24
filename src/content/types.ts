// Modèle de contenu : les exercices sont des données (versionnées dans le dépôt),
// séparées de leur moteur d'affichage (src/mechanics) et de validation (src/engine).

export type PathId = 'azure-foundations' | 'azure-admin' | 'identity-security' | 'observability' | 'sentinel' | 'kql' | 'soc';
export type Level = 1 | 2 | 3 | 4;
export type KqlContext = 'sentinel' | 'defender-xdr';

export const LEVEL_NAMES: Record<Level, string> = { 1: 'Débutant', 2: 'Intermédiaire', 3: 'Avancé', 4: 'Expert' };

export type ExType = 'kql-write' | 'kql-fix' | 'kql-blocks' | 'order' | 'match' | 'place' | 'inspect' | 'read-results' | 'investigate' | 'choice';

export const EX_TYPE_LABELS: Record<ExType, string> = {
  'kql-write': 'Écriture KQL',
  'kql-fix': 'Correction de requête',
  'kql-blocks': 'Blocs KQL (glisser-déposer)',
  order: 'Remise en ordre',
  match: 'Association',
  place: 'Placement (glisser-déposer)',
  inspect: 'Inspection de configuration',
  'read-results': 'Lecture de résultats',
  investigate: 'Enquête multi-étapes',
  choice: 'Choix',
};

export interface SourceRef {
  title: string;
  url: string;
  /** Date de vérification (AAAA-MM-JJ) dans la source officielle. */
  verified: string;
}

export interface Rule {
  kind: 'must-use' | 'must-not-use' | 'optimize';
  /** Trait extrait par l'analyseur : op:summarize, fn:ago, strop:has, tbl:SigninLogs, order:filter-before-summarize, time:window (borne de temps), time:relative (ago/now)... */
  feature: string;
  message: string;
}

export interface KqlCheck {
  /** exact : mêmes colonnes (ordre ignoré) ; superset : colonnes attendues + autres ; ignore-names : comparaison par position. */
  columns?: 'exact' | 'superset' | 'ignore-names';
  /** multiset : mêmes lignes (ordre ignoré) ; ordered : même ordre ; count : même nombre ; subset : n lignes parmi un univers. */
  rows?: 'multiset' | 'ordered' | 'count' | 'subset';
  /** Mode ordered : colonnes de tri. Les lignes à égalité sur ces colonnes peuvent apparaître dans n'importe quel ordre. */
  orderBy?: string[];
  /** Requête définissant l'univers de lignes valides (mode subset). */
  universe?: string;
  /** Nombre de lignes attendu (mode subset). */
  n?: number;
  rules?: Rule[];
  /** Désactiver la validation sur un second jeu de données (rare). */
  noVariant?: boolean;
}

export interface Choice {
  id: string;
  text: string;
}

export interface Item {
  id: string;
  text: string;
}

export interface ExerciseBase {
  /** Identifiant stable : ne jamais le changer une fois publié (la progression y est liée). */
  id: string;
  title: string;
  path: PathId;
  level: Level;
  competency: string;
  prerequisites: string[];
  objective: string;
  /** Énoncé (mini-markdown : paragraphes, listes, `code`, **gras**, blocs ```kql). */
  statement: string;
  hints: string[];
  /** Correction expliquée, affichée après une tentative. */
  explanation: string;
  commonMistakes: string[];
  sources: SourceRef[];
  /** Temps de référence pour le mode chronométré (secondes). */
  parSeconds?: number;
  lesson?: string;
  /** Contenu lié à une fonctionnalité en préversion (à re-vérifier). */
  preview?: boolean;
  kind?: 'exercise' | 'mission' | 'assessment';
  /** Données ou ressources nécessaires (texte libre affiché à l'apprenant). */
  resources?: string;
}

export interface KqlWrite extends ExerciseBase {
  type: 'kql-write' | 'kql-fix';
  context: KqlContext;
  tables: string[];
  starter?: string;
  /** La première solution sert de référence de résultat ; les autres sont affichées comme variantes. */
  solutions: string[];
  check: KqlCheck;
}

export interface KqlBlocks extends ExerciseBase {
  type: 'kql-blocks';
  context: KqlContext;
  tables: string[];
  blocks: Item[];
  /** Ordre des identifiants de blocs de la solution de référence. */
  solution: string[];
  check: KqlCheck;
}

export interface OrderEx extends ExerciseBase {
  type: 'order';
  items: Item[];
  correct: string[];
  /** Ordres alternatifs acceptés (ex. étapes interchangeables). */
  alternatives?: string[][];
}

export interface MatchEx extends ExerciseBase {
  type: 'match';
  items: Item[];
  options: Item[];
  /** Pour chaque élément, la ou les options acceptées. */
  answer: Record<string, string[]>;
}

export interface PlaceEx extends ExerciseBase {
  type: 'place';
  items: Item[];
  zones: { id: string; label: string; description?: string }[];
  answer: Record<string, string>;
}

export interface InspectLine {
  id: string;
  text: string;
  /** Si la ligne est défectueuse : correctif attendu parmi remedies. */
  faulty?: { correctRemedy?: string; remedies?: Choice[] };
}

export interface InspectEx extends ExerciseBase {
  type: 'inspect';
  language: 'kql' | 'json' | 'bicep' | 'azcli' | 'powershell' | 'text';
  lines: InspectLine[];
}

export type AnswerSpec =
  | { mode: 'cell'; query?: string; column: string; row?: number }
  | { mode: 'rows'; query?: string }
  | { mode: 'static'; accepted: string[] };

export interface ReadResultsEx extends ExerciseBase {
  type: 'read-results';
  context: KqlContext;
  tables: string[];
  /** Requête exécutée et affichée avec son résultat. */
  query: string;
  question: string;
  answerKind: 'number' | 'text' | 'choice';
  answer?: AnswerSpec;
  choices?: Choice[];
  correct?: string[];
}

export interface InvestigateStep {
  id: string;
  prompt: string;
  evidence?: { title: string; query?: string; text?: string }[];
  kind: 'choice' | 'multi' | 'number' | 'kql';
  choices?: Choice[];
  correct?: string[];
  answer?: AnswerSpec;
  kql?: { solutions: string[]; check: KqlCheck; starter?: string };
  explanation: string;
}

export interface InvestigateEx extends ExerciseBase {
  type: 'investigate';
  context: KqlContext;
  tables: string[];
  scenario: string;
  steps: InvestigateStep[];
}

export interface ChoiceEx extends ExerciseBase {
  type: 'choice';
  choices: Choice[];
  correct: string[];
  multi?: boolean;
}

export type Exercise = KqlWrite | KqlBlocks | OrderEx | MatchEx | PlaceEx | InspectEx | ReadResultsEx | InvestigateEx | ChoiceEx;

// ----------------------------------------------------------------------- cours

export interface Lesson {
  id: string;
  path: PathId;
  title: string;
  summary: string;
  /** Durée de lecture indicative (minutes). */
  minutes: number;
  level: Level;
  competency: string;
  /** Contenu (mini-markdown). Les blocs ```kql sont exécutables dans le terrain de jeu. */
  body: string;
  /** Exercices associés, dans l'ordre suggéré. */
  exercises: string[];
  sources: SourceRef[];
  preview?: boolean;
  /** Contexte de données du terrain de jeu pour les blocs de code. */
  context?: KqlContext;
}

export interface PathDef {
  id: PathId;
  title: string;
  short: string;
  description: string;
  topics: string[];
  accent: string;
}

export interface Competency {
  id: string;
  name: string;
  path: PathId;
  description: string;
}

export interface Lab {
  id: string;
  title: string;
  path: PathId;
  level: Level;
  summary: string;
  prerequisites: string[];
  licenses: string;
  cost: string;
  steps: string[];
  checks: string[];
  cleanup: string[];
  sources: SourceRef[];
  preview?: boolean;
}

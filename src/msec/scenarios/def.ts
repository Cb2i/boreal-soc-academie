// Définition d’un scénario croisé Defender + Intune et de sa fiche de décision.
import type { Nature } from '../types.ts';

/** Fiche de décision d’un scénario : une seule source de vérité pour le catalogue, la fiche et le module. */
export interface ScenarioSheet {
  /** Besoin d’affaires. */
  need: string;
  /** Menace visée. */
  threat: string;
  /** Source du signal. */
  signal: string;
  /** Produit qui décide. */
  deciding: string;
  /** Portail où l’on configure. */
  portal: string;
  /** Composant qui applique. */
  enforcing: string;
  /** Produit de preuve. */
  evidence: string;
  /** Connecteurs et dépendances. */
  dependencies: string;
  /** Délais et conditions. */
  delays: string;
  /** Échecs possibles. */
  failures: string;
  /** Vérification. */
  verification: string;
  /** Retour arrière. */
  rollback: string;
  /** Limites et incertitudes connues. */
  limits: string;
  /** Nature dominante de la couverture. */
  nature: Nature;
  /** Identifiants du registre de sources. */
  sources: string[];
}

/** Question à choix unique : t = titre, q = énoncé, r = bonne réponse, w = trois mauvaises réponses, e = explication. */
export interface QDef { t: string; q: string; r: string; w: [string, string, string]; e: string }

export interface ScenarioDef {
  id: string;
  n: number;
  level: number;
  title: string;
  summary: string;
  sheet: ScenarioSheet;
  /** Contexte propre au scénario, en lignes de mini-markdown, une liste par leçon. */
  extras: [string[], string[], string[]];
  /** Trois paires situation et réponse. */
  pairs: [[string, string], [string, string], [string, string]];
  /** Trois défauts de plan : [ligne fautive, bonne correction, mauvaise correction]. */
  defects: [[string, string, string], [string, string, string], [string, string, string]];
  /** Cinq étapes ordonnées de vérification et une étape interdite. */
  steps: { ok: [string, string, string, string, string]; forbidden: string };
  /** Douze questions : 3 par leçon, puis trois d’évaluation. */
  quiz: QDef[];
  short: { title: string; q: string; value: number; exp: string };
  /** Trois composants et leur nature (trois natures distinctes). */
  components: [[string, Nature], [string, Nature], [string, Nature]];
  /** Étiquettes de thèmes par leçon. */
  tags: [string[], string[], string[]];
  /** Identifiants de sources par leçon. */
  links: [string[], string[], string[]];
}

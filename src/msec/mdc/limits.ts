import { SCOPE_DATE, SCOPE_VERSION } from './model.ts';
import type { Limit } from './model.ts';

export const LIMITS: Limit[] = [
  { id: 'L01', kind: 'limite', text: 'Aucune fonction n’a été validée dans un laboratoire Microsoft réel.', impact: 'Toutes les capacités portent le statut « non réalisée » pour la validation en laboratoire réel. Les labs connectés décrivent comment le faire, ils n’ont pas été exécutés.' },
  { id: 'L02', kind: 'limite', text: 'Le contenu repose sur les pages Microsoft Learn consultées le 2026-10-25.', impact: 'Plans, noms de portail, préversions et dépréciations changent vite : appliquer la procédure de revue après chaque note de publication.' },
  { id: 'L03', kind: 'limite', text: 'Les schémas animés sont des illustrations pédagogiques simplifiées.', impact: 'Ils ne remplacent ni la documentation ni les écrans réels, et ne montrent pas tous les cas limites.' },
  { id: 'L04', kind: 'decision', text: 'Aucun prix n’est affiché dans le parcours.', impact: 'Les tarifs changent et dépendent du contrat : le cours enseigne la méthode d’estimation et renvoie à la page officielle et au calculateur de coûts.' },
  { id: 'L05', kind: 'decision', text: 'Les sept dimensions demandées sont regroupées en six dimensions du moteur d’évaluation.', impact: 'Compréhension, Fonctionnement (exactitude et raisonnement), Sécurité, Maintenabilité, Vérification et Coût sont notées séparément ; exactitude et raisonnement ne sont pas séparées.' },
  { id: 'L06', kind: 'decision', text: 'Les réponses ouvertes ne sont pas notées automatiquement.', impact: 'Elles s’évaluent avec une grille explicite d’autoévaluation ou par revue guidée, jamais par mots-clés.' },
  { id: 'L07', kind: 'incertitude', text: 'Conflit documentaire sur l’AI SPM et GCP.', impact: 'La page de posture IA indique que Vertex AI est découvert, alors que la matrice multicloud indique l’AI SPM non pris en charge sur GCP. Test qui trancherait : connecter un projet GCP de test et lire l’inventaire.' },
  { id: 'L08', kind: 'incertitude', text: 'Gestion des plans dans le portail Defender en préversion.', impact: 'Disponible pour l’Azure commercial seulement au moment de la consultation, avec des limites propres. Ne pas bâtir un processus de production dessus sans revérifier.' },
  { id: 'L09', kind: 'limite', text: 'Les simulations du site ne se connectent à aucun locataire.', impact: 'Les données, alertes et résultats de requêtes sont fictifs et identifiés comme tels ; aucune synchronisation n’existe. La progression est enregistrée dans le navigateur seulement.' },
];

export interface ChangeEntry { version: string; date: string; items: string[] }
export const CHANGELOG: ChangeEntry[] = [
  { version: SCOPE_VERSION, date: SCOPE_DATE, items: ['Création du parcours : inventaire documentaire initial, version de référence du périmètre, 26 modules planifiés.'] },
];

export const UPDATE_PROCEDURE: string[] = [
  'Relire les notes de publication de Defender for Cloud depuis la date de consultation la plus ancienne du registre des sources.',
  'Pour chaque source du registre, rouvrir la page, noter la nouvelle date, le statut (disponibilité générale, préversion, retrait annoncé) et l’incertitude.',
  'Rechercher les capacités ajoutées, renommées ou retirées ; les ajouter à la matrice avec une nouvelle version de référence et noter leur impact.',
  'Revoir les fiches de configuration touchées : chemin du portail, valeurs par défaut, permissions et prérequis.',
  'Relancer les tests du dépôt (contenu, schémas, parcours) et le contrôle des liens du registre, puis consigner les résultats.',
  'Mettre à jour le journal des changements et la liste des limites ; ne passer une validation en laboratoire à « réalisée » qu’après une exécution réelle documentée.',
];

export interface TestEntry { date: string; what: string; result: string; kind: 'automatique' | 'manuel' }
export const TEST_LOG: TestEntry[] = [];

import type { AiProject } from '../../agentic/types.ts';

/** Projets de synthèse de la rubrique partagée. Tout reste simulé par défaut, avec des données fictives. */
export const SCENARIO_FINAL: AiProject[] = [
  {
    id: 'sc-f01', module: 'final', level: 'intermédiaire', title: 'Comparer trois fiches de décision',
    problem: 'Choisir trois scénarios du catalogue et comparer leurs fiches : qui décide, qui applique, qui prouve, quelles dépendances, quels échecs. Dégager les points communs et les pièges propres à chacun.',
    architecture: 'Tableau comparatif de trois colonnes et douze lignes, suivi d’une synthèse d’une page.',
    tools: ['Catalogue des fiches du parcours', 'Tableur ou éditeur de texte'],
    data: 'Fiches fictives du catalogue.',
    steps: ['Choisir trois scénarios aux natures différentes.', 'Recopier les rubriques dans le tableau.', 'Repérer les produits qui décident, ceux qui appliquent et ceux qui prouvent.', 'Comparer les dépendances et les licences.', 'Rédiger la synthèse : ce qui se répète, ce qui diffère.'],
    success: ['Les trois fiches sont comparées rubrique par rubrique.', 'La synthèse nomme au moins deux pièges communs.', 'Aucune affirmation ne dépasse la fiche et ses sources.'],
    risks: ['Comparer des rubriques qui ne sont pas de même nature.', 'Généraliser à partir d’un seul cas.'],
    extensions: ['Ajouter un quatrième scénario.', 'Proposer une rubrique supplémentaire à la fiche.'],
  },
  {
    id: 'sc-f02', module: 'final', level: 'avancé', title: 'Un incident, de la détection à la restauration',
    problem: 'Enchaîner trois scénarios sur un incident fictif : hameçonnage, risque d’appareil, confinement puis restauration. Pour chaque maillon, nommer qui décide, qui applique et quelle preuve confirme.',
    architecture: 'Chronologie de l’incident reliée à trois fiches, avec les points de passage entre produits et les délais attendus.',
    tools: ['Catalogue des fiches', 'Moteur KQL local du parcours', 'Éditeur de texte'],
    data: 'Événements fictifs de courriel, d’appareil et de réponse.',
    steps: ['Écrire la chronologie de l’incident.', 'Relier chaque étape à une fiche.', 'Nommer les preuves à chaque étape.', 'Repérer les délais qui retardent la réponse.', 'Écrire le plan de restauration et sa vérification.'],
    success: ['Chaque étape a une fiche et une preuve.', 'Les délais sont discutés.', 'Le plan de restauration a une vérification et un retour arrière.'],
    risks: ['Présenter la simulation comme une exécution réelle.', 'Oublier la restauration.'],
    extensions: ['Ajouter la perte de télémétrie comme complication.'],
  },
  {
    id: 'sc-f03', module: 'final', level: 'avancé', title: 'Audit de cohérence Defender + Intune',
    problem: 'Auditer la cohérence entre les politiques Intune et les paramètres Defender d’un parc fictif : conflits, doublons, trous de couverture et preuves manquantes, avec un plan de correction.',
    architecture: 'Matrice domaine par source de configuration, liste d’écarts classés par risque et plan de correction par vagues.',
    tools: ['Tableur', 'Fiches du catalogue', 'Matrice de couverture du parcours'],
    data: 'Inventaire fictif de politiques et de rapports d’état.',
    steps: ['Inventorier les sources de configuration par domaine.', 'Repérer conflits et doublons.', 'Repérer les domaines sans preuve.', 'Classer les écarts par risque.', 'Planifier les corrections avec retour arrière.'],
    success: ['Chaque écart a un risque, un propriétaire et une correction.', 'Les natures de couverture sont indiquées.', 'Le plan prévoit des vérifications.'],
    risks: ['Corriger sans localiser la couche en cause.', 'Cacher un écart non pris en charge.'],
    extensions: ['Ajouter un indicateur de dérive.', 'Ajouter une revue après une mise à jour de documentation.'],
    connected: { accounts: 'Un locataire de test avec Defender et Intune.', permissions: 'Rôles de lecture des rapports dans le locataire de test.', costs: 'Licences de test.', secrets: 'Aucun secret.', cleanup: 'Aucun changement n’est fait : lecture seule.', limits: 'Facultatif : l’audit en lecture seule ne modifie rien.' },
  },
];

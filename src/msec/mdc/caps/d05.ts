import { cap } from '../model.ts';

export const CAPS_D05 = [
  cap('d05.standards.mcsb', 'Microsoft cloud security benchmark : initiative par défaut', {
    plan: 'CSPM de base (sans frais)', obj: 'Évaluer les ressources contre la référence de sécurité Microsoft.', risk: 'Modifier une définition sans mesurer l’effet sur la production.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, compte ou projet', req: 'Environnement enregistré', perm: 'Security Admin pour modifier ; Security Reader pour lire', cost: 'Aucun frais de plan',
    collect: 'Évaluations Azure Policy et connecteurs', compat: 'Disponibilité générale ; MCSB v2 en préversion', limits: 'Un effet en refus bloque la création de ressources non conformes.', nature: 'native', src: ['security-policy', 'policy-reference', 'recos'], lessons: ['d05-l1'],
  }),
  cap('d05.recos.lecture', 'Recommandations : description, remédiation, ressources, risque', {
    plan: 'CSPM de base ; risque avec Defender CSPM', obj: 'Lire et prioriser les recommandations.', risk: 'Prioriser par sévérité seule.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, compte ou projet', req: 'Évaluations disponibles', perm: 'Security Reader', cost: 'Le risque suppose Defender CSPM',
    collect: 'Évaluations', compat: 'Les recommandations groupées sont remplacées par des recommandations individuelles', limits: 'Les évaluations sont différées : mesurer après la fenêtre documentée.', nature: 'native', src: ['recos', 'recos-review', 'risk'], lessons: ['d05-l1'],
  }),
  cap('d05.score.calcul-classique', 'Niveau de sécurité classique : calcul par contrôles', {
    plan: 'CSPM de base', obj: 'Suivre la conformité aux règles évaluées.', risk: 'Interpréter le score comme un risque réel.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement ou connecteur', req: 'Recommandations MCSB évaluées', perm: 'Security Reader', cost: 'Aucun frais',
    collect: 'Évaluations', compat: 'Portail Azure', limits: 'Préversions et recommandations hors MCSB exclues ; recalcul environ toutes les 8 heures.', nature: 'native', src: ['secure-score'], lessons: ['d05-l2'],
  }),
  cap('d05.score.resource-graph', 'Lecture du niveau de sécurité par Azure Resource Graph', {
    plan: 'CSPM de base', obj: 'Extraire niveaux et contrôles en lecture seule pour un suivi.', risk: 'Industrialiser une requête sans valider les noms de champs.',
    clouds: 'Azure', scope: 'Abonnements visibles', req: 'Accès à Azure Resource Graph', perm: 'Reader ou Security Reader', cost: 'Aucun frais',
    collect: 'Lecture seule', compat: 'Table SecurityResources', limits: 'Les requêtes fournies sont indicatives et à valider.', nature: 'native', src: ['resource-graph', 'arg-samples'], lessons: ['d05-l2'], note: 'Requêtes écrites à partir de la structure documentée mais non exécutées dans un locataire réel.', write: 'redigee',
  }),
  cap('d05.recos.personnalisees-kql', 'Recommandations personnalisées en KQL', {
    plan: 'Defender CSPM', obj: 'Exprimer des règles internes évaluées avec les recommandations intégrées.', risk: 'Règles bruyantes, non actionnables ou sans propriétaire.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, compte ou projet', req: 'Plan Defender CSPM', perm: 'Security Admin pour les recommandations ; Owner pour un standard', cost: 'Inclus au plan Defender CSPM',
    collect: 'Table RawEntityMetadata', compat: 'Disponibilité générale ; API composite pour l’automatisation', limits: 'Sept colonnes obligatoires ; une ressource omise est traitée comme sans donnée.', nature: 'native', src: ['custom-recos'], lessons: ['d05-l3'],
  }),
  cap('d05.standards.personnalises', 'Standards personnalisés', {
    plan: 'Au moins un plan payant', obj: 'Regrouper recommandations internes et intégrées dans un standard propre.', risk: 'Standard sans gouvernance qui dérive.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement', req: 'Plan payant activé', perm: 'Owner sur l’abonnement', cost: 'Aucun frais propre',
    collect: 'Évaluations', compat: 'Disponibilité générale', limits: 'Un standard personnalisé exige au moins un plan payant.', nature: 'native', src: ['custom-recos', 'security-policy'], lessons: ['d05-l3'],
  }),
];

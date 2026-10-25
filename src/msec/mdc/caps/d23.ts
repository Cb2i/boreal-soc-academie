import { cap } from '../model.ts';

export const CAPS_D23 = [
  cap('d23.resource-graph', 'Azure Resource Graph pour la posture', {
    plan: 'Fonctions de base de Defender for Cloud', obj: 'Interroger l’état courant des scores, évaluations et alertes actives.', risk: 'Résultat tronqué ou limité par les droits.',
    clouds: 'Azure principalement', scope: 'Abonnements et groupes de gestion lisibles', req: 'Table SecurityResources alimentée', perm: 'Reader sur la portée', cost: 'Sans frais propres',
    collect: 'État courant des ressources de sécurité', compat: 'Portail, interface en ligne de commande, PowerShell, Power BI', limits: '1 000 enregistrements par défaut; pas d’historique.', nature: 'native', src: ['resource-graph', 'arg-samples'], lessons: ['d23-l1', 'd23-l2'],
  }),
  cap('d23.log-analytics', 'Log Analytics et export continu', {
    plan: 'Export continu', obj: 'Conserver et interroger l’historique des alertes et de la posture.', risk: 'Données non exportées avant le besoin.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Espace de travail', req: 'Export configuré', perm: 'Droits sur l’espace de travail', cost: 'Ingestion et rétention facturées',
    collect: 'Tables alimentées par l’export', compat: 'KQL avec TimeGenerated', limits: 'Dépend de la rétention et de ce qui est exporté.', nature: 'integration', src: ['continuous-export', 'siem-export'], lessons: ['d23-l1'],
  }),
  cap('d23.chasse-avancee', 'Chasse avancée Defender XDR (tables cloud)', {
    plan: 'Defender for Cloud intégré à Defender XDR', obj: 'Chasser dans les événements d’audit, de processus et de stockage du cloud.', risk: 'Détection créée sans ligne de base.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Locataire', req: 'Intégration Defender for Cloud et XDR active', perm: 'Droits de chasse avancée du portail Defender', cost: 'Selon la licence du portail Defender',
    collect: 'CloudAuditEvents, CloudProcessEvents, CloudStorageAggregatedEvents', compat: 'KQL avec Timestamp', limits: 'CloudProcessEvents présentée en préversion; sans Defender for Cloud, aucune donnée.', nature: 'integration', src: ['ah-schema', 'ah-cloudaudit', 'ah-cloudprocess'], lessons: ['d23-l1', 'd23-l3'],
  }),
  cap('d23.explorateur', 'Cloud security explorer', {
    plan: 'Defender CSPM', obj: 'Interroger le graphe de sécurité par relations.', risk: 'Supposer sa disponibilité dans tous les portails.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Environnements connectés', req: 'Plan Defender CSPM', perm: 'Security Reader', cost: 'Selon le plan Defender CSPM',
    collect: 'Graphe de sécurité', compat: 'Constructeur de requêtes graphique', limits: 'Voir le tableau de comparaison des portails.', nature: 'licence-supplementaire', src: ['explorer-howto', 'portal-compare'], lessons: ['d23-l1'],
  }),
  cap('d23.power-bi', 'Données Defender for Cloud dans Power BI', {
    plan: 'Fonctions de base', obj: 'Produire des tableaux de bord de direction depuis Resource Graph.', risk: 'Surexposition du rapport et troncature.',
    clouds: 'Azure principalement', scope: 'Abonnements lisibles', req: 'Connexion Power BI à Resource Graph', perm: 'Reader sur la portée; licence Power BI', cost: 'Licence Power BI selon l’organisation',
    collect: 'Résultats de requêtes Resource Graph', compat: 'Option $resultTruncated pour lever la troncature', limits: 'Les droits d’accès au rapport sont à gouverner.', nature: 'integration', src: ['powerbi'], lessons: ['d23-l3'],
  }),
  cap('d23.classeurs', 'Classeurs de couverture et de posture', {
    plan: 'Fonctions de base', obj: 'Suivre la couverture des plans par abonnement et connecteur.', risk: 'Lecture d’une couverture sans vérifier les extensions.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Abonnements et connecteurs', req: 'Accès au portail Azure', perm: 'Security Reader', cost: 'Sans frais propres',
    collect: 'État des plans et réglages', compat: 'Azure Workbooks', limits: 'Le classeur ne remplace pas la preuve d’état des agents.', nature: 'native', src: ['workbooks'], lessons: ['d23-l3'],
  }),
];

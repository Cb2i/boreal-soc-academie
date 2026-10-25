import { cap } from '../model.ts';

export const CAPS_D01 = [
  cap('d01.cnapp.piliers', 'Positionnement CNAPP : CSPM, CWPP, DevSecOps et sécurité de l’IA', {
    plan: 'CSPM de base (sans frais) et plans payants selon le pilier', obj: 'Situer chaque capacité dans un pilier et dans le bon produit Microsoft.', risk: 'Acheter ou promettre un plan pour un besoin qu’il ne couvre pas.',
    clouds: 'Azure, AWS, GCP, hybride', scope: 'Par environnement connecté (abonnement, compte, projet, organisation)', req: 'Aucun pour la lecture documentaire', perm: 'Aucune pour apprendre ; Reader ou Security Reader pour lire un environnement', cost: 'Le CSPM de base est gratuit ; les autres piliers dépendent des plans',
    collect: 'Sans agent, capteur ou Azure Arc selon le plan', compat: 'Variable par plan et par cloud : voir la matrice de prise en charge', limits: 'Defender for Cloud n’est pas un SIEM ni un outil de correction automatique.', nature: 'native', src: ['intro', 'multicloud-matrix', 'support-matrix'], lessons: ['d01-l1'],
  }),
  cap('d01.portals.defender-portal', 'Defender for Cloud dans le portail Defender', {
    plan: 'Tous plans, avec expériences propres au portail Defender', obj: 'Travailler les alertes, l’inventaire et le niveau de sécurité fondé sur le risque dans le portail Defender.', risk: 'Citer un chiffre sans nommer le portail et le modèle de calcul.',
    clouds: 'Azure, AWS, GCP', scope: 'Locataire, avec accès aux étendues cloud par RBAC unifié', req: 'Defender for Cloud activé sur les abonnements', perm: 'Permissions du RBAC unifié (étendues cloud) ou rôles Azure selon l’expérience', cost: 'Pas de frais propres au portail',
    collect: 'Données déjà collectées par les plans', compat: 'Intégration disponible en disponibilité générale depuis le 2026-05-05 ; certaines expériences en préversion', limits: 'Gestion des plans dans le portail Defender : préversion, Azure commercial seulement.', nature: 'integration', src: ['portal-defender', 'plan-mgmt', 'secure-score'], lessons: ['d01-l1'], doc: 'verifiee',
  }),
  cap('d01.score.deux-modeles', 'Niveau de sécurité classique et niveau fondé sur le risque', {
    plan: 'Classique : CSPM de base ; fondé sur le risque : Defender CSPM pour l’analyse de risque complète', obj: 'Suivre l’amélioration de la posture avec le bon modèle de calcul.', risk: 'Comparer deux valeurs issues de modèles différents.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement ou connecteur', req: 'Recommandations évaluées', perm: 'Security Reader pour lire', cost: 'Le calcul est inclus ; la priorisation par risque suppose Defender CSPM',
    collect: 'Évaluations de recommandations', compat: 'Modèle classique dans le portail Azure, modèle fondé sur le risque dans le portail Defender', limits: 'Les recommandations en préversion sont exclues du calcul classique ; plus de 200 recommandations AWS et GCP s’y ajoutent depuis le 2026-06-30.', nature: 'native', src: ['secure-score'], lessons: ['d01-l1'],
  }),
  cap('d01.collecte.trois-voies', 'Voies de collecte : sans agent, capteur et Azure Arc', {
    plan: 'Variable : Defender CSPM, Defender for Servers, Defender for Containers', obj: 'Choisir la voie de collecte adaptée à chaque type de ressource.', risk: 'Croire qu’une ressource est couverte alors que son composant est absent ou en échec.',
    clouds: 'Azure, AWS, GCP, hybride', scope: 'Connecteur et ressource', req: 'Connecteur, permissions et, selon la voie, extension ou Azure Arc', perm: 'Owner pour certains provisionnements automatiques ; voir le module 3', cost: 'Coûts des plans et des services dépendants',
    collect: 'Sans agent, capteur, Azure Arc', compat: 'Dépend du cloud et du plan', limits: 'La voie sans agent ne remplace pas la protection à l’exécution.', nature: 'native', src: ['intro', 'servers-matrix', 'containers-arch'], lessons: ['d01-l1', 'd01-l2'],
  }),
  cap('d01.couverture.classeur', 'Classeur de couverture (Coverage workbook)', {
    plan: 'Tous plans', obj: 'Visualiser quels plans sont activés sur quels abonnements et ressources.', risk: 'Laisser des abonnements sans plan sans le savoir.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnements visibles par le lecteur', req: 'Defender for Cloud activé', perm: 'Lecture sur les abonnements ; classeurs Azure Monitor', cost: 'Aucun frais propre à la lecture du classeur',
    collect: 'Lecture des paramètres de tarification et de couverture', compat: 'Classeur intégré aux classeurs Azure', limits: 'Il montre les plans activés, pas la preuve qu’une fonction opère.', nature: 'native', src: ['workbooks'], lessons: ['d01-l2'],
  }),
];

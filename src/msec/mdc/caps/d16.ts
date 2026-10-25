import { cap } from '../model.ts';

export const CAPS_D16 = [
  cap('d16.dspm.decouverte', 'Découverte des données sensibles', {
    plan: 'Defender CSPM, Defender for Storage', obj: 'Repérer les magasins de données qui contiennent des informations sensibles.', risk: 'Conclure à l’absence de données sur la foi d’un échantillon.',
    clouds: 'Azure, AWS, GCP (stockage)', scope: 'Abonnement ou connecteur', req: 'Plan Defender CSPM ou Storage et extension activée', perm: 'Security Admin ou Owner pour activer', cost: 'Inclus aux plans; coût de découverte limité par l’échantillonnage',
    collect: 'Échantillons de données, métadonnées transmises', compat: 'Blobs, Azure Files SMB, Data Lake Gen2, Azure SQL, S3, bases AWS', limits: 'Domaine personnalisé et SSE-C non pris en charge; tous les types non détectés.', nature: 'native', src: ['dspm', 'dspm-prepare', 'dspm-enable'], lessons: ['d16-l1'],
  }),
  cap('d16.dspm.sensibilite', 'Paramètres de sensibilité', {
    plan: 'Defender CSPM', obj: 'Définir ce qui est sensible, avec types, étiquettes et seuils.', risk: 'Seuils par défaut inadaptés.',
    clouds: 'Azure, AWS, GCP', scope: 'Locataire ou abonnement', req: 'Extension de découverte', perm: 'Security Admin', cost: 'Inclus',
    collect: 'Types Purview', compat: 'Types prédéfinis et personnalisés de Purview', limits: 'Effet à la prochaine découverte.', nature: 'integration', src: ['dspm-sensitivity', 'dspm'], lessons: ['d16-l1'],
  }),
  cap('d16.dspm.priorisation', 'Priorisation du risque sur les données', {
    plan: 'Defender CSPM', obj: 'Croiser sensibilité, exposition et accès avec le graphe de sécurité.', risk: 'Prioriser par sensibilité seule.',
    clouds: 'Azure, AWS, GCP', scope: 'Environnement', req: 'Defender CSPM', perm: 'Security Reader pour consulter', cost: 'Inclus au plan Defender CSPM',
    collect: 'Contexte du graphe', compat: 'Chemins d’attaque et explorateur', limits: 'Règles d’affichage des conteneurs et partages.', nature: 'native', src: ['dspm-risks', 'explorer-howto', 'attack-path'], lessons: ['d16-l2'],
  }),
  cap('d16.ciem', 'Gestion des droits (CIEM)', {
    plan: 'Defender CSPM', obj: 'Identifier identités inactives et surdimensionnées sur Azure, AWS, GCP.', risk: 'Retirer des droits sans journaux d’activité.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, compte ou projet', req: 'Defender CSPM; AWS ou GCP connectés', perm: 'Security Admin (abonnement, compte ou organisation)', cost: 'Inclus au plan Defender CSPM',
    collect: 'Rôles, attributions, journaux d’activité', compat: 'Recommandations et chemins d’attaque', limits: 'Inactivité sur 90 jours; PCI retiré; actions inutilisées non publiées pour AWS et GCP depuis 2026-08-06.', nature: 'native', src: ['ciem', 'ciem-enable'], lessons: ['d16-l3'],
  }),
  cap('d16.ciem.aws-journaux', 'Ingestion CloudTrail pour le CIEM', {
    plan: 'Defender CSPM', obj: 'Améliorer l’exactitude du CIEM sur AWS.', risk: 'Fonction en préversion.',
    clouds: 'AWS (Amazon)', scope: 'Compte AWS ou organisation', req: 'Connecteur AWS et Permissions Management', perm: 'Security Admin', cost: 'Coûts AWS de journalisation à confirmer',
    collect: 'Événements de gestion CloudTrail', compat: 'Comptes uniques et organisations à journalisation centralisée', limits: 'Préversion; requise pour les identités SSO et SAML.', nature: 'dependance', src: ['cloudtrail', 'ciem-enable'], lessons: ['d16-l3'],
  }),
  cap('d16.ciem.gcp-journaux', 'Ingestion Cloud Logging pour le CIEM', {
    plan: 'Defender CSPM', obj: 'Évaluer les permissions GCP avec les journaux.', risk: 'Fonction en préversion.',
    clouds: 'GCP (Google)', scope: 'Projet ou organisation GCP', req: 'Connecteur GCP et Permissions Management', perm: 'Security Admin', cost: 'Coûts GCP de journalisation à confirmer',
    collect: 'Journaux Cloud Logging via Pub/Sub', compat: 'Recommandations CIEM GCP', limits: 'Préversion; requise pour l’évaluation GCP.', nature: 'dependance', src: ['logging-ingestion', 'ciem-enable'], lessons: ['d16-l3'],
  }),
];

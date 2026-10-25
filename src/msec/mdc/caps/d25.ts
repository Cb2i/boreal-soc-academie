import { cap } from '../model.ts';

export const CAPS_D25 = [
  cap('d25.sante-connecteurs', 'Statut de connectivité des connecteurs multicloud', {
    plan: 'Fonctions de base', obj: 'Voir si un connecteur AWS ou GCP est sain et lire les remédiations.', risk: 'Silence interprété comme une absence de menace.',
    clouds: 'AWS (Amazon) et GCP (Google)', scope: 'Environnements connectés', req: 'Connecteur créé', perm: 'Security Reader pour lire', cost: 'Sans frais propres',
    collect: 'État de configuration et de permissions', compat: 'Portail Azure, Environment settings', limits: 'Ne remplace pas la vérification de la couverture réelle.', nature: 'native', src: ['aws', 'gcp', 'troubleshoot-connectors'], lessons: ['d25-l1', 'd25-l2'],
  }),
  cap('d25.sante-mde', 'Santé de Defender for Endpoint sur les serveurs', {
    plan: 'Defender for Servers Plan 2, ou Defender CSPM avec Plan 1', obj: 'Distinguer problèmes d’installation et de battement de coeur.', risk: 'Lire un état de quatre heures comme un état instantané.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Machines intégrées', req: 'Intégration Defender for Endpoint', perm: 'Security Reader', cost: 'Selon le plan Servers',
    collect: 'État de santé des agents', compat: 'Security explorer et classeur de suivi', limits: 'Mise à jour aux quatre heures; certains appareils non applicables.', nature: 'native', src: ['mde-health', 'mde-integration'], lessons: ['d25-l1', 'd25-l3'],
  }),
  cap('d25.depannage-eks', 'Dépannage de l’approvisionnement sur EKS', {
    plan: 'Defender for Containers', obj: 'Résoudre l’absence de capteur malgré l’approvisionnement automatique.', risk: 'Suppression excessive d’un rôle ou ouverture du point de terminaison.',
    clouds: 'AWS (Amazon)', scope: 'Clusters EKS', req: 'Connecteur AWS et approvisionnement automatique', perm: 'Droits IAM et EKS sur le compte', cost: 'Selon le plan Containers',
    collect: 'Capteur Defender et inventaire des pods', compat: 'Entrées d’accès EKS, Azure Arc', limits: 'Trois causes documentées; autres cas au soutien.', nature: 'native', src: ['containers-troubleshoot', 'troubleshoot-connectors'], lessons: ['d25-l2'],
  }),
  cap('d25.diagnostic-linux', 'Diagnostic de l’extension Defender for Endpoint sous Linux', {
    plan: 'Defender for Servers', obj: 'Collecter journaux et état du capteur sans modifier la configuration.', risk: 'Désactiver un contrôle de sécurité par réflexe.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Serveurs Linux', req: 'Accès administrateur à la machine', perm: 'Accès local à la machine', cost: 'Sans frais propres',
    collect: 'Journaux d’extension, d’installation et du système', compat: 'mdatp, journalctl, azcmagent', limits: 'Ne désactiver aucun contrôle sans cause confirmée.', nature: 'integration', src: ['mde-integration', 'arc-troubleshoot'], lessons: ['d25-l3'],
  }),
];

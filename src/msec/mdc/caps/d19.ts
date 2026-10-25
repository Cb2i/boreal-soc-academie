import { cap } from '../model.ts';

export const CAPS_D19 = [
  cap('d19.arc', 'Azure Arc pour serveurs hors Azure', {
    plan: 'Prérequis de Defender for Servers', obj: 'Connecter les serveurs sur place et multicloud comme ressources Azure.', risk: 'Pare-feu, rôle ou fournisseur de ressources manquant.',
    clouds: 'Sur place et multicloud', scope: 'Serveurs Windows et Linux x86-64', req: 'Agent Connected Machine; HTTPS 443 sortant; fournisseurs de ressources enregistrés', perm: 'Azure Connected Machine Onboarding; administrateur local de la machine', cost: 'Agent sans frais propres; services Azure ajoutés facturés selon leur tarif',
    collect: 'Métadonnées de la machine et extensions déployées', compat: 'Systèmes pris en charge selon la documentation Arc', limits: 'Ni 32 bits ni ARM; certaines extensions n’héritent pas du proxy de l’agent.', nature: 'dependance', src: ['onboard-machines', 'arc-prereq', 'arc-proxy'], lessons: ['d19-l1', 'd19-l2'],
  }),
  cap('d19.direct', 'Intégration directe par Defender for Endpoint', {
    plan: 'Defender for Servers Plan 1 et une partie du Plan 2', obj: 'Rattacher à un abonnement des serveurs déjà dans Defender for Endpoint.', risk: 'Paramètre à portée tenant et fonctions du Plan 2 indisponibles.',
    clouds: 'Sur place et multicloud', scope: 'Tous les serveurs non-Azure admissibles du tenant', req: 'Serveurs conformes à MDE avec télémétrie saine; même tenant', perm: 'Owner sur l’abonnement; Security Administrator dans Entra', cost: 'Facturation par serveur; remise possible avec licences MDE serveurs',
    collect: 'Télémétrie existante de Defender for Endpoint', compat: 'Aucun agent supplémentaire', limits: 'Pas de gestion Azure; fonctions du Plan 2 qui exigent Arc indisponibles.', nature: 'integration', src: ['onboard-mde-direct', 'servers-select', 'servers-matrix'], lessons: ['d19-l1'],
  }),
  cap('d19.extension-mde', 'Extension MDE sur serveur Arc', {
    plan: 'Defender for Servers', obj: 'Déployer Defender for Endpoint sur les serveurs connectés.', risk: 'Extension en échec ou appareil rattaché au mauvais tenant.',
    clouds: 'Sur place et multicloud', scope: 'Serveurs Arc', req: 'Plan activé, machine allumée, système pris en charge, agent Arc sain', perm: 'Rôles de déploiement d’extension sur la machine', cost: 'Inclus dans le plan par serveur',
    collect: 'Télémétrie du capteur', compat: 'MDE.Windows ou MDE.Linux', limits: 'Visibilité dans le portail Defender : jusqu’à 12 heures puis environ une heure.', nature: 'native', src: ['mde-integration', 'onboard-machines'], lessons: ['d19-l2', 'd19-l3'],
  }),
  cap('d19.mode-surveillance', 'Mode de surveillance de l’agent Arc', {
    plan: 'Agent Connected Machine', obj: 'Limiter les extensions permises aux extensions de surveillance et de sécurité.', risk: 'Bloquer une extension de gestion utile par erreur.',
    clouds: 'Sur place et multicloud', scope: 'Machine', req: 'Agent Arc installé', perm: 'Administrateur local', cost: 'Aucun',
    collect: 'Sans objet', compat: 'Commande de configuration de l’agent', limits: 'Fonction décrite dans la documentation de sécurité des extensions; à revérifier avant usage.', nature: 'native', src: ['arc-monitor-mode'], lessons: ['d19-l2'],
  }),
  cap('d19.verification', 'Vérification de couverture par Resource Graph', {
    plan: 'Sans plan dédié', obj: 'Rapprocher serveurs attendus, serveurs Arc et extensions MDE.', risk: 'Conclure sans preuve d’état des agents.',
    clouds: 'Sur place et multicloud', scope: 'Abonnements accessibles', req: 'Accès en lecture aux ressources', perm: 'Reader sur les abonnements', cost: 'Aucun frais propre',
    collect: 'Propriétés des ressources Arc', compat: 'Requêtes KQL dans Resource Graph', limits: 'Les requêtes du parcours n’ont pas été exécutées sur un tenant réel.', nature: 'native', src: ['resource-graph', 'workbooks'], lessons: ['d19-l3'],
  }),
  cap('d19.retrait', 'Retrait de machines hybrides', {
    plan: 'Sans plan dédié', obj: 'Déconnecter l’agent et nettoyer les ressources.', risk: 'Ressources Arc ou appareils MDE orphelins.',
    clouds: 'Sur place et multicloud', scope: 'Machine retirée', req: 'Accès administrateur à la machine et à la ressource', perm: 'Contributor sur la ressource; rôle MDE pour le retrait', cost: 'Réduit les coûts par serveur',
    collect: 'Sans objet', compat: 'Commande de déconnexion de l’agent', limits: 'Serveurs multicloud disparus retirés automatiquement après sept jours.', nature: 'native', src: ['arc-troubleshoot', 'onboard-machines'], lessons: ['d19-l3'],
  }),
];

import { cap } from '../model.ts';

export const CAPS_D18 = [
  cap('d18.connecteur', 'Connecteur GCP natif', {
    plan: 'Fonctions de base du connecteur', obj: 'Découvrir les ressources GCP et évaluer la posture.', risk: 'Politique de domaine bloquant le script.',
    clouds: 'GCP (Google)', scope: 'Projet ou organisation', req: 'Abonnement Azure avec Defender for Cloud et accès GCP; cinq API activées', perm: 'Contributor sur l’abonnement Azure; administrateur GCP pour le script', cost: 'Aucun frais propre; les plans activés sont facturés',
    collect: 'Inventaire et configuration GCP par API', compat: 'Script gcloud généré (Cloud Shell)', limits: 'Domain Restricted Sharing peut faire échouer le script.', nature: 'native', src: ['gcp', 'gcp-auth', 'gcp-sharing'], lessons: ['d18-l1'],
  }),
  cap('d18.federation', 'Fédération d’identité de charge de travail', {
    plan: 'Connecteur GCP', obj: 'Accéder à GCP sans identifiants durables.', risk: 'Ressources de fédération supprimées ou modifiées.',
    clouds: 'GCP (Google)', scope: 'Pool et fournisseurs par plan', req: 'Script exécuté', perm: 'Administrateur GCP', cost: 'Aucun',
    collect: 'Jetons Entra échangés auprès de Google STS', compat: 'Emprunt d’identité de compte de service', limits: 'Accès limité au projet ou à l’organisation connectés.', nature: 'native', src: ['gcp-auth', 'gcp'], lessons: ['d18-l1'],
  }),
  cap('d18.servers-gcp', 'Defender for Servers sur GCP', {
    plan: 'Defender for Servers', obj: 'Protéger les VM GCP avec Arc, MDE et évaluation des vulnérabilités.', risk: 'Agent OS Config actif facturé par GCP.',
    clouds: 'GCP (Google)', scope: 'VM Compute Engine', req: 'Arc, agent OS Config, extensions MDE et VA', perm: 'Owner sur l’abonnement pour l’autoprovisionnement', cost: 'Par machine; coût GCP possible pour OS Config',
    collect: 'Télémétrie MDE et inventaire', compat: 'Servers P1 ou P2', limits: 'Serveurs Arc retirés sept jours après la disparition de la VM.', nature: 'dependance', src: ['gcp-plans', 'servers-enable', 'multicloud-matrix'], lessons: ['d18-l2'],
  }),
  cap('d18.containers-gcp', 'Defender for Containers sur GKE', {
    plan: 'Defender for Containers', obj: 'Protéger les clusters GKE.', risk: 'Extension Arc ou politique Azure absente.',
    clouds: 'GCP (Google)', scope: 'Clusters GKE', req: 'Arc pour Kubernetes; journaux d’audit', perm: 'Security Admin; administrateur GCP', cost: 'Par cœur ou nœud',
    collect: 'Journaux d’audit et capteur', compat: 'Extension Defender et Azure Policy pour Arc', limits: 'Voir la matrice de prise en charge des conteneurs.', nature: 'dependance', src: ['gcp-plans', 'containers-troubleshoot', 'containers-deploy-cli'], lessons: ['d18-l2', 'd18-l3'],
  }),
  cap('d18.cspm-gcp', 'Defender CSPM sur GCP', {
    plan: 'Defender CSPM', obj: 'Posture, chemins d’attaque et CIEM sur GCP.', risk: 'Supposer des fonctions propres à Azure.',
    clouds: 'GCP (Google)', scope: 'Projet ou organisation', req: 'Plan activé; Owner de l’abonnement', perm: 'Owner; Application Administrator pour le CIEM à l’intégration', cost: 'Facturé selon les ressources',
    collect: 'Configuration GCP et plateformes d’IA', compat: 'Rôle personnalisé de lecture et de découverte', limits: 'AI SPM : conflit documentaire pour GCP, à revérifier.', nature: 'native', src: ['gcp-plans', 'permissions', 'ciem-enable'], lessons: ['d18-l2'],
  }),
  cap('d18.non-couvert', 'Plans non pris en charge sur GCP', {
    plan: 'Storage, bases managées, Key Vault, ARM, DNS, App Service, API, IA', obj: 'Énoncer les écarts avec Azure.', risk: 'Promettre une couverture inexistante.',
    clouds: 'GCP (Google)', scope: 'Offre commerciale', req: 'Sans objet', perm: 'Sans objet', cost: 'Sans objet',
    collect: 'Sans objet', compat: 'Sans objet', limits: 'Non pris en charge selon la matrice consultée; à revérifier à la date de mise en œuvre.', nature: 'non-prise-en-charge', src: ['multicloud-matrix'], lessons: ['d18-l2'],
  }),
  cap('d18.sante', 'Santé du connecteur et mesure des appels', {
    plan: 'Connecteur GCP', obj: 'Suivre la connectivité et les appels d’API.', risk: 'Script obsolète, pare-feu bloquant Arc.',
    clouds: 'GCP (Google)', scope: 'Connecteur', req: 'Accès au portail et à Log Explorer', perm: 'Security Reader pour lire; Contributor pour modifier', cost: 'Appels d’API facturés côté GCP selon l’usage',
    collect: 'Statut de connectivité et journaux GCP', compat: 'Classeur de couverture et Resource Graph', limits: 'Intervalle fixe d’une heure pour certains collecteurs.', nature: 'native', src: ['troubleshoot-connectors', 'workbooks', 'logging-ingestion'], lessons: ['d18-l3'],
  }),
];

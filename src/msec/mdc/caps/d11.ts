import { cap } from '../model.ts';

export const CAPS_D11 = [
  cap('d11.containers.capteur', 'Capteur Defender pour Kubernetes', {
    plan: 'Defender for Containers', obj: 'Collecter la télémétrie d’exécution des nœuds.', risk: 'Sortie réseau bloquée ou cluster non connecté à Azure Arc.',
    clouds: 'Azure, AWS, GCP', scope: 'Cluster Kubernetes', req: 'Plan activé, OIDC, Azure CLI 2.40 ou plus, Arc hors AKS', perm: 'Contributor ou Security Admin pour déployer', cost: 'Defender for Containers facturé par nœud; estimer avec le calculateur',
    collect: 'DaemonSet eBPF; audit Kubernetes', compat: 'AKS natif; EKS, GKE et Arc par extension', limits: 'Réconciliation du cluster à l’activation; limites de ressources non configurables.', nature: 'native', src: ['containers', 'containers-arch', 'containers-deploy-cli'], lessons: ['d11-l1'],
  }),
  cap('d11.containers.decouverte', 'Découverte sans agent de Kubernetes', {
    plan: 'Defender for Containers ou Defender CSPM', obj: 'Voir clusters, configurations et déploiements sans agent.', risk: 'Approuver des rôles sans lire leurs permissions.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, compte ou projet', req: 'Extension de découverte sans agent', perm: 'Owner pour l’intégration; rôle Kubernetes Agentless Operator attribué', cost: 'Inclus aux plans concernés',
    collect: 'Appels API du serveur Kubernetes', compat: 'AKS: accès approuvé; GKE: compte de service dédié', limits: 'Sur GKE, le rôle personnalisé contient container.clusters.update (écriture).', nature: 'native', src: ['containers-arch', 'containers'], lessons: ['d11-l1'],
  }),
  cap('d11.containers.detections-execution', 'Détections d’exécution des conteneurs', {
    plan: 'Defender for Containers', obj: 'Détecter charges suspectes, dérive binaire, DNS et maliciel.', risk: 'Compter sur une détection dans un cluster non pris en charge.',
    clouds: 'Azure, AWS, GCP', scope: 'Clusters pris en charge', req: 'Capteur (Helm pour antimaliciel et DNS); analyse sans agent pour les nœuds', perm: 'Security Reader pour lire les alertes', cost: 'Inclus au plan Defender for Containers',
    collect: 'Télémétrie du capteur et journaux d’audit', compat: 'XDR : alertes et chasse avancée', limits: 'EKS privé, GKE réseau privé et GKE Autopilot non pris en charge; réponse XDR en préversion.', nature: 'native', src: ['containers-matrix', 'containers-arch', 'xdr-integration'], lessons: ['d11-l2'],
  }),
  cap('d11.containers.deploiement-controle', 'Déploiement contrôlé par vulnérabilités', {
    plan: 'Defender for Containers', obj: 'Auditer ou refuser les images selon leurs vulnérabilités avant admission.', risk: 'Refus immédiat qui bloque un correctif urgent.',
    clouds: 'Azure, selon la matrice de prise en charge', scope: 'Cluster et registre pris en charge', req: 'Capteur avec Security Gating; Registry access avec Security findings; OIDC', perm: 'Security Admin pour créer; Security Reader pour lire', cost: 'Inclus au plan Defender for Containers',
    collect: 'Résultats d’analyse de vulnérabilités des registres', compat: 'Version Kubernetes 1.31 ou plus selon le dépannage', limits: 'Une image non analysée n’est pas contrôlée; analyse quelques heures après le dépôt.', nature: 'native', src: ['containers-gated', 'containers-gated-trouble', 'k8s-workload'], lessons: ['d11-l3'],
  }),
];

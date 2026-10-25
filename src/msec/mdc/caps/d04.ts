import { cap } from '../model.ts';

export const CAPS_D04 = [
  cap('d04.echelle.politique-activation', 'Activation de Defender for Cloud par Azure Policy sur un groupe de gestion', {
    plan: 'Fonctions de base ; plans payants par politiques propres', obj: 'Intégrer tous les abonnements d’un groupe de gestion, existants et futurs.', risk: 'Croire que les plans payants sont activés alors que seule l’inscription l’est.',
    clouds: 'Azure (abonnements)', scope: 'Groupe de gestion', req: 'Fournisseur de ressources Microsoft.Security enregistré', perm: 'Security Admin ; droits d’affectation de politique sur le groupe de gestion', cost: 'Aucun frais pour l’enregistrement ; chaque plan activé facture',
    collect: 'Sans objet', compat: 'Disponibilité générale', limits: 'La définition fournie considère free et standard comme conformes.', nature: 'native', src: ['onboard-mg'], lessons: ['d04-l1'],
  }),
  cap('d04.echelle.servers-un-plan', 'Un seul plan Defender for Servers par abonnement', {
    plan: 'Defender for Servers plan 1 ou plan 2', obj: 'Concevoir les groupes de gestion pour utiliser les deux plans dans une organisation.', risk: 'Vouloir deux plans sur le même abonnement.',
    clouds: 'Azure, AWS et GCP via Arc', scope: 'Abonnement', req: 'Groupes de gestion adaptés', perm: 'Security Admin ou Owner', cost: 'Facturation par serveur selon le sous-plan',
    collect: 'Extension Defender for Endpoint, analyse sans agent (plan 2)', compat: 'Disponibilité générale', limits: 'Une organisation qui veut P1 et P2 sépare ses abonnements en deux groupes de gestion.', nature: 'native', src: ['servers-scale', 'servers-enable'], lessons: ['d04-l1'],
  }),
  cap('d04.echelle.code', 'Activation des plans par PowerShell, API REST, CLI et Terraform', {
    plan: 'Tous plans', obj: 'Versionner et répéter les activations.', risk: 'Écrire en production sans revue ni retour arrière.',
    clouds: 'Azure (abonnements)', scope: 'Abonnement, ressource selon le plan', req: 'Module Az.Security, CLI ou fournisseur Terraform', perm: 'Security Admin ou Owner', cost: 'Chaque plan activé facture',
    collect: 'Sans objet', compat: 'Variable selon la version du module et de l’API', limits: 'Les exemples de la documentation sont à valider dans un abonnement de test avant usage.', nature: 'native', src: ['set-pricing', 'powershell-onboarding', 'storage-iac'], lessons: ['d04-l1'],
  }),
  cap('d04.collecte.composants', 'Composants de surveillance : Azure Monitor Agent, Defender for Endpoint, Arc, capteurs', {
    plan: 'Servers, SQL sur machines, Containers', obj: 'Associer chaque plan à ses composants et à leur déploiement.', risk: 'Ressource éligible mais composants absents ou en échec.',
    clouds: 'Azure, AWS, GCP, hybride', scope: 'Ressource de calcul', req: 'Politique Deploy If Not Exists, réseau sortant, agent Arc pour les machines hors Azure', perm: 'Owner sur l’abonnement pour l’AMA ; rôles des identités de service', cost: 'Coût des plans ; ingestion de journaux selon la configuration',
    collect: 'Extension, agent, capteur', compat: 'AMA pris en charge sur les clouds commerciaux', limits: 'Les composants ne concernent que le calcul ; MMA est déprécié.', nature: 'dependance', src: ['monitoring-components', 'ama', 'mde-integration'], lessons: ['d04-l2'],
  }),
  cap('d04.collecte.arc-mode-surveillance', 'Mode surveillance de l’agent Azure Arc', {
    plan: 'Servers et plans qui s’appuient sur Arc', obj: 'Restreindre les extensions aux seules extensions de surveillance et de sécurité.', risk: 'Surface d’attaque inutile ou blocage d’une extension nécessaire.',
    clouds: 'Hybride, AWS, GCP via Arc', scope: 'Machine (agent Arc)', req: 'Agent Connected Machine installé', perm: 'Administrateur local de la machine', cost: 'Aucun frais propre',
    collect: 'Sans objet', compat: 'Liste des extensions autorisées mise à jour par Microsoft', limits: 'En mode surveillance, on ne modifie pas les listes d’autorisation et de blocage.', nature: 'dependance', src: ['arc-monitor-mode'], lessons: ['d04-l2'],
  }),
  cap('d04.cspm.composants', 'Composants de Defender CSPM', {
    plan: 'Defender CSPM', obj: 'Activer analyse sans agent, découverte Kubernetes, vulnérabilités de conteneurs, données sensibles, CIEM, charges sans serveur.', risk: 'Plan activé mais composants fermés : chemins d’attaque et inventaire incomplets.',
    clouds: 'Azure, AWS, GCP selon le composant', scope: 'Abonnement ou connecteur', req: 'Plan Defender CSPM ; permissions du composant', perm: 'Owner pour l’analyse sans agent ; Security Admin pour le reste', cost: 'Inclus au plan sauf coûts indirects de services dépendants',
    collect: 'Sans agent', compat: 'Variable par composant et cloud', limits: 'CIEM : installation et collecte jusqu’à 24 heures.', nature: 'native', src: ['cspm-components', 'cspm-enable'], lessons: ['d04-l2'],
  }),
  cap('d04.audit.classeur-couverture', 'Classeur de couverture et santé des connecteurs', {
    plan: 'Tous plans', obj: 'Visualiser plans et extensions activés et la santé des connecteurs.', risk: 'Confondre réglage activé et fonction opérationnelle.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnements et connecteurs visibles', req: 'Defender for Cloud activé', perm: 'Lecture sur les abonnements', cost: 'Aucun frais propre',
    collect: 'Lecture des paramètres', compat: 'Disponibilité générale', limits: 'Ne prouve pas le fonctionnement ; le classeur n’existe pas dans le portail Defender.', nature: 'native', src: ['workbooks', 'troubleshoot-connectors'], lessons: ['d04-l3'],
  }),
];

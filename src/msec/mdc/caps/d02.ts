import { cap } from '../model.ts';

export const CAPS_D02 = [
  cap('d02.cspm.base-gratuit', 'CSPM de base (foundational CSPM)', {
    plan: 'Sans frais', obj: 'Inventaire, recommandations de la référence de sécurité Microsoft, niveau de sécurité classique et couverture multicloud.', risk: 'Croire qu’il fournit la priorisation par risque ou les chemins d’attaque.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, compte AWS, projet GCP', req: 'Environnement connecté', perm: 'Security Reader pour lire ; Contributor sur l’abonnement pour connecter AWS et GCP', cost: 'Aucun frais de plan ; les services dépendants se facturent à part',
    collect: 'Lecture par les API du fournisseur', compat: 'Disponibilité générale', limits: 'Colonnes de risque floutées sans Defender CSPM ; standards de conformité additionnels exigent un plan payant.', nature: 'native', src: ['cspm', 'pricing'], lessons: ['d02-l1'],
  }),
  cap('d02.cspm.defender-cspm', 'Defender CSPM : plan de posture avancée', {
    plan: 'Defender CSPM (payant)', obj: 'Gouvernance, chemins d’attaque, explorateur, priorisation par risque, analyse sans agent des machines, posture des données et de l’IA.', risk: 'Activer le plan sans permission Owner pour l’analyse sans agent, ce qui laisse les chemins d’attaque sans vulnérabilités.',
    clouds: 'Azure, AWS, GCP (selon la fonction)', scope: 'Abonnement ou connecteur', req: 'CSPM de base ; extensions du plan activées', perm: 'Security Admin ou Owner pour activer ; Owner pour l’analyse sans agent', cost: 'Payant, unité de facturation propre ; estimer avec le calculateur officiel',
    collect: 'Sans agent, API du fournisseur', compat: 'Variable par fonction et cloud', limits: 'Certaines fonctions sont propres à Azure ; consulter la matrice de prise en charge.', nature: 'native', src: ['cspm', 'cspm-enable', 'multicloud-matrix'], lessons: ['d02-l1'],
  }),
  cap('d02.plans.retrait-consolidation', 'Plans en retrait et consolidation (AKS, ACR, DNS, Key Vault, Resource Manager)', {
    plan: 'Defender for Containers, Servers P2 ou modèle fixe selon le plan remplacé', obj: 'Savoir quel plan remplace un plan historique et ne jamais l’offrir comme choix.', risk: 'Concevoir une architecture autour d’un plan que l’API refuse d’activer sur de nouveaux abonnements.',
    clouds: 'Azure (abonnements)', scope: 'Abonnement', req: 'Lire les notes de publication', perm: 'Lecture de la documentation', cost: 'Les abonnements existants continuent de facturer selon leur plan',
    collect: 'Sans objet', compat: 'Blocage d’activation depuis 2026-07-05 pour de nouveaux abonnements', limits: 'Les détails de transition évoluent : vérifier la note de publication à la date de la décision.', nature: 'native', src: ['plan-mgmt-changes', 'release-notes'], lessons: ['d02-l1'],
  }),
  cap('d02.portee.sous-plans-surcharge', 'Portée des plans, sous-plans de Servers et surcharge par ressource', {
    plan: 'Defender for Servers plan 1 et plan 2', obj: 'Choisir la portée et le sous-plan et lister les surcharges de ressource.', risk: 'Machines laissées à nu par une surcharge sous un plan « On ».',
    clouds: 'Azure, AWS et GCP (via Azure Arc)', scope: 'Abonnement, ressource', req: 'Abonnement avec le plan ; Azure Arc pour les machines hors Azure', perm: 'Security Admin ou Owner', cost: 'Facturation par serveur selon le sous-plan ; coûts indirects en plus',
    collect: 'Extension Defender for Endpoint, analyse sans agent (plan 2)', compat: 'JIT : Azure et AWS ; carte réseau : Azure', limits: 'Le plan 2 ne s’active pas sur une seule ressource.', nature: 'native', src: ['servers-plan', 'servers-enable', 'set-pricing'], lessons: ['d02-l2'],
  }),
  cap('d02.essai.gratuit', 'Essai gratuit de 30 jours', {
    plan: 'Plans payants éligibles', obj: 'Évaluer un plan avant la facturation.', risk: 'Fin d’essai ignorée et facturation imprévue.',
    clouds: 'Azure, AWS, GCP', scope: 'Par plan et par abonnement, compte AWS ou projet GCP', req: 'Plan non encore activé', perm: 'Reader pour voir ; Security Admin ou Owner pour activer', cost: 'Gratuit pendant l’essai ou jusqu’à une limite d’usage',
    collect: 'Selon le plan', compat: 'Règles par cloud', limits: 'Dans le portail Defender, l’essai doit être choisi explicitement.', nature: 'native', src: ['free-trial'], lessons: ['d02-l2'],
  }),
  cap('d02.couts.calculateur', 'Calculateur de coûts de Defender for Cloud', {
    plan: 'Tous plans', obj: 'Estimer le coût des plans à partir des actifs.', risk: 'Présenter l’estimation comme une facture.',
    clouds: 'Azure, AWS, GCP (par script pour les environnements non connectés)', scope: 'Environnements connectés, script ou actifs saisis', req: 'Environnement connecté ou script PowerShell 7', perm: 'Reader sur l’abonnement ; roles/viewer sur GCP pour le script', cost: 'Aucun frais propre',
    collect: 'Lecture seule', compat: 'Disponibilité générale', limits: 'Estimation approximative qui ignore les réservations ; découverte de 30 à 60 minutes sur grands environnements.', nature: 'native', src: ['cost-calculator', 'pricing'], lessons: ['d02-l3'],
  }),
  cap('d02.couts.dwu', 'Modèle de facturation en unités de charge (DWU)', {
    plan: 'Plans gérés depuis le portail Defender', obj: 'Estimer, suivre et facturer avec un modèle unifié.', risk: 'Migrer et perdre les surcharges de ressource.',
    clouds: 'Azure commercial', scope: 'Abonnement ou groupe de gestion', req: 'Rôle Global Admin ou Security Admin, ou droit de gestion des paramètres de sécurité du RBAC unifié', perm: 'Voir la documentation de gestion des plans', cost: 'Facturation DWU pour l’abonnement migré',
    collect: 'Sans objet', compat: 'Préversion', limits: 'Préversion : unités et calendrier peuvent changer ; première synchronisation jusqu’à 24 heures.', nature: 'integration', doc: 'verifiee', src: ['dwu', 'plan-mgmt', 'plan-mgmt-changes'], lessons: ['d02-l3'],
  }),
  cap('d02.plans.desactivation', 'Désactivation d’un plan et retour arrière', {
    plan: 'Tous plans', obj: 'Arrêter un plan sans mécanisme de réactivation ni coût résiduel.', risk: 'Plan réactivé par une politique ou facture qui continue.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, connecteur, ressource', req: 'Inventaire des politiques et du provisionnement', perm: 'Security Admin ou Owner', cost: 'Les ressources de soutien (espace de travail, stockage) restent facturées tant qu’elles existent',
    collect: 'Sans objet', compat: 'Disponibilité générale', limits: 'Off ne supprime pas les ressources de soutien ; AWS et GCP demandent de reconfigurer l’accès.', nature: 'native', src: ['disable-plans'], lessons: ['d02-l3'],
  }),
];

import { cap } from '../model.ts';

export const CAPS_D24 = [
  cap('d24.workflow-automation', 'Workflow automation', {
    plan: 'Fonctions de base de Defender for Cloud', obj: 'Déclencher une application logique sur une alerte, une recommandation ou un changement de conformité.', risk: 'Confinement automatisé qui interrompt la production.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Abonnement ou groupe de ressources', req: 'Application logique de type Consommation', perm: 'Security Admin ou Owner; Logic App Contributor pour créer, Operator pour exécuter', cost: 'Applications logiques facturées à l’usage',
    collect: 'Événements d’alerte, de recommandation et de conformité', compat: 'Portail Azure; non offerte dans le portail Defender selon la comparaison', limits: 'Le déclencheur hérité sur les alertes n’ouvre plus les applications logiques.', nature: 'integration', src: ['workflow-auto', 'workflow-iac'], lessons: ['d24-l1'],
  }),
  cap('d24.iac-pricings', 'Plans décrits par infrastructure as code', {
    plan: 'Tous les plans', obj: 'Activer et configurer les plans de façon reproductible.', risk: 'Activation involontaire d’un plan payant ou plan bloqué par l’API.',
    clouds: 'Azure principalement', scope: 'Abonnement, groupe de gestion ou ressource selon le plan', req: 'Modèle Bicep, Terraform ou ARM', perm: 'Security Admin ou Owner sur la portée', cost: 'Selon les plans activés par le modèle',
    collect: 'Aucune propre', compat: 'Bicep, ARM, Terraform, interface en ligne de commande', limits: 'Sous-plan P2 non pris en charge au niveau ressource; certains plans bloqués à l’activation.', nature: 'native', src: ['pricings-ref', 'set-pricing', 'storage-iac'], lessons: ['d24-l2'],
  }),
  cap('d24.policy-echelle', 'Azure Policy pour déployer à l’échelle', {
    plan: 'Fonctions de base', obj: 'Appliquer une configuration ou une automatisation à un groupe de gestion.', risk: 'Erreur propagée à grande échelle.',
    clouds: 'Azure', scope: 'Groupe de gestion', req: 'Initiative et tâche de remédiation', perm: 'Droits d’affectation de politique', cost: 'Sans frais propres',
    collect: 'États de conformité', compat: 'Portail Azure et IaC', limits: 'Commencer en audit; exceptions avec expiration.', nature: 'native', src: ['workflow-auto', 'policy-exemption', 'security-policy'], lessons: ['d24-l3'],
  }),
  cap('d24.iac-mapping', 'Cartographie des modèles IaC', {
    plan: 'Defender CSPM', obj: 'Relier une ressource déployée au modèle qui l’a produite.', risk: 'Étiquettes absentes ou non uniques.',
    clouds: 'Azure principalement', scope: 'Dépôts Azure DevOps connectés', req: 'Extension MSDO avec analyse IaC; étiquettes yor_trace ou mapping_tag', perm: 'Droits sur le connecteur DevOps', cost: 'Selon le plan Defender CSPM',
    collect: 'Résultats d’analyse de modèles', compat: 'ARM, Bicep, CloudFormation, Terraform', limits: 'Prérequis d’étiquetage stricts.', nature: 'licence-supplementaire', src: ['iac-mapping'], lessons: ['d24-l3'],
  }),
];

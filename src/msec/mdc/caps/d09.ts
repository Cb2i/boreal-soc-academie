import { cap } from '../model.ts';

export const CAPS_D09 = [
  cap('d09.sans-agent.machines', 'Analyse sans agent des machines', {
    plan: 'Defender CSPM ou Defender for Servers plan 2', obj: 'Analyser disques, vulnérabilités et secrets sans agent.', risk: 'Conclure à l’absence de risque sur une machine arrêtée ou exclue.',
    clouds: 'Azure, AWS, GCP', scope: 'Machines virtuelles prises en charge', req: 'Plan activé et option sans agent', perm: 'Rôle de propriétaire à l’activation ; Security Reader pour lire', cost: 'Aucun frais Defender supplémentaire; frais de stockage d’instantanés possibles chez AWS',
    collect: 'Instantanés de disque analysés hors bande', compat: 'Azure : 14 disques, 4 To; AWS: EC2; GCP : Compute Engine', limits: 'Machine arrêtée non analysée; images AWS sous licence tierce non prises en charge; politique GCP possible bloquante.', nature: 'native', src: ['agentless-concept', 'agentless-enable', 'faq-general'], lessons: ['d09-l1'],
  }),
  cap('d09.sans-agent.exclusion', 'Exclusion de machines par étiquette', {
    plan: 'Defender CSPM ou Defender for Servers plan 2', obj: 'Exclure des machines de l’analyse sans agent.', risk: 'Exclusion sans motif ni revue.',
    clouds: 'Azure, AWS, GCP', scope: 'Machines étiquetées', req: 'Analyse sans agent activée', perm: 'Permissions de modification des paramètres du plan', cost: 'Aucun coût propre',
    collect: 'Aucune', compat: 'Paires étiquette:valeur existantes', limits: 'Une exclusion crée un trou de couverture à documenter.', nature: 'native', src: ['agentless-exclude'], lessons: ['d09-l1'],
  }),
  cap('d09.vulnerabilites.mdvm', 'Évaluation des vulnérabilités des machines par MDVM', {
    plan: 'Defender for Servers plan 1 ou 2', obj: 'Détecter les vulnérabilités des machines par capteur ou sans agent.', risk: 'Comparer des constats de sources différentes.',
    clouds: 'Azure, AWS, GCP, machines Arc', scope: 'Machines connectées', req: 'Servers P2 pour le sans agent; Defender for Endpoint pour le capteur', perm: 'Security Reader pour lire', cost: 'Inclus aux plans Servers (payants)',
    collect: 'Capteur ou instantanés', compat: 'Vue unifiée avec Defender for Endpoint', limits: 'Pas de vulnérabilités réseau; le sans agent exige le plan 2.', nature: 'native', src: ['va-machines', 'mde-integration', 'servers-faq'], lessons: ['d09-l2'],
  }),
  cap('d09.vulnerabilites.byol', 'Scanneur tiers sous licence', {
    plan: 'Aucun plan payant requis', obj: 'Utiliser un scanneur existant (Qualys ou Rapid7) et remonter les constats.', risk: 'Installer plusieurs scanneurs ou perdre la fraîcheur.',
    clouds: 'Azure, AWS, GCP', scope: 'Machines avec l’agent partenaire', req: 'Licence du partenaire', perm: 'Permissions de déploiement du partenaire', cost: 'Licence du partenaire à votre charge',
    collect: 'Agent du partenaire', compat: 'Un seul scanneur BYOL pris en charge', limits: 'Un seul scanneur; la console du partenaire donne le détail.', nature: 'integration', src: ['va-byol', 'va-machines'], lessons: ['d09-l2'],
  }),
  cap('d09.conteneurs.va', 'Évaluation des vulnérabilités des conteneurs', {
    plan: 'Defender for Containers ou Defender CSPM', obj: 'Évaluer images de registre, nœuds et conteneurs en exécution.', risk: 'Croire un registre non pris en charge couvert.',
    clouds: 'Azure, AWS, GCP', scope: 'Registres et clusters pris en charge', req: 'Analyse sans agent des machines pour l’exécution', perm: 'Security Reader pour lire', cost: 'Selon le plan',
    collect: 'Sans agent', compat: 'ACR, ECR, GAR, GCR et registres externes pris en charge', limits: 'Microsoft Artifact Registry et registre ARO non pris en charge; plans dépréciés à migrer.', nature: 'native', src: ['va-containers', 'containers-faq', 'containers'], lessons: ['d09-l3'],
  }),
];

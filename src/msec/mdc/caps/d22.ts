import { cap } from '../model.ts';

export const CAPS_D22 = [
  cap('d22.connecteur-sentinel', 'Connecteur Microsoft Sentinel pour Defender for Cloud', {
    plan: 'Au moins un plan Defender activé par abonnement', obj: 'Ingérer les alertes dans Sentinel pour corrélation et réponse.', risk: 'Alertes de locataires clients non synchronisées.',
    clouds: 'Azure principalement', scope: 'Abonnement (hérité) ou locataire (préversion)', req: 'Fournisseur SecurityInsights; solution Defender for Cloud; plan activé', perm: 'Contributor ou Owner sur l’abonnement; lecture et écriture sur l’espace de travail', cost: 'Ingestion et stockage de l’espace de travail Sentinel',
    collect: 'Alertes dans la table SecurityAlert', compat: 'Sentinel dans le portail Azure ou le portail Defender', limits: 'Pas de synchronisation d’abonnements d’autres locataires, même avec Lighthouse.', nature: 'integration', src: ['sentinel-connector', 'siem-export'], lessons: ['d22-l1'],
  }),
  cap('d22.sync-bidirectionnelle', 'Synchronisation bidirectionnelle des statuts', {
    plan: 'Connecteur Sentinel', obj: 'Fermer l’alerte d’origine en fermant l’incident Sentinel.', risk: 'Deux équipes qui ferment avec des raisons différentes.',
    clouds: 'Azure principalement', scope: 'Abonnement', req: 'Connecteur actif', perm: 'Contributor ou Security Admin sur l’abonnement', cost: 'Aucun frais propre',
    collect: 'Statuts d’alertes et d’incidents', compat: 'Option par abonnement', limits: 'Quelques minutes de délai; la synchronisation de base ne met pas à jour les incidents.', nature: 'integration', src: ['sentinel-connector'], lessons: ['d22-l1'],
  }),
  cap('d22.xdr-sentinel', 'Intégration Defender XDR et Sentinel', {
    plan: 'Connecteur Defender XDR', obj: 'Diffuser incidents et événements de chasse dans Sentinel.', risk: 'Incidents Defender for Cloud vides sans le second connecteur.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Locataire', req: 'Connecteur Defender for Cloud activé pour les alertes et entités', perm: 'Droits Sentinel et Defender XDR', cost: 'Ingestion Sentinel',
    collect: 'Incidents, alertes et événements de chasse', compat: 'Synchronisation bidirectionnelle des incidents', limits: 'Tables de Defender Vulnerability Management non ingérées.', nature: 'integration', src: ['sentinel-xdr-integration', 'sentinel-mdc-incidents'], lessons: ['d22-l2'],
  }),
  cap('d22.sentinel-defender', 'Sentinel dans le portail Defender', {
    plan: 'Microsoft Sentinel', obj: 'Gérer incidents et chasse dans un portail unifié.', risk: 'Retrait annoncé du portail Azure; inventaire tardif.',
    clouds: 'Azure principalement', scope: 'Espaces de travail Sentinel', req: 'Intégration au portail Defender', perm: 'Droits du portail Defender et de l’espace de travail', cost: 'Aucune licence XDR requise selon la documentation consultée',
    collect: 'Alertes, incidents et événements', compat: 'Un seul espace principal corrélé', limits: 'Date de fin de prise en charge du portail Azure annoncée au 2027-03-31, à revérifier.', nature: 'integration', src: ['sentinel-defender-portal', 'sentinel-xdr-connector'], lessons: ['d22-l2'],
  }),
  cap('d22.requetes-alertes', 'Requêtes KQL sur SecurityAlert et SecurityIncident', {
    plan: 'Connecteur Sentinel actif', obj: 'Mesurer alertes et incidents sans gonfler les comptes.', risk: 'Comptes doublés et conclusions sur requête vide.',
    clouds: 'Azure principalement', scope: 'Espace de travail', req: 'Tables alimentées', perm: 'Lecture de l’espace de travail', cost: 'Requêtes comprises; stockage selon la rétention',
    collect: 'Tables SecurityAlert et SecurityIncident', compat: 'KQL dans Log Analytics ou Sentinel', limits: 'Requêtes du parcours non exécutées sur un espace réel.', nature: 'native', src: ['sentinel-connector', 'sentinel-mdc-incidents'], lessons: ['d22-l3'],
  }),
  cap('d22.regles-analytiques', 'Règles d’analytique sur les alertes cloud', {
    plan: 'Sentinel', obj: 'Créer des incidents pertinents à partir des alertes.', risk: 'Bruit d’alertes informationnelles.',
    clouds: 'Azure principalement', scope: 'Espace de travail', req: 'Connecteur actif', perm: 'Droits d’écriture sur les règles', cost: 'Selon le volume ingéré',
    collect: 'Alertes ingérées', compat: 'Règle par défaut modifiable', limits: 'Tester et suivre le taux de faux positifs.', nature: 'native', src: ['sentinel-connector'], lessons: ['d22-l3'],
  }),
];

import { cap } from '../model.ts';

export const CAPS_D21 = [
  cap('d21.alertes', 'Alertes de sécurité de Defender for Cloud', {
    plan: 'Plans de protection (Servers, Containers, Storage, Databases…)', obj: 'Signaler les activités suspectes avec gravité, ressource et intention.', risk: 'Alertes ignorées ou conservées moins longtemps que nécessaire.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Ressources protégées par un plan actif', req: 'Plan de protection activé et capteur sain', perm: 'Security Reader pour lire; Security Admin pour agir', cost: 'Inclus dans les plans payants',
    collect: 'Télémétrie des capteurs et journaux des services', compat: 'Portail Azure et API', limits: 'Rétention de 90 jours dans le service; la liste des alertes évolue.', nature: 'native', src: ['alerts', 'alerts-reference', 'alerts-manage'], lessons: ['d21-l1', 'd21-l2'],
  }),
  cap('d21.incidents', 'Corrélation en incidents', {
    plan: 'Plans de protection', obj: 'Regrouper les alertes liées en histoires d’attaque.', risk: 'Fusions qui déplacent l’incident cible.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Alertes de l’abonnement ou du locataire', req: 'Alertes corrélables', perm: 'Security Reader pour lire', cost: 'Inclus',
    collect: 'Alertes et signaux contextuels', compat: 'Defender for Cloud et portail Defender', limits: 'Logique de corrélation propriétaire; direction de fusion décidée par Defender.', nature: 'native', src: ['alerts', 'xdr-correlation'], lessons: ['d21-l1'],
  }),
  cap('d21.xdr', 'Intégration à Defender XDR', {
    plan: 'Activée avec Defender for Cloud', obj: 'Investiguer les alertes cloud dans le portail Defender.', risk: 'Alertes informationnelles absentes du portail.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Locataire', req: 'Intégration active', perm: 'Rôles Defender XDR (Entra ou RBAC unifié)', cost: 'Sans frais propres',
    collect: 'Alertes et incidents cloud', compat: 'API publique de Defender XDR', limits: 'Alertes informationnelles non envoyées au portail Defender.', nature: 'integration', src: ['xdr-integration', 'xdr-correlation'], lessons: ['d21-l1'],
  }),
  cap('d21.alertes-test', 'Alertes d’exemple et simulations', {
    plan: 'Tous les plans admissibles', obj: 'Valider la chaîne d’alerte et la détection de façon inoffensive.', risk: 'Test réalisé en production sans prévenir le SOC.',
    clouds: 'Azure principalement', scope: 'Abonnement choisi', req: 'Machine de test avec capteur pour les simulations réelles', perm: 'Subscription Contributor pour les alertes d’exemple', cost: 'Aucun frais propre; le plan reste facturé',
    collect: 'Sans objet', compat: 'Page Sample alerts, fichier EICAR, outil de simulation Kubernetes', limits: 'Les alertes d’exemple portent sur des ressources simulées.', nature: 'native', src: ['alerts-validate'], lessons: ['d21-l3'],
  }),
  cap('d21.suppression', 'Règles de suppression d’alertes', {
    plan: 'Tous les plans', obj: 'Masquer les alertes bénignes de façon bornée.', risk: 'Angle mort permanent si la règle est trop large.',
    clouds: 'Azure principalement', scope: 'Abonnement ou groupe de gestion', req: 'Type d’alerte déjà déclenché au moins une fois', perm: 'Security Admin; Azure Policy pour les groupes de gestion', cost: 'Aucun',
    collect: 'Sans objet', compat: 'Portail, API REST et Azure Policy', limits: 'Supprimer une règle ne rouvre pas les alertes déjà fermées.', nature: 'native', src: ['alerts-suppress'], lessons: ['d21-l3'],
  }),
  cap('d21.export-alertes', 'Export des alertes', {
    plan: 'Sans plan dédié', obj: 'Conserver et corréler les alertes hors du service.', risk: 'Export non configuré avant l’incident.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Abonnement', req: 'Destination Log Analytics, Event Hubs ou SIEM', perm: 'Security Admin; droits sur la destination', cost: 'Ingestion et stockage de la destination',
    collect: 'Alertes et recommandations', compat: 'Export continu, CSV, connecteurs', limits: 'Pas d’export rétroactif des alertes expirées.', nature: 'integration', src: ['continuous-export', 'siem-export'], lessons: ['d21-l1', 'd21-l3'],
  }),
];

// Sources du parcours Microsoft Purview. Date de consultation propre à chaque entrée (session de recherche du 2026-11-06).
import type { SourceDef, SourceStatus } from '../types.ts';

const C = '2026-11-06';
const L = 'https://learn.microsoft.com/';
const S = (id: string, title: string, path: string, product: string, topic: string, status: SourceStatus = 'ga', uncertainty?: string): SourceDef => ({
  id: `purview-${id}`, title: `Microsoft Learn : ${title}`, url: L + path, product, topic, status, consulted: C, ...(uncertainty ? { uncertainty } : {}),
});
const LIC = 'Les tableaux de licences changent : revérifier la description de service avant tout achat ou toute affirmation à un client.';

export const PURVIEW_SOURCES: SourceDef[] = [
  S('overview', 'Learn about Microsoft Purview', 'purview/purview', 'Microsoft Purview', 'Vue d’ensemble'),
  S('portal', 'Learn about the Microsoft Purview portal', 'purview/purview-portal', 'Microsoft Purview', 'Portail Purview'),
  S('permissions', 'Permissions in the Microsoft Purview portal', 'purview/purview-permissions', 'Microsoft Purview', 'Rôles et groupes de rôles'),
  S('role-groups', 'Roles and role groups in Microsoft Defender for Office 365 and Microsoft Purview', 'defender-office-365/scc-permissions', 'Microsoft Purview', 'Groupes de rôles par défaut'),
  S('service-desc', 'Microsoft Purview service description', 'office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description', 'Microsoft Purview', 'Licences par fonction', 'reference', LIC),
  S('classifiers', 'Microsoft Purview classifiers overview', 'purview/data-classification-overview', 'Information Protection', 'Types de classification', 'ga', 'La nouvelle expérience des classifiers est en préversion à côté des expériences existantes.'),
  S('sit', 'Learn about sensitive information types', 'purview/sit-sensitive-information-type-learn-about', 'Information Protection', 'Types d’informations sensibles'),
  S('edm', 'Learn about exact data match based sensitive information types', 'purview/sit-learn-about-exact-data-match-based-sits', 'Information Protection', 'Exact Data Match'),
  S('false-positives', 'Reduce false positives by using SITs and advanced classifiers', 'purview/deploymentmodels/depmod-reduce-false-positives', 'Information Protection', 'Réduction des faux positifs'),
  S('labels', 'Learn about sensitivity labels', 'purview/sensitivity-labels', 'Information Protection', 'Étiquettes de sensibilité', 'ga', 'Le schéma d’étiquettes moderne (groupes d’étiquettes) remplace progressivement les étiquettes parentes : vérifier le schéma de votre locataire.'),
  S('labels-start', 'Get started with sensitivity labels', 'purview/get-started-with-sensitivity-labels', 'Information Protection', 'Déploiement des étiquettes', 'ga', LIC),
  S('labels-create', 'Create and configure sensitivity labels and their policies', 'purview/create-sensitivity-labels', 'Information Protection', 'Création et publication'),
  S('dlp-learn', 'Learn about data loss prevention', 'purview/dlp-learn-about-dlp', 'Data Loss Prevention', 'Vue d’ensemble DLP'),
  S('dlp-ref', 'Data Loss Prevention policy reference', 'purview/dlp-policy-reference', 'Data Loss Prevention', 'Anatomie d’une politique'),
  S('dlp-create', 'Create and deploy data loss prevention policies', 'purview/dlp-create-deploy-policy', 'Data Loss Prevention', 'Déploiement et modes'),
  S('dlp-plan', 'Plan for data loss prevention (DLP)', 'purview/dlp-overview-plan-for-dlp', 'Data Loss Prevention', 'Planification'),
  S('dlp-sim', 'Learn about data loss prevention simulation mode', 'purview/dlp-simulation-mode-learn', 'Data Loss Prevention', 'Mode simulation'),
  S('dlp-sim-start', 'Get started with the data loss prevention simulation mode', 'purview/dlp-simulation-mode-get-started', 'Data Loss Prevention', 'Mode simulation : état et limites'),
  S('dlp-alerts', 'Learn about investigating data loss prevention alerts', 'purview/dlp-alert-investigation-learn', 'Data Loss Prevention', 'Investigation des alertes'),
  S('dlp-defender', 'Investigate data loss prevention alerts with Microsoft Defender XDR', 'defender-xdr/dlp-investigate-alerts-defender', 'Defender XDR', 'Alertes DLP dans le portail Defender', 'ga', 'Une règle d’ajustement d’alertes intégrée (octobre 2026) peut transformer les signaux DLP en comportements : vérifier son état dans votre locataire.'),
  S('irm', 'Learn about Insider Risk Management', 'purview/insider-risk-management', 'Insider Risk Management', 'Vue d’ensemble'),
  S('irm-policies', 'Create and manage Insider Risk Management policies', 'purview/insider-risk-management-policies', 'Insider Risk Management', 'Politiques'),
  S('irm-templates', 'Learn about Insider Risk Management policy templates', 'purview/insider-risk-management-policy-templates', 'Insider Risk Management', 'Modèles de politique'),
  S('irm-share', 'Share Insider Risk Management data with other solutions', 'purview/insider-risk-management-settings-share-data', 'Insider Risk Management', 'Partage avec Defender XDR et DLP'),
  S('irm-defender', 'Investigate insider risk threats in the Microsoft Defender portal', 'defender-xdr/irm-investigate-alerts-defender', 'Defender XDR', 'Alertes Insider Risk dans Defender', 'preview', 'La page signale du contenu relatif à un produit en préversion.'),
  S('cc', 'Learn about Communication Compliance', 'purview/communication-compliance', 'Communication Compliance', 'Vue d’ensemble'),
  S('cc-policies', 'Create and manage Communication Compliance policies', 'purview/communication-compliance-policies', 'Communication Compliance', 'Politiques'),
  S('cc-plan', 'Plan for Communication Compliance', 'purview/communication-compliance-plan', 'Communication Compliance', 'Planification'),
  S('audit', 'Learn about auditing solutions in Microsoft Purview', 'purview/audit-solutions-overview', 'Audit', 'Audit Standard et Premium', 'ga', LIC),
  S('audit-start', 'Get started with auditing solutions', 'purview/audit-get-started', 'Audit', 'Mise en route de l’audit'),
  S('audit-search', 'Search the audit log', 'purview/audit-search', 'Audit', 'Recherche dans le journal d’audit'),
  S('audit-retention', 'Manage audit log retention policies', 'purview/audit-log-retention-policies', 'Audit', 'Rétention du journal d’audit'),
  S('audit-defender', 'Search the audit log for events in Microsoft Defender XDR', 'defender-xdr/microsoft-xdr-auditing', 'Defender XDR', 'Audit dans le portail Defender'),
  S('ps-ual', 'Search-UnifiedAuditLog', 'powershell/module/exchangepowershell/search-unifiedauditlog', 'Audit', 'Applet de commande PowerShell'),
  S('edisc', 'Learn about eDiscovery', 'purview/edisc', 'eDiscovery', 'Nouvelle expérience eDiscovery'),
  S('edisc-workflow', 'Learn about the eDiscovery workflow', 'purview/edisc-workflow', 'eDiscovery', 'Flux de travail'),
  S('edisc-limits', 'Limits in eDiscovery', 'purview/edisc-ref-limits', 'eDiscovery', 'Limites', 'ga', 'Les limites sont révisées par Microsoft : revérifier avant de dimensionner un dossier.'),
  S('retention', 'Learn about retention policies and retention labels', 'purview/retention', 'Data Lifecycle Management', 'Rétention'),
  S('retention-labels', 'Publish retention labels and apply them in apps', 'purview/create-apply-retention-labels', 'Data Lifecycle Management', 'Étiquettes de rétention'),
  S('retention-auto', 'Automatically apply a retention label to retain or delete content', 'purview/apply-retention-labels-automatically', 'Data Lifecycle Management', 'Application automatique'),
  S('cm', 'Microsoft Purview Compliance Manager', 'purview/compliance-manager', 'Compliance Manager', 'Vue d’ensemble'),
  S('cm-setup', 'Get started with Compliance Manager', 'purview/compliance-manager-setup', 'Compliance Manager', 'Mise en route'),
  S('cm-scoring', 'Compliance Manager scoring', 'purview/compliance-manager-scoring', 'Compliance Manager', 'Calcul du score'),
  S('cm-actions', 'Working with improvement actions in Compliance Manager', 'purview/compliance-manager-improvement-actions', 'Compliance Manager', 'Actions d’amélioration'),
  S('hunting-cloudapp', 'CloudAppEvents (advanced hunting)', 'defender-xdr/advanced-hunting-cloudappevents-table', 'Defender XDR', 'Table CloudAppEvents', 'ga', 'La table n’est alimentée que si Defender for Cloud Apps est déployé avec le connecteur Microsoft 365.'),
];

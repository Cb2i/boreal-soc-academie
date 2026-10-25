// Registre des sources officielles consultées. Chaque lien cité dans une leçon doit figurer ici (test d'intégrité).
// Date de consultation commune : session de recherche du 2026-10-24 (Microsoft Learn, consulté via la recherche et la lecture de pages).
import type { SourceDef } from './types.ts';

export const CONSULTED = '2026-10-24';

const L = 'https://learn.microsoft.com/';

export const SOURCES: SourceDef[] = [
  { id: 'xdr-overview', title: 'Microsoft Learn : What is Microsoft Defender XDR?', url: L + 'defender-xdr/microsoft-365-defender', product: 'Defender XDR', topic: 'Vue d’ensemble', status: 'ga' },
  { id: 'xdr-portal', title: 'Microsoft Learn : Microsoft Defender XDR in the Microsoft Defender portal', url: L + 'defender-xdr/microsoft-365-defender-portal', product: 'Defender XDR', topic: 'Portail Defender', status: 'ga' },
  { id: 'xdr-prereq', title: 'Microsoft Learn : Microsoft Defender XDR prerequisites', url: L + 'defender-xdr/prerequisites', product: 'Defender XDR', topic: 'Licences et prérequis', status: 'ga', uncertainty: 'Les listes de licences évoluent : vérifier dans le centre d’administration avant tout achat.' },
  { id: 'xdr-pilot', title: 'Microsoft Learn : Pilot and deploy Microsoft Defender XDR', url: L + 'defender-xdr/pilot-deploy-overview', product: 'Defender XDR', topic: 'Architecture et déploiement', status: 'ga' },
  { id: 'xdr-incidents', title: 'Microsoft Learn : Incidents and alerts in the Microsoft Defender portal', url: L + 'defender-xdr/incidents-overview', product: 'Defender XDR', topic: 'Incidents et alertes', status: 'ga', uncertainty: 'Les « incident cases » sont indiquées en préversion au moment de la consultation.' },
  { id: 'xdr-air', title: 'Microsoft Learn : Automated investigation and response in Microsoft Defender XDR', url: L + 'defender-xdr/m365d-autoir', product: 'Defender XDR', topic: 'Investigation automatique', status: 'ga' },
  { id: 'xdr-air-results', title: 'Microsoft Learn : Details and results of an automated investigation', url: L + 'defender-xdr/m365d-autoir-results', product: 'Defender XDR', topic: 'Investigation automatique', status: 'ga' },
  { id: 'xdr-urbac', title: 'Microsoft Learn : Microsoft Defender unified role-based access control (RBAC)', url: L + 'defender-xdr/manage-rbac', product: 'Defender XDR', topic: 'RBAC unifié', status: 'ga' },
  { id: 'xdr-urbac-perms', title: 'Microsoft Learn : Permissions in Microsoft Defender unified RBAC', url: L + 'defender-xdr/custom-permissions-details', product: 'Defender XDR', topic: 'RBAC unifié', status: 'ga' },
  { id: 'xdr-urbac-map', title: 'Microsoft Learn : Map existing RBAC permissions to Microsoft Defender unified RBAC permissions', url: L + 'defender-xdr/compare-rbac-roles', product: 'Defender XDR', topic: 'RBAC unifié', status: 'ga' },
  { id: 'xdr-ah-overview', title: 'Microsoft Learn : Proactively hunt for threats with advanced hunting in Microsoft Defender', url: L + 'defender-xdr/advanced-hunting-overview', product: 'Defender XDR', topic: 'Advanced Hunting', status: 'ga' },
  { id: 'xdr-whatsnew', title: 'Microsoft Learn : What\'s new in Microsoft Defender XDR', url: L + 'defender-xdr/whats-new', product: 'Defender XDR', topic: 'Notes de publication', status: 'reference', uncertainty: 'Page mise à jour en continu : plusieurs éléments y sont indiqués en préversion.' },
  { id: 'sentinel-defender-portal', title: 'Microsoft Learn : Microsoft Sentinel in the Microsoft Defender portal', url: L + 'azure/sentinel/microsoft-sentinel-defender-portal', product: 'Microsoft Sentinel', topic: 'Sentinel dans le portail Defender', status: 'ga', uncertainty: 'Calendrier de retrait du portail Azure repoussé au 31 mars 2027 selon la page consultée (initialement juillet 2026) : revérifier.' },
  { id: 'sentinel-xdr-integration', title: 'Microsoft Learn : Microsoft Defender XDR integration with Microsoft Sentinel', url: L + 'azure/sentinel/microsoft-365-defender-sentinel-integration', product: 'Microsoft Sentinel', topic: 'Connecteur Defender XDR', status: 'ga' },
  { id: 'intune-endpoint-security', title: 'Microsoft Learn : Manage endpoint security in Microsoft Intune', url: L + 'intune/device-security/endpoint-security-policies', product: 'Intune', topic: 'Endpoint security', status: 'ga' },
  { id: 'intune-manage-policies', title: 'Microsoft Learn : Manage device security with endpoint security policies in Microsoft Intune', url: L + 'intune/device-configuration/endpoint-security/manage-policies', product: 'Intune', topic: 'Endpoint security', status: 'ga' },
  { id: 'intune-device-security', title: 'Microsoft Learn : Protect data and devices with Microsoft Intune', url: L + 'intune/device-security/overview', product: 'Intune', topic: 'Vue d’ensemble de la sécurité', status: 'ga' },
  { id: 'xdr-pilot-mde', title: 'Microsoft Learn : Pilot and deploy Microsoft Defender for Endpoint', url: L + 'defender-xdr/pilot-deploy-defender-endpoint', product: 'Defender for Endpoint', topic: 'Pilote et déploiement', status: 'ga' },
  { id: 'xdr-pilot-mdo', title: 'Microsoft Learn : Pilot and deploy Defender for Office 365', url: L + 'defender-xdr/pilot-deploy-defender-office-365', product: 'Defender for Office 365', topic: 'Pilote et déploiement', status: 'ga' },
  { id: 'xdr-pilot-mdi', title: 'Microsoft Learn : Pilot and deploy Microsoft Defender for Identity', url: L + 'defender-xdr/pilot-deploy-defender-identity', product: 'Defender for Identity', topic: 'Pilote et déploiement', status: 'ga' },
  { id: 'xdr-pilot-mda', title: 'Microsoft Learn : Pilot and deploy Microsoft Defender for Cloud Apps', url: L + 'defender-xdr/pilot-deploy-defender-cloud-apps', product: 'Defender for Cloud Apps', topic: 'Pilote et déploiement', status: 'ga' },
  { id: 'xdr-pilot-respond', title: 'Microsoft Learn : Investigate and respond using Microsoft Defender', url: L + 'defender-xdr/pilot-deploy-investigate-respond', product: 'Defender XDR', topic: 'Pilote : investigation et réponse', status: 'ga' },
  { id: 'mde-onboard-client', title: 'Microsoft Learn : Onboard Windows client devices to Microsoft Defender for Endpoint', url: L + 'defender-endpoint/onboard-client', product: 'Defender for Endpoint', topic: 'Intégration des appareils Windows', status: 'ga' },
  { id: 'mde-onboard-script', title: 'Microsoft Learn : Onboard Windows devices to Defender for Endpoint with a local script', url: L + 'defender-endpoint/configure-endpoints-script', product: 'Defender for Endpoint', topic: 'Script local', status: 'ga' },
  { id: 'mde-onboard-gp', title: 'Microsoft Learn : Onboard Windows devices to Defender for Endpoint with Group Policy', url: L + 'defender-endpoint/configure-endpoints-gp', product: 'Defender for Endpoint', topic: 'Stratégie de groupe', status: 'ga' },
  { id: 'mde-onboard-intune', title: 'Microsoft Learn : Onboard Windows devices to Defender for Endpoint using Microsoft Intune', url: L + 'defender-endpoint/onboarding-endpoint-manager', product: 'Defender for Endpoint', topic: 'Intégration par Intune', status: 'ga' },
  { id: 'mde-migrate-onboard', title: 'Microsoft Learn : Migrate to Microsoft Defender for Endpoint, Phase 3: Onboard', url: L + 'defender-endpoint/switch-to-mde-phase-3', product: 'Defender for Endpoint', topic: 'Méthodes par système d’exploitation', status: 'ga' },

  { id: 'mde-respond', title: 'Microsoft Learn : Take response actions on a device', url: L + 'defender-endpoint/respond-machine-alerts', product: 'Defender for Endpoint', topic: 'Actions de réponse', status: 'ga', uncertainty: 'La page signale du contenu lié à des fonctions préliminaires : vérifier la disponibilité par plan.' },
  { id: 'mde-live-response', title: 'Microsoft Learn : Investigate entities on devices using live response', url: L + 'defender-endpoint/live-response', product: 'Defender for Endpoint', topic: 'Live response', status: 'ga' },
  { id: 'mde-high-value', title: 'Microsoft Learn : Restrict response actions on high-value assets', url: L + 'defender-endpoint/restrict-response-actions-high-value-assets', product: 'Defender for Endpoint', topic: 'Actions de réponse restreintes', status: 'ga' },
  { id: 'mde-device-groups', title: 'Microsoft Learn : Create and manage device groups in Microsoft Defender for Endpoint', url: L + 'defender-endpoint/machine-groups', product: 'Defender for Endpoint', topic: 'Groupes d’appareils', status: 'ga' },
  { id: 'mde-device-tags', title: 'Microsoft Learn : Create and manage device tags and target devices', url: L + 'defender-endpoint/machine-tags', product: 'Defender for Endpoint', topic: 'Étiquettes d’appareils', status: 'ga' },
  { id: 'mde-devices-overview', title: 'Microsoft Learn : Devices in Microsoft Defender for Endpoint', url: L + 'defender-endpoint/devices-overview', product: 'Defender for Endpoint', topic: 'Ciblage des appareils', status: 'ga' },
  { id: 'mde-edr-block', title: 'Microsoft Learn : Endpoint detection and response in block mode', url: L + 'defender-endpoint/edr-in-block-mode', product: 'Defender for Endpoint', topic: 'EDR en mode blocage', status: 'ga' },
  { id: 'mde-passive', title: 'Microsoft Learn : Defender Antivirus in passive mode', url: L + 'defender-endpoint/microsoft-defender-passive-mode', product: 'Defender for Endpoint', topic: 'Mode passif', status: 'ga' },
  { id: 'mde-av-compat', title: 'Microsoft Learn : Microsoft Defender Antivirus compatibility with other security products', url: L + 'defender-endpoint/microsoft-defender-antivirus-compatibility', product: 'Defender for Endpoint', topic: 'Compatibilité antivirus', status: 'ga' },
  { id: 'mde-tamper', title: 'Microsoft Learn : Tamper protection overview', url: L + 'defender-endpoint/tamper-protection-overview', product: 'Defender for Endpoint', topic: 'Protection contre la falsification', status: 'ga' },
  { id: 'mde-advanced-features', title: 'Microsoft Learn : Configure advanced features in Defender for Endpoint', url: L + 'defender-endpoint/advanced-features', product: 'Defender for Endpoint', topic: 'Fonctions avancées', status: 'ga' },
  { id: 'xdr-auto-config', title: 'Microsoft Learn : Configure automated investigation and response capabilities in Microsoft Defender XDR', url: L + 'defender-xdr/m365d-configure-auto-investigation-response', product: 'Defender XDR', topic: 'Configuration de l’AIR', status: 'ga' },

];

export const SOURCE_BY_ID: Record<string, SourceDef> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

/** Référence de lien pour une leçon : titre et URL du registre, date de consultation commune. */
export function sref(id: string): { title: string; url: string; verified: string } {
  const s = SOURCE_BY_ID[id];
  if (!s) throw new Error(`Source inconnue du registre : ${id}`);
  return { title: s.title, url: s.url, verified: CONSULTED };
}

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
];

export const SOURCE_BY_ID: Record<string, SourceDef> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

/** Référence de lien pour une leçon : titre et URL du registre, date de consultation commune. */
export function sref(id: string): { title: string; url: string; verified: string } {
  const s = SOURCE_BY_ID[id];
  if (!s) throw new Error(`Source inconnue du registre : ${id}`);
  return { title: s.title, url: s.url, verified: CONSULTED };
}

// Métadonnées légères des parcours (aucun contenu pédagogique ici) : utilisées par la navigation, l'accueil et le routage.
export interface TrackNavItem {
  /** Sous-route (undefined : accueil du parcours). */
  sub?: string;
  fr: string;
  en: string;
  /** Autres sous-routes qui activent cet onglet. */
  also?: string[];
}

export interface TrackMeta {
  id: 'ia' | 'xdr' | 'intune' | 'scenarios';
  route: string;
  /** Libellé court dans le menu des sections. */
  navFr: string;
  navEn: string;
  titleFr: string;
  titleEn: string;
  kickerFr: string;
  accent: string;
  /** Clé localStorage de la progression de ce parcours. */
  storageKey: string;
  /** Répertoire sous public/ des ressources téléchargeables. */
  resourceDir: string;
  exportFile: string;
  /** Libellé utilisé dans les messages d'import, d'export et d'effacement. */
  label: string;
  descFr: string;
  descEn: string;
  nav: TrackNavItem[];
}

const COMMON_NAV: TrackNavItem[] = [
  { fr: 'Formation', en: 'Course', also: ['module', 'cours', 'exercice', 'evaluation', 'cas'] },
  { sub: 'suivi', fr: 'Suivi', en: 'Tracking' },
  { sub: 'projets', fr: 'Labs', en: 'Labs', also: ['projet'] },
  { sub: 'ressources', fr: 'Ressources', en: 'Resources' },
  { sub: 'couverture', fr: 'Couverture', en: 'Coverage' },
];

export const TRACKS: TrackMeta[] = [
  {
    id: 'ia',
    route: 'ia',
    navFr: 'Agentic AI',
    navEn: 'Agentic AI',
    titleFr: 'Agentic AI for Cybersecurity',
    titleEn: 'Agentic AI for Cybersecurity',
    kickerFr: 'Section 2',
    accent: '#9b8cff',
    storageKey: 'boube.agentic.v1',
    resourceDir: 'ressources-ia',
    exportFile: 'boube-agentic-progression.json',
    label: 'Agentic AI',
    descFr: 'Du débutant à l’expert : fondations de l’IA, automatisation et n8n, applications LLM, agents, cybersécurité, sécurité et production, projets.',
    descEn: 'From beginner to expert. Written in French.',
    nav: COMMON_NAV,
  },
  {
    id: 'xdr',
    route: 'xdr',
    navFr: 'Defender XDR',
    navEn: 'Defender XDR',
    titleFr: 'Microsoft Defender XDR',
    titleEn: 'Microsoft Defender XDR',
    kickerFr: 'Section 3',
    accent: '#4aa3ff',
    storageKey: 'boube.xdr.v1',
    resourceDir: 'ressources-xdr',
    exportFile: 'boube-defender-xdr-progression.json',
    label: 'Defender XDR',
    descFr: 'Architecture, déploiement, Endpoint, Office 365, Identity, Cloud Apps, Vulnerability Management, incidents, Advanced Hunting, détections personnalisées et automatisation.',
    descEn: 'Architecture, deployment, Endpoint, Office 365, Identity, Cloud Apps, Vulnerability Management, incidents, Advanced Hunting, custom detections and automation. Written in French.',
    nav: [...COMMON_NAV, { sub: 'sources', fr: 'Sources', en: 'Sources' }],
  },
  {
    id: 'intune',
    route: 'intune',
    navFr: 'Intune Sécurité',
    navEn: 'Intune Security',
    titleFr: 'Microsoft Intune : sécurité',
    titleEn: 'Microsoft Intune: security',
    kickerFr: 'Section 4',
    accent: '#35c4a0',
    storageKey: 'boube.intune.v1',
    resourceDir: 'ressources-intune',
    exportFile: 'boube-intune-securite-progression.json',
    label: 'Intune Sécurité',
    descFr: 'Politiques de sécurité, baselines, Defender Antivirus, ASR, EDR, pare-feu, chiffrement, comptes, conformité, protection des applications, correctifs et durcissement par plateforme.',
    descEn: 'Security policies, baselines, Defender Antivirus, ASR, EDR, firewall, encryption, accounts, compliance, app protection, patching and per-platform hardening. Written in French.',
    nav: [...COMMON_NAV, { sub: 'sources', fr: 'Sources', en: 'Sources' }],
  },
  {
    id: 'scenarios',
    route: 'scenarios',
    navFr: 'Defender + Intune',
    navEn: 'Defender + Intune',
    titleFr: 'Configurer, protéger et vérifier : Defender + Intune',
    titleEn: 'Configure, protect and verify: Defender + Intune',
    kickerFr: 'Rubrique partagée',
    accent: '#f0a34a',
    storageKey: 'boube.scenarios.v1',
    resourceDir: 'ressources-scenarios',
    exportFile: 'boube-scenarios-progression.json',
    label: 'Scénarios Defender + Intune',
    descFr: 'Scénarios croisés : phishing, protection web et réseau, WSL, ASR, supports amovibles, risque appareil et accès conditionnel, perte de télémétrie, confinement et restauration.',
    descEn: 'Cross scenarios: phishing, web and network protection, WSL, ASR, removable media, device risk and Conditional Access, telemetry loss, containment and restoration. Written in French.',
    nav: [
      { fr: 'Scénarios', en: 'Scenarios', also: ['module', 'cours', 'exercice', 'evaluation', 'cas'] },
      { sub: 'catalogue', fr: 'Catalogue', en: 'Catalog', also: ['fiche'] },
      { sub: 'suivi', fr: 'Suivi', en: 'Tracking' },
      { sub: 'projets', fr: 'Labs', en: 'Labs', also: ['projet'] },
      { sub: 'couverture', fr: 'Couverture', en: 'Coverage' },
    ],
  },
];

export const TRACK_BY_ROUTE: Record<string, TrackMeta> = Object.fromEntries(TRACKS.map((t) => [t.route, t]));

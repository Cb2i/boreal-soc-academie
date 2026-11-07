import type { Route } from '../router.ts';
import { CONTENT } from '../msec/purview/index.ts';
import type { Track } from '../agentic/TrackContext.tsx';
import { TrackRouter } from '../pages/track/TrackRouter.tsx';
import { STORES } from './stores.ts';
import { TRACK_BY_ROUTE } from './meta.ts';
import { SourcesPage } from '../pages/track/SourcesPage.tsx';

export const purviewTrack: Track = {
  meta: TRACK_BY_ROUTE.purview,
  store: STORES.purview,
  content: CONTENT,
  pages: { sources: SourcesPage },
  home: {
    lead: 'Microsoft Purview : protection et gouvernance des données. Portail et rôles, classification, étiquettes de sensibilité, prévention des pertes de données, risques internes, Communication Compliance, audit, eDiscovery, rétention et exploitation par le SOC. Le parcours fonctionne sans locataire Microsoft : données fictives et actions simulées, aucune interface ne prétend administrer Purview.',
    notes: ['Chaque fait Microsoft cite une source du registre avec sa date de consultation (2026-11-06). Rien n’a été validé dans un locataire Purview réel : à vérifier dans votre environnement avant toute procédure interne. Traduction anglaise à venir.'],
    leadEn: 'Microsoft Purview: data protection and governance. Portal and roles, classification, sensitivity labels, data loss prevention, insider risk, Communication Compliance, audit, eDiscovery, retention and SOC operations. The path works without a Microsoft tenant: fictitious data and simulated actions.',
    notesEn: ['Every Microsoft fact cites a registry source with its consultation date (2026-11-06). Nothing has been validated in a real Purview tenant. English translation to come.'],
  },
};

export default function PurviewEntry({ route }: { route: Route }) {
  return <TrackRouter track={purviewTrack} route={route} />;
}

import type { Route } from '../router.ts';
import { CONTENT } from '../msec/xdr/index.ts';
import type { Track } from '../agentic/TrackContext.tsx';
import { TrackRouter } from '../pages/track/TrackRouter.tsx';
import { STORES } from './stores.ts';
import { TRACK_BY_ROUTE } from './meta.ts';
import { SourcesPage } from '../pages/track/SourcesPage.tsx';

export const xdrTrack: Track = {
  meta: TRACK_BY_ROUTE.xdr,
  store: STORES.xdr,
  content: CONTENT,
  pages: { sources: SourcesPage },
  home: {
    lead: 'Microsoft Defender XDR de l’architecture à l’exploitation : terminaux, courriel, identités, applications infonuagiques, incidents, chasse en KQL et détections. Le parcours principal fonctionne sans locataire, avec des données fictives et des simulations identifiées. Les laboratoires réels sont séparés, avec leurs prérequis, leurs coûts et leur nettoyage.',
    notes: ['Chaque fait Microsoft cite une source du registre, avec sa date de consultation. Rien n’a été validé dans un laboratoire Microsoft réel.'],
  },
};

export default function XdrEntry({ route }: { route: Route }) {
  return <TrackRouter track={xdrTrack} route={route} />;
}

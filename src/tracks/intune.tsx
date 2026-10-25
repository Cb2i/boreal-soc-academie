import type { Route } from '../router.ts';
import { CONTENT } from '../msec/intune/index.ts';
import type { Track } from '../agentic/TrackContext.tsx';
import { TrackRouter } from '../pages/track/TrackRouter.tsx';
import { STORES } from './stores.ts';
import { TRACK_BY_ROUTE } from './meta.ts';
import { SourcesPage } from '../pages/track/SourcesPage.tsx';

export const intuneTrack: Track = {
  meta: TRACK_BY_ROUTE.intune,
  store: STORES.intune,
  content: CONTENT,
  pages: { sources: SourcesPage },
  home: {
    lead: 'La sécurité dans Microsoft Intune : politiques, baselines, Defender Antivirus, ASR, EDR, pare-feu, chiffrement, comptes, conformité, applications, correctifs et durcissement, plateforme par plateforme. Le parcours principal fonctionne sans locataire, avec des données fictives et des simulations identifiées. Les laboratoires réels sont séparés, avec leurs prérequis, leurs coûts et leur nettoyage.',
    notes: ['Chaque fait Microsoft cite une source du registre, avec sa date de consultation. Rien n’a été validé dans un laboratoire Microsoft réel.'],
  },
};

export default function IntuneEntry({ route }: { route: Route }) {
  return <TrackRouter track={intuneTrack} route={route} />;
}

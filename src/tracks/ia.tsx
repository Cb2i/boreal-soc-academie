import type { Route } from '../router.ts';
import { CONTENT } from '../agentic/content/index.ts';
import type { Track } from '../agentic/TrackContext.tsx';
import { TrackRouter } from '../pages/track/TrackRouter.tsx';
import { STORES } from './stores.ts';
import { TRACK_BY_ROUTE } from './meta.ts';

export const iaTrack: Track = {
  meta: TRACK_BY_ROUTE.ia,
  store: STORES.ia,
  content: CONTENT,
  home: {
    lead: 'Une formation du débutant à l’expert : comprendre l’IA, distinguer automatisation, workflow avec LLM et agent, puis concevoir, tester, sécuriser et exploiter des workflows pour la cybersécurité. Tout fonctionne avec des simulations et des données fictives : aucun tenant réel, aucune API payante.',
    notes: [],
    leadEn: 'A course from beginner to expert: understand AI, tell automation, LLM workflows and agents apart, then design, test, secure and operate workflows for cybersecurity. Everything runs on simulations and fictitious data: no real tenant, no paid API.',
    notesEn: [],
  },
};

export default function IaEntry({ route }: { route: Route }) {
  return <TrackRouter track={iaTrack} route={route} />;
}

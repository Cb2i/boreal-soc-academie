import type { Route } from '../router.ts';
import { CONTENT } from '../msec/scenarios/index.ts';
import type { Track } from '../agentic/TrackContext.tsx';
import { TrackRouter } from '../pages/track/TrackRouter.tsx';
import { STORES } from './stores.ts';
import { TRACK_BY_ROUTE } from './meta.ts';
import { CataloguePage, SheetPage } from '../pages/track/ScenarioPages.tsx';

export const scenariosTrack: Track = {
  meta: TRACK_BY_ROUTE.scenarios,
  store: STORES.scenarios,
  content: CONTENT,
  pages: { catalogue: CataloguePage, fiche: SheetPage },
  home: {
    lead: 'Configurer, protéger et vérifier : huit scénarios qui croisent Defender et Intune. Pour chacun, une fiche de décision dit quel besoin et quelle menace, d’où vient le signal, quel produit décide, où l’on configure, quel composant applique, où se trouve la preuve, quelles dépendances, quels délais, quels échecs, et comment vérifier et revenir en arrière. Le parcours fonctionne sans locataire, avec des données fictives et des simulations identifiées.',
    notes: ['Chaque fait Microsoft cite une source du registre, avec sa date de consultation. Les fiches sont des lectures pédagogiques : rien n’a été validé dans un laboratoire Microsoft réel.'],
    leadEn: 'Configure, protect and verify: eight scenarios that combine Defender and Intune. Each one comes with a decision sheet that states the need and the threat, where the signal comes from, which product decides, where to configure, which component enforces, where the evidence lives, the dependencies, the delays, the failure modes, and how to verify and roll back. The path works without a tenant, using fictitious data and clearly labelled simulations.',
    notesEn: ['Every Microsoft fact cites a registry source with its consultation date. The sheets are educational readings: nothing has been validated in a real Microsoft lab.'],
  },
};

export default function ScenariosEntry({ route }: { route: Route }) {
  return <TrackRouter track={scenariosTrack} route={route} />;
}

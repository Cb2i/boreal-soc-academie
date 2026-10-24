import type { TrackContent } from '../agentic/content/build.ts';

/** Chargement différé du contenu de chaque parcours (accueil, palette de recherche, outils de contrôle). */
export const CONTENT_LOADERS: Record<string, () => Promise<TrackContent>> = {
  ia: () => import('../agentic/content/index.ts').then((m) => m.CONTENT),
};

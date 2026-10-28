// Contexte d'un parcours : contenu, progression et utilitaires de liens, partagés par toutes les pages du parcours.
import { createContext, useContext } from 'react';
import type { ComponentType } from 'react';
import type { TrackMeta } from '../tracks/meta.ts';
import type { TrackContent } from './content/build.ts';
import type { AiProgress, ProgressStore } from './state.ts';
import { useStoreProgress } from './state.ts';
import type { Catalog } from './engine.ts';
import { href } from '../router.ts';

export interface Track {
  meta: TrackMeta;
  store: ProgressStore;
  content: TrackContent;
  /** Pages propres au parcours (sources, catalogue, couverture enrichie…), indexées par sous-route. */
  pages?: Record<string, ComponentType>;
  /** Texte d'introduction de l'accueil du parcours (mini-markdown) et mentions d'honnêteté propres au parcours. */
  home?: { lead: string; notes: string[]; leadEn?: string; notesEn?: string[] };
}

export interface TrackCtx {
  track: Track;
  meta: TrackMeta;
  c: TrackContent;
  p: AiProgress;
  store: ProgressStore;
  cat: Catalog;
  /** Lien interne du parcours : to('cours', id) -> #/xdr/cours/<id>. */
  to: (...params: string[]) => string;
}

const Ctx = createContext<TrackCtx | null>(null);

export function TrackProvider({ track, children }: { track: Track; children: React.ReactNode }) {
  const p = useStoreProgress(track.store);
  const c = track.content;
  const value: TrackCtx = {
    track,
    meta: track.meta,
    c,
    p,
    store: track.store,
    cat: { modules: c.MODULES, lessons: c.LESSONS, exercises: c.EXERCISES, competencies: c.COMPETENCIES },
    to: (...params) => href(track.meta.route, ...params),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrack(): TrackCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTrack doit être utilisé dans un TrackProvider');
  return v;
}

// Un magasin de progression par parcours, créé sans charger le contenu pédagogique.
import { aiStore, createProgressStore } from '../agentic/state.ts';
import type { ProgressStore } from '../agentic/state.ts';
import { TRACKS } from './meta.ts';

export const STORES: Record<string, ProgressStore> = Object.fromEntries(
  TRACKS.map((t) => [t.id, t.id === 'ia' ? aiStore : createProgressStore(t.storageKey)]),
);

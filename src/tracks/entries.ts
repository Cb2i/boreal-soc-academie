import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { Route } from '../router.ts';

/** Chaque parcours est chargé à la demande : son contenu n'alourdit pas l'accueil. */
export const TRACK_ENTRIES: Record<string, LazyExoticComponent<ComponentType<{ route: Route }>>> = {
  ia: lazy(() => import('./ia.tsx')),
  xdr: lazy(() => import('./xdr.tsx')),
  intune: lazy(() => import('./intune.tsx')),
  'defender-cloud': lazy(() => import('./mdc.tsx')),
  scenarios: lazy(() => import('./scenarios.tsx')),
};

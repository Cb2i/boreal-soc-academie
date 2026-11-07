import { useEffect, useState } from 'react';
import type { Flow } from './types.ts';

type FlowMap = Record<string, Flow>;

/** Un chunk par groupe de schémas : une leçon n'en charge qu'un seul (celui de son parcours). */
const LOADERS: Record<string, () => Promise<Flow[]>> = {
  azure: () => import('./azure.ts').then((m) => m.FLOWS_AZURE),
  ia: () => import('./iaFlows.ts').then((m) => m.FLOWS_IA),
  xdr: () => import('./xdrFlows.ts').then((m) => m.FLOWS_XDR),
  intune: () => import('./intuneFlows.ts').then((m) => m.FLOWS_INTUNE),
  mdc: () => import('./mdcFlows.ts').then((m) => m.FLOWS_MDC),
  scenarios: () => import('./scenarios.ts').then((m) => m.FLOWS_SCEN),
};

const cache: Record<string, FlowMap> = {};
const pending: Record<string, Promise<FlowMap>> = {};

/**
 * Charge à la demande les schémas animés d'un groupe ('azure' ou l'id d'un parcours) :
 * ils ne pèsent plus sur l'accueil ni sur les pages qui n'ouvrent aucune leçon.
 */
export function loadFlows(group: string): Promise<FlowMap> {
  const load = LOADERS[group];
  if (!load) return Promise.resolve({});
  return (pending[group] ??= load().then((flows) => (cache[group] = Object.fromEntries(flows.map((f) => [f.lesson, f])))));
}

/** Schéma animé d'une leçon (undefined tant que le chunk charge ou si la leçon n'en a pas). */
export function useFlow(lessonId: string, group: string): Flow | undefined {
  const [map, setMap] = useState<FlowMap | undefined>(cache[group]);
  useEffect(() => {
    if (cache[group]) {
      setMap(cache[group]);
      return;
    }
    setMap(undefined);
    let alive = true;
    void loadFlows(group).then((m) => {
      if (alive) setMap(m);
    });
    return () => {
      alive = false;
    };
  }, [group]);
  return map?.[lessonId];
}

// Fichier généré par scripts/f-apply.ts : ne pas éditer.
// Révision rédactionnelle du français (registre soutenu) : phrase d'origine -> phrase révisée.
type Dict = Record<string, string>;
const LOADERS: Record<string, (() => Promise<{ default: Dict }>)[]> = {
  ia: [() => import('./dictfr/ia/000.json'), () => import('./dictfr/ia/001.json')],
  intune: [() => import('./dictfr/intune/000.json'), () => import('./dictfr/intune/001.json')],
  mdc: [() => import('./dictfr/mdc/000.json'), () => import('./dictfr/mdc/001.json')],
  scenarios: [() => import('./dictfr/scenarios/000.json'), () => import('./dictfr/scenarios/001.json'), () => import('./dictfr/scenarios/002.json')],
  xdr: [() => import('./dictfr/xdr/000.json'), () => import('./dictfr/xdr/001.json')],
};

export async function loadDictFr(track: string): Promise<Dict> {
  const parts = await Promise.all((LOADERS[track] ?? []).map((f) => f()));
  return Object.assign({}, ...parts.map((p) => p.default));
}

// Fichier généré par scripts/f-apply.ts : ne pas éditer.
// Révision rédactionnelle du français (registre soutenu) : phrase d'origine -> phrase révisée.
type Dict = Record<string, string>;
const LOADERS: Record<string, (() => Promise<{ default: Dict }>)[]> = {
  ia: [() => import('./dictfr/ia/000.json'), () => import('./dictfr/ia/001.json'), () => import('./dictfr/ia/002.json'), () => import('./dictfr/ia/003.json'), () => import('./dictfr/ia/004.json'), () => import('./dictfr/ia/005.json')],
  intune: [() => import('./dictfr/intune/000.json'), () => import('./dictfr/intune/001.json'), () => import('./dictfr/intune/002.json'), () => import('./dictfr/intune/003.json'), () => import('./dictfr/intune/004.json'), () => import('./dictfr/intune/005.json')],
  mdc: [() => import('./dictfr/mdc/000.json'), () => import('./dictfr/mdc/001.json'), () => import('./dictfr/mdc/002.json'), () => import('./dictfr/mdc/003.json'), () => import('./dictfr/mdc/004.json'), () => import('./dictfr/mdc/005.json')],
  scenarios: [() => import('./dictfr/scenarios/000.json'), () => import('./dictfr/scenarios/001.json'), () => import('./dictfr/scenarios/002.json'), () => import('./dictfr/scenarios/003.json'), () => import('./dictfr/scenarios/004.json'), () => import('./dictfr/scenarios/005.json')],
  xdr: [() => import('./dictfr/xdr/000.json'), () => import('./dictfr/xdr/001.json'), () => import('./dictfr/xdr/002.json'), () => import('./dictfr/xdr/003.json'), () => import('./dictfr/xdr/004.json'), () => import('./dictfr/xdr/005.json')],
};

export async function loadDictFr(track: string): Promise<Dict> {
  const parts = await Promise.all((LOADERS[track] ?? []).map((f) => f()));
  return Object.assign({}, ...parts.map((p) => p.default));
}

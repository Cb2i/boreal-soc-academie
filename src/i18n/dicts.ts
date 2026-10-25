// Fichier généré par scripts/t-apply.ts : ne pas éditer.
// Chargement différé des dictionnaires anglais des parcours (un dossier par parcours, plusieurs fichiers JSON).
type Dict = Record<string, string>;
const LOADERS: Record<string, (() => Promise<{ default: Dict }>)[]> = {
  ia: [() => import('./dict/ia/000.json')],
  intune: [() => import('./dict/intune/000.json')],
  mdc: [() => import('./dict/mdc/000.json')],
  scenarios: [() => import('./dict/scenarios/000.json'), () => import('./dict/scenarios/001.json'), () => import('./dict/scenarios/002.json'), () => import('./dict/scenarios/003.json'), () => import('./dict/scenarios/004.json'), () => import('./dict/scenarios/005.json'), () => import('./dict/scenarios/006.json'), () => import('./dict/scenarios/007.json')],
  xdr: [() => import('./dict/xdr/000.json')],
};

export async function loadDict(track: string): Promise<Dict> {
  const parts = await Promise.all((LOADERS[track] ?? []).map((f) => f()));
  return Object.assign({}, ...parts.map((p) => p.default));
}

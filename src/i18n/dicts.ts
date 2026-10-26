// Fichier généré par scripts/t-apply.ts : ne pas éditer.
// Chargement différé des dictionnaires anglais des parcours (un dossier par parcours, plusieurs fichiers JSON).
type Dict = Record<string, string>;
const LOADERS: Record<string, (() => Promise<{ default: Dict }>)[]> = {
  ia: [() => import('./dict/ia/000.json')],
  intune: [() => import('./dict/intune/000.json')],
  mdc: [() => import('./dict/mdc/000.json'), () => import('./dict/mdc/001.json'), () => import('./dict/mdc/002.json'), () => import('./dict/mdc/003.json'), () => import('./dict/mdc/004.json'), () => import('./dict/mdc/005.json'), () => import('./dict/mdc/006.json'), () => import('./dict/mdc/007.json'), () => import('./dict/mdc/008.json'), () => import('./dict/mdc/009.json'), () => import('./dict/mdc/010.json'), () => import('./dict/mdc/011.json'), () => import('./dict/mdc/012.json'), () => import('./dict/mdc/013.json'), () => import('./dict/mdc/014.json'), () => import('./dict/mdc/015.json'), () => import('./dict/mdc/016.json'), () => import('./dict/mdc/017.json'), () => import('./dict/mdc/018.json'), () => import('./dict/mdc/019.json'), () => import('./dict/mdc/020.json'), () => import('./dict/mdc/021.json'), () => import('./dict/mdc/022.json'), () => import('./dict/mdc/023.json'), () => import('./dict/mdc/024.json'), () => import('./dict/mdc/025.json'), () => import('./dict/mdc/026.json'), () => import('./dict/mdc/027.json')],
  scenarios: [() => import('./dict/scenarios/000.json'), () => import('./dict/scenarios/001.json'), () => import('./dict/scenarios/002.json'), () => import('./dict/scenarios/003.json'), () => import('./dict/scenarios/004.json'), () => import('./dict/scenarios/005.json'), () => import('./dict/scenarios/006.json'), () => import('./dict/scenarios/007.json')],
  xdr: [() => import('./dict/xdr/000.json'), () => import('./dict/xdr/001.json'), () => import('./dict/xdr/002.json'), () => import('./dict/xdr/003.json'), () => import('./dict/xdr/004.json'), () => import('./dict/xdr/005.json'), () => import('./dict/xdr/006.json'), () => import('./dict/xdr/007.json'), () => import('./dict/xdr/008.json'), () => import('./dict/xdr/009.json'), () => import('./dict/xdr/010.json'), () => import('./dict/xdr/011.json'), () => import('./dict/xdr/012.json'), () => import('./dict/xdr/013.json'), () => import('./dict/xdr/014.json'), () => import('./dict/xdr/015.json'), () => import('./dict/xdr/016.json'), () => import('./dict/xdr/017.json'), () => import('./dict/xdr/018.json'), () => import('./dict/xdr/019.json'), () => import('./dict/xdr/020.json'), () => import('./dict/xdr/021.json'), () => import('./dict/xdr/022.json'), () => import('./dict/xdr/023.json'), () => import('./dict/xdr/024.json')],
};

export async function loadDict(track: string): Promise<Dict> {
  const parts = await Promise.all((LOADERS[track] ?? []).map((f) => f()));
  return Object.assign({}, ...parts.map((p) => p.default));
}

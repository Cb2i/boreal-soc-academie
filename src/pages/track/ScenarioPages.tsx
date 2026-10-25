import { useTrack } from '../../agentic/TrackContext.tsx';
import { SCENARIOS } from '../../msec/scenarios/index.ts';
import type { ScenarioDef, ScenarioSheet } from '../../msec/scenarios/def.ts';
import { NATURE_LABELS } from '../../msec/types.ts';
import { CONSULTED, SOURCE_BY_ID } from '../../msec/sources.ts';
import { tr } from '../../i18n/lang.ts';
import { parseHash } from '../../router.ts';

/** Rubriques d’une fiche de décision, dans l’ordre de lecture. */
export const SHEET_FIELDS: { key: keyof ScenarioSheet; fr: string; en: string }[] = [
  { key: 'need', fr: 'Besoin d’affaires', en: 'Business need' },
  { key: 'threat', fr: 'Menace visée', en: 'Threat' },
  { key: 'signal', fr: 'Source du signal', en: 'Signal source' },
  { key: 'deciding', fr: 'Produit qui décide', en: 'Deciding product' },
  { key: 'portal', fr: 'Portail de configuration', en: 'Configuration portal' },
  { key: 'enforcing', fr: 'Composant qui applique', en: 'Enforcing component' },
  { key: 'evidence', fr: 'Produit de preuve', en: 'Evidence product' },
  { key: 'dependencies', fr: 'Connecteurs et dépendances', en: 'Connectors and dependencies' },
  { key: 'delays', fr: 'Délais et conditions', en: 'Delays and conditions' },
  { key: 'failures', fr: 'Échecs possibles', en: 'Possible failures' },
  { key: 'verification', fr: 'Vérification', en: 'Verification' },
  { key: 'rollback', fr: 'Retour arrière', en: 'Rollback' },
  { key: 'limits', fr: 'Limites et incertitudes', en: 'Limits and uncertainties' },
];

/** Catalogue des scénarios : une ligne par fiche, avec les trois rôles en vue. */
export function CataloguePage() {
  const { meta, to } = useTrack();
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <span aria-current="page">{tr('Catalogue', 'Catalog')}</span></nav>
      <h1>{tr('Catalogue des fiches de décision', 'Decision sheet catalog')}</h1>
      <p className="muted">{tr('Chaque scénario a une fiche de décision : besoin, menace, signal, produit qui décide, composant qui applique, produit de preuve, dépendances, délais, échecs, vérification et retour arrière. Les fiches sont des lectures pédagogiques fondées sur la documentation citée, pas des procédures validées dans un locataire réel.', 'Each scenario has a decision sheet. The sheets are teaching readings of the cited documentation, not procedures validated in a real tenant.')}</p>
      <div className="table-wrap">
        <table className="grid-table">
          <thead><tr><th scope="col">{tr('Scénario', 'Scenario')}</th><th scope="col">{tr('Décide', 'Decides')}</th><th scope="col">{tr('Applique', 'Enforces')}</th><th scope="col">{tr('Preuve', 'Evidence')}</th><th scope="col">{tr('Nature', 'Nature')}</th></tr></thead>
          <tbody>
            {SCENARIOS.map((s) => (
              <tr key={s.id}>
                <th scope="row"><a href={to('fiche', s.id)}>{s.title}</a></th>
                <td>{s.sheet.deciding}</td>
                <td>{s.sheet.enforcing}</td>
                <td>{s.sheet.evidence}</td>
                <td>{NATURE_LABELS[s.sheet.nature]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SheetBody({ s }: { s: ScenarioDef }) {
  const { to } = useTrack();
  const sources = s.sheet.sources.map((id) => SOURCE_BY_ID[id]).filter(Boolean);
  return (
    <>
      <div className="table-wrap">
        <table className="grid-table">
          <tbody>
            {SHEET_FIELDS.map((f) => (
              <tr key={f.key}><th scope="row">{tr(f.fr, f.en)}</th><td>{s.sheet[f.key] as string}</td></tr>
            ))}
            <tr><th scope="row">{tr('Nature dominante', 'Dominant nature')}</th><td>{NATURE_LABELS[s.sheet.nature]}</td></tr>
          </tbody>
        </table>
      </div>
      <h2>{tr('Sources', 'Sources')}</h2>
      <p className="muted">{tr(`Pages consultées le ${CONSULTED}. Revérifiez la date et le statut avant de vous appuyer sur une source.`, `Pages consulted on ${CONSULTED}.`)}</p>
      <ul>
        {sources.map((x) => <li key={x.id}><a href={x.url} target="_blank" rel="noreferrer noopener">{x.title}</a></li>)}
      </ul>
      <p><a className="btn" href={to('module', s.id)}>{tr('Ouvrir le module du scénario', 'Open the scenario module')}</a></p>
    </>
  );
}

/** Fiche d’un scénario : #/scenarios/fiche/<id>. */
export function SheetPage() {
  const { meta, to } = useTrack();
  const id = parseHash(window.location.hash).params[1] ?? '';
  const s = SCENARIOS.find((x) => x.id === id);
  if (!s) {
    return (
      <div className="state" role="alert">
        <h2>{tr('Fiche introuvable', 'Sheet not found')}</h2>
        <a className="btn" href={to('catalogue')}>{tr('Retour au catalogue', 'Back to the catalog')}</a>
      </div>
    );
  }
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <a href={to('catalogue')}>{tr('Catalogue', 'Catalog')}</a> / <span aria-current="page">{s.title}</span></nav>
      <h1>{tr('Fiche de décision : ', 'Decision sheet: ')}{s.title}</h1>
      <p className="muted">{s.summary}</p>
      <SheetBody s={s} />
    </div>
  );
}

import { useTrack } from '../../agentic/TrackContext.tsx';
import { CONSULTED, SOURCES } from '../../msec/sources.ts';
import { tr } from '../../i18n/lang.ts';

const STATUS: Record<string, string> = {
  ga: 'Disponibilité générale',
  preview: 'Préversion',
  'retrait-annonce': 'Retrait annoncé',
  reference: 'Référence',
  communautaire: 'Communautaire',
};

/** Registre des sources : chaque fait Microsoft du parcours renvoie à une entrée datée. */
export function SourcesPage() {
  const { meta, to } = useTrack();
  const rows = SOURCES.filter((s) => meta.id === 'scenarios' || s.id.startsWith(meta.id === 'xdr' ? 'xdr-' : 'intune-') || s.id.startsWith('sentinel-'));
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <span aria-current="page">{tr('Sources', 'Sources')}</span></nav>
      <h1>{tr('Registre des sources', 'Source registry')}</h1>
      <p className="muted">{tr(`Pages consultées le ${CONSULTED}. La documentation Microsoft évolue : revérifiez la date, le statut (disponibilité générale, préversion, retrait annoncé) et l’incertitude avant de vous appuyer sur une source. Voir la procédure de revue après une mise à jour Microsoft dans la documentation du dépôt.`, `Pages consulted on ${CONSULTED}. Microsoft documentation changes: recheck date and status before relying on a source.`)}</p>
      <div className="table-wrap">
        <table className="grid-table">
          <thead><tr><th scope="col">{tr('Titre', 'Title')}</th><th scope="col">{tr('Produit', 'Product')}</th><th scope="col">{tr('Sujet', 'Topic')}</th><th scope="col">{tr('Statut', 'Status')}</th><th scope="col">{tr('Consultée le', 'Consulted')}</th><th scope="col">{tr('Incertitude', 'Uncertainty')}</th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td><a href={s.url} target="_blank" rel="noreferrer noopener">{s.title}</a></td>
                <td>{s.product}</td>
                <td>{s.topic}</td>
                <td>{STATUS[s.status] ?? s.status}</td>
                <td>{CONSULTED}</td>
                <td>{s.uncertainty ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

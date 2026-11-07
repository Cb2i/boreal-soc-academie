import { useMemo, useState } from 'react';
import { useTrack } from '../../agentic/TrackContext.tsx';
import { GROUPS, USE_CASES } from '../../msec/purview/usecases/index.ts';
import type { UcGroup } from '../../msec/purview/usecases/index.ts';
import { SOURCE_BY_ID } from '../../msec/sources.ts';
import { tr } from '../../i18n/lang.ts';

/** Catalogue des cas d'usage Purview : recherche, filtre par thème, fiches repliables avec étapes, test, pièges et sources. */
export function UseCasesPage() {
  const { meta, to } = useTrack();
  const [text, setText] = useState('');
  const [group, setGroup] = useState<UcGroup | 'all'>('all');
  const q = text.trim().toLowerCase();
  const list = useMemo(() => USE_CASES.filter((x) => (group === 'all' || x.group === group)
    && (!q || `${x.title} ${x.goal} ${x.steps.join(' ')} ${x.pitfalls}`.toLowerCase().includes(q))), [q, group]);
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <span aria-current="page">{tr('Cas d’usage', 'Use cases')}</span></nav>
      <h1>{tr('Cas d’usage Microsoft Purview', 'Microsoft Purview use cases')}</h1>
      <p className="muted">{tr(`${USE_CASES.length} cas d’usage tirés de la documentation Microsoft Learn : détection des cartes de crédit, étiquettes, DLP, gouvernance de l’IA et de Copilot, surpartage, risques internes, rétention, audit, eDiscovery, gouvernance des données et enquêtes. Chaque fiche donne l’objectif, la licence, les prérequis, les étapes, le test, les pièges et les sources. Les écrans changent souvent : vérifier dans votre locataire, en simulation d’abord. Rien ici n’a été validé dans un locataire réel.`, 'Purview use cases, French only for now.')}</p>
      <div className="row">
        <label className="small">{tr('Recherche', 'Search')} <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={tr('carte de crédit, Copilot, USB', 'credit card, Copilot, USB')} /></label>
        <label className="small">{tr('Thème', 'Theme')}{' '}
          <select value={group} onChange={(e) => setGroup(e.target.value as UcGroup | 'all')}>
            <option value="all">{tr('Tous', 'All')} ({USE_CASES.length})</option>
            {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.title} ({USE_CASES.filter((x) => x.group === g.id).length})</option>)}
          </select>
        </label>
      </div>
      {GROUPS.map((g) => {
        const items = list.filter((x) => x.group === g.id);
        if (!items.length) return null;
        return (
          <section key={g.id} className="stack" aria-labelledby={`uc-${g.id}`}>
            <h2 id={`uc-${g.id}`}>{g.title}</h2>
            <p className="muted small">{g.intro}</p>
            {items.map((x) => (
              <details key={x.id} className="card" id={x.id}>
                <summary><strong>{x.title}</strong> <span className="pill">{x.level}</span></summary>
                <p>{x.goal}</p>
                <div className="table-wrap">
                  <table className="grid-table">
                    <tbody>
                      <tr><th scope="row">{tr('Licence', 'Licence')}</th><td>{x.licence}</td></tr>
                      <tr><th scope="row">{tr('Prérequis', 'Prerequisites')}</th><td>{x.prereq}</td></tr>
                      <tr><th scope="row">{tr('Configuration', 'Configuration')}</th><td><ol>{x.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></td></tr>
                      <tr><th scope="row">{tr('Test', 'Test')}</th><td>{x.test}</td></tr>
                      <tr><th scope="row">{tr('Pièges', 'Pitfalls')}</th><td>{x.pitfalls}</td></tr>
                      <tr><th scope="row">{tr('Sources', 'Sources')}</th><td>{x.sources.map((s, i) => { const r = SOURCE_BY_ID[`purview-${s}`]; return r ? <span key={s}>{i > 0 ? ' ; ' : ''}<a href={r.url} target="_blank" rel="noreferrer noopener">{r.title.replace('Microsoft Learn : ', '')}</a></span> : null; })}</td></tr>
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </section>
        );
      })}
      {!list.length && <p className="muted">{tr('Aucun cas ne correspond.', 'No matching case.')}</p>}
      <p className="muted small">{list.length} / {USE_CASES.length} {tr('cas affichés', 'cases shown')}</p>
    </div>
  );
}

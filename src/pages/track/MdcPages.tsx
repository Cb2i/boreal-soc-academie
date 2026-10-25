import { useMemo, useState } from 'react';
import { useTrack } from '../../agentic/TrackContext.tsx';
import { CAPABILITIES } from '../../msec/mdc/caps/index.ts';
import { SHEETS } from '../../msec/mdc/sheets/index.ts';
import { SCENARIOS_MDC } from '../../msec/mdc/scenarios.ts';
import { CHANGELOG, LIMITS, TEST_LOG, UPDATE_PROCEDURE } from '../../msec/mdc/limits.ts';
import { SCOPE_DATE, SCOPE_VERSION, SCENARIO_FAMILIES, SHEET_POINTS } from '../../msec/mdc/model.ts';
import type { MdcCapability } from '../../msec/mdc/model.ts';
import { NATURE_LABELS } from '../../msec/types.ts';
import { SOURCE_BY_ID } from '../../msec/sources.ts';
import { tr } from '../../i18n/lang.ts';
import { parseHash } from '../../router.ts';

const DOC: Record<string, string> = { verifiee: 'Vérifiée', partielle: 'Partielle', 'non-verifiee': 'Non vérifiée' };
const WRITE: Record<string, string> = { redigee: 'Rédigée', planifiee: 'Planifiée', exclue: 'Exclue' };
const IMPL: Record<string, string> = { implementee: 'Implémentée', partielle: 'Partielle', non: 'Non' };
const SIM: Record<string, string> = { simulee: 'Simulée', non: 'Non' };
const LAB: Record<string, string> = { 'non-realisee': 'Non réalisée', realisee: 'Réalisée' };
const tone = (ok: boolean) => (ok ? 'pill ok' : 'pill warn');

const crumbs = (to: (...p: string[]) => string, nav: string, here: string, parent?: [string, string]) => (
  <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{nav}</a> / {parent && <><a href={parent[0]}>{parent[1]}</a> / </>}<span aria-current="page">{here}</span></nav>
);

function download(name: string, mime: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

/** Matrice de capacités : version de référence, statuts séparés, filtres et export. Générée depuis les données du dépôt. */
export function CapabilitiesPage() {
  const { meta, to, c } = useTrack();
  const [mod, setMod] = useState('');
  const [nat, setNat] = useState('');
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const rows = useMemo(() => CAPABILITIES.filter((x) => (!mod || x.module === mod) && (!nat || x.nature === nat) && (!pending || x.status.redaction !== 'redigee') && (!text || `${x.id} ${x.title} ${x.plan} ${x.clouds}`.toLowerCase().includes(text.toLowerCase()))), [mod, nat, text, pending]);
  const count = (f: (x: MdcCapability) => boolean) => CAPABILITIES.filter(f).length;
  const moduleOf = (m: string) => c.MODULE_BY_ID[m];
  const exportJson = () => download(`matrice-capacites-${SCOPE_VERSION}.json`, 'application/json', JSON.stringify({ version: SCOPE_VERSION, date: SCOPE_DATE, capacities: CAPABILITIES }, null, 2));
  return (
    <div className="stack">
      {crumbs(to, tr(meta.navFr, meta.navEn), tr('Capacités', 'Capabilities'))}
      <h1>{tr('Matrice de capacités', 'Capability matrix')}</h1>
      <p className="muted">{tr(`Version de référence du périmètre : ${SCOPE_VERSION} (${SCOPE_DATE}). Chaque capacité porte cinq statuts séparés : recherche documentaire, rédaction, implémentation, test de simulation et validation en laboratoire réel. Une simulation réussie ne valide pas un déploiement Microsoft réel : la validation en laboratoire réel est « non réalisée » partout.`, `Reference scope version ${SCOPE_VERSION}. Five separate statuses per capability.`)}</p>
      <div className="row" role="group" aria-label={tr('Synthèse des statuts', 'Status summary')}>
        <span className="pill info">{CAPABILITIES.length} {tr('capacités', 'capabilities')}</span>
        <span className="pill">{tr('Documentation vérifiée', 'Doc verified')} : {count((x) => x.status.doc === 'verifiee')}</span>
        <span className="pill">{tr('Partielle', 'Partial')} : {count((x) => x.status.doc === 'partielle')}</span>
        <span className="pill">{tr('Rédigées', 'Written')} : {count((x) => x.status.redaction === 'redigee')}</span>
        <span className="pill">{tr('Planifiées ou exclues', 'Planned or excluded')} : {count((x) => x.status.redaction !== 'redigee')}</span>
        <span className="pill">{tr('Simulées', 'Simulated')} : {count((x) => x.status.simulation === 'simulee')}</span>
        <span className="pill warn">{tr('Laboratoire réel réalisé', 'Real lab done')} : {count((x) => x.status.lab === 'realisee')}</span>
      </div>
      <div className="row" role="search" aria-label={tr('Filtres de la matrice', 'Matrix filters')}>
        <label className="small">{tr('Module', 'Module')} <select value={mod} onChange={(e) => setMod(e.target.value)}><option value="">{tr('Tous', 'All')}</option>{c.MODULES.map((m) => <option key={m.id} value={m.id}>{m.n}. {m.title}</option>)}</select></label>
        <label className="small">{tr('Nature', 'Nature')} <select value={nat} onChange={(e) => setNat(e.target.value)}><option value="">{tr('Toutes', 'All')}</option>{Object.entries(NATURE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label className="small">{tr('Recherche', 'Search')} <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={tr('plan, cloud, titre', 'plan, cloud, title')} /></label>
        <label className="small"><input type="checkbox" checked={pending} onChange={(e) => setPending(e.target.checked)} /> {tr('Planifiées ou exclues seulement', 'Planned or excluded only')}</label>
        <button className="btn" type="button" onClick={exportJson}>{tr('Exporter en JSON', 'Export JSON')}</button>
      </div>
      <p className="muted small" aria-live="polite">{rows.length} {tr('capacité(s) affichée(s)', 'shown')}</p>
      {rows.map((x) => {
        const m = moduleOf(x.module);
        const lessons = x.lessons.map((id) => c.LESSON_BY_ID[id]).filter(Boolean);
        const exCount = c.EXERCISES.filter((e) => x.lessons.includes(e.lesson ?? '') && ['guided', 'autonomous', 'quiz'].includes(e.role)).length;
        const projects = c.PROJECTS.filter((p) => p.module === x.module);
        return (
          <details key={x.id} className="card">
            <summary><strong>{x.title}</strong> <span className="muted small">{x.id}</span> <span className="pill info">{NATURE_LABELS[x.nature]}</span> <span className={tone(x.status.doc === 'verifiee')}>{DOC[x.status.doc]}</span> <span className={tone(x.status.redaction === 'redigee')}>{WRITE[x.status.redaction]}</span></summary>
            <div className="table-wrap">
              <table className="grid-table">
                <tbody>
                  <tr><th scope="row">{tr('Module', 'Module')}</th><td>{m ? <a href={to('module', m.id)}>{m.n}. {m.title}</a> : x.module}</td></tr>
                  <tr><th scope="row">{tr('Plan ou composant', 'Plan or component')}</th><td>{x.plan}</td></tr>
                  <tr><th scope="row">{tr('Objectif', 'Objective')}</th><td>{x.objective}</td></tr>
                  <tr><th scope="row">{tr('Risque traité', 'Risk addressed')}</th><td>{x.risk}</td></tr>
                  <tr><th scope="row">{tr('Cloud et workload', 'Cloud and workload')}</th><td>{x.clouds}</td></tr>
                  <tr><th scope="row">{tr('Périmètre de configuration', 'Configuration scope')}</th><td>{x.scope}</td></tr>
                  <tr><th scope="row">{tr('Prérequis', 'Prerequisites')}</th><td>{x.prerequisites}</td></tr>
                  <tr><th scope="row">{tr('Permissions', 'Permissions')}</th><td>{x.permissions}</td></tr>
                  <tr><th scope="row">{tr('Coûts et dépendances', 'Costs and dependencies')}</th><td>{x.costs}</td></tr>
                  <tr><th scope="row">{tr('Mode de collecte ou de protection', 'Collection mode')}</th><td>{x.collection}</td></tr>
                  <tr><th scope="row">{tr('Compatibilité', 'Compatibility')}</th><td>{x.compatibility}</td></tr>
                  <tr><th scope="row">{tr('Limites', 'Limits')}</th><td>{x.limits}</td></tr>
                  <tr><th scope="row">{tr('Sources et date', 'Sources and date')}</th><td>{x.sources.map((s, i) => { const src = SOURCE_BY_ID[`mdc-${s}`]; return src ? <span key={s}>{i > 0 ? ' ; ' : ''}<a href={src.url} target="_blank" rel="noreferrer noopener">{src.title.replace('Microsoft Learn : ', '')}</a></span> : null; })} ({x.verified})</td></tr>
                  <tr><th scope="row">{tr('Cours', 'Course')}</th><td>{lessons.length ? lessons.map((l, i) => <span key={l.id}>{i > 0 ? ' ; ' : ''}<a href={to('cours', l.id)}>{l.title}</a></span>) : '-'}</td></tr>
                  <tr><th scope="row">{tr('Exercices', 'Exercises')}</th><td>{exCount}</td></tr>
                  <tr><th scope="row">{tr('Évaluation', 'Assessment')}</th><td>{m ? <a href={to('evaluation', m.id)}>{tr('Évaluation du module', 'Module assessment')}</a> : '-'}</td></tr>
                  <tr><th scope="row">{tr('Projets', 'Projects')}</th><td>{projects.length ? projects.map((p, i) => <span key={p.id}>{i > 0 ? ' ; ' : ''}<a href={to('projet', p.id)}>{p.title}</a></span>) : '-'}</td></tr>
                  <tr><th scope="row">{tr('Statuts', 'Statuses')}</th><td className="row"><span className={tone(x.status.doc === 'verifiee')}>{tr('Documentation', 'Doc')} : {DOC[x.status.doc]}</span><span className={tone(x.status.redaction === 'redigee')}>{tr('Rédaction', 'Writing')} : {WRITE[x.status.redaction]}</span><span className={tone(x.status.implementation === 'implementee')}>{tr('Implémentation', 'Implementation')} : {IMPL[x.status.implementation]}</span><span className={tone(x.status.simulation === 'simulee')}>{tr('Simulation', 'Simulation')} : {SIM[x.status.simulation]}</span><span className="pill warn">{tr('Laboratoire réel', 'Real lab')} : {LAB[x.status.lab]}</span></td></tr>
                  {x.note && <tr><th scope="row">{tr('Justification', 'Justification')}</th><td>{x.note}</td></tr>}
                </tbody>
              </table>
            </div>
          </details>
        );
      })}
    </div>
  );
}

/** Liste des fiches de configuration à 22 points. */
export function SheetsPage() {
  const { meta, to, c } = useTrack();
  const [text, setText] = useState('');
  const rows = SHEETS.filter((s) => !text || `${s.title} ${s.plan}`.toLowerCase().includes(text.toLowerCase()));
  return (
    <div className="stack">
      {crumbs(to, tr(meta.navFr, meta.navEn), tr('Fiches', 'Sheets'))}
      <h1>{tr('Fiches de configuration à 22 points', '22-point configuration sheets')}</h1>
      <p className="muted">{tr('Chaque configuration enseignée a sa fiche : de l’objectif au retour arrière, avec la distinction entre plan activé, ressource éligible, ressource couverte, données collectées et fonction opérationnelle. Les chemins de portail sont ceux de la documentation consultée : ils changent, revérifiez-les.', 'Each configuration has a 22-point sheet.')}</p>
      <label className="small">{tr('Recherche', 'Search')} <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={tr('plan ou titre', 'plan or title')} /></label>
      <div className="table-wrap">
        <table className="grid-table">
          <thead><tr><th scope="col">{tr('Fiche', 'Sheet')}</th><th scope="col">{tr('Plan', 'Plan')}</th><th scope="col">{tr('Module', 'Module')}</th></tr></thead>
          <tbody>
            {rows.map((s) => <tr key={s.id}><th scope="row"><a href={to('fiche', s.id)}>{s.title}</a></th><td>{s.plan}</td><td>{c.MODULE_BY_ID[s.module] ? <a href={to('module', s.module)}>{c.MODULE_BY_ID[s.module].n}. {c.MODULE_BY_ID[s.module].title}</a> : s.module}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p className="muted small">{rows.length} {tr('fiche(s)', 'sheet(s)')}</p>
    </div>
  );
}

const STATE_OF: Record<number, string> = { 6: 'Ressource éligible (avec le point 7)', 7: 'Ressource éligible', 15: 'Plan activé', 16: 'Ressource effectivement couverte', 17: 'Fonction opérationnelle', 18: 'Données collectées' };

/** Fiche d’une configuration : #/defender-cloud/fiche/<id>. */
export function SheetPage() {
  const { meta, to, c } = useTrack();
  const id = parseHash(window.location.hash).params[1] ?? '';
  const s = SHEETS.find((x) => x.id === id);
  if (!s) return <div className="state" role="alert"><h2>{tr('Fiche introuvable', 'Sheet not found')}</h2><a className="btn" href={to('fiches')}>{tr('Retour aux fiches', 'Back to sheets')}</a></div>;
  const src = s.sources.map((x) => SOURCE_BY_ID[`mdc-${x}`]).filter(Boolean);
  const m = c.MODULE_BY_ID[s.module];
  return (
    <div className="stack">
      {crumbs(to, tr(meta.navFr, meta.navEn), s.title, [to('fiches'), tr('Fiches', 'Sheets')])}
      <h1>{tr('Fiche de configuration : ', 'Configuration sheet: ')}{s.title}</h1>
      <p className="muted">{tr('Plan : ', 'Plan: ')}{s.plan}. {tr('Fiche pédagogique : aucune de ces étapes n’a été exécutée dans un environnement Microsoft réel. Les chemins de portail et les valeurs par défaut sont ceux de la documentation consultée à la date des sources.', 'Teaching sheet, not executed in a real environment.')}</p>
      <div className="table-wrap">
        <table className="grid-table">
          <tbody>
            {s.points.map((p, i) => (
              <tr key={i}><th scope="row">{i + 1}. {SHEET_POINTS[i]}{STATE_OF[i + 1] && <div className="muted small">{STATE_OF[i + 1]}</div>}</th><td>{p}</td></tr>
            ))}
            <tr><th scope="row">22. {SHEET_POINTS[21]}</th><td><ul>{src.map((x) => <li key={x.id}><a href={x.url} target="_blank" rel="noreferrer noopener">{x.title.replace('Microsoft Learn : ', '')}</a> ({x.consulted}){x.uncertainty ? ` : ${x.uncertainty}` : ''}</li>)}</ul></td></tr>
          </tbody>
        </table>
      </div>
      <div className="row">
        {m && <a className="btn" href={to('module', m.id)}>{tr('Ouvrir le module', 'Open the module')}</a>}
        {s.lessons.map((l) => c.LESSON_BY_ID[l] && <a key={l} className="btn" href={to('cours', l)}>{c.LESSON_BY_ID[l].title}</a>)}
      </div>
    </div>
  );
}

/** Catalogue des scénarios transversaux, regroupés par famille. */
export function ScenariosPage() {
  const { meta, to, c } = useTrack();
  return (
    <div className="stack">
      {crumbs(to, tr(meta.navFr, meta.navEn), tr('Scénarios', 'Scenarios'))}
      <h1>{tr('Catalogue des scénarios transversaux', 'Cross-cutting scenario catalog')}</h1>
      <p className="muted">{tr('Les scénarios relient les modules. Pour chacun : besoin métier, architecture, responsabilités des produits, configuration, test, preuves attendues, investigation, dépannage et évaluation. Une alerte absente n’est jamais une preuve suffisante que tout fonctionne.', 'Scenarios that link modules.')}</p>
      {SCENARIO_FAMILIES.map((f) => {
        const list = SCENARIOS_MDC.filter((s) => s.family === f);
        if (!list.length) return null;
        return (
          <section key={f} className="stack" aria-labelledby={`fam-${f}`}>
            <h2 id={`fam-${f}`}>{f}</h2>
            {list.map((s) => (
              <details key={s.id} className="card">
                <summary><strong>{s.title}</strong> <span className="pill">{s.clouds}</span></summary>
                <div className="table-wrap">
                  <table className="grid-table">
                    <tbody>
                      <tr><th scope="row">{tr('Besoin métier', 'Business need')}</th><td>{s.need}</td></tr>
                      <tr><th scope="row">{tr('Architecture', 'Architecture')}</th><td>{s.architecture}</td></tr>
                      <tr><th scope="row">{tr('Responsabilités des produits', 'Product responsibilities')}</th><td>{s.responsibilities}</td></tr>
                      <tr><th scope="row">{tr('Configuration', 'Configuration')}</th><td>{s.configuration}</td></tr>
                      <tr><th scope="row">{tr('Test', 'Test')}</th><td>{s.test}</td></tr>
                      <tr><th scope="row">{tr('Preuves attendues', 'Expected evidence')}</th><td>{s.evidence}</td></tr>
                      <tr><th scope="row">{tr('Investigation', 'Investigation')}</th><td>{s.investigation}</td></tr>
                      <tr><th scope="row">{tr('Dépannage', 'Troubleshooting')}</th><td>{s.troubleshooting}</td></tr>
                      <tr><th scope="row">{tr('Évaluation', 'Assessment')}</th><td>{s.evaluation}</td></tr>
                      <tr><th scope="row">{tr('Modules', 'Modules')}</th><td>{s.modules.map((m, i) => c.MODULE_BY_ID[m] ? <span key={m}>{i > 0 ? ' ; ' : ''}<a href={to('module', m)}>{c.MODULE_BY_ID[m].n}. {c.MODULE_BY_ID[m].title}</a></span> : null)}</td></tr>
                      <tr><th scope="row">{tr('Sources', 'Sources')}</th><td>{s.sources.map((x, i) => { const r = SOURCE_BY_ID[`mdc-${x}`]; return r ? <span key={x}>{i > 0 ? ' ; ' : ''}<a href={r.url} target="_blank" rel="noreferrer noopener">{r.title.replace('Microsoft Learn : ', '')}</a></span> : null; })}</td></tr>
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </section>
        );
      })}
      <p className="muted small">{SCENARIOS_MDC.length} {tr('scénarios', 'scenarios')}</p>
    </div>
  );
}

/** Limites connues, incertitudes, journal des changements, procédure de mise à jour et rapport en quatre catégories. */
export function LimitsPage() {
  const { meta, to, c } = useTrack();
  const caps = CAPABILITIES;
  const n = (f: (x: MdcCapability) => boolean) => caps.filter(f).length;
  const sourcesUsed = new Set(c.LESSONS.flatMap((l) => l.links.map((x) => x.url))).size;
  return (
    <div className="stack">
      {crumbs(to, tr(meta.navFr, meta.navEn), tr('Limites', 'Limits'))}
      <h1>{tr('Limites, journal et état des vérifications', 'Limits, changelog and verification status')}</h1>
      <h2>{tr('Rapport en quatre catégories', 'Four-category report')}</h2>
      <div className="table-wrap">
        <table className="grid-table">
          <tbody>
            <tr><th scope="row">{tr('1. Couverture documentaire', '1. Documentary coverage')}</th><td>{caps.length} {tr('capacités inventoriées (version de référence', 'capabilities (scope')} {SCOPE_VERSION}) : {n((x) => x.status.doc === 'verifiee')} {tr('vérifiées', 'verified')}, {n((x) => x.status.doc === 'partielle')} {tr('partielles', 'partial')}, {n((x) => x.status.doc === 'non-verifiee')} {tr('non vérifiées', 'unverified')} ; {sourcesUsed} {tr('pages de source citées par les leçons', 'source pages cited by lessons')}.</td></tr>
            <tr><th scope="row">{tr('2. Contenu livré', '2. Delivered content')}</th><td>{c.MODULES.length} {tr('modules sur 26', 'of 26 modules')}, {c.LESSONS.length} {tr('leçons', 'lessons')}, {c.EXERCISES.length} {tr('exercices et questions', 'exercises')}, {c.PROJECTS.length} {tr('projets et labs', 'projects')}, {SHEETS.length} {tr('fiches de configuration', 'configuration sheets')}, {SCENARIOS_MDC.length} {tr('scénarios', 'scenarios')}, {n((x) => x.status.redaction !== 'redigee')} {tr('capacités planifiées ou exclues (justifiées dans la matrice)', 'capabilities planned or excluded')}.</td></tr>
            <tr><th scope="row">{tr('3. Tests de la plateforme', '3. Platform tests')}</th><td>{TEST_LOG.length ? TEST_LOG.map((t) => `${t.date} ${t.what} : ${t.result}`).join(' ; ') : tr('Aucun test consigné pour l’instant.', 'No recorded test yet.')}</td></tr>
            <tr><th scope="row">{tr('4. Validations en laboratoire réel', '4. Real lab validations')}</th><td>{n((x) => x.status.lab === 'realisee')} {tr('sur', 'of')} {caps.length}. {tr('Une simulation réussie ne valide pas un déploiement Microsoft réel.', 'A passed simulation does not validate a real Microsoft deployment.')}</td></tr>
          </tbody>
        </table>
      </div>
      <h2>{tr('Limites connues, incertitudes et décisions', 'Known limits, uncertainties and decisions')}</h2>
      <div className="table-wrap">
        <table className="grid-table">
          <thead><tr><th scope="col">{tr('Réf.', 'Ref')}</th><th scope="col">{tr('Type', 'Kind')}</th><th scope="col">{tr('Énoncé', 'Statement')}</th><th scope="col">{tr('Impact', 'Impact')}</th></tr></thead>
          <tbody>{LIMITS.map((l) => <tr key={l.id}><th scope="row">{l.id}</th><td>{l.kind === 'limite' ? 'Limite' : l.kind === 'incertitude' ? 'Incertitude' : 'Décision'}</td><td>{l.text}</td><td>{l.impact}</td></tr>)}</tbody>
        </table>
      </div>
      <h2>{tr('Journal des changements', 'Changelog')}</h2>
      <ul>{CHANGELOG.map((e) => <li key={e.version}><strong>{e.version}</strong> ({e.date}) : {e.items.join(' ')}</li>)}</ul>
      <h2>{tr('Après une évolution Microsoft', 'After a Microsoft update')}</h2>
      <ol>{UPDATE_PROCEDURE.map((s, i) => <li key={i}>{s}</li>)}</ol>
    </div>
  );
}

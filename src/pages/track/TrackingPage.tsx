import { useRef, useState } from 'react';
import { DIM_LABELS } from '../../agentic/types.ts';
import type { Dim } from '../../agentic/types.ts';
import { competenceStatus, dimScores, lessonProgress, moduleStats, recommend, weakTags, remediationFor } from '../../agentic/engine.ts';
import { exportAi, importProgress } from '../../agentic/state.ts';
import { useTrack } from '../../agentic/TrackContext.tsx';
import { tr } from '../../i18n/lang.ts';

export function TrackingPage() {
  const { c, p, cat: CAT, meta, to, store: aiStore } = useTrack();
  const { COMP_BY_ID, LESSONS, MODULES, PROJECTS, EXERCISES } = c;
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null);
  const next = recommend(CAT, p);
  const dims = dimScores(CAT, p);
  const link = next.kind === 'lesson' ? to('cours', next.id) : next.kind === 'evaluation' ? to('evaluation', next.module) : next.kind === 'case' ? to('cas', next.module) : next.kind === 'remediation' ? to('module', next.module) : to('projets');
  const doExport = () => {
    const blob = new Blob([exportAi(p, meta.storageKey)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = meta.exportFile;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const imported = importProgress(await f.text(), meta.label, meta.storageKey);
      aiStore.set(() => imported);
      setMsg({ kind: 'ok', text: 'Progression importée.' });
    } catch (e) {
      setMsg({ kind: 'bad', text: e instanceof Error ? e.message : 'Import impossible.' });
    }
  };
  const allWeak = MODULES.flatMap((m) => weakTags(m.id, CAT, p).map((t) => ({ m, t })));
  const doneProjects = PROJECTS.filter((x) => p.projects[x.id]?.status === 'realise');
  const inProgress = PROJECTS.filter((x) => p.projects[x.id]?.status === 'en-cours');
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <span aria-current="page">{tr('Suivi', 'Tracking')}</span></nav>
      <h1>{tr('Suivi de la formation', 'Course tracking')}</h1>
      <p className="muted">{tr('Contenu consulté et compétence validée sont deux choses différentes : lire une leçon ne valide rien, seules les évaluations et les cas pratiques notés par des règles déterministes comptent comme preuve. Les travaux ouverts restent des autoévaluations.', 'Content viewed and skill validated are different things.')}</p>
      {!aiStore.storageAvailable() && <div className="verdict warn" role="alert">{tr('Le stockage local est indisponible : la progression ne sera pas conservée. Utilisez « Exporter ».', 'Local storage unavailable: progress will not be kept. Use “Export”.')}</div>}

      <section className="card stack" aria-labelledby="t-next">
        <h2 id="t-next" style={{ margin: 0 }}>{tr('Recommandation', 'Recommendation')}</h2>
        {next.kind === 'done' ? <p>{next.reason}</p> : <p><strong>{next.title}</strong> <span className="muted small">{next.reason}</span></p>}
        <div><a className="btn primary" href={link}>{tr('Continuer', 'Continue')}</a></div>
      </section>

      <section aria-labelledby="t-lessons" className="stack">
        <h2 id="t-lessons">{tr('Leçons suivies', 'Lessons followed')} ({LESSONS.filter((l) => p.lessonsSeen[l.id]).length}/{LESSONS.length})</h2>
        <div className="table-wrap"><table className="grid-table">
          <thead><tr><th scope="col">{tr('Module', 'Module')}</th><th scope="col">{tr('Leçon', 'Lesson')}</th><th scope="col">{tr('Consultée', 'Viewed')}</th><th scope="col">{tr('Exercices réussis', 'Exercises passed')}</th></tr></thead>
          <tbody>{LESSONS.map((l) => { const lp = lessonProgress(l, p); return <tr key={l.id}><td>{l.module.replace('m', 'M')}</td><th scope="row"><a href={to('cours', l.id)}>{l.title}</a></th><td>{lp.seen ? tr('Oui', 'Yes') : tr('Non', 'No')}</td><td>{lp.passed}/{lp.total}</td></tr>; })}</tbody>
        </table></div>
      </section>

      <section aria-labelledby="t-evals" className="stack">
        <h2 id="t-evals">{tr('Résultats aux évaluations', 'Assessment results')}</h2>
        <div className="table-wrap"><table className="grid-table">
          <thead><tr><th scope="col">{tr('Module', 'Module')}</th><th scope="col">{tr('Évaluation', 'Assessment')}</th><th scope="col">{tr('Meilleur', 'Best')}</th><th scope="col">{tr('Passations', 'Attempts')}</th><th scope="col">{tr('Cas pratique', 'Case')}</th></tr></thead>
          <tbody>{MODULES.map((m) => { const e = p.evals[m.id]; const st = moduleStats(m, CAT, p, []); return <tr key={m.id}><th scope="row"><a href={to('module', m.id)}>{m.n}. {m.title}</a></th><td>{e ? `${Math.round(e.score * 100)} %` : '-'}</td><td>{e ? `${Math.round(e.best * 100)} %` : '-'}</td><td>{e ? e.attempts : 0}</td><td>{st.caseScore !== null ? `${Math.round(st.caseScore * 100)} %` : '-'}</td></tr>; })}</tbody>
        </table></div>
        <div className="row">{(Object.keys(dims) as Dim[]).filter((d) => dims[d].n > 0 || !['verifier', 'cout'].includes(d)).map((d) => <span key={d} className="pill">{DIM_LABELS[d]} : {dims[d].n ? `${Math.round(dims[d].mean * 100)} % (${dims[d].n})` : '-'}</span>)}</div>
      </section>

      <section aria-labelledby="t-comp" className="stack">
        <h2 id="t-comp">{tr('Compétences', 'Skills')}</h2>
        <div className="table-wrap"><table className="grid-table">
          <thead><tr><th scope="col">{tr('Compétence', 'Skill')}</th><th scope="col">{tr('Validation par les preuves', 'Validated by evidence')}</th><th scope="col">{tr('Autoévaluation', 'Self-assessment')}</th></tr></thead>
          <tbody>{MODULES.flatMap((m) => m.competencies).map((cid) => { const c = COMP_BY_ID[cid]; const r = competenceStatus(c, CAT, p); const g = Object.values(p.grids[c.id] ?? {}); const avg = g.length ? g.reduce((a, b) => a + b, 0) / g.length : null; return <tr key={c.id}><th scope="row">{c.name}</th><td>{r.status === 'validee' ? <span className="pill ok">{tr('Validée', 'Validated')}</span> : r.status === 'en-cours' ? <span className="pill warn">{tr('En cours', 'In progress')} ({r.attempted}/{r.total})</span> : <span className="pill">{tr('Non évaluée', 'Not assessed')}</span>}</td><td>{avg === null ? '-' : `${['À développer', 'En cours', 'Acquis', 'Solide'][Math.round(avg)]}`}</td></tr>; })}</tbody>
        </table></div>
      </section>

      <section aria-labelledby="t-weak" className="stack">
        <h2 id="t-weak">{tr('Notions à revoir', 'Notions to review')}</h2>
        {allWeak.length === 0 ? <div className="state">{tr('Rien à revoir pour l’instant : passez des évaluations pour que vos erreurs soient repérées.', 'Nothing to review yet.')}</div> : (
          <ul>{MODULES.map((m) => { const tags = weakTags(m.id, CAT, p); if (!tags.length) return null; const rem = remediationFor(m.id, tags, CAT); return <li key={m.id}><a href={to('module', m.id)}>{tr('Module', 'Module')} {m.n}</a> : {tags.map((t) => <span key={t} className="pill" style={{ marginRight: '0.3rem' }}>{t}</span>)}{rem.lessons.length > 0 && <> {tr('à relire', 'to re-read')} : {rem.lessons.map((l, i) => <span key={l.id}>{i > 0 ? ', ' : ''}<a href={to('cours', l.id)}>{l.title}</a></span>)}</>}</li>; })}</ul>
        )}
      </section>

      <section aria-labelledby="t-proj" className="stack">
        <h2 id="t-proj">{tr('Labs réalisés', 'Labs completed')} ({doneProjects.length}/{PROJECTS.length})</h2>
        {doneProjects.length + inProgress.length === 0 ? <div className="state">{tr('Aucun projet démarré. Choisissez-en un dans la liste.', 'No project started.')} <a href={to('projets')}>{tr('Voir les projets', 'See projects')}</a></div> : (
          <ul>{[...doneProjects, ...inProgress].map((x) => <li key={x.id}><a href={to('projet', x.id)}>{x.title}</a> <span className={`pill${p.projects[x.id].status === 'realise' ? ' ok' : ''}`}>{p.projects[x.id].status === 'realise' ? 'Réalisé' : 'En cours'}</span></li>)}</ul>
        )}
      </section>

      <section className="card stack" aria-labelledby="t-data">
        <h2 id="t-data" style={{ margin: 0 }}>{tr('Vos données', 'Your data')}</h2>
        <p className="muted small">{tr('La progression est enregistrée dans ce navigateur uniquement. Il n’y a aucune synchronisation entre appareils : pour changer d’appareil, exportez puis importez le fichier.', 'Progress is stored in this browser only. There is no sync between devices.')}</p>
        <div className="row">
          <button type="button" className="btn" onClick={doExport}>{tr('Exporter', 'Export')}</button>
          <button type="button" className="btn" onClick={() => file.current?.click()}>{tr('Importer', 'Import')}</button>
          <input ref={file} type="file" accept="application/json" className="sr-only" aria-label={tr('Fichier de sauvegarde', 'Backup file')} onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
          <button type="button" className="btn danger" onClick={() => { if (window.confirm(tr(`Effacer la progression de la section ${meta.label} dans ce navigateur ?`, `Erase ${meta.label} progress in this browser?`))) { aiStore.reset(); setMsg({ kind: 'ok', text: 'Progression effacée.' }); } }}>{tr('Effacer', 'Erase')}</button>
        </div>
        {msg && <div className={`verdict ${msg.kind === 'ok' ? 'ok' : 'bad'}`} role="status">{msg.text}</div>}
      </section>
      <p className="muted small">{EXERCISES.length} {tr('éléments évaluables au total.', 'items in total.')}</p>
    </div>
  );
}

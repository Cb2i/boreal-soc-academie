import { competenceStatus, lessonProgress, moduleStats, remediationFor, weakTags } from '../../agentic/engine.ts';
import { useTrack } from '../../agentic/TrackContext.tsx';
import { InlineExercise } from '../../agentic/components/InlineExercise.tsx';
import { tr } from '../../i18n/lang.ts';

const GRID_LABELS = ['À développer', 'En cours', 'Acquis', 'Solide'];
const STATUS_LABEL: Record<string, string> = { 'non-evaluee': 'Non évaluée', 'en-cours': 'En cours d’évaluation', validee: 'Validée par les évaluations' };

export function ModulePage({ id }: { id: string }) {
  const { c, p, cat: CAT, meta, to, store } = useTrack();
  const { CASE_BY_MODULE, COMP_BY_ID, LESSON_BY_ID, MODULE_BY_ID, PROJECTS, LEVELS } = c;
  const m = MODULE_BY_ID[id];
  if (!m) return <div className="state" role="alert"><h2>{tr('Module introuvable', 'Module not found')}</h2><a className="btn" href={to()}>{tr('Retour à la formation', 'Back to the course')}</a></div>;
  const lv = LEVELS.find((l) => l.n === m.level)!;
  const projects = PROJECTS.filter((x) => x.module === m.id);
  const st = moduleStats(m, CAT, p, projects.map((x) => x.id));
  const weak = weakTags(m.id, CAT, p);
  const rem = remediationFor(m.id, weak, CAT);
  const cs = CASE_BY_MODULE[m.id];
  const ev = p.evals[m.id];
  return (
    <div className="stack" style={{ ['--pc' as string]: lv.accent }}>
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <span>{tr('Niveau', 'Level')} {lv.n} : {lv.title}</span> / <span aria-current="page">{tr('Module', 'Module')} {m.n}</span></nav>
      <header className="path-head">
        <div>
          <h1 style={{ marginBottom: '0.2em' }}>{tr('Module', 'Module')} {m.n} : {m.title}</h1>
          <p className="lead muted" style={{ margin: 0 }}>{m.summary}</p>
          <p className="muted small" style={{ margin: '0.4rem 0 0' }}>
            {st.lessonsSeen}/{st.lessons} {tr('leçons consultées', 'lessons viewed')} · {st.exercisesPassed}/{st.exercises} {tr('exercices de leçon réussis', 'lesson exercises passed')} · {st.competenciesValidated}/{st.competencies} {tr('compétences validées', 'skills validated')}
          </p>
        </div>
      </header>

      <section aria-labelledby="m-lessons">
        <h2 id="m-lessons">{tr('Leçons', 'Lessons')}</h2>
        <div className="grid cols-3">
          {m.lessons.map((lid) => {
            const l = LESSON_BY_ID[lid];
            const lp = lessonProgress(l, p);
            return (
              <a key={lid} className="card link" href={to('cours', lid)}>
                <h3>{l.title}</h3>
                <p className="muted small">{l.summary}</p>
                <div className="row">
                  <span className="pill">{l.minutes} min</span>
                  {lp.seen ? <span className="pill info">{tr('Consultée', 'Viewed')}</span> : <span className="pill">{tr('Non consultée', 'Not viewed')}</span>}
                  <span className={`pill${lp.passed === lp.total ? ' ok' : ''}`}>{lp.passed}/{lp.total} {tr('exercices', 'exercises')}</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="m-eval" className="grid cols-2">
        <div className="card stack">
          <h2 id="m-eval" style={{ margin: 0 }}>{tr('Évaluation des connaissances', 'Knowledge assessment')}</h2>
          <p className="muted small">{m.evaluation.length} {tr('questions variées. Les corrections s’affichent à la fin.', 'varied questions. Corrections are shown at the end.')}</p>
          {ev && <p><strong>{Math.round(ev.score * 100)} %</strong> <span className="muted small">{tr(`dernière passation, meilleur résultat ${Math.round(ev.best * 100)} %, ${ev.attempts} passation(s)`, `last attempt, best ${Math.round(ev.best * 100)} %, ${ev.attempts} attempt(s)`)}</span></p>}
          <a className="btn primary" href={to('evaluation', m.id)}>{ev ? tr('Repasser l’évaluation', 'Retake the assessment') : tr('Passer l’évaluation', 'Take the assessment')}</a>
        </div>
        <div className="card stack">
          <h2 style={{ margin: 0 }}>{tr('Cas pratique évalué', 'Assessed practical case')}</h2>
          <p className="muted small">{cs.title} · {cs.minutes} min</p>
          {st.caseScore !== null && <p><strong>{Math.round(st.caseScore * 100)} %</strong> <span className="muted small">{tr('moyenne des étapes', 'step average')}</span></p>}
          <a className="btn primary" href={to('cas', m.id)}>{st.caseScore !== null ? tr('Revoir le cas', 'Review the case') : tr('Ouvrir le cas pratique', 'Open the practical case')}</a>
        </div>
      </section>

      {ev && (
        <section aria-labelledby="m-rem">
          <h2 id="m-rem">{tr('Remédiation', 'Remediation')}</h2>
          {weak.length === 0 ? <div className="state">{tr('Aucune notion à revoir d’après votre dernière évaluation. Bravo.', 'Nothing to review according to your last assessment.')}</div> : (
            <div className="card stack">
              <p>{tr('Notions à revoir d’après vos erreurs', 'Notions to review based on your mistakes')} : {weak.map((t) => <span key={t} className="pill" style={{ marginRight: '0.3rem' }}>{t}</span>)}</p>
              {rem.lessons.length > 0 && <p>{tr('Leçons à relire', 'Lessons to re-read')} : {rem.lessons.map((l, i) => <span key={l.id}>{i > 0 ? ', ' : ''}<a href={to('cours', l.id)}>{l.title}</a></span>)}</p>}
              {rem.exercises.length > 0 ? <div className="stack">{rem.exercises.map((e) => <InlineExercise key={e.id} ex={e} compact />)}</div> : <p className="muted small">{tr('Pas d’exercice de remédiation dédié pour ces notions : relisez les leçons ci-dessus.', 'No dedicated remediation exercise: re-read the lessons above.')}</p>}
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="m-grid">
        <h2 id="m-grid">{tr('Grille de compétences', 'Skills grid')}</h2>
        <p className="muted small">{tr('Deux regards distincts : le statut calculé à partir de vos évaluations et cas pratiques, et votre propre autoévaluation par critère. Consulter une leçon ne valide aucune compétence.', 'Two distinct views: the status computed from your assessments and cases, and your own self-assessment per criterion. Viewing a lesson validates no skill.')}</p>
        <div className="stack">
          {m.competencies.map((cid) => {
            const c = COMP_BY_ID[cid];
            const r = competenceStatus(c, CAT, p);
            const g = p.grids[c.id] ?? {};
            return (
              <div key={c.id} className="card stack">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>{c.name}</h3>
                  <span className={`pill${r.status === 'validee' ? ' ok' : r.status === 'en-cours' ? ' warn' : ''}`}>{STATUS_LABEL[r.status]}{r.total ? ` (${r.attempted}/${r.total} preuves, ${Math.round(r.mean * 100)} %)` : ''}</span>
                </div>
                <p className="muted small">{c.description}</p>
                <div className="table-scroll"><table className="grid-table">
                  <thead><tr><th scope="col">{tr('Critère', 'Criterion')}</th>{GRID_LABELS.map((l) => <th key={l} scope="col">{l}</th>)}</tr></thead>
                  <tbody>
                    {c.criteria.map((cr) => (
                      <tr key={cr.id}>
                        <th scope="row">{cr.text}</th>
                        {GRID_LABELS.map((l, i) => (
                          <td key={l}><input type="radio" name={`g-${cr.id}`} aria-label={`${cr.text} : ${l}`} checked={g[cr.id] === i} onChange={() => store.set((s) => ({ ...s, grids: { ...s.grids, [c.id]: { ...(s.grids[c.id] ?? {}), [cr.id]: i } } }))} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="m-proj">
        <h2 id="m-proj">{tr('Idées de projets', 'Project ideas')}</h2>
        <div className="grid cols-3">
          {projects.map((x) => {
            const r = p.projects[x.id];
            return (
              <a key={x.id} className="card link" href={to('projet', x.id)}>
                <span className="pill">{x.level}</span>
                <h3>{x.title}</h3>
                <p className="muted small">{x.problem}</p>
                {r && <span className={`pill${r.status === 'realise' ? ' ok' : ''}`}>{r.status === 'realise' ? 'Réalisé' : r.status === 'en-cours' ? 'En cours' : 'Idée'}</span>}
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

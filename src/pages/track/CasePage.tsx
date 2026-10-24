import { useTrack } from '../../agentic/TrackContext.tsx';
import { InlineExercise } from '../../agentic/components/InlineExercise.tsx';
import { Markdown } from '../../components/Markdown.tsx';
import { tr } from '../../i18n/lang.ts';

export function CasePage({ moduleId }: { moduleId: string }) {
  const { c, p, meta, to } = useTrack();
  const { CASE_BY_MODULE, EX_BY_ID, MODULE_BY_ID } = c;
  const m = MODULE_BY_ID[moduleId];
  const cs = CASE_BY_MODULE[moduleId];
  if (!m || !cs) return <div className="state" role="alert"><h2>{tr('Cas pratique introuvable', 'Case not found')}</h2><a className="btn" href={to()}>{tr('Retour', 'Back')}</a></div>;
  const steps = cs.steps.map((id) => EX_BY_ID[id]).filter(Boolean);
  const firstOpen = steps.findIndex((e) => !p.items[e.id]);
  const visible = firstOpen === -1 ? steps.length : firstOpen + 1;
  const scored = steps.filter((e) => p.items[e.id]);
  const score = scored.length === steps.length && steps.length ? steps.reduce((a, e) => a + p.items[e.id].best, 0) / steps.length : null;
  const deliverable = cs.deliverable ? EX_BY_ID[cs.deliverable] : null;
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <a href={to('module', m.id)}>{tr('Module', 'Module')} {m.n}</a> / <span aria-current="page">{tr('Cas pratique', 'Practical case')}</span></nav>
      <h1>{cs.title}</h1>
      <div className="card stack"><h2 style={{ margin: 0 }}>{tr('Contexte', 'Scenario')}</h2><Markdown source={cs.scenario} /><p className="muted small">{cs.minutes} min · {steps.length} {tr('étapes', 'steps')}{deliverable ? tr(' et un livrable à autoévaluer', ' and a deliverable to self-assess') : ''}</p></div>
      {score !== null && <div className="verdict ok"><strong>{Math.round(score * 100)} %</strong> {tr('sur l’ensemble des étapes (meilleurs scores). Les étapes se refont autant que vous voulez.', 'across all steps (best scores).')}</div>}
      {steps.slice(0, visible).map((e, i) => (
        <section key={e.id} aria-label={`${tr('Étape', 'Step')} ${i + 1}`} className="stack">
          <h2 style={{ fontSize: '1.1rem' }}>{tr('Étape', 'Step')} {i + 1} {tr('sur', 'of')} {steps.length}</h2>
          <InlineExercise ex={e} />
        </section>
      ))}
      {firstOpen !== -1 && <p className="muted small">{tr('L’étape suivante apparaît dès que vous avez tenté celle-ci.', 'The next step appears once you have attempted this one.')}</p>}
      {deliverable && firstOpen === -1 && (
        <section className="stack"><h2>{tr('Livrable final', 'Final deliverable')}</h2><InlineExercise ex={deliverable} /></section>
      )}
      <div className="row"><a className="btn" href={to('module', m.id)}>{tr('Retour au module', 'Back to module')}</a></div>
    </div>
  );
}

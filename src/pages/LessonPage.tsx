import { useEffect } from 'react';
import { EXERCISE_BY_ID, LESSON_BY_ID } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { Markdown } from '../components/Markdown.tsx';
import { href } from '../router.ts';
import { store } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { tr } from '../i18n/lang.ts';
import { FlowDiagram } from '../diagrams/FlowDiagram.tsx';
import { FLOW_BY_LESSON } from '../diagrams/index.ts';

export function LessonPage({ id }: { id: string }) {
  const p = useProgress();
  const l = LESSON_BY_ID[id];
  useEffect(() => {
    if (l) store.set((s) => ({ ...s, last: { route: href('cours', l.id), title: l.title, at: Date.now() } }));
  }, [l]);
  if (!l) return <div className="state" role="alert"><h2>{tr('Cours introuvable', 'Lesson not found')}</h2><a className="btn" href={href('catalogue')}>{tr('Catalogue', 'Catalog')}</a></div>;
  const read = p.lessonsDone.includes(l.id);
  return (
    <article className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={href('parcours', l.path)}>{PATH_BY_ID[l.path].short}</a> / <span aria-current="page">{l.title}</span></nav>
      <h1>{l.title}</h1>
      <div className="row"><span className="pill">{l.minutes} min</span><span className="pill">{tr('Niveau', 'Level')} {l.level}</span>{l.preview && <span className="pill warn">{tr('Fonctionnalité en préversion', 'Preview feature')}</span>}</div>
      {l.preview && <p className="callout preview">{tr('Ce cours touche une fonctionnalité en préversion : le comportement et la disponibilité peuvent changer. Revalidez dans la documentation officielle.', 'This lesson covers a preview feature: behavior and availability may change. Re-check the official documentation.')}</p>}
      {FLOW_BY_LESSON[l.id] && <FlowDiagram key={l.id} flow={FLOW_BY_LESSON[l.id]} />}
      <Markdown source={l.body} context={l.context} />
      <section className="card stack" aria-labelledby="ex-h">
        <h2 id="ex-h" style={{ fontSize: '1.15rem' }}>{tr('Exercices associés', 'Related exercises')}</h2>
        <ul>{l.exercises.map((x) => EXERCISE_BY_ID[x] && <li key={x}><a href={href('exercice', x)}>{EXERCISE_BY_ID[x].title}</a>{p.done[x] ? ' ✓' : ''}</li>)}</ul>
        <h3>Sources</h3>
        <ul className="small">{l.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted">({tr('vérifié le', 'verified on')} {s.verified})</span></li>)}</ul>
      </section>
      <div className="row">
        <button type="button" className="btn" aria-pressed={read} onClick={() => store.set((s) => ({ ...s, lessonsDone: read ? s.lessonsDone.filter((x) => x !== l.id) : [...s.lessonsDone, l.id] }))}>
          {read ? tr('✓ Marqué comme lu', '✓ Marked as read') : tr('Marquer comme lu', 'Mark as read')}
        </button>
        {l.exercises[0] && <a className="btn primary" href={href('exercice', l.exercises[0])}>{tr('Passer aux exercices', 'Go to the exercises')}</a>}
      </div>
    </article>
  );
}

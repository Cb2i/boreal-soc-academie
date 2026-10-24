import { useEffect } from 'react';
import { EXERCISE_BY_ID, LESSON_BY_ID } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { Markdown } from '../components/Markdown.tsx';
import { href } from '../router.ts';
import { store } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';

export function LessonPage({ id }: { id: string }) {
  const p = useProgress();
  const l = LESSON_BY_ID[id];
  useEffect(() => {
    if (l) store.set((s) => ({ ...s, last: { route: href('cours', l.id), title: l.title, at: Date.now() } }));
  }, [l]);
  if (!l) return <div className="state" role="alert"><h2>Cours introuvable</h2><a className="btn" href={href('catalogue')}>Catalogue</a></div>;
  const read = p.lessonsDone.includes(l.id);
  return (
    <article className="stack">
      <nav className="crumbs" aria-label="Fil d’Ariane"><a href={href('parcours', l.path)}>{PATH_BY_ID[l.path].short}</a> / <span aria-current="page">{l.title}</span></nav>
      <h1>{l.title}</h1>
      <div className="row"><span className="pill">{l.minutes} min</span><span className="pill">Niveau {l.level}</span>{l.preview && <span className="pill warn">Fonctionnalité en préversion</span>}</div>
      {l.preview && <p className="callout preview">Ce cours touche une fonctionnalité en préversion : le comportement et la disponibilité peuvent changer. Revalidez dans la documentation officielle.</p>}
      <Markdown source={l.body} context={l.context} />
      <section className="card stack" aria-labelledby="ex-h">
        <h2 id="ex-h" style={{ fontSize: '1.15rem' }}>Exercices associés</h2>
        <ul>{l.exercises.map((x) => EXERCISE_BY_ID[x] && <li key={x}><a href={href('exercice', x)}>{EXERCISE_BY_ID[x].title}</a>{p.done[x] ? ' ✓' : ''}</li>)}</ul>
        <h3>Sources</h3>
        <ul className="small">{l.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted">(vérifié le {s.verified})</span></li>)}</ul>
      </section>
      <div className="row">
        <button type="button" className="btn" aria-pressed={read} onClick={() => store.set((s) => ({ ...s, lessonsDone: read ? s.lessonsDone.filter((x) => x !== l.id) : [...s.lessonsDone, l.id] }))}>
          {read ? '✓ Marqué comme lu' : 'Marquer comme lu'}
        </button>
        {l.exercises[0] && <a className="btn primary" href={href('exercice', l.exercises[0])}>Passer aux exercices</a>}
      </div>
    </article>
  );
}

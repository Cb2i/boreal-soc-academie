import { useEffect, useState } from 'react';
import { markLessonSeen } from '../../agentic/state.ts';
import { useTrack } from '../../agentic/TrackContext.tsx';
import { InlineExercise } from '../../agentic/components/InlineExercise.tsx';
import { Markdown } from '../../components/Markdown.tsx';
import { tr } from '../../i18n/lang.ts';
import { FlowDiagram } from '../../diagrams/FlowDiagram.tsx';
import { FLOW_BY_LESSON } from '../../diagrams/index.ts';

export function LessonPage({ id }: { id: string }) {
  const { c, p, meta, to, store } = useTrack();
  const { EX_BY_ID, LESSON_BY_ID, MODULE_BY_ID, MODULES, LESSONS, RESOURCES, LEVELS } = c;
  const l = LESSON_BY_ID[id];
  useEffect(() => {
    if (!l) return;
    store.set((s) => ({ ...markLessonSeen(s, l.id), last: { route: to('cours', l.id), title: l.title, at: Date.now() } }));
  }, [l?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [revision, setRevision] = useState(false);
  if (!l) return <div className="state" role="alert"><h2>{tr('Leçon introuvable', 'Lesson not found')}</h2><a className="btn" href={to()}>{tr('Retour à la formation', 'Back to the course')}</a></div>;
  const m = MODULE_BY_ID[l.module];
  const lv = LEVELS.find((x) => x.n === m.level)!;
  const idx = LESSONS.findIndex((x) => x.id === l.id);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const quizDone = l.quiz.filter((q) => p.items[q]?.passed).length;
  const related = RESOURCES.filter((r) => r.lessons?.includes(l.id));
  return (
    <article className="stack lesson" style={{ ['--pc' as string]: lv.accent }}>
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <a href={to('module', m.id)}>{tr('Module', 'Module')} {m.n}</a> / <span aria-current="page">{l.title}</span></nav>
      <header>
        <h1>{l.title}</h1>
        <p className="lead muted">{l.summary}</p>
        <div className="row"><span className="pill">{l.minutes} min</span><span className="pill">{tr('Module', 'Module')} {m.n} : {m.title}</span></div>
        <nav className="toc" aria-label={tr('Sommaire de la leçon', 'Lesson contents')}>
          <a href="#objectifs">{tr('Objectifs', 'Objectives')}</a><a href="#explication">{tr('Explication', 'Explanation')}</a>{FLOW_BY_LESSON[l.id] && <a href="#schema">{tr('Schéma animé', 'Animated diagram')}</a>}<a href="#demo">{tr('Démonstration', 'Demonstration')}</a><a href="#guide">{tr('Exercice guidé', 'Guided exercise')}</a><a href="#autonome">{tr('Exercice autonome', 'Independent exercise')}</a><a href="#evaluation">{tr('Évaluation courte', 'Short quiz')}</a><a href="#fiche">{tr('Fiche de révision', 'Revision sheet')}</a><a href="#liens">{tr('Liens', 'Links')}</a>
        </nav>
      </header>

      <section id="objectifs" className="card stack" aria-labelledby="h-obj">
        <h2 id="h-obj" style={{ margin: 0 }}>{tr('Objectifs et prérequis', 'Objectives and prerequisites')}</h2>
        <div className="grid cols-2">
          <div><h3>{tr('À la fin de la leçon, vous saurez', 'By the end you will')}</h3><ul>{l.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
          <div><h3>{tr('Prérequis', 'Prerequisites')}</h3>{l.prerequisites.length ? <ul>{l.prerequisites.map((o, i) => <li key={i}>{o}</li>)}</ul> : <p>{tr('Aucun prérequis.', 'None.')}</p>}</div>
        </div>
      </section>

      <section id="explication" className="stack" aria-labelledby="h-exp">
        <h2 id="h-exp">{tr('Explication', 'Explanation')}</h2>
        <div className="prose"><Markdown source={l.body} /></div>
      </section>

      {FLOW_BY_LESSON[l.id] && <section id="schema" className="stack" aria-label={tr('Schéma animé', 'Animated diagram')}><FlowDiagram key={l.id} flow={FLOW_BY_LESSON[l.id]} /></section>}

      <section id="demo" className="card stack demo" aria-labelledby="h-demo">
        <h2 id="h-demo" style={{ margin: 0 }}>{tr('Démonstration commentée', 'Annotated demonstration')} : {l.demo.title}</h2>
        <div className="prose"><Markdown source={l.demo.body} /></div>
      </section>

      <section id="guide" className="stack" aria-labelledby="h-guide">
        <h2 id="h-guide">{tr('Exercice guidé', 'Guided exercise')}</h2>
        <InlineExercise ex={EX_BY_ID[l.guided]} />
      </section>

      <section id="autonome" className="stack" aria-labelledby="h-auto">
        <h2 id="h-auto">{tr('Exercice autonome', 'Independent exercise')}</h2>
        <InlineExercise ex={EX_BY_ID[l.autonomous]} />
      </section>

      <section id="evaluation" className="stack" aria-labelledby="h-quiz">
        <h2 id="h-quiz">{tr('Évaluation courte', 'Short quiz')} <span className="pill">{quizDone}/{l.quiz.length}</span></h2>
        {l.quiz.map((q) => <InlineExercise key={q} ex={EX_BY_ID[q]} compact />)}
      </section>

      <section id="fiche" className="card stack" aria-labelledby="h-fiche">
        <h2 id="h-fiche" style={{ margin: 0 }}>{tr('Fiche de révision', 'Revision sheet')}</h2>
        <div className="row no-print">
          <button type="button" className="btn small" aria-expanded={revision} onClick={() => setRevision((v) => !v)}>{revision ? tr('Masquer', 'Hide') : tr('Afficher', 'Show')}</button>
          <button type="button" className="btn small" onClick={() => { setRevision(true); setTimeout(() => window.print(), 50); }}>{tr('Imprimer', 'Print')}</button>
        </div>
        {revision && <div className="prose revision-sheet"><Markdown source={l.revision} /></div>}
      </section>

      {related.length > 0 && (
        <section className="card stack" aria-labelledby="h-res">
          <h2 id="h-res" style={{ margin: 0 }}>{tr('Ressources de cette leçon', 'Resources for this lesson')}</h2>
          <ul>{related.map((r) => <li key={r.id}><a href={to('ressources') + '?r=' + r.id}>{r.title}</a> <span className={`pill ${r.status === 'teste' ? 'ok' : 'warn'}`}>{r.status === 'teste' ? 'testé' : 'à vérifier'}</span></li>)}</ul>
        </section>
      )}

      <section id="liens" className="card stack" aria-labelledby="h-liens">
        <h2 id="h-liens" style={{ margin: 0 }}>{tr('Liens utiles', 'Useful links')}</h2>
        <ul>{l.links.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted small">({tr('vérifié le', 'checked')} {s.verified})</span></li>)}</ul>
      </section>

      <footer className="row" style={{ justifyContent: 'space-between' }}>
        {prev ? <a className="btn" href={to('cours', prev.id)}>← {prev.title}</a> : <span />}
        {next ? <a className="btn primary" href={to('cours', next.id)}>{next.title} →</a> : <a className="btn primary" href={to('module', MODULES[MODULES.length - 1].id)}>{tr('Retour au module', 'Back to module')}</a>}
      </footer>
    </article>
  );
}

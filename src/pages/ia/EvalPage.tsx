import { useState } from 'react';
import { DIM_LABELS } from '../../agentic/types.ts';
import type { AiExercise, Dim } from '../../agentic/types.ts';
import { EX_BY_ID, MODULE_BY_ID } from '../../agentic/content/index.ts';
import { remediationFor } from '../../agentic/engine.ts';
import { validateAi } from '../../agentic/validate.ts';
import type { AiAnswer, AiVerdict } from '../../agentic/validate.ts';
import { aiStore, recordEval, recordItem, useAi } from '../../agentic/state.ts';
import { AiExerciseView, initialAiAnswer } from '../../agentic/components/AiExerciseView.tsx';
import { verdictClass } from '../../agentic/components/InlineExercise.tsx';
import { Inline, Markdown } from '../../components/Markdown.tsx';
import { href } from '../../router.ts';
import { CAT } from './AiHome.tsx';
import { tr } from '../../i18n/lang.ts';

/** Évaluation du module : on valide chaque réponse sans retour immédiat, puis on corrige tout à la fin. */
export function EvalPage({ moduleId }: { moduleId: string }) {
  const p = useAi();
  const m = MODULE_BY_ID[moduleId];
  const [answers, setAnswers] = useState<Record<string, AiAnswer>>({});
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, AiVerdict> | null>(null);
  const [run, setRun] = useState(0);
  if (!m) return <div className="state" role="alert"><h2>{tr('Module introuvable', 'Module not found')}</h2><a className="btn" href={href('ia')}>{tr('Retour', 'Back')}</a></div>;
  const exs = m.evaluation.map((id) => EX_BY_ID[id]).filter(Boolean) as AiExercise[];
  const answered = exs.filter((e) => locked[e.id]).length;
  const finish = () => {
    const res: Record<string, AiVerdict> = {};
    const scores: Record<string, number> = {};
    for (const e of exs) {
      const v = locked[e.id] ? validateAi(e, answers[e.id] ?? initialAiAnswer(e)) : { correct: false, score: 0, title: 'Sans réponse', message: 'Aucune réponse validée pour cette question.', details: [] };
      res[e.id] = v;
      scores[e.id] = v.score;
    }
    aiStore.set((s) => {
      let n = s;
      for (const e of exs) n = recordItem(n, e.id, res[e.id].score, res[e.id].correct);
      return recordEval(n, m.id, scores);
    });
    setResults(res);
    window.scrollTo(0, 0);
  };
  const restart = () => { setAnswers({}); setLocked({}); setResults(null); setRun((r) => r + 1); window.scrollTo(0, 0); };

  if (results) {
    const score = exs.reduce((a, e) => a + results[e.id].score, 0) / exs.length;
    const byDim: Record<Dim, number[]> = { comprendre: [], fonctionner: [], securiser: [], maintenir: [] };
    exs.forEach((e) => byDim[e.dim].push(results[e.id].score));
    const weakTagsList = [...new Set(exs.filter((e) => results[e.id].score < 1).flatMap((e) => e.tags))];
    const rem = remediationFor(m.id, weakTagsList, CAT);
    return (
      <div className="stack">
        <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={href('ia')}>Agentic AI</a> / <a href={href('ia', 'module', m.id)}>{tr('Module', 'Module')} {m.n}</a> / <span aria-current="page">{tr('Résultats', 'Results')}</span></nav>
        <h1>{tr('Résultats de l’évaluation', 'Assessment results')} : {m.title}</h1>
        <div className="card stack">
          <h2 style={{ margin: 0 }}>{Math.round(score * 100)} % <span className="muted small">({exs.filter((e) => results[e.id].correct).length}/{exs.length} {tr('questions réussies', 'questions passed')})</span></h2>
          <div className="row">{(Object.keys(byDim) as Dim[]).filter((d) => byDim[d].length).map((d) => <span key={d} className="pill">{DIM_LABELS[d]} : {Math.round((byDim[d].reduce((a, b) => a + b, 0) / byDim[d].length) * 100)} %</span>)}</div>
          <p className="muted small">{tr('Score calculé par des règles déterministes, sans IA. Les questions partiellement justes donnent un score partiel.', 'Score computed by deterministic rules, no AI. Partially correct questions earn partial credit.')}</p>
          {weakTagsList.length > 0 && (
            <div>
              <h3>{tr('Notions à revoir', 'Notions to review')}</h3>
              <p>{weakTagsList.map((t) => <span key={t} className="pill" style={{ marginRight: '0.3rem' }}>{t}</span>)}</p>
              {rem.lessons.length > 0 && <p>{tr('Leçons à relire', 'Lessons to re-read')} : {rem.lessons.map((l, i) => <span key={l.id}>{i > 0 ? ', ' : ''}<a href={href('ia', 'cours', l.id)}>{l.title}</a></span>)}</p>}
              <a className="btn" href={href('ia', 'module', m.id) + '#m-rem'}>{tr('Voir les exercices de remédiation', 'See remediation exercises')}</a>
            </div>
          )}
          <div className="row"><button type="button" className="btn" onClick={restart}>{tr('Repasser l’évaluation', 'Retake')}</button><a className="btn primary" href={href('ia', 'module', m.id)}>{tr('Retour au module', 'Back to module')}</a></div>
        </div>
        <h2>{tr('Corrections', 'Corrections')}</h2>
        {exs.map((e, i) => {
          const v = results[e.id];
          return (
            <article key={e.id} className="card stack" aria-labelledby={`r-${e.id}`}>
              <h3 id={`r-${e.id}`} style={{ margin: 0 }}>{i + 1}. {e.title} <span className={`pill ${v.correct ? 'ok' : v.score > 0 ? 'warn' : 'bad'}`}>{Math.round(v.score * 100)} %</span></h3>
              <Markdown source={e.statement} />
              <AiExerciseView ex={e} answer={answers[e.id] ?? initialAiAnswer(e)} onAnswer={() => {}} verdict={v} disabled onSubmit={() => {}} />
              <div className={`verdict ${verdictClass(v)}`} role="status"><h4 style={{ margin: '0 0 0.3em' }}>{v.title}</h4><p style={{ margin: 0 }}>{v.message}</p>{v.details.length > 0 && <ul>{v.details.map((d, k) => <li key={k}><Inline text={d} /></li>)}</ul>}</div>
              <div className="card stack"><h4 style={{ margin: 0 }}>{tr('Correction expliquée', 'Explained correction')}</h4><Markdown source={e.explanation} /></div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="stack" key={run}>
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={href('ia')}>Agentic AI</a> / <a href={href('ia', 'module', m.id)}>{tr('Module', 'Module')} {m.n}</a> / <span aria-current="page">{tr('Évaluation', 'Assessment')}</span></nav>
      <h1>{tr('Évaluation du module', 'Module assessment')} {m.n} : {m.title}</h1>
      <p className="muted">{tr('Validez chaque réponse avec son bouton. Vous ne verrez les corrections qu’à la fin, comme dans une vraie évaluation. Aucune limite de temps.', 'Submit each answer with its button. Corrections appear at the end. No time limit.')}</p>
      <div className="bar" role="progressbar" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={exs.length} aria-label={tr('Questions validées', 'Answered questions')}><span style={{ width: `${(answered / exs.length) * 100}%` }} /></div>
      {exs.map((e, i) => (
        <article key={e.id} className="card stack" aria-labelledby={`e-${e.id}`}>
          <h2 id={`e-${e.id}`} style={{ margin: 0, fontSize: '1.15rem' }}>{i + 1}. {e.title} {locked[e.id] && <span className="pill info">{tr('Réponse enregistrée', 'Answer saved')}</span>}</h2>
          <Markdown source={e.statement} />
          <AiExerciseView ex={e} answer={answers[e.id] ?? initialAiAnswer(e)} onAnswer={(a) => setAnswers((x) => ({ ...x, [e.id]: a }))} verdict={null} disabled={!!locked[e.id]} onSubmit={() => { setAnswers((x) => ({ ...x, [e.id]: x[e.id] ?? initialAiAnswer(e) })); setLocked((x) => ({ ...x, [e.id]: true })); }} submitLabel={tr('Valider ma réponse', 'Submit my answer')} />
        </article>
      ))}
      <div className="row">
        <button type="button" className="btn primary big" onClick={finish} disabled={answered === 0}>{tr('Terminer l’évaluation', 'Finish the assessment')}</button>
        {answered < exs.length && <span className="muted small">{tr(`${exs.length - answered} question(s) sans réponse compteront pour 0.`, `${exs.length - answered} unanswered question(s) will count as 0.`)}</span>}
      </div>
      {p.evals[m.id] && <p className="muted small">{tr('Précédent résultat', 'Previous result')} : {Math.round(p.evals[m.id].score * 100)} %.</p>}
    </div>
  );
}

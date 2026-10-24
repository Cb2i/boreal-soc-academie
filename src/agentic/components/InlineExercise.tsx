import { useState } from 'react';
import type { AiExercise } from '../types.ts';
import { AI_TYPE_LABELS, DIM_LABELS, ROLE_LABELS } from '../types.ts';
import { validateAi } from '../validate.ts';
import type { AiAnswer, AiVerdict } from '../validate.ts';
import { aiStore, recordItem, useAi } from '../state.ts';
import { AiExerciseView, initialAiAnswer } from './AiExerciseView.tsx';
import { Inline, Markdown } from '../../components/Markdown.tsx';
import { useAnnounce } from '../../components/Announcer.tsx';

export function verdictClass(v: AiVerdict): string {
  if (v.selfAssessed) return v.correct ? 'ok' : 'warn';
  return v.correct ? 'ok' : v.score >= 0.5 ? 'warn' : 'bad';
}

/** Un exercice qu'on fait et corrige sur place. Le résultat est enregistré dans la progression locale. */
export function InlineExercise({ ex, compact = false }: { ex: AiExercise; compact?: boolean }) {
  const p = useAi();
  const announce = useAnnounce();
  const [answer, setAnswer] = useState<AiAnswer>(() => initialAiAnswer(ex));
  const [verdict, setVerdict] = useState<AiVerdict | null>(null);
  const [hints, setHints] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const rec = p.items[ex.id];
  const hasHints = (ex.hints?.length ?? 0) > 0;
  const showCorrection = verdict?.correct === true || revealed || (verdict !== null && ex.type === 'open');

  const submit = () => {
    const v = validateAi(ex, answer);
    setVerdict(v);
    setAttempts((n) => n + 1);
    announce(`${v.title}. ${v.message}`);
    if (ex.type === 'open') {
      const a = answer as { checked: string[]; text: string };
      aiStore.set((s) => ({ ...s, open: { ...s.open, [ex.id]: { checked: a.checked, text: a.text, at: Date.now() } } }));
    }
    // Un exercice dont la correction a été consultée avant de répondre ne compte pas comme réussi.
    aiStore.set((s) => recordItem(s, ex.id, v.score, v.correct && !revealed));
  };

  const retry = () => {
    setAnswer(initialAiAnswer(ex));
    setVerdict(null);
  };

  return (
    <article className={`ai-ex card stack${compact ? ' compact' : ''}`} aria-labelledby={`t-${ex.id}`}>
      <header className="row" style={{ justifyContent: 'space-between' }}>
        <h3 id={`t-${ex.id}`} style={{ margin: 0 }}>{ex.title}</h3>
        <span className="row" style={{ gap: '0.35rem' }}>
          <span className="pill">{ROLE_LABELS[ex.role]}</span>
          <span className="pill">{AI_TYPE_LABELS[ex.type]}</span>
          <span className="pill" title="Dimension évaluée">{DIM_LABELS[ex.dim]}</span>
          {rec?.passed && <span className="pill ok">Réussi</span>}
        </span>
      </header>
      <Markdown source={ex.statement} />
      {hasHints && (
        <div className="stack" style={{ gap: '0.4rem' }}>
          {ex.hints!.slice(0, hints).map((h, i) => <div key={i} className="callout"><strong>Indice {i + 1}.</strong> <Inline text={h} /></div>)}
          {hints < ex.hints!.length && !showCorrection && <div><button type="button" className="btn small" onClick={() => setHints((n) => n + 1)}>Révéler l’indice {hints + 1} sur {ex.hints!.length}</button></div>}
        </div>
      )}
      <AiExerciseView ex={ex} answer={answer} onAnswer={setAnswer} verdict={verdict} disabled={verdict?.correct === true || (verdict !== null && ex.type === 'open')} onSubmit={submit} />
      {verdict && (
        <div className={`verdict ${verdictClass(verdict)} anim-pop`} role="status">
          <h4 style={{ margin: '0 0 0.3em' }}>{verdict.title}</h4>
          <p style={{ margin: 0 }}>{verdict.message}</p>
          {verdict.details.length > 0 && <ul>{verdict.details.map((d, i) => <li key={i}><Inline text={d} /></li>)}</ul>}
        </div>
      )}
      <div className="row">
        {verdict && !verdict.correct && !verdict.selfAssessed && <button type="button" className="btn" onClick={retry}>Réessayer</button>}
        {verdict && ex.type === 'open' && <button type="button" className="btn" onClick={retry}>Refaire l’autoévaluation</button>}
        {attempts >= 1 && !showCorrection && ex.type !== 'open' && <button type="button" className="btn ghost" onClick={() => { setRevealed(true); announce('Correction affichée. Cet exercice ne sera pas compté comme réussi.'); }}>Voir la correction (ne compte pas comme réussi)</button>}
      </div>
      {showCorrection && (
        <div className="card stack anim-pop">
          <h4 style={{ margin: 0 }}>Correction expliquée</h4>
          <Markdown source={ex.explanation} />
          {ex.mistakes && ex.mistakes.length > 0 && (
            <>
              <h4 style={{ margin: '0.5rem 0 0' }}>Erreurs fréquentes</h4>
              <ul>{ex.mistakes.map((m, i) => <li key={i}><Inline text={m} /></li>)}</ul>
            </>
          )}
        </div>
      )}
    </article>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Exercise, InvestigateEx } from '../content/types.ts';
import { EX_TYPE_LABELS, LEVEL_NAMES } from '../content/types.ts';
import { ALL_EXERCISES, EXERCISE_BY_ID, LESSON_BY_ID } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { computeXp, solutionOf, validateExercise } from '../engine/validate.ts';
import type { Answer, Verdict } from '../engine/validate.ts';
import { isUnlocked } from '../engine/unlock.ts';
import { store, recordFailure, recordSuccess, toggleFavorite } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { Inline, Markdown } from '../components/Markdown.tsx';
import { CodeBlock } from '../components/CodeBlock.tsx';
import { useAnnounce } from '../components/Announcer.tsx';
import { KqlMechanic } from '../mechanics/KqlMechanic.tsx';
import { BlocksMechanic } from '../mechanics/BlocksMechanic.tsx';
import { OrderMechanic } from '../mechanics/OrderMechanic.tsx';
import { MatchMechanic } from '../mechanics/MatchMechanic.tsx';
import { PlaceMechanic } from '../mechanics/PlaceMechanic.tsx';
import { InspectMechanic } from '../mechanics/InspectMechanic.tsx';
import { ReadResultsMechanic } from '../mechanics/ReadResultsMechanic.tsx';
import { ChoiceMechanic } from '../mechanics/ChoiceMechanic.tsx';
import { InvestigateMechanic } from '../mechanics/InvestigateMechanic.tsx';
import { shuffleSeeded } from '../engine/shuffle.ts';

function initialAnswer(ex: Exercise, draft?: string): Answer {
  switch (ex.type) {
    case 'kql-write':
    case 'kql-fix':
      return { type: ex.type, query: draft ?? ex.starter ?? '' };
    case 'kql-blocks':
      return { type: 'kql-blocks', blockIds: [] };
    case 'order':
      return { type: 'order', ids: shuffleSeeded(ex.items.map((i) => i.id), ex.id, ex.correct) };
    case 'match':
      return { type: 'match', map: {} };
    case 'place':
      return { type: 'place', map: {} };
    case 'inspect':
      return { type: 'inspect', faulty: [], remedies: {} };
    case 'read-results':
      return { type: 'read-results', value: '', choices: [] };
    case 'choice':
      return { type: 'choice', ids: [] };
    case 'investigate':
      return { type: 'choice', ids: [] };
  }
}

function verdictClass(v: Verdict): string {
  if (v.status === 'perfect') return 'ok';
  if (v.status === 'optimizable' || v.status === 'reasoning') return 'warn';
  if (v.status === 'unsupported' || v.status === 'limit') return 'info';
  return 'bad';
}

export function ExercisePage({ id, review }: { id: string; review?: boolean }) {
  const ex = EXERCISE_BY_ID[id];
  const p = useProgress();
  if (!ex) {
    return (
      <div className="state" role="alert">
        <h2>Exercice introuvable</h2>
        <p>L’identifiant « {id} » n’existe pas dans cette version du contenu.</p>
        <a className="btn" href={href('catalogue')}>Retour au catalogue</a>
      </div>
    );
  }
  const unlocked = isUnlocked(ex, ALL_EXERCISES, p.done, p.settings.unlockAll);
  if (!unlocked) {
    const missing = ex.prerequisites.filter((x) => !p.done[x]);
    return (
      <div className="state" role="status">
        <h2>Exercice verrouillé</h2>
        <p>
          {missing.length > 0
            ? `Réussissez d’abord : ${missing.map((m) => EXERCISE_BY_ID[m]?.title ?? m).join(', ')}.`
            : `Réussissez au moins 60 % du niveau précédent du parcours « ${PATH_BY_ID[ex.path].short} » pour ouvrir ce niveau.`}
        </p>
        <p className="muted small">Vous pouvez aussi activer « Tout débloquer » dans le tableau de bord (mode exploration).</p>
        <a className="btn" href={href('parcours', ex.path)}>Voir la carte du parcours</a>
      </div>
    );
  }
  return <ExerciseRunner key={ex.id} ex={ex} review={review} />;
}

function ExerciseRunner({ ex, review }: { ex: Exercise; review?: boolean }) {
  const p = useProgress();
  const announce = useAnnounce();
  const [answer, setAnswer] = useState<Answer>(() => initialAnswer(ex, p.drafts[ex.id]));
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [gained, setGained] = useState<number | null>(null);
  const start = useRef(Date.now());
  const verdictRef = useRef<HTMLDivElement>(null);
  const alreadyDone = !!p.done[ex.id];

  useEffect(() => {
    store.set((s) => ({ ...s, last: { route: href('exercice', ex.id), title: ex.title, at: Date.now() } }));
  }, [ex.id, ex.title]);

  const lesson = ex.lesson ? LESSON_BY_ID[ex.lesson] : undefined;
  const isInvestigate = ex.type === 'investigate';

  const submit = () => {
    if (isInvestigate) return;
    let v: Verdict;
    try {
      v = validateExercise(ex, answer);
    } catch (e) {
      v = { status: 'semantic', correct: false, xpFactor: 0, title: 'Erreur interne de validation', message: e instanceof Error ? e.message : String(e), details: [] };
    }
    const n = attempts + 1;
    setAttempts(n);
    setVerdict(v);
    announce(`${v.title}. ${v.message}`);
    if (v.correct) {
      const elapsed = (Date.now() - start.current) / 1000;
      const xp = revealed ? 0 : computeXp(ex, v, { hintsUsed: hintsShown, attempts: n, timedUnderPar: p.settings.timed && ex.parSeconds !== undefined && elapsed <= ex.parSeconds });
      setGained(xp);
      store.set((s) => recordSuccess(s, ex.id, xp, v.status, hintsShown, n));
    } else {
      store.set((s) => recordFailure(s, ex.id));
    }
    requestAnimationFrame(() => verdictRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };

  const setQuery = (q: string) => {
    setAnswer({ type: ex.type === 'kql-fix' ? 'kql-fix' : 'kql-write', query: q });
    store.set((s) => ({ ...s, drafts: { ...s.drafts, [ex.id]: q } }));
  };

  const finished = verdict?.correct === true;
  const disabled = false;
  const showCorrection = finished || revealed;
  const nextEx = useMemo(() => {
    const list = ALL_EXERCISES.filter((e) => e.path === ex.path);
    const i = list.findIndex((e) => e.id === ex.id);
    return list.slice(i + 1).find((e) => isUnlocked(e, ALL_EXERCISES, { ...p.done, [ex.id]: true }, p.settings.unlockAll)) ?? null;
  }, [ex.id, ex.path, p.done, p.settings.unlockAll]);

  const solutions = solutionOf(ex);
  const fav = p.favorites.includes(ex.id);

  return (
    <article>
      <nav className="crumbs" aria-label="Fil d’Ariane">
        <a href={href('catalogue')}>Catalogue</a> / <a href={href('parcours', ex.path)}>{PATH_BY_ID[ex.path].short}</a> / <span aria-current="page">{ex.title}</span>
      </nav>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>{ex.title}</h1>
        <button type="button" className="btn" aria-pressed={fav} onClick={() => store.set((s) => toggleFavorite(s, ex.id))}>
          {fav ? '★ Favori' : '☆ Ajouter aux favoris'}
        </button>
      </div>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <span className="pill">{PATH_BY_ID[ex.path].short}</span>
        <span className="pill">Niveau {ex.level} : {LEVEL_NAMES[ex.level]}</span>
        <span className="pill">{EX_TYPE_LABELS[ex.type]}</span>
        {ex.kind === 'mission' && <span className="pill warn">Mission finale</span>}
        {ex.kind === 'assessment' && <span className="pill info">Évaluation</span>}
        {ex.preview && <span className="pill warn">Fonctionnalité en préversion</span>}
        {alreadyDone && <span className="pill ok">Déjà réussi{review ? ' (mode révision)' : ''}</span>}
      </div>

      <div className="ex-layout">
        <section className="stack" aria-label="Énoncé">
          <div className="card stack">
            <div><strong>Objectif :</strong> {ex.objective}</div>
            <Markdown source={ex.statement} context={'context' in ex ? ex.context : undefined} />
            {ex.resources && <p className="muted small"><strong>Ressources :</strong> {ex.resources}</p>}
            {lesson && <a href={href('cours', lesson.id)}>Relire le cours : {lesson.title}</a>}
          </div>

          <div className="card stack">
            <h2 style={{ fontSize: '1.05rem' }}>Indices ({hintsShown}/{ex.hints.length})</h2>
            {ex.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="callout"><strong>Indice {i + 1}.</strong> <Markdown source={h} /></div>
            ))}
            <div className="row">
              <button type="button" className="btn" disabled={hintsShown >= ex.hints.length || finished} onClick={() => { setHintsShown((n) => n + 1); announce(`Indice ${hintsShown + 1} révélé.`); }}>
                {hintsShown >= ex.hints.length ? 'Plus d’indices' : `Révéler l’indice ${hintsShown + 1}`}
              </button>
              <span className="muted small">Chaque indice réduit les XP de 10 % (maximum 40 %).</span>
            </div>
          </div>
        </section>

        <section className="ex-side stack" aria-label="Espace de travail">
          {ex.type === 'kql-write' || ex.type === 'kql-fix' ? (
            <KqlMechanic ex={ex} query={(answer as { query: string }).query} onQuery={setQuery} disabled={disabled} onSubmit={submit} />
          ) : ex.type === 'kql-blocks' ? (
            <BlocksMechanic ex={ex} ids={(answer as { blockIds: string[] }).blockIds} onIds={(ids) => setAnswer({ type: 'kql-blocks', blockIds: ids })} disabled={disabled} verdict={verdict} announce={announce} onSubmit={submit} />
          ) : ex.type === 'order' ? (
            <OrderMechanic ex={ex} ids={(answer as { ids: string[] }).ids} onIds={(ids) => setAnswer({ type: 'order', ids })} disabled={disabled} verdict={verdict} announce={announce} onSubmit={submit} />
          ) : ex.type === 'match' ? (
            <MatchMechanic ex={ex} map={(answer as { map: Record<string, string> }).map} onMap={(map) => setAnswer({ type: 'match', map })} disabled={disabled} verdict={verdict} onSubmit={submit} />
          ) : ex.type === 'place' ? (
            <PlaceMechanic ex={ex} map={(answer as { map: Record<string, string> }).map} onMap={(map) => setAnswer({ type: 'place', map })} disabled={disabled} verdict={verdict} announce={announce} onSubmit={submit} />
          ) : ex.type === 'inspect' ? (
            <InspectMechanic ex={ex} faulty={(answer as { faulty: string[] }).faulty} remedies={(answer as { remedies: Record<string, string> }).remedies} onChange={(faulty, remedies) => setAnswer({ type: 'inspect', faulty, remedies })} disabled={disabled} verdict={verdict} onSubmit={submit} />
          ) : ex.type === 'read-results' ? (
            <ReadResultsMechanic ex={ex} value={(answer as { value: string }).value} choices={(answer as { choices?: string[] }).choices ?? []} onValue={(value) => setAnswer({ type: 'read-results', value, choices: [] })} onChoices={(choices) => setAnswer({ type: 'read-results', value: '', choices })} disabled={disabled} verdict={verdict} onSubmit={submit} />
          ) : ex.type === 'choice' ? (
            <ChoiceMechanic ex={ex} ids={(answer as { ids: string[] }).ids} onIds={(ids) => setAnswer({ type: 'choice', ids })} disabled={disabled} verdict={verdict} onSubmit={submit} />
          ) : (
            renderInvestigation(ex)
          )}

          <div ref={verdictRef} aria-live="polite">
            {verdict && (
              <div className={`verdict ${verdictClass(verdict)} anim-pop`} role="status">
                <h3>{verdict.title}</h3>
                <p><Inline text={verdict.message} /></p>
                {verdict.hint && <p className="muted">Piste : {verdict.hint}</p>}
                {verdict.details.length > 0 && (
                  <ul>
                    {verdict.details.map((d, i) => <li key={i}><Inline text={d} /></li>)}
                  </ul>
                )}
                {attempts >= 2 && verdict.examples && verdict.examples.length > 0 && (
                  <ul className="small muted">
                    {verdict.examples.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                )}
                {verdict.correct && gained !== null && (
                  <p><strong>+{gained} XP</strong>{revealed ? ' (solution consultée : aucun XP)' : ''}</p>
                )}
              </div>
            )}
          </div>

          {!isInvestigate && (
            <div className="row">
              {attempts >= 1 && !showCorrection && (
                <button type="button" className="btn ghost" onClick={() => { setRevealed(true); announce('Correction affichée. Aucun XP ne sera accordé pour cet exercice.'); }}>
                  Voir la correction (sans XP)
                </button>
              )}
              {finished && nextEx && <a className="btn primary" href={href('exercice', nextEx.id)}>Exercice suivant : {nextEx.title}</a>}
              {finished && !nextEx && <a className="btn primary" href={href('parcours', ex.path)}>Retour à la carte du parcours</a>}
            </div>
          )}

          {showCorrection && !isInvestigate && (
            <div className="card stack anim-pop">
              <h2 style={{ fontSize: '1.15rem' }}>Correction expliquée</h2>
              {solutions.map((s, i) => (
                <div key={i}>
                  {solutions.length > 1 && <p className="muted small">{i === 0 ? 'Solution de référence' : `Variante ${i}`}</p>}
                  <CodeBlock code={s} lang="kql" playgroundContext={'context' in ex ? ex.context : undefined} />
                </div>
              ))}
              <Markdown source={ex.explanation} />
              {ex.commonMistakes.length > 0 && (
                <>
                  <h3>Erreurs fréquentes</h3>
                  <ul>{ex.commonMistakes.map((m, i) => <li key={i}><Inline text={m} /></li>)}</ul>
                </>
              )}
              <h3>Sources</h3>
              <ul className="small">
                {ex.sources.map((s) => (
                  <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted">(vérifié le {s.verified})</span></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </article>
  );

  function renderInvestigation(inv: Exercise) {
    const e = inv as InvestigateEx;
    const done = p.steps[e.id] ?? [];
    const finishedAll = e.steps.every((s) => done.includes(s.id));
    return (
      <div className="stack">
        <InvestigateMechanic
          ex={e}
          doneSteps={done}
          announce={announce}
          disabled={false}
          onAttempt={() => store.set((s) => recordFailure(s, e.id))}
          onStepDone={(stepId) => {
            const nextDone = done.includes(stepId) ? done : [...done, stepId];
            store.set((s) => ({ ...s, steps: { ...s.steps, [e.id]: nextDone } }));
            if (e.steps.every((st) => nextDone.includes(st.id))) {
              const v: Verdict = { status: 'perfect', correct: true, xpFactor: 1, title: 'Enquête terminée', message: 'Toutes les étapes sont validées.', details: [] };
              const xp = computeXp(e, v, { hintsUsed: hintsShown, attempts: Math.max(1, p.failed[e.id] ?? 0) });
              setVerdict(v);
              setGained(xp);
              store.set((s) => recordSuccess(s, e.id, xp, 'perfect', hintsShown, 1));
              announce('Enquête terminée.');
            }
          }}
        />
        {finishedAll && (
          <div className="card stack anim-pop">
            <h2 style={{ fontSize: '1.15rem' }}>Bilan de l’enquête</h2>
            <Markdown source={e.explanation} />
            <h3>Sources</h3>
            <ul className="small">
              {e.sources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted">(vérifié le {s.verified})</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

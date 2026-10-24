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
import { nextInPath } from '../engine/next.ts';
import { PathBar } from '../components/PathBar.tsx';
import { Celebrate } from '../components/Celebrate.tsx';
import { tr, useLang } from '../i18n/lang.ts';

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
        <h2>{tr('Exercice introuvable', 'Exercise not found')}</h2>
        <p>{tr(`L’identifiant « ${id} » n’existe pas dans cette version du contenu.`, `The identifier “${id}” does not exist in this version of the content.`)}</p>
        <a className="btn" href={href('catalogue')}>{tr('Retour au catalogue', 'Back to the catalog')}</a>
      </div>
    );
  }
  const unlocked = isUnlocked(ex, ALL_EXERCISES, p.done, p.settings.unlockAll, p.startLevel[ex.path]);
  if (!unlocked) {
    const missing = ex.prerequisites.filter((x) => !p.done[x]);
    const nextOpen = nextInPath(ALL_EXERCISES, ex.path, p);
    return (
      <div className="state" role="status">
        <h2>{tr('Exercice verrouillé', 'Exercise locked')}</h2>
        <p>
          {missing.length > 0
            ? tr(`Réussissez d’abord : ${missing.map((m) => EXERCISE_BY_ID[m]?.title ?? m).join(', ')}.`, `Complete first: ${missing.map((m) => EXERCISE_BY_ID[m]?.title ?? m).join(', ')}.`)
            : tr(`Réussissez au moins 60 % du niveau précédent du parcours « ${PATH_BY_ID[ex.path].short} » pour ouvrir ce niveau.`, `Complete at least 60% of the previous level of the “${PATH_BY_ID[ex.path].short}” path to open this level.`)}
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          {missing.length > 0 && EXERCISE_BY_ID[missing[0]] && <a className="btn primary" href={href('exercice', missing[0])}>{tr('Aller au prérequis', 'Go to the prerequisite')} : {EXERCISE_BY_ID[missing[0]].title}</a>}
          {missing.length === 0 && nextOpen && <a className="btn primary" href={href('exercice', nextOpen.id)}>{tr('Continuer avec', 'Continue with')} : {nextOpen.title}</a>}
          <a className="btn" href={href('parcours', ex.path)}>{tr('Voir la carte du parcours', 'See the path map')}</a>
          <button type="button" className="btn ghost" onClick={() => store.set((st) => ({ ...st, settings: { ...st.settings, unlockAll: true } }))}>{tr('Tout débloquer (mode exploration)', 'Unlock everything (exploration mode)')}</button>
        </div>
      </div>
    );
  }
  return <ExerciseRunner key={ex.id} ex={ex} review={review} />;
}

export interface PlacementCtl {
  index: number;
  total: number;
  /** Appelé quand l'apprenant passe à la question suivante (réussie ou non). */
  onNext: (passed: boolean) => void;
}

export function ExerciseRunner({ ex, review, placement }: { ex: Exercise; review?: boolean; placement?: PlacementCtl }) {
  const p = useProgress();
  const lang = useLang();
  const announce = useAnnounce();
  const [answer, setAnswer] = useState<Answer>(() => initialAnswer(ex, p.drafts[ex.id]));
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [gained, setGained] = useState<number | null>(null);
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
      v = { status: 'semantic', correct: false, xpFactor: 0, title: tr('Erreur interne de validation', 'Internal validation error'), message: e instanceof Error ? e.message : String(e), details: [] };
    }
    const n = attempts + 1;
    setAttempts(n);
    setVerdict(v);
    announce(`${v.title}. ${v.message}`);
    if (v.correct) {
      const xp = revealed ? 0 : computeXp(ex, v, { hintsUsed: hintsShown, attempts: n });
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
    return list.slice(i + 1).find((e) => isUnlocked(e, ALL_EXERCISES, { ...p.done, [ex.id]: true }, p.settings.unlockAll, p.startLevel[ex.path])) ?? null;
  }, [ex.id, ex.path, p.done, p.settings.unlockAll, p.startLevel, lang]);

  const solutions = solutionOf(ex);
  const fav = p.favorites.includes(ex.id);

  return (
    <article>
      {finished && gained !== null && gained > 0 && <Celebrate key={`${ex.id}-${attempts}`} xp={gained} perfect={verdict?.status === 'perfect'} />}
      {placement ? <p className="kicker" role="status">{tr(`Test de niveau : question ${placement.index + 1} sur ${placement.total}`, `Placement test: question ${placement.index + 1} of ${placement.total}`)}</p> : <PathBar ex={ex} />}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>{ex.title}</h1>
        <button type="button" className="btn" aria-pressed={fav} onClick={() => store.set((s) => toggleFavorite(s, ex.id))}>
          {fav ? tr('★ Favori', '★ Favorite') : tr('☆ Ajouter aux favoris', '☆ Add to favorites')}
        </button>
      </div>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <span className="pill">{PATH_BY_ID[ex.path].short}</span>
        <span className="pill">{tr('Niveau', 'Level')} {ex.level} : {LEVEL_NAMES[ex.level]}</span>
        <span className="pill">{EX_TYPE_LABELS[ex.type]}</span>
        {ex.kind === 'mission' && <span className="pill warn">{tr('Cas pratique', 'Practical case')}</span>}
        {ex.kind === 'assessment' && <span className="pill info">{tr('Évaluation', 'Assessment')}</span>}
        {ex.preview && <span className="pill warn">{tr('Fonctionnalité en préversion', 'Preview feature')}</span>}
        {alreadyDone && <span className="pill ok">{tr('Déjà réussi', 'Already completed')}{review ? tr(' (mode révision)', ' (review mode)') : ''}</span>}
      </div>

      <div className="ex-layout">
        <section className="stack" aria-label={tr('Énoncé', 'Statement')}>
          <div className="card stack">
            <div><strong>{tr('Objectif :', 'Objective:')}</strong> {ex.objective}</div>
            <Markdown source={ex.statement} context={'context' in ex ? ex.context : undefined} />
            {lang === 'en' && 'tables' in ex && ex.type !== 'read-results' && <p className="muted small">Some column names in the exercises are French identifiers (for example <code>Echecs</code>, <code>Connexions</code>). Use them exactly as written in the statement.</p>}
            {ex.resources && <p className="muted small"><strong>{tr('Ressources :', 'Resources:')}</strong> {ex.resources}</p>}
            {lesson && <a href={href('cours', lesson.id)}>{tr('Relire le cours', 'Re-read the lesson')} : {lesson.title}</a>}
          </div>

          <div className="card stack">
            <h2 style={{ fontSize: '1.05rem' }}>{tr('Indices', 'Hints')} ({hintsShown}/{ex.hints.length})</h2>
            {ex.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="callout"><strong>{tr('Indice', 'Hint')} {i + 1}.</strong> <Markdown source={h} /></div>
            ))}
            <div className="row">
              <button type="button" className="btn" disabled={hintsShown >= ex.hints.length || finished} onClick={() => { setHintsShown((n) => n + 1); announce(tr(`Indice ${hintsShown + 1} révélé.`, `Hint ${hintsShown + 1} revealed.`)); }}>
                {hintsShown >= ex.hints.length ? tr('Plus d’indices', 'No more hints') : tr(`Révéler l’indice ${hintsShown + 1}`, `Reveal hint ${hintsShown + 1}`)}
              </button>
              <span className="muted small">{tr('Chaque indice réduit les XP de 10 % (maximum 40 %).', 'Each hint reduces XP by 10% (maximum 40%).')}</span>
            </div>
          </div>
        </section>

        <section className="ex-side stack" aria-label={tr('Espace de travail', 'Workspace')}>
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
                {verdict.hint && <p className="muted">{tr('Piste', 'Hint')} : {verdict.hint}</p>}
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
                  <p><strong>+{gained} XP</strong>{revealed ? tr(' (solution consultée : aucun XP)', ' (solution viewed: no XP)') : ''}</p>
                )}
              </div>
            )}
          </div>

          {!isInvestigate && (
            <div className="row">
              {attempts >= 1 && !showCorrection && (
                <button type="button" className="btn ghost" onClick={() => { setRevealed(true); announce(tr('Correction affichée. Aucun XP ne sera accordé pour cet exercice.', 'Correction shown. No XP will be awarded for this exercise.')); }}>
                  {tr('Voir la correction (sans XP)', 'Show the correction (no XP)')}
                </button>
              )}
              {placement && finished && <button type="button" className="btn primary" onClick={() => placement.onNext(true)}>{placement.index + 1 < placement.total ? tr('Question suivante', 'Next question') : tr('Voir mon résultat', 'See my result')} →</button>}
              {placement && !finished && <button type="button" className="btn ghost" onClick={() => placement.onNext(false)}>{tr('Je ne sais pas, terminer le test', 'I do not know, finish the test')}</button>}
              {!placement && finished && nextEx && <a className="btn primary" href={href('exercice', nextEx.id)}>{tr('Exercice suivant', 'Next exercise')} : {nextEx.title}</a>}
              {!placement && finished && !nextEx && <a className="btn primary" href={href('parcours', ex.path)}>{tr('Retour à la carte du parcours', 'Back to the path map')}</a>}
            </div>
          )}

          {showCorrection && !isInvestigate && (
            <div className="card stack anim-pop">
              <h2 style={{ fontSize: '1.15rem' }}>{tr('Correction expliquée', 'Explained correction')}</h2>
              {solutions.map((s, i) => (
                <div key={i}>
                  {solutions.length > 1 && <p className="muted small">{i === 0 ? tr('Solution de référence', 'Reference solution') : tr(`Variante ${i}`, `Variant ${i}`)}</p>}
                  <CodeBlock code={s} lang="kql" playgroundContext={'context' in ex ? ex.context : undefined} />
                </div>
              ))}
              <Markdown source={ex.explanation} />
              {ex.commonMistakes.length > 0 && (
                <>
                  <h3>{tr('Erreurs fréquentes', 'Common mistakes')}</h3>
                  <ul>{ex.commonMistakes.map((m, i) => <li key={i}><Inline text={m} /></li>)}</ul>
                </>
              )}
              <h3>Sources</h3>
              <ul className="small">
                {ex.sources.map((s) => (
                  <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted">({tr('vérifié le', 'verified on')} {s.verified})</span></li>
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
              const v: Verdict = { status: 'perfect', correct: true, xpFactor: 1, title: tr('Enquête terminée', 'Investigation complete'), message: tr('Toutes les étapes sont validées.', 'All steps are validated.'), details: [] };
              const xp = computeXp(e, v, { hintsUsed: hintsShown, attempts: Math.max(1, p.failed[e.id] ?? 0) });
              setVerdict(v);
              setGained(xp);
              store.set((s) => recordSuccess(s, e.id, xp, 'perfect', hintsShown, 1));
              announce(tr('Enquête terminée.', 'Investigation complete.'));
            }
          }}
        />
        {finishedAll && (
          <div className="card stack anim-pop">
            <h2 style={{ fontSize: '1.15rem' }}>{tr('Bilan de l’enquête', 'Investigation wrap-up')}</h2>
            <Markdown source={e.explanation} />
            <h3>Sources</h3>
            <ul className="small">
              {e.sources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted">({tr('vérifié le', 'verified on')} {s.verified})</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

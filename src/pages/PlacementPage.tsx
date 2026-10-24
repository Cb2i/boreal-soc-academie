import { useMemo, useState } from 'react';
import { ALL_EXERCISES, EXERCISE_BY_ID } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { LEVEL_NAMES } from '../content/types.ts';
import type { Exercise, Level, PathId } from '../content/types.ts';
import { store } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { nextInPath } from '../engine/next.ts';
import { ExerciseRunner } from './ExercisePage.tsx';
import { tr } from '../i18n/lang.ts';

/** Une question par niveau (1 à 3) parmi les exercices ordinaires du parcours. On préfère un exercice pas encore réussi. */
export function placementQuestions(exs: Exercise[], path: PathId, done: Record<string, unknown>): Exercise[] {
  const out: Exercise[] = [];
  for (const level of [1, 2, 3] as Level[]) {
    const pool = exs.filter((e) => e.path === path && e.level === level && e.type !== 'investigate' && (e.kind === undefined || e.kind === 'exercise'));
    if (pool.length === 0) continue;
    out.push(pool.find((e) => !done[e.id]) ?? pool[0]);
  }
  return out;
}

/** Niveau de départ : le niveau suivant la dernière réussite consécutive, plafonné au niveau le plus haut du parcours. */
export function placementResult(questions: Exercise[], passed: boolean[], maxLevel: number): number {
  let reached = 0;
  for (let i = 0; i < questions.length && passed[i]; i++) reached = questions[i].level;
  return reached === 0 ? 1 : Math.min(maxLevel, reached + 1);
}

export function PlacementPage({ id }: { id: string }) {
  const p = useProgress();
  const path = PATH_BY_ID[id as PathId];
  const [step, setStep] = useState(-1);
  const [passed, setPassed] = useState<boolean[]>([]);
  const questions = useMemo(() => (path ? placementQuestions(ALL_EXERCISES, path.id, p.done) : []), [path?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!path) return <div className="state" role="alert"><h2>{tr('Parcours introuvable', 'Path not found')}</h2><a className="btn" href={href('catalogue')}>{tr('Catalogue', 'Catalog')}</a></div>;
  const maxLevel = Math.max(1, ...ALL_EXERCISES.filter((e) => e.path === path.id).map((e) => e.level));
  const back = <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={href('catalogue')}>{tr('Catalogue', 'Catalog')}</a> / <a href={href('parcours', path.id)}>{path.short}</a> / <span aria-current="page">{tr('Test de niveau', 'Placement test')}</span></nav>;

  if (questions.length === 0) {
    return <div className="stack">{back}<div className="state"><h2>{tr('Pas de test pour ce parcours', 'No test for this path')}</h2><a className="btn primary" href={href('parcours', path.id)}>{tr('Voir le parcours', 'See the path')}</a></div></div>;
  }

  if (step < 0) {
    return (
      <div className="stack" style={{ ['--pc' as string]: path.accent }}>
        {back}
        <h1>{tr('Tester mon niveau', 'Test my level')} : {path.short}</h1>
        <p className="lead muted">{tr(`${questions.length} question(s), une par niveau, tirées de vrais exercices du parcours. Si vous réussissez, nous ouvrons le niveau suivant pour vous. Vous pouvez arrêter à tout moment.`, `${questions.length} question(s), one per level, taken from real exercises of the path. If you pass, we open the next level for you. You can stop at any time.`)}</p>
        <ol>{questions.map((q) => <li key={q.id}>{tr('Niveau', 'Level')} {q.level} : {LEVEL_NAMES[q.level]}</li>)}</ol>
        <p className="muted small">{tr('Les exercices réussis comptent dans votre progression (XP inclus). Les niveaux sautés restent accessibles, rien n’est perdu.', 'Completed exercises count toward your progress (XP included). Skipped levels stay accessible, nothing is lost.')}</p>
        <div className="row">
          <button type="button" className="btn primary big" onClick={() => setStep(0)}>{tr('Commencer le test', 'Start the test')} →</button>
          <a className="btn" href={href('parcours', path.id)}>{tr('Choisir un niveau moi-même', 'Pick a level myself')}</a>
        </div>
      </div>
    );
  }

  if (step < questions.length) {
    const q = questions[step];
    return (
      <div className="stack" style={{ ['--pc' as string]: path.accent }}>
        <ExerciseRunner
          key={q.id}
          ex={EXERCISE_BY_ID[q.id] ?? q}
          review
          placement={{
            index: step,
            total: questions.length,
            onNext: (ok) => {
              const next = [...passed, ok];
              setPassed(next);
              // Une réponse manquée met fin au test : on ne pose pas de niveaux plus difficiles.
              setStep(ok ? step + 1 : questions.length);
            },
          }}
        />
      </div>
    );
  }

  const start = placementResult(questions, passed, maxLevel);
  const apply = () => store.set((s) => ({ ...s, startLevel: start >= 2 ? { ...s.startLevel, [path.id]: Math.max(start, s.startLevel[path.id] ?? 1) } : s.startLevel }));
  const after = { ...p, startLevel: { ...p.startLevel, [path.id]: Math.max(start, p.startLevel[path.id] ?? 1) } };
  const target = nextInPath(ALL_EXERCISES, path.id, after);
  return (
    <div className="stack" style={{ ['--pc' as string]: path.accent }}>
      {back}
      <h1>{tr('Résultat du test', 'Test result')}</h1>
      <div className="card stack">
        <p>{tr(`${passed.filter(Boolean).length} réussie(s) sur ${questions.length}.`, `${passed.filter(Boolean).length} of ${questions.length} passed.`)}</p>
        <h2 style={{ margin: 0 }}>{start >= 2 ? tr(`Nous vous proposons de commencer au niveau ${start} : ${LEVEL_NAMES[start as Level]}`, `We suggest starting at level ${start}: ${LEVEL_NAMES[start as Level]}`) : tr('Nous vous conseillons de commencer au niveau 1', 'We suggest starting at level 1')}</h2>
        <p className="muted small">{start >= 2 ? tr('Les niveaux précédents sont ouverts et leurs prérequis ne vous bloquent plus. Vous pourrez toujours les faire plus tard.', 'The previous levels are open and their prerequisites no longer block you. You can still do them later.') : tr('Le cours du parcours est un bon point de départ.', 'The path lessons are a good starting point.')}</p>
        <div className="row">
          <a className="btn primary" href={target ? href('exercice', target.id) : href('parcours', path.id)} onClick={apply}>{start >= 2 ? tr('Appliquer et continuer', 'Apply and continue') : tr('Continuer', 'Continue')} →</a>
          <a className="btn" href={href('parcours', path.id)} onClick={apply}>{tr('Voir la carte du parcours', 'See the path map')}</a>
          <button type="button" className="btn ghost" onClick={() => { setStep(-1); setPassed([]); }}>{tr('Refaire le test', 'Retake the test')}</button>
        </div>
      </div>
    </div>
  );
}

import { EXERCISE_BY_ID } from '../content/index.ts';
import { dueForReview } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { tr } from '../i18n/lang.ts';
import { DailyChallenge } from '../components/DailyChallenge.tsx';

export function ReviewPage() {
  const p = useProgress();
  const due = dueForReview(p).filter((id) => EXERCISE_BY_ID[id]);
  const others = Object.keys(p.done).filter((id) => EXERCISE_BY_ID[id] && !due.includes(id));
  return (
    <div className="stack">
      <h1>{tr('Mode révision', 'Review mode')}</h1>
      <p className="muted">{tr('Les exercices déjà réussis restent accessibles librement. Ceux dont l’échéance est passée (1, 3, 7, 14 puis 30 jours selon vos réussites) sont listés en premier. Un échec remet l’exercice à demain.', 'Exercises you have already completed remain freely accessible. Those past their due date (1, 3, 7, 14 then 30 days depending on your successes) are listed first. A failure moves the exercise to tomorrow.')}</p>
      <DailyChallenge />
      <h2>{tr('À réviser', 'To review')} ({due.length})</h2>
      {due.length === 0 ? <div className="state">{tr('Rien à réviser pour le moment. Revenez plus tard ou refaites un exercice de la liste ci-dessous.', 'Nothing to review right now. Come back later or redo an exercise from the list below.')}</div> : (
        <ul>{due.map((id) => <li key={id}><a href={href('revision', id)}>{EXERCISE_BY_ID[id].title}</a></li>)}</ul>
      )}
      <h2>{tr('Tous les exercices réussis', 'All completed exercises')} ({others.length})</h2>
      {others.length === 0 ? <div className="state">{tr('Aucun exercice réussi pour le moment.', 'No completed exercises yet.')}</div> : <ul>{others.map((id) => <li key={id}><a href={href('revision', id)}>{EXERCISE_BY_ID[id].title}</a> <span className="muted small">({tr('prochaine révision', 'next review')} : {new Date(p.done[id].due).toLocaleDateString(tr('fr-CA', 'en-CA'))})</span></li>)}</ul>}
    </div>
  );
}

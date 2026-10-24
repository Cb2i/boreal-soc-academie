import { EXERCISE_BY_ID } from '../content/index.ts';
import { dueForReview } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';

export function ReviewPage() {
  const p = useProgress();
  const due = dueForReview(p).filter((id) => EXERCISE_BY_ID[id]);
  const others = Object.keys(p.done).filter((id) => EXERCISE_BY_ID[id] && !due.includes(id));
  return (
    <div className="stack">
      <h1>Mode révision</h1>
      <p className="muted">Les exercices déjà réussis restent accessibles librement. Ceux dont l’échéance est passée (1, 3, 7, 14 puis 30 jours selon vos réussites) sont listés en premier. Un échec remet l’exercice à demain.</p>
      <h2>À réviser ({due.length})</h2>
      {due.length === 0 ? <div className="state">Rien à réviser pour le moment. Revenez plus tard ou refaites un exercice de la liste ci-dessous.</div> : (
        <ul>{due.map((id) => <li key={id}><a href={href('revision', id)}>{EXERCISE_BY_ID[id].title}</a></li>)}</ul>
      )}
      <h2>Tous les exercices réussis ({others.length})</h2>
      {others.length === 0 ? <div className="state">Aucun exercice réussi pour le moment.</div> : <ul>{others.map((id) => <li key={id}><a href={href('revision', id)}>{EXERCISE_BY_ID[id].title}</a> <span className="muted small">(prochaine révision : {new Date(p.done[id].due).toLocaleDateString('fr-CA')})</span></li>)}</ul>}
    </div>
  );
}

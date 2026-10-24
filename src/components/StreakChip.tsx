import { streak, weeklyCount } from '../engine/streak.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { tr } from '../i18n/lang.ts';

/** Série de jours et objectif de la semaine, dans l'en-tête. */
export function StreakChip() {
  const p = useProgress();
  const s = streak(p);
  const wk = weeklyCount(p);
  const goal = p.settings.weeklyGoal;
  const reached = wk >= goal;
  const label = tr(
    `Série de ${s.current} jour(s). Objectif de la semaine : ${wk} sur ${goal}.${s.current > 0 && !s.todayDone ? ' Réussissez un exercice aujourd’hui pour la garder.' : ''}`,
    `${s.current}-day streak. Weekly goal: ${wk} of ${goal}.${s.current > 0 && !s.todayDone ? ' Complete an exercise today to keep it.' : ''}`,
  );
  return (
    <a className={`streak-chip${s.current > 0 && !s.todayDone ? ' at-risk' : ''}${reached ? ' reached' : ''}`} href={href('tableau')} aria-label={label} title={label}>
      <span className="streak-flame" aria-hidden="true">{s.current > 0 ? '▲' : '△'}</span>
      <span>{s.current}{tr(' j', 'd')}</span>
      <span className="streak-goal" aria-hidden="true">{wk}/{goal}</span>
    </a>
  );
}

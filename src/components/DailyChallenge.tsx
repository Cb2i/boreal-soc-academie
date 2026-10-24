import { EXERCISE_BY_ID } from '../content/index.ts';
import { dailyChallenge, DAILY_SIZE } from '../engine/daily.ts';
import { useEffect } from 'react';
import { dayKey, store } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { tr } from '../i18n/lang.ts';

/** Défi du jour : 5 exercices à revoir. Le « fait aujourd'hui » vient de la date de dernière réussite. */
export function DailyChallenge({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  const today = dayKey(Date.now());
  const frozen = p.daily && p.daily.day === today ? p.daily.ids.filter((id) => EXERCISE_BY_ID[id] && p.done[id]) : null;
  const ids = frozen && frozen.length > 0 ? frozen : dailyChallenge(p, (id) => !!EXERCISE_BY_ID[id]);
  const key = ids.join('|');
  useEffect(() => {
    if (ids.length > 0 && !(frozen && frozen.length > 0)) store.set((s) => (s.daily && s.daily.day === today && s.daily.ids.join('|') === key ? s : { ...s, daily: { day: today, ids } }));
  }, [key, today]); // eslint-disable-line react-hooks/exhaustive-deps
  if (ids.length === 0) {
    return compact ? null : (
      <div className="state">{tr('Le défi du jour apparaît dès votre premier exercice réussi : il reprendra ce qui est à réviser ou fragile.', 'The daily challenge appears after your first completed exercise: it will pick what is due or shaky.')}</div>
    );
  }
  const doneToday = ids.filter((id) => dayKey(p.done[id].lastAt) === today).length;
  const next = ids.find((id) => dayKey(p.done[id].lastAt) !== today);
  const complete = doneToday >= ids.length;
  return (
    <section className="daily card" aria-labelledby="daily-h">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <span className="kicker">{tr('Défi du jour', 'Daily challenge')}</span>
          <h2 id="daily-h" style={{ margin: '0.1em 0 0' }}>{complete ? tr('Défi terminé, bravo', 'Challenge complete, well done') : tr(`${ids.length} exercice(s) à revoir aujourd’hui`, `${ids.length} exercise(s) to revisit today`)}</h2>
        </div>
        <span className="pill" aria-label={tr(`${doneToday} sur ${ids.length} faits`, `${doneToday} of ${ids.length} done`)}>{doneToday}/{ids.length}</span>
      </div>
      {!compact && <p className="muted small">{tr(`Tirés de ce qui est à réviser, de vos échecs et des réussites fragiles (maximum ${DAILY_SIZE}). La liste change chaque jour.`, `Picked from what is due, your failures and shaky successes (up to ${DAILY_SIZE}). The list changes every day.`)}</p>}
      <ol className="daily-list">
        {ids.map((id) => {
          const d = dayKey(p.done[id].lastAt) === today;
          return (
            <li key={id} className={d ? 'is-done' : undefined}>
              <a href={href('revision', id)}>{EXERCISE_BY_ID[id].title}</a>
              {d && <span className="pill ok">{tr('Fait', 'Done')}</span>}
            </li>
          );
        })}
      </ol>
      {next && <a className="btn primary" href={href('revision', next)}>{doneToday === 0 ? tr('Commencer le défi', 'Start the challenge') : tr('Continuer le défi', 'Continue the challenge')} →</a>}
    </section>
  );
}

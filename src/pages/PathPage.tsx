import { ALL_EXERCISES, ALL_LESSONS } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { LEVEL_NAMES } from '../content/types.ts';
import type { Level, PathId } from '../content/types.ts';
import { isUnlocked, levelUnlocked } from '../engine/unlock.ts';
import { href } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';
import { nextStep, orderedPath } from '../engine/next.ts';
import { Ring } from '../components/Ring.tsx';
import { tr } from '../i18n/lang.ts';

export function PathPage({ id }: { id: string }) {
  const p = useProgress();
  const path = PATH_BY_ID[id as PathId];
  if (!path) return <div className="state" role="alert"><h2>{tr('Parcours introuvable', 'Path not found')}</h2><a className="btn" href={href('catalogue')}>{tr('Catalogue', 'Catalog')}</a></div>;
  const exs = ALL_EXERCISES.filter((e) => e.path === path.id);
  const lessons = ALL_LESSONS.filter((l) => l.path === path.id);
  const done = exs.filter((e) => p.done[e.id]).length;
  const pct = exs.length ? Math.round((done / exs.length) * 100) : 0;
  const step = nextStep(ALL_EXERCISES, ALL_LESSONS, path.id, p);
  const nextId = step?.kind === 'exercise' ? step.ex.id : null;
  const order = orderedPath(ALL_EXERCISES, path.id);
  return (
    <div className="stack" style={{ ['--pc' as string]: path.accent }}>
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={href('catalogue')}>{tr('Catalogue', 'Catalog')}</a> / <span aria-current="page">{path.short}</span></nav>
      <div className="path-head">
        <Ring pct={pct} size={92} stroke={9} color={path.accent}><span className="ring-num big">{pct}%</span></Ring>
        <div>
          <h1 style={{ marginBottom: '0.2em' }}>{path.title}</h1>
          <p className="lead muted" style={{ margin: 0 }}>{path.description}</p>
          <p className="muted small" style={{ margin: '0.4rem 0 0' }}>{tr(`${done} sur ${exs.length} exercice(s) réussis.`, `${done} of ${exs.length} exercise(s) completed.`)}</p>
        </div>
      </div>
      <div className="bar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={exs.length || 1} aria-label={tr('Progression du parcours', 'Path progress')}><span style={{ width: `${pct}%` }} /></div>
      {step && (
        <a className="next-banner" href={step.kind === 'lesson' ? href('cours', step.lesson.id) : href('exercice', step.ex.id)}>
          <span className="kicker">{done === 0 ? tr('Commencez ici', 'Start here') : tr('Prochaine étape', 'Next step')}</span>
          <strong>{step.kind === 'lesson' ? step.lesson.title : step.ex.title}</strong>
          <span className="muted small">{step.kind === 'lesson' ? tr(`Cours · ${step.lesson.minutes} min`, `Lesson · ${step.lesson.minutes} min`) : tr(`Exercice · niveau ${step.ex.level}`, `Exercise · level ${step.ex.level}`)}</span>
          <span className="go">{tr('Y aller', 'Go')} →</span>
        </a>
      )}

      {lessons.length > 0 && (
        <section aria-labelledby="cours-h">
          <h2 id="cours-h">{tr('Cours', 'Lessons')}</h2>
          <div className="grid cols-3">
            {lessons.map((l) => (
              <a key={l.id} className="card link" href={href('cours', l.id)}>
                <h3>{l.title}</h3>
                <p className="muted small">{l.summary}</p>
                <span className="pill">{l.minutes} min</span> {p.lessonsDone.includes(l.id) && <span className="pill ok">{tr('Lu', 'Read')}</span>}
              </a>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="map-h" className="map">
        <h2 id="map-h">{tr('Carte des niveaux', 'Level map')}</h2>
        {exs.length === 0 && <div className="state">{tr('Aucun exercice dans ce parcours pour le moment.', 'No exercises in this path yet.')}</div>}
        {([1, 2, 3, 4] as Level[]).map((lvl) => {
          const inLvl = exs.filter((e) => e.level === lvl);
          if (inLvl.length === 0) return null;
          const open = levelUnlocked(ALL_EXERCISES, path.id, lvl, p.done) || p.settings.unlockAll;
          const d = inLvl.filter((e) => p.done[e.id]).length;
          return (
            <div key={lvl} className={`lvl${open ? '' : ' locked'}`}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>{tr('Niveau', 'Level')} {lvl} : {LEVEL_NAMES[lvl]}</h3>
                <span className="pill">{d}/{inLvl.length}</span>
              </div>
              {!open && <p className="muted small">{tr('Réussissez 60 % du niveau précédent pour ouvrir ce niveau.', 'Complete 60% of the previous level to open this level.')}</p>}
              <div className="nodes">
                {inLvl.map((e) => {
                  const ok = isUnlocked(e, ALL_EXERCISES, p.done, p.settings.unlockAll);
                  const isDone = !!p.done[e.id];
                  const isNext = e.id === nextId;
                  const cls = `node${isDone ? ' done' : ''}${ok ? '' : ' locked'}${isNext ? ' next' : ''}`;
                  const inner = (
                    <>
                      <span className="t"><span className="node-n" aria-hidden="true">{isDone ? '✓' : ok ? order.findIndex((x) => x.id === e.id) + 1 : '🔒'}</span>{e.title}</span>
                      {isNext && <span className="pill info">{tr('À faire maintenant', 'Do this now')}</span>}
                      <span className="muted small">{e.kind === 'mission' ? tr('Mission finale', 'Final mission') : e.kind === 'assessment' ? tr('Évaluation', 'Assessment') : tr('Exercice', 'Exercise')}</span>
                    </>
                  );
                  return ok ? (
                    <a key={e.id} className={cls} href={href('exercice', e.id)}>{inner}</a>
                  ) : (
                    <span key={e.id} className={cls} aria-disabled="true" title={tr('Verrouillé : terminez les prérequis', 'Locked: complete the prerequisites')}>{inner}</span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

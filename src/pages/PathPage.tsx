import { ALL_EXERCISES, ALL_LESSONS } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { LEVEL_NAMES } from '../content/types.ts';
import type { Level, PathId } from '../content/types.ts';
import { isUnlocked, levelUnlocked } from '../engine/unlock.ts';
import { href } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';

export function PathPage({ id }: { id: string }) {
  const p = useProgress();
  const path = PATH_BY_ID[id as PathId];
  if (!path) return <div className="state" role="alert"><h2>Parcours introuvable</h2><a className="btn" href={href('catalogue')}>Catalogue</a></div>;
  const exs = ALL_EXERCISES.filter((e) => e.path === path.id);
  const lessons = ALL_LESSONS.filter((l) => l.path === path.id);
  const done = exs.filter((e) => p.done[e.id]).length;
  return (
    <div className="stack">
      <nav className="crumbs" aria-label="Fil d’Ariane"><a href={href('catalogue')}>Catalogue</a> / <span aria-current="page">{path.short}</span></nav>
      <h1 style={{ borderLeft: `6px solid ${path.accent}`, paddingLeft: '0.7rem' }}>{path.title}</h1>
      <p className="lead muted">{path.description}</p>
      <div className="bar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={exs.length || 1} aria-label="Progression du parcours"><span style={{ width: `${exs.length ? (done / exs.length) * 100 : 0}%` }} /></div>
      <p className="muted small">{done} sur {exs.length} exercice(s) réussis.</p>

      {lessons.length > 0 && (
        <section aria-labelledby="cours-h">
          <h2 id="cours-h">Cours</h2>
          <div className="grid cols-3">
            {lessons.map((l) => (
              <a key={l.id} className="card link" href={href('cours', l.id)}>
                <h3>{l.title}</h3>
                <p className="muted small">{l.summary}</p>
                <span className="pill">{l.minutes} min</span> {p.lessonsDone.includes(l.id) && <span className="pill ok">Lu</span>}
              </a>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="map-h" className="map">
        <h2 id="map-h">Carte des niveaux</h2>
        {exs.length === 0 && <div className="state">Aucun exercice dans ce parcours pour le moment.</div>}
        {([1, 2, 3, 4] as Level[]).map((lvl) => {
          const inLvl = exs.filter((e) => e.level === lvl);
          if (inLvl.length === 0) return null;
          const open = levelUnlocked(ALL_EXERCISES, path.id, lvl, p.done) || p.settings.unlockAll;
          const d = inLvl.filter((e) => p.done[e.id]).length;
          return (
            <div key={lvl} className={`lvl${open ? '' : ' locked'}`}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>Niveau {lvl} : {LEVEL_NAMES[lvl]}</h3>
                <span className="pill">{d}/{inLvl.length}</span>
              </div>
              {!open && <p className="muted small">Réussissez 60 % du niveau précédent pour ouvrir ce niveau.</p>}
              <div className="nodes">
                {inLvl.map((e) => {
                  const ok = isUnlocked(e, ALL_EXERCISES, p.done, p.settings.unlockAll);
                  const isDone = !!p.done[e.id];
                  const cls = `node${isDone ? ' done' : ''}${ok ? '' : ' locked'}`;
                  const inner = (
                    <>
                      <span className="t">{isDone ? '✓ ' : ok ? '' : '🔒 '}{e.title}</span>
                      <span className="muted small">{e.kind === 'mission' ? 'Mission finale' : e.kind === 'assessment' ? 'Évaluation' : 'Exercice'}</span>
                    </>
                  );
                  return ok ? (
                    <a key={e.id} className={cls} href={href('exercice', e.id)}>{inner}</a>
                  ) : (
                    <span key={e.id} className={cls} aria-disabled="true" title="Verrouillé : terminez les prérequis">{inner}</span>
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

import type { Exercise } from '../content/types.ts';
import { LEVEL_NAMES } from '../content/types.ts';
import { ALL_EXERCISES } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { orderedPath } from '../engine/next.ts';
import { href } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';
import { tr } from '../i18n/lang.ts';

/** Barre de position : où suis-je dans le parcours, et où aller ensuite. */
export function PathBar({ ex }: { ex: Exercise }) {
  const p = useProgress();
  const path = PATH_BY_ID[ex.path];
  const list = orderedPath(ALL_EXERCISES, ex.path);
  const i = list.findIndex((e) => e.id === ex.id);
  const prev = i > 0 ? list[i - 1] : null;
  const next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
  const done = list.filter((e) => p.done[e.id]).length;
  return (
    <div className="pathbar" style={{ ['--pc' as string]: path.accent }}>
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}>
        <a href={href('accueil')}>{tr('Accueil', 'Home')}</a> / <a href={href('parcours', ex.path)}>{path.short}</a> / <span aria-current="page">{tr('Niveau', 'Level')} {ex.level} : {LEVEL_NAMES[ex.level]}</span>
      </nav>
      <div className="pathbar-pos">
        <a className="btn small ghost" href={prev ? href('exercice', prev.id) : href('parcours', ex.path)} aria-label={prev ? tr(`Exercice précédent : ${prev.title}`, `Previous exercise: ${prev.title}`) : tr('Retour au parcours', 'Back to the path')}>←</a>
        <span className="pathbar-count" title={`${done}/${list.length} ${tr('réussis', 'completed')}`}>
          <strong>{i + 1}</strong> / {list.length}
          <span className="bar" aria-hidden="true"><span style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} /></span>
        </span>
        <a className="btn small ghost" href={next ? href('exercice', next.id) : href('parcours', ex.path)} aria-label={next ? tr(`Exercice suivant : ${next.title}`, `Next exercise: ${next.title}`) : tr('Retour au parcours', 'Back to the path')}>→</a>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { ALL_EXERCISES } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { COMPETENCIES } from '../content/competencies.ts';
import { EX_TYPE_LABELS, LEVEL_NAMES } from '../content/types.ts';
import type { ExType, Level, PathId } from '../content/types.ts';
import { isUnlocked } from '../engine/unlock.ts';
import { href } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';
import { tr, useLang } from '../i18n/lang.ts';

export function CatalogPage({ initialPath }: { initialPath?: string }) {
  const p = useProgress();
  const lang = useLang();
  const [q, setQ] = useState('');
  const [path, setPath] = useState<string>(initialPath ?? '');
  const [level, setLevel] = useState('');
  const [type, setType] = useState('');
  const [comp, setComp] = useState('');
  const [status, setStatus] = useState('');
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALL_EXERCISES.filter((e) => {
      if (path && e.path !== (path as PathId)) return false;
      if (level && e.level !== (Number(level) as Level)) return false;
      if (type && e.type !== (type as ExType)) return false;
      if (comp && e.competency !== comp) return false;
      const done = !!p.done[e.id];
      if (status === 'done' && !done) return false;
      if (status === 'todo' && done) return false;
      if (status === 'fav' && !p.favorites.includes(e.id)) return false;
      if (status === 'open' && !isUnlocked(e, ALL_EXERCISES, p.done, p.settings.unlockAll, p.startLevel[e.path])) return false;
      if (needle && !`${e.title} ${e.objective}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, path, level, type, comp, status, p, lang]);
  const reset = () => { setQ(''); setPath(''); setLevel(''); setType(''); setComp(''); setStatus(''); };
  return (
    <div className="stack">
      <h1>{tr('Catalogue', 'Catalog')}</h1>
      <form className="filters card" onSubmit={(e) => e.preventDefault()} aria-label={tr('Filtres du catalogue', 'Catalog filters')}>
        <label>{tr('Recherche', 'Search')}<input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Titre ou objectif', 'Title or objective')} /></label>
        <label>{tr('Parcours', 'Path')}<select value={path} onChange={(e) => setPath(e.target.value)}><option value="">{tr('Tous', 'All')}</option>{PATHS.map((x) => <option key={x.id} value={x.id}>{x.short}</option>)}</select></label>
        <label>{tr('Niveau', 'Level')}<select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">{tr('Tous', 'All')}</option>{([1, 2, 3, 4] as Level[]).map((l) => <option key={l} value={l}>{l} : {LEVEL_NAMES[l]}</option>)}</select></label>
        <label>Type<select value={type} onChange={(e) => setType(e.target.value)}><option value="">{tr('Tous', 'All')}</option>{(Object.keys(EX_TYPE_LABELS) as ExType[]).map((t) => <option key={t} value={t}>{EX_TYPE_LABELS[t]}</option>)}</select></label>
        <label>{tr('Compétence', 'Competency')}<select value={comp} onChange={(e) => setComp(e.target.value)}><option value="">{tr('Toutes', 'All')}</option>{COMPETENCIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>{tr('État', 'Status')}<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">{tr('Tous', 'All')}</option><option value="open">{tr('Débloqués', 'Unlocked')}</option><option value="todo">{tr('À faire', 'To do')}</option><option value="done">{tr('Réussis', 'Completed')}</option><option value="fav">{tr('Favoris', 'Favorites')}</option></select></label>
        <button type="button" className="btn ghost" onClick={reset}>{tr('Réinitialiser', 'Reset')}</button>
      </form>
      <p role="status" aria-live="polite" className="muted">{tr(`${list.length} exercice(s) sur ${ALL_EXERCISES.length}.`, `${list.length} of ${ALL_EXERCISES.length} exercise(s).`)}</p>
      {list.length === 0 ? (
        <div className="state"><h2>{tr('Aucun résultat', 'No results')}</h2><p>{tr('Aucun exercice ne correspond à ces filtres.', 'No exercise matches these filters.')}</p><button type="button" className="btn" onClick={reset}>{tr('Effacer les filtres', 'Clear filters')}</button></div>
      ) : (
        <div className="grid cols-3">
          {list.map((e) => {
            const done = p.done[e.id];
            const open = isUnlocked(e, ALL_EXERCISES, p.done, p.settings.unlockAll, p.startLevel[e.path]);
            return (
              <a key={e.id} className="card link" href={href('exercice', e.id)} aria-label={`${e.title}${done ? tr(', réussi', ', completed') : open ? '' : tr(', verrouillé', ', locked')}`}>
                <div className="row" style={{ marginBottom: '0.4rem' }}>
                  <span className="pill">{tr('Niv.', 'Lvl')} {e.level}</span>
                  <span className="pill">{EX_TYPE_LABELS[e.type]}</span>
                  {done && <span className="pill ok">{tr('Réussi', 'Completed')}</span>}
                  {!done && !open && <span className="pill bad">{tr('Verrouillé', 'Locked')}</span>}
                  {p.favorites.includes(e.id) && <span className="pill warn">★</span>}
                </div>
                <h3>{e.title}</h3>
                <p className="muted small">{e.objective}</p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

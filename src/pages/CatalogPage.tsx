import { useMemo, useState } from 'react';
import { ALL_EXERCISES } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { COMPETENCIES } from '../content/competencies.ts';
import { EX_TYPE_LABELS, LEVEL_NAMES } from '../content/types.ts';
import type { ExType, Level, PathId } from '../content/types.ts';
import { isUnlocked } from '../engine/unlock.ts';
import { href } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';

export function CatalogPage({ initialPath }: { initialPath?: string }) {
  const p = useProgress();
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
      if (status === 'open' && !isUnlocked(e, ALL_EXERCISES, p.done, p.settings.unlockAll)) return false;
      if (needle && !`${e.title} ${e.objective}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, path, level, type, comp, status, p]);
  const reset = () => { setQ(''); setPath(''); setLevel(''); setType(''); setComp(''); setStatus(''); };
  return (
    <div className="stack">
      <h1>Catalogue</h1>
      <form className="filters card" onSubmit={(e) => e.preventDefault()} aria-label="Filtres du catalogue">
        <label>Recherche<input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titre ou objectif" /></label>
        <label>Parcours<select value={path} onChange={(e) => setPath(e.target.value)}><option value="">Tous</option>{PATHS.map((x) => <option key={x.id} value={x.id}>{x.short}</option>)}</select></label>
        <label>Niveau<select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Tous</option>{([1, 2, 3, 4] as Level[]).map((l) => <option key={l} value={l}>{l} : {LEVEL_NAMES[l]}</option>)}</select></label>
        <label>Type<select value={type} onChange={(e) => setType(e.target.value)}><option value="">Tous</option>{(Object.keys(EX_TYPE_LABELS) as ExType[]).map((t) => <option key={t} value={t}>{EX_TYPE_LABELS[t]}</option>)}</select></label>
        <label>Compétence<select value={comp} onChange={(e) => setComp(e.target.value)}><option value="">Toutes</option>{COMPETENCIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>État<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tous</option><option value="open">Débloqués</option><option value="todo">À faire</option><option value="done">Réussis</option><option value="fav">Favoris</option></select></label>
        <button type="button" className="btn ghost" onClick={reset}>Réinitialiser</button>
      </form>
      <p role="status" aria-live="polite" className="muted">{list.length} exercice(s) sur {ALL_EXERCISES.length}.</p>
      {list.length === 0 ? (
        <div className="state"><h2>Aucun résultat</h2><p>Aucun exercice ne correspond à ces filtres.</p><button type="button" className="btn" onClick={reset}>Effacer les filtres</button></div>
      ) : (
        <div className="grid cols-3">
          {list.map((e) => {
            const done = p.done[e.id];
            const open = isUnlocked(e, ALL_EXERCISES, p.done, p.settings.unlockAll);
            return (
              <a key={e.id} className="card link" href={href('exercice', e.id)} aria-label={`${e.title}${done ? ', réussi' : open ? '' : ', verrouillé'}`}>
                <div className="row" style={{ marginBottom: '0.4rem' }}>
                  <span className="pill">Niv. {e.level}</span>
                  <span className="pill">{EX_TYPE_LABELS[e.type]}</span>
                  {done && <span className="pill ok">Réussi</span>}
                  {!done && !open && <span className="pill bad">Verrouillé</span>}
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

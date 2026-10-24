import { useRef, useState } from 'react';
import { ALL_EXERCISES } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { competencyBadges, globalBadges, rankFor } from '../engine/scoring.ts';
import { dueForReview, exportProgress, importProgress, store, totalXp } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { EXERCISE_BY_ID } from '../content/index.ts';

export function DashboardPage() {
  const p = useProgress();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const xp = totalXp(p);
  const rank = rankFor(xp);
  const comp = competencyBadges(ALL_EXERCISES, p);
  const glob = globalBadges(ALL_EXERCISES, p);
  const due = dueForReview(p).filter((id) => EXERCISE_BY_ID[id]);
  const favs = p.favorites.filter((id) => EXERCISE_BY_ID[id]);

  const doExport = () => {
    const blob = new Blob([exportProgress(p)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'boreal-progression.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg({ kind: 'ok', text: 'Sauvegarde téléchargée.' });
  };
  const doImport = async (f: File | undefined) => {
    if (!f) return;
    try {
      const imported = importProgress(await f.text());
      store.set(() => imported);
      setMsg({ kind: 'ok', text: 'Progression importée.' });
    } catch (e) {
      setMsg({ kind: 'bad', text: e instanceof Error ? e.message : 'Import impossible.' });
    }
  };

  return (
    <div className="stack">
      <h1>Tableau de bord</h1>
      {!store.storageAvailable() && <div className="verdict warn" role="alert">Le stockage local est indisponible (navigation privée ou blocage) : votre progression ne sera pas conservée après la fermeture de l’onglet. Utilisez « Exporter » pour la sauvegarder.</div>}
      <div className="grid cols-3">
        <div className="card"><p className="muted small">Rang</p><h2 style={{ margin: 0 }}>{rank.name}</h2><div className="bar" style={{ margin: '0.5rem 0' }}><span style={{ width: `${rank.pct}%` }} /></div><p className="muted small">{xp} XP{rank.next ? ` · ${rank.next.xp - xp} XP avant ${rank.next.name}` : ''}</p></div>
        <div className="card"><p className="muted small">Exercices réussis</p><h2 style={{ margin: 0 }}>{Object.keys(p.done).length} / {ALL_EXERCISES.length}</h2></div>
        <div className="card"><p className="muted small">À réviser aujourd’hui</p><h2 style={{ margin: 0 }}>{due.length}</h2>{due.length > 0 && <a href={href('revision')}>Ouvrir la révision</a>}</div>
      </div>

      <section aria-labelledby="pp">
        <h2 id="pp">Par parcours</h2>
        <div className="grid cols-2">
          {PATHS.map((pa) => {
            const list = ALL_EXERCISES.filter((e) => e.path === pa.id);
            const d = list.filter((e) => p.done[e.id]).length;
            return (
              <a key={pa.id} className="card link" href={href('parcours', pa.id)}>
                <div className="row" style={{ justifyContent: 'space-between' }}><strong>{pa.short}</strong><span className="muted small">{d}/{list.length}</span></div>
                <div className="bar" style={{ marginTop: '0.4rem' }}><span style={{ width: `${list.length ? (d / list.length) * 100 : 0}%` }} /></div>
              </a>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="bc">
        <h2 id="bc">Badges de compétences</h2>
        {comp.every((b) => b.tier === 'none') && <p className="muted">Réussissez des exercices pour gagner un premier badge de compétence (bronze, argent, or).</p>}
        <div className="grid cols-3">
          {comp.map((b) => (
            <div key={b.id} className={`badge ${b.tier === 'none' ? 'off' : b.tier}`}>
              <div className="medal" aria-hidden="true">{b.tier === 'none' ? '·' : b.tier === 'bronze' ? 'B' : b.tier === 'argent' ? 'A' : 'O'}</div>
              <strong>{b.name}</strong>
              <div className="muted small">{b.tier === 'none' ? 'Pas encore obtenu' : `Badge ${b.tier}`} · {b.done}/{b.total}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="gb">
        <h2 id="gb">Badges généraux</h2>
        <div className="grid cols-3">
          {glob.map((b) => (
            <div key={b.id} className={`badge ${b.earned ? 'or' : 'off'}`}>
              <div className="medal" aria-hidden="true">{b.earned ? '✓' : '·'}</div>
              <strong>{b.name}</strong>
              <div className="muted small">{b.description}</div>
              <span className="sr-only">{b.earned ? 'Obtenu' : 'Non obtenu'}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="fv">
        <h2 id="fv">Favoris</h2>
        {favs.length === 0 ? <div className="state">Aucun favori. Utilisez « Ajouter aux favoris » sur un exercice.</div> : <ul>{favs.map((id) => <li key={id}><a href={href('exercice', id)}>{EXERCISE_BY_ID[id].title}</a></li>)}</ul>}
      </section>

      <section className="card stack" aria-labelledby="st">
        <h2 id="st" style={{ fontSize: '1.15rem' }}>Réglages et données</h2>
        <div className="row">
          <label>Thème{' '}
            <select value={p.settings.theme} onChange={(e) => store.set((s) => ({ ...s, settings: { ...s.settings, theme: e.target.value as 'auto' | 'dark' | 'light' } }))}>
              <option value="auto">Automatique</option><option value="dark">Sombre</option><option value="light">Clair</option>
            </select>
          </label>
          <label>Animations{' '}
            <select value={p.settings.reducedMotion} onChange={(e) => store.set((s) => ({ ...s, settings: { ...s.settings, reducedMotion: e.target.value as 'auto' | 'on' | 'off' } }))}>
              <option value="auto">Selon le système</option><option value="on">Réduites</option><option value="off">Sans animation</option>
            </select>
          </label>
        </div>
        <label className="row"><input type="checkbox" checked={p.settings.unlockAll} onChange={(e) => store.set((s) => ({ ...s, settings: { ...s.settings, unlockAll: e.target.checked } }))} /> Tout débloquer (mode exploration)</label>
        <label className="row"><input type="checkbox" checked={p.settings.timed} onChange={(e) => store.set((s) => ({ ...s, settings: { ...s.settings, timed: e.target.checked } }))} /> Défis chronométrés (bonus de 15 % d’XP si le temps de référence est respecté)</label>
        <div className="row">
          <button type="button" className="btn" onClick={doExport}>Exporter la progression</button>
          <button type="button" className="btn" onClick={() => file.current?.click()}>Importer une sauvegarde</button>
          <input ref={file} type="file" accept="application/json" className="sr-only" aria-label="Fichier de sauvegarde" onChange={(e) => { void doImport(e.target.files?.[0]); e.target.value = ''; }} />
          <button type="button" className="btn danger" onClick={() => { if (window.confirm('Effacer toute la progression de ce navigateur ?')) { store.reset(); setMsg({ kind: 'ok', text: 'Progression effacée.' }); } }}>Réinitialiser</button>
        </div>
        <div aria-live="polite">{msg && <p className={`pill ${msg.kind}`}>{msg.text}</p>}</div>
      </section>
    </div>
  );
}

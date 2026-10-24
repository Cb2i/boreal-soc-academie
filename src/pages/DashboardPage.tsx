import { useRef, useState } from 'react';
import { ALL_EXERCISES } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { competencyBadges, globalBadges, rankFor } from '../engine/scoring.ts';
import { dueForReview, exportProgress, importProgress, store, totalXp } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { EXERCISE_BY_ID } from '../content/index.ts';
import { tr } from '../i18n/lang.ts';
import { streak, weeklyCount } from '../engine/streak.ts';
import { pathCompletion } from './CertificatePage.tsx';

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
    setMsg({ kind: 'ok', text: tr('Sauvegarde téléchargée.', 'Backup downloaded.') });
  };
  const doImport = async (f: File | undefined) => {
    if (!f) return;
    try {
      const imported = importProgress(await f.text());
      store.set(() => imported);
      setMsg({ kind: 'ok', text: tr('Progression importée.', 'Progress imported.') });
    } catch (e) {
      setMsg({ kind: 'bad', text: e instanceof Error ? e.message : tr('Import impossible.', 'Import failed.') });
    }
  };

  return (
    <div className="stack">
      <h1>{tr('Tableau de bord', 'Dashboard')}</h1>
      {!store.storageAvailable() && <div className="verdict warn" role="alert">{tr('Le stockage local est indisponible (navigation privée ou blocage) : votre progression ne sera pas conservée après la fermeture de l’onglet. Utilisez « Exporter » pour la sauvegarder.', 'Local storage is unavailable (private browsing or blocked): your progress will not be kept after the tab is closed. Use “Export” to save it.')}</div>}
      <div className="grid cols-3">
        <div className="card"><p className="muted small">{tr('Rang', 'Rank')}</p><h2 style={{ margin: 0 }}>{rank.name}</h2><div className="bar" style={{ margin: '0.5rem 0' }}><span style={{ width: `${rank.pct}%` }} /></div><p className="muted small">{xp} XP{rank.next ? tr(` · ${rank.next.xp - xp} XP avant ${rank.next.name}`, ` · ${rank.next.xp - xp} XP to ${rank.next.name}`) : ''}</p></div>
        <div className="card"><p className="muted small">{tr('Exercices réussis', 'Completed exercises')}</p><h2 style={{ margin: 0 }}>{Object.keys(p.done).length} / {ALL_EXERCISES.length}</h2></div>
        <div className="card"><p className="muted small">{tr('À réviser aujourd’hui', 'To review today')}</p><h2 style={{ margin: 0 }}>{due.length}</h2>{due.length > 0 && <a href={href('revision')}>{tr('Ouvrir la révision', 'Open review')}</a>}</div>
      </div>

      <section aria-labelledby="sg">
        <h2 id="sg">{tr('Série et objectif de la semaine', 'Streak and weekly goal')}</h2>
        <div className="grid cols-3">
          <div className="card"><p className="muted small">{tr('Série actuelle', 'Current streak')}</p><h2 style={{ margin: 0 }}>{streak(p).current} {tr('jour(s)', 'day(s)')}</h2><p className="muted small">{tr('Meilleure série', 'Best streak')} : {streak(p).best}</p></div>
          <div className="card">
            <p className="muted small">{tr('Cette semaine', 'This week')}</p>
            <h2 style={{ margin: 0 }}>{weeklyCount(p)} / {p.settings.weeklyGoal}</h2>
            <div className="bar" style={{ margin: '0.5rem 0' }}><span style={{ width: `${Math.min(100, (weeklyCount(p) / p.settings.weeklyGoal) * 100)}%` }} /></div>
          </div>
          <div className="card">
            <label htmlFor="goal" className="muted small">{tr('Objectif : réussites par semaine', 'Goal: completions per week')}</label>
            <input id="goal" type="number" min={1} max={50} value={p.settings.weeklyGoal} onChange={(e) => { const n = Math.min(50, Math.max(1, Math.round(Number(e.target.value) || 1))); store.set((s) => ({ ...s, settings: { ...s.settings, weeklyGoal: n } })); }} />
          </div>
        </div>
      </section>

      <section aria-labelledby="ct">
        <h2 id="ct">{tr('Certificats', 'Certificates')}</h2>
        <ul className="cert-list">
          {PATHS.map((pa) => {
            const c = pathCompletion(pa.id, p);
            return (
              <li key={pa.id}>
                <span>{pa.short} <span className="muted small">({c.done}/{c.total})</span></span>
                {c.complete ? <a className="btn small" href={href('certificat', pa.id)}>{tr('Voir le certificat', 'View certificate')}</a> : <span className="muted small">{tr('Parcours à terminer', 'Finish the path first')}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="pp">
        <h2 id="pp">{tr('Par parcours', 'By path')}</h2>
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
        <h2 id="bc">{tr('Badges de compétences', 'Competency badges')}</h2>
        {comp.every((b) => b.tier === 'none') && <p className="muted">{tr('Réussissez des exercices pour gagner un premier badge de compétence (bronze, argent, or).', 'Complete exercises to earn your first competency badge (bronze, silver, gold).')}</p>}
        <div className="grid cols-3">
          {comp.map((b) => (
            <div key={b.id} className={`badge ${b.tier === 'none' ? 'off' : b.tier}`}>
              <div className="medal" aria-hidden="true">{b.tier === 'none' ? '·' : b.tier === 'bronze' ? 'B' : b.tier === 'argent' ? tr('A', 'S') : tr('O', 'G')}</div>
              <strong>{b.name}</strong>
              <div className="muted small">{b.tier === 'none' ? tr('Pas encore obtenu', 'Not earned yet') : tr(`Badge ${b.tier}`, `${b.tier === 'argent' ? 'Silver' : b.tier === 'or' ? 'Gold' : 'Bronze'} badge`)} · {b.done}/{b.total}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="gb">
        <h2 id="gb">{tr('Badges généraux', 'General badges')}</h2>
        <div className="grid cols-3">
          {glob.map((b) => (
            <div key={b.id} className={`badge ${b.earned ? 'or' : 'off'}`}>
              <div className="medal" aria-hidden="true">{b.earned ? '✓' : '·'}</div>
              <strong>{b.name}</strong>
              <div className="muted small">{b.description}</div>
              <span className="sr-only">{b.earned ? tr('Obtenu', 'Earned') : tr('Non obtenu', 'Not earned')}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="fv">
        <h2 id="fv">{tr('Favoris', 'Favorites')}</h2>
        {favs.length === 0 ? <div className="state">{tr('Aucun favori. Utilisez « Ajouter aux favoris » sur un exercice.', 'No favorites. Use “Add to favorites” on an exercise.')}</div> : <ul>{favs.map((id) => <li key={id}><a href={href('exercice', id)}>{EXERCISE_BY_ID[id].title}</a></li>)}</ul>}
      </section>

      <section className="card stack" aria-labelledby="st">
        <h2 id="st" style={{ fontSize: '1.15rem' }}>{tr('Réglages et données', 'Settings and data')}</h2>
        <div className="row">
          <label>{tr('Thème', 'Theme')}{' '}
            <select value={p.settings.theme} onChange={(e) => store.set((s) => ({ ...s, settings: { ...s.settings, theme: e.target.value as 'auto' | 'dark' | 'light' } }))}>
              <option value="auto">{tr('Automatique', 'Automatic')}</option><option value="dark">{tr('Sombre', 'Dark')}</option><option value="light">{tr('Clair', 'Light')}</option>
            </select>
          </label>
          <label>{tr('Animations', 'Animations')}{' '}
            <select value={p.settings.reducedMotion} onChange={(e) => store.set((s) => ({ ...s, settings: { ...s.settings, reducedMotion: e.target.value as 'auto' | 'on' | 'off' } }))}>
              <option value="auto">{tr('Selon le système', 'Follow system')}</option><option value="on">{tr('Réduites', 'Reduced')}</option><option value="off">{tr('Sans animation', 'None')}</option>
            </select>
          </label>
        </div>
        <label className="row"><input type="checkbox" checked={p.settings.unlockAll} onChange={(e) => store.set((s) => ({ ...s, settings: { ...s.settings, unlockAll: e.target.checked } }))} /> {tr('Tout débloquer (mode exploration)', 'Unlock everything (exploration mode)')}</label>
        <div className="row">
          <button type="button" className="btn" onClick={doExport}>{tr('Exporter la progression', 'Export progress')}</button>
          <button type="button" className="btn" onClick={() => file.current?.click()}>{tr('Importer une sauvegarde', 'Import a backup')}</button>
          <input ref={file} type="file" accept="application/json" className="sr-only" aria-label={tr('Fichier de sauvegarde', 'Backup file')} onChange={(e) => { void doImport(e.target.files?.[0]); e.target.value = ''; }} />
          <button type="button" className="btn danger" onClick={() => { if (window.confirm(tr('Effacer toute la progression de ce navigateur ?', 'Erase all progress in this browser?'))) { store.reset(); setMsg({ kind: 'ok', text: tr('Progression effacée.', 'Progress erased.') }); } }}>{tr('Réinitialiser', 'Reset')}</button>
        </div>
        <div aria-live="polite">{msg && <p className={`pill ${msg.kind}`}>{msg.text}</p>}</div>
      </section>
    </div>
  );
}

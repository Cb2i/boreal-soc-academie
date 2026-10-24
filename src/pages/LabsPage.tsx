import { ALL_LABS } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { store } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';

export function LabsPage() {
  const p = useProgress();
  return (
    <div className="stack">
      <h1>Labos Azure réels (optionnels)</h1>
      <div className="callout preview">
        <strong>Ces labos sont séparés des exercices.</strong> Ils créent de vraies ressources dans un abonnement Azure que vous contrôlez et peuvent générer des coûts. N’utilisez jamais un locataire de production, ne partagez aucun secret, et suivez toujours l’étape de nettoyage. Rien dans cette application ne se connecte à Azure.
      </div>
      <p className="muted small">Transparence : les commandes et les étapes sont fondées sur la documentation officielle consultée aux dates indiquées, mais ces labos n’ont pas été exécutés de bout en bout dans un abonnement réel lors de la conception de cette plateforme. Vérifiez les noms de paramètres avec az --help et la tarification actuelle avant de commencer.</p>
      {ALL_LABS.length === 0 && <div className="state">Aucun labo pour le moment.</div>}
      {ALL_LABS.map((l) => {
        const checked = p.labsChecked[l.id] ?? [];
        const toggle = (key: string) => store.set((s) => {
          const cur = s.labsChecked[l.id] ?? [];
          return { ...s, labsChecked: { ...s.labsChecked, [l.id]: cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key] } };
        });
        return (
          <article key={l.id} className="card stack" aria-labelledby={`lab-${l.id}`}>
            <h2 id={`lab-${l.id}`}>{l.title}</h2>
            <div className="row"><span className="pill">{PATH_BY_ID[l.path].short}</span><span className="pill">Niveau {l.level}</span>{l.preview && <span className="pill warn">Préversion</span>}</div>
            <p>{l.summary}</p>
            <h3>Prérequis</h3><ul>{l.prerequisites.map((x, i) => <li key={i}>{x}</li>)}</ul>
            <p><strong>Licences :</strong> {l.licenses}</p>
            <p><strong>Coûts :</strong> {l.cost}</p>
            <h3>Étapes</h3>
            <ol>{l.steps.map((x, i) => <li key={i}><label className="row" style={{ fontWeight: 400 }}><input type="checkbox" checked={checked.includes(`s${i}`)} onChange={() => toggle(`s${i}`)} /> {x}</label></li>)}</ol>
            <h3>Vérifications</h3>
            <ul>{l.checks.map((x, i) => <li key={i}><label className="row" style={{ fontWeight: 400 }}><input type="checkbox" checked={checked.includes(`c${i}`)} onChange={() => toggle(`c${i}`)} /> {x}</label></li>)}</ul>
            <h3>Nettoyage</h3>
            <ol>{l.cleanup.map((x, i) => <li key={i}><label className="row" style={{ fontWeight: 400 }}><input type="checkbox" checked={checked.includes(`n${i}`)} onChange={() => toggle(`n${i}`)} /> {x}</label></li>)}</ol>
            <h3>Sources</h3>
            <ul className="small">{l.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted">(vérifié le {s.verified})</span></li>)}</ul>
          </article>
        );
      })}
    </div>
  );
}

import { ALL_LABS } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import { store } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { tr } from '../i18n/lang.ts';

export function LabsPage() {
  const p = useProgress();
  return (
    <div className="stack">
      <h1>{tr('Labos Azure réels (optionnels)', 'Real Azure labs (optional)')}</h1>
      <div className="callout preview">
        {tr(
          <><strong>Ces labos sont séparés des exercices.</strong> Ils créent de vraies ressources dans un abonnement Azure que vous contrôlez et peuvent générer des coûts. N’utilisez jamais un locataire de production, ne partagez aucun secret, et suivez toujours l’étape de nettoyage. Rien dans cette application ne se connecte à Azure.</>,
          <><strong>These labs are separate from the exercises.</strong> They create real resources in an Azure subscription that you control and may incur costs. Never use a production tenant, never share any secret, and always follow the cleanup step. Nothing in this application connects to Azure.</>,
        )}
      </div>
      <p className="muted small">{tr('Transparence : les commandes et les étapes sont fondées sur la documentation officielle consultée aux dates indiquées, mais ces labos n’ont pas été exécutés de bout en bout dans un abonnement réel lors de la conception de cette plateforme. Vérifiez les noms de paramètres avec az --help et la tarification actuelle avant de commencer.', 'Transparency: the commands and steps are based on the official documentation consulted on the dates shown, but these labs were not run end to end in a real subscription when this platform was designed. Check parameter names with az --help and current pricing before you start.')}</p>
      {ALL_LABS.length === 0 && <div className="state">{tr('Aucun labo pour le moment.', 'No labs yet.')}</div>}
      {ALL_LABS.map((l) => {
        const checked = p.labsChecked[l.id] ?? [];
        const toggle = (key: string) => store.set((s) => {
          const cur = s.labsChecked[l.id] ?? [];
          return { ...s, labsChecked: { ...s.labsChecked, [l.id]: cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key] } };
        });
        return (
          <article key={l.id} className="card stack" aria-labelledby={`lab-${l.id}`}>
            <h2 id={`lab-${l.id}`}>{l.title}</h2>
            <div className="row"><span className="pill">{PATH_BY_ID[l.path].short}</span><span className="pill">{tr('Niveau', 'Level')} {l.level}</span>{l.preview && <span className="pill warn">{tr('Préversion', 'Preview')}</span>}</div>
            <p>{l.summary}</p>
            <h3>{tr('Prérequis', 'Prerequisites')}</h3><ul>{l.prerequisites.map((x, i) => <li key={i}>{x}</li>)}</ul>
            <p><strong>{tr('Licences :', 'Licenses:')}</strong> {l.licenses}</p>
            <p><strong>{tr('Coûts :', 'Costs:')}</strong> {l.cost}</p>
            <h3>{tr('Étapes', 'Steps')}</h3>
            <ol>{l.steps.map((x, i) => <li key={i}><label className="row" style={{ fontWeight: 400 }}><input type="checkbox" checked={checked.includes(`s${i}`)} onChange={() => toggle(`s${i}`)} /> {x}</label></li>)}</ol>
            <h3>{tr('Vérifications', 'Checks')}</h3>
            <ul>{l.checks.map((x, i) => <li key={i}><label className="row" style={{ fontWeight: 400 }}><input type="checkbox" checked={checked.includes(`c${i}`)} onChange={() => toggle(`c${i}`)} /> {x}</label></li>)}</ul>
            <h3>{tr('Nettoyage', 'Cleanup')}</h3>
            <ol>{l.cleanup.map((x, i) => <li key={i}><label className="row" style={{ fontWeight: 400 }}><input type="checkbox" checked={checked.includes(`n${i}`)} onChange={() => toggle(`n${i}`)} /> {x}</label></li>)}</ol>
            <h3>Sources</h3>
            <ul className="small">{l.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> <span className="muted">({tr('vérifié le', 'verified on')} {s.verified})</span></li>)}</ul>
          </article>
        );
      })}
    </div>
  );
}

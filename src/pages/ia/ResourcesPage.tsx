import { RESOURCES, MODULE_BY_ID } from '../../agentic/content/index.ts';
import { href } from '../../router.ts';
import { tr } from '../../i18n/lang.ts';

const KIND: Record<string, string> = { json: 'JSON', python: 'Python', prompt: 'Prompt', n8n: 'Workflow n8n', config: 'Configuration', grille: 'Grille', schema: 'Schéma', donnees: 'Données fictives', logicapps: 'Logic Apps', markdown: 'Document' };

export function ResourcesPage({ focus }: { focus?: string }) {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={href('ia')}>Agentic AI</a> / <span aria-current="page">{tr('Ressources', 'Resources')}</span></nav>
      <h1>{tr('Ressources téléchargeables', 'Downloadable resources')}</h1>
      <p className="muted">{tr('Chaque fichier indique son statut : « testé » signifie que le contrôle décrit a réellement été exécuté ; « à vérifier » signifie que l’import ou l’exécution reste à confirmer dans votre environnement. Aucun fichier ne contient de secret : remplacez les valeurs d’exemple.', 'Each file shows its status: tested means the described check was actually run; to-verify means import or execution remains to be confirmed.')}</p>
      {RESOURCES.length === 0 && <div className="state">{tr('Aucune ressource publiée pour le moment.', 'No resource published yet.')}</div>}
      <div className="stack">
        {RESOURCES.map((r) => (
          <article key={r.id} id={r.id} className={`card stack${focus === r.id ? ' focus-ring' : ''}`}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{r.title}</h2>
              <span className="row"><span className="pill">{KIND[r.kind]}</span><span className={`pill ${r.status === 'teste' ? 'ok' : 'warn'}`}>{r.status === 'teste' ? tr('Testé', 'Tested') : tr('À vérifier', 'To verify')}</span></span>
            </div>
            <p>{r.description}</p>
            <p className="small"><strong>{tr('Contrôle', 'Check')} :</strong> {r.how}</p>
            {r.needs && <p className="small"><strong>{tr('Credentials et adaptations', 'Credentials and adaptations')} :</strong> {r.needs}</p>}
            <div className="row"><a className="btn" href={`${base}ressources-ia/${r.file}`} download>{tr('Télécharger', 'Download')} ({r.file})</a><span className="muted small">{MODULE_BY_ID[r.module] ? `${tr('Module', 'Module')} ${MODULE_BY_ID[r.module].n}` : tr('Synthèse', 'Capstone')}</span></div>
          </article>
        ))}
      </div>
    </div>
  );
}

import { SUPPORTED_AGGREGATES, SUPPORTED_FUNCTIONS, SUPPORTED_OPERATOR_LIST } from '../kql/index.ts';
import { datasetNote } from '../data/dataset.ts';
import { tr } from '../i18n/lang.ts';

export function LimitsPage() {
  return (
    <div className="stack prose" style={{ maxWidth: '80ch' }}>
      <h1>{tr('Limites et honnêteté technique', 'Limits and technical honesty')}</h1>
      <p>
        {tr(
          <>Boube exécute le KQL avec un <strong>moteur local écrit pour l’apprentissage</strong>. Ce n’est pas Azure Data Explorer ni Log Analytics. Il couvre un sous-ensemble documenté ci-dessous. Une construction non prise en charge est refusée avec un message clair, jamais ignorée en silence.</>,
          <>Boube runs KQL with a <strong>local engine written for learning</strong>. It is not Azure Data Explorer or Log Analytics. It covers the documented subset below. An unsupported construct is rejected with a clear message, never silently ignored.</>,
        )}
      </p>
      <h2>{tr('Ce que la plateforme ne fait pas', 'What the platform does not do')}</h2>
      <ul>
        <li>{tr(<>Aucune requête n’est envoyée à Azure : tout s’exécute dans votre navigateur, sans <code>eval</code>.</>, <>No query is sent to Azure: everything runs in your browser, without <code>eval</code>.</>)}</li>
        <li>{tr('Les données sont fictives et générées de façon déterministe. Un second jeu de données, caché, sert à détecter les réponses codées en dur.', 'The data is fictional and generated deterministically. A second, hidden dataset is used to detect hard-coded answers.')}</li>
        <li>{tr(<>La division est réelle (pas de division entière). <code>percentile</code> utilise le rang le plus proche. <code>make_set</code> retourne un tableau trié. <code>dcount</code> est exact (réellement approximatif dans Kusto).</>, <>Division is real (no integer division). <code>percentile</code> uses the nearest rank. <code>make_set</code> returns a sorted array. <code>dcount</code> is exact (actually approximate in Kusto).</>)}</li>
        <li>{tr(<>Non pris en charge : <code>parse</code>, <code>make-series</code>, <code>series_*</code>, <code>row_number</code>, <code>serialize</code>, <code>lookup</code>, <code>evaluate</code>, <code>mv-apply</code>, <code>scan</code>, <code>search</code>, <code>find</code>.</>, <>Not supported: <code>parse</code>, <code>make-series</code>, <code>series_*</code>, <code>row_number</code>, <code>serialize</code>, <code>lookup</code>, <code>evaluate</code>, <code>mv-apply</code>, <code>scan</code>, <code>search</code>, <code>find</code>.</>)}</li>
        <li>{tr('Le glisser-déposer a toujours une alternative par boutons ou listes (clavier et tactile).', 'Drag and drop always has an alternative with buttons or lists (keyboard and touch).')}</li>
      </ul>
      <h2>{tr('Section Agentic AI : limites', 'Agentic AI section: limits')}</h2>
      <ul>
        <li>{tr('Les agents sont simulés par des règles déterministes : aucun vrai modèle de langage n’a été évalué ici, et aucune API d’IA n’est appelée.', 'Agents are simulated with deterministic rules: no real language model was evaluated here and no AI API is called.')}</li>
        <li>{tr('Les requêtes KQL de cette section suivent la documentation Microsoft mais n’ont pas été exécutées sur un espace Log Analytics réel.', 'KQL queries in this section follow Microsoft documentation but were not run on a real Log Analytics workspace.')}</li>
        <li>{tr('Les ressources marquées « à vérifier » (workflow n8n, instructions Logic Apps, gabarits de prompt) n’ont pas été éprouvées dans leur outil cible. Les ressources « testées » l’ont été avec Python 3 ou Node, pas dans un environnement Azure.', 'Resources marked “to verify” (n8n workflow, Logic Apps instructions, prompt templates) were not exercised in their target tool. “Tested” resources were run with Python 3 or Node, not in Azure.')}</li>
        <li>{tr('Les travaux ouverts n’ont pas de note automatique : seule l’autoévaluation par grille est enregistrée.', 'Open work has no automatic grade: only the rubric self-assessment is recorded.')}</li>
        <li>{tr('Rien de ce cours n’est un avis juridique ou de conformité (par exemple sur les incidents de confidentialité au Québec).', 'Nothing in this course is legal or compliance advice.')}</li>
      </ul>
      <h2>{tr('Deux contextes distincts', 'Two distinct contexts')}</h2>
      <p>
        {tr(
          <><strong>Sentinel / Log Analytics</strong> utilise <code>TimeGenerated</code> et des tables comme <code>SigninLogs</code>. <strong>Defender XDR (Advanced Hunting)</strong> utilise <code>Timestamp</code> et des tables comme <code>DeviceProcessEvents</code>. Interroger une table de l’autre contexte affiche une explication.</>,
          <><strong>Sentinel / Log Analytics</strong> uses <code>TimeGenerated</code> and tables such as <code>SigninLogs</code>. <strong>Defender XDR (Advanced Hunting)</strong> uses <code>Timestamp</code> and tables such as <code>DeviceProcessEvents</code>. Querying a table from the other context shows an explanation.</>,
        )}
      </p>
      <p>{datasetNote()}</p>
      <h2>{tr('Opérateurs pris en charge', 'Supported operators')}</h2>
      <p>{SUPPORTED_OPERATOR_LIST.map((o) => <code key={o} style={{ marginRight: 6 }}>{o}</code>)}</p>
      <h2>{tr('Agrégations', 'Aggregations')}</h2>
      <p>{SUPPORTED_AGGREGATES.map((o) => <code key={o} style={{ marginRight: 6 }}>{o}</code>)}</p>
      <h2>{tr('Fonctions', 'Functions')} ({SUPPORTED_FUNCTIONS.length})</h2>
      <p>{SUPPORTED_FUNCTIONS.map((o) => <code key={o} style={{ marginRight: 6 }}>{o}</code>)}</p>
      <h2>{tr('Verdicts de correction', 'Grading verdicts')}</h2>
      <ul>
        <li>{tr(<><strong>Erreur de syntaxe</strong> : la requête ne peut pas être analysée.</>, <><strong>Syntax error</strong>: the query cannot be parsed.</>)}</li>
        <li>{tr(<><strong>Exécutable mais résultat incorrect</strong> : la requête tourne, le résultat diffère de l’attendu (ou ne tient pas sur le second jeu de données).</>, <><strong>Runs but wrong result</strong>: the query runs, but the result differs from the expected one (or fails on the second dataset).</>)}</li>
        <li>{tr(<><strong>Résultat correct, raisonnement à revoir</strong> : par exemple un filtre exigé par l’énoncé est absent. XP réduits à 60 %.</>, <><strong>Correct result, reasoning to review</strong>: for example a filter required by the statement is missing. XP reduced to 60%.</>)}</li>
        <li>{tr(<><strong>Correct mais optimisable</strong> : par exemple filtrer après <code>summarize</code>. XP à 90 %.</>, <><strong>Correct but optimizable</strong>: for example filtering after <code>summarize</code>. XP at 90%.</>)}</li>
      </ul>
      <h2>{tr('Vie privée', 'Privacy')}</h2>
      <p>{tr('La progression est enregistrée dans le stockage local de votre navigateur. Aucun compte, aucun suivi, aucun service tiers. Polices auto-hébergées.', 'Progress is saved in your browser’s local storage. No account, no tracking, no third-party service. Self-hosted fonts.')}</p>
    </div>
  );
}

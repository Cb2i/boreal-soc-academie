import { SUPPORTED_AGGREGATES, SUPPORTED_FUNCTIONS, SUPPORTED_OPERATOR_LIST } from '../kql/index.ts';
import { DATASET_NOTE } from '../data/dataset.ts';

export function LimitsPage() {
  return (
    <div className="stack prose" style={{ maxWidth: '80ch' }}>
      <h1>Limites et honnêteté technique</h1>
      <p>Boréal exécute le KQL avec un <strong>moteur local écrit pour l’apprentissage</strong>. Ce n’est pas Azure Data Explorer ni Log Analytics. Il couvre un sous-ensemble documenté ci-dessous. Une construction non prise en charge est refusée avec un message clair, jamais ignorée en silence.</p>
      <h2>Ce que la plateforme ne fait pas</h2>
      <ul>
        <li>Aucune requête n’est envoyée à Azure : tout s’exécute dans votre navigateur, sans <code>eval</code>.</li>
        <li>Les données sont fictives et générées de façon déterministe. Un second jeu de données, caché, sert à détecter les réponses codées en dur.</li>
        <li>La division est réelle (pas de division entière). <code>percentile</code> utilise le rang le plus proche. <code>make_set</code> retourne un tableau trié. <code>dcount</code> est exact (réellement approximatif dans Kusto).</li>
        <li>Non pris en charge : <code>parse</code>, <code>make-series</code>, <code>series_*</code>, <code>row_number</code>, <code>serialize</code>, <code>lookup</code>, <code>evaluate</code>, <code>mv-apply</code>, <code>scan</code>, <code>search</code>, <code>find</code>.</li>
        <li>Le glisser-déposer a toujours une alternative par boutons ou listes (clavier et tactile).</li>
      </ul>
      <h2>Deux contextes distincts</h2>
      <p><strong>Sentinel / Log Analytics</strong> utilise <code>TimeGenerated</code> et des tables comme <code>SigninLogs</code>. <strong>Defender XDR (Advanced Hunting)</strong> utilise <code>Timestamp</code> et des tables comme <code>DeviceProcessEvents</code>. Interroger une table de l’autre contexte affiche une explication.</p>
      <p>{DATASET_NOTE}</p>
      <h2>Opérateurs pris en charge</h2>
      <p>{SUPPORTED_OPERATOR_LIST.map((o) => <code key={o} style={{ marginRight: 6 }}>{o}</code>)}</p>
      <h2>Agrégations</h2>
      <p>{SUPPORTED_AGGREGATES.map((o) => <code key={o} style={{ marginRight: 6 }}>{o}</code>)}</p>
      <h2>Fonctions ({SUPPORTED_FUNCTIONS.length})</h2>
      <p>{SUPPORTED_FUNCTIONS.map((o) => <code key={o} style={{ marginRight: 6 }}>{o}</code>)}</p>
      <h2>Verdicts de correction</h2>
      <ul>
        <li><strong>Erreur de syntaxe</strong> : la requête ne peut pas être analysée.</li>
        <li><strong>Exécutable mais résultat incorrect</strong> : la requête tourne, le résultat diffère de l’attendu (ou ne tient pas sur le second jeu de données).</li>
        <li><strong>Résultat correct, raisonnement à revoir</strong> : par exemple un filtre exigé par l’énoncé est absent. XP réduits à 60 %.</li>
        <li><strong>Correct mais optimisable</strong> : par exemple filtrer après <code>summarize</code>. XP à 90 %.</li>
      </ul>
      <h2>Vie privée</h2>
      <p>La progression est enregistrée dans le stockage local de votre navigateur. Aucun compte, aucun suivi, aucun service tiers. Polices auto-hébergées.</p>
    </div>
  );
}

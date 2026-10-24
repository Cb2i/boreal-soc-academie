import { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor.tsx';
import { ResultTable } from '../components/ResultTable.tsx';
import { SchemaPanel } from '../components/SchemaPanel.tsx';
import { execute, VISIBLE_SEED } from '../engine/validate.ts';
import type { RunResult } from '../kql/index.ts';
import type { KqlContext } from '../content/types.ts';
import type { Route } from '../router.ts';
import { tr } from '../i18n/lang.ts';

export function PlaygroundPage({ route }: { route: Route }) {
  const qs = route.query;
  const [ctx, setCtx] = useState<KqlContext>(qs.get('ctx') === 'defender-xdr' ? 'defender-xdr' : 'sentinel');
  const [q, setQ] = useState(qs.get('q') ?? (ctx === 'sentinel' ? 'SigninLogs\n| where TimeGenerated > ago(1d)\n| summarize ' + tr('Connexions', 'Signins') + ' = count() by ResultType\n| sort by ' + tr('Connexions', 'Signins') + ' desc' : 'DeviceProcessEvents\n| where Timestamp > ago(1d)\n| take 10'));
  const [run, setRun] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const doRun = () => {
    setBusy(true);
    setTimeout(() => {
      setRun(execute(ctx, q, VISIBLE_SEED));
      setBusy(false);
    }, 0);
  };
  return (
    <div className="stack">
      <h1>{tr('Terrain de jeu KQL', 'KQL playground')}</h1>
      <p className="muted">{tr(<>Exécutez du KQL sur les données fictives, dans votre navigateur. Le moteur local couvre un sous-ensemble documenté (voir <a href="#/limites">Limites</a>).</>, <>Run KQL on the fictional data, in your browser. The local engine covers a documented subset (see <a href="#/limites">Limits</a>).</>)}</p>
      <label>{tr('Contexte de données', 'Data context')}{' '}
        <select value={ctx} onChange={(e) => setCtx(e.target.value as KqlContext)}>
          <option value="sentinel">Microsoft Sentinel / Log Analytics (TimeGenerated)</option>
          <option value="defender-xdr">Defender XDR, Advanced Hunting (Timestamp)</option>
        </select>
      </label>
      <SchemaPanel context={ctx} />
      <CodeEditor value={q} onChange={setQ} onRun={doRun} label={tr('Requête KQL du terrain de jeu', 'Playground KQL query')} minRows={10} error={run && !run.ok && run.error.line ? { line: run.error.line, col: run.error.col ?? 1 } : null} />
      <div className="row">
        <button type="button" className="btn primary" onClick={doRun} disabled={busy}>{busy ? <span className="spinner" aria-hidden="true" /> : null} {tr('Exécuter', 'Run')} <kbd>Ctrl</kbd>+<kbd>{tr('Entrée', 'Enter')}</kbd></button>
      </div>
      <div aria-live="polite">
        {!run && <div className="state">{tr('Aucun résultat pour l’instant. Exécutez une requête.', 'No results yet. Run a query.')}</div>}
        {run && !run.ok && (
          <div className="verdict bad" role="alert"><h3>{tr('Erreur', 'Error')} ({run.error.kind})</h3><p>{run.error.message}{run.error.line ? tr(` (ligne ${run.error.line}, colonne ${run.error.col})`, ` (line ${run.error.line}, column ${run.error.col})`) : ''}</p>{run.error.hint && <p className="muted">{tr('Piste', 'Hint')} : {run.error.hint}</p>}</div>
        )}
        {run && run.ok && <div className="stack">{run.notes.map((n, i) => <p key={i} className="callout small">{n}</p>)}{run.table.rows.length === 0 ? <div className="state">{tr('La requête s’est exécutée mais ne retourne aucune ligne.', 'The query ran but returned no rows.')}</div> : <ResultTable table={run.table} />}{run.truncated && <p className="muted small">{tr('Résultat tronqué.', 'Result truncated.')}</p>}</div>}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor.tsx';
import { ResultTable } from '../components/ResultTable.tsx';
import { SchemaPanel } from '../components/SchemaPanel.tsx';
import { execute, VISIBLE_SEED } from '../engine/validate.ts';
import type { RunResult } from '../kql/index.ts';
import type { KqlContext } from '../content/types.ts';
import type { Route } from '../router.ts';

export function PlaygroundPage({ route }: { route: Route }) {
  const qs = route.query;
  const [ctx, setCtx] = useState<KqlContext>(qs.get('ctx') === 'defender-xdr' ? 'defender-xdr' : 'sentinel');
  const [q, setQ] = useState(qs.get('q') ?? (ctx === 'sentinel' ? 'SigninLogs\n| where TimeGenerated > ago(1d)\n| summarize Connexions = count() by ResultType\n| sort by Connexions desc' : 'DeviceProcessEvents\n| where Timestamp > ago(1d)\n| take 10'));
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
      <h1>Terrain de jeu KQL</h1>
      <p className="muted">Exécutez du KQL sur les données fictives, dans votre navigateur. Le moteur local couvre un sous-ensemble documenté (voir <a href="#/limites">Limites</a>).</p>
      <label>Contexte de données{' '}
        <select value={ctx} onChange={(e) => setCtx(e.target.value as KqlContext)}>
          <option value="sentinel">Microsoft Sentinel / Log Analytics (TimeGenerated)</option>
          <option value="defender-xdr">Defender XDR, Advanced Hunting (Timestamp)</option>
        </select>
      </label>
      <SchemaPanel context={ctx} />
      <CodeEditor value={q} onChange={setQ} onRun={doRun} label="Requête KQL du terrain de jeu" minRows={10} error={run && !run.ok && run.error.line ? { line: run.error.line, col: run.error.col ?? 1 } : null} />
      <div className="row">
        <button type="button" className="btn primary" onClick={doRun} disabled={busy}>{busy ? <span className="spinner" aria-hidden="true" /> : null} Exécuter <kbd>Ctrl</kbd>+<kbd>Entrée</kbd></button>
      </div>
      <div aria-live="polite">
        {!run && <div className="state">Aucun résultat pour l’instant. Exécutez une requête.</div>}
        {run && !run.ok && (
          <div className="verdict bad" role="alert"><h3>Erreur ({run.error.kind})</h3><p>{run.error.message}{run.error.line ? ` (ligne ${run.error.line}, colonne ${run.error.col})` : ''}</p>{run.error.hint && <p className="muted">Piste : {run.error.hint}</p>}</div>
        )}
        {run && run.ok && <div className="stack">{run.notes.map((n, i) => <p key={i} className="callout small">{n}</p>)}{run.table.rows.length === 0 ? <div className="state">La requête s’est exécutée mais ne retourne aucune ligne.</div> : <ResultTable table={run.table} />}{run.truncated && <p className="muted small">Résultat tronqué.</p>}</div>}
      </div>
    </div>
  );
}

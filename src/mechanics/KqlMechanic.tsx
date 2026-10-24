import { useState } from 'react';
import type { KqlWrite } from '../content/types.ts';
import { CodeEditor } from '../components/CodeEditor.tsx';
import { ResultTable } from '../components/ResultTable.tsx';
import { SchemaPanel } from '../components/SchemaPanel.tsx';
import { execute, VISIBLE_SEED } from '../engine/validate.ts';
import type { RunResult } from '../kql/index.ts';

interface Props {
  ex: KqlWrite;
  query: string;
  onQuery: (q: string) => void;
  disabled: boolean;
  onSubmit: () => void;
  tableOverride?: RunResult | null;
}

export function KqlMechanic({ ex, query, onQuery, disabled, onSubmit }: Props) {
  const [run, setRun] = useState<RunResult | null>(null);
  const doRun = () => setRun(execute(ex.context, query, VISIBLE_SEED));
  return (
    <div className="stack">
      <SchemaPanel context={ex.context} tables={ex.tables} />
      <CodeEditor
        value={query}
        onChange={onQuery}
        onRun={doRun}
        label="Requête KQL"
        readOnly={disabled}
        error={run && !run.ok && run.error.line ? { line: run.error.line, col: run.error.col ?? 1 } : null}
      />
      <div className="row">
        <button type="button" className="btn" onClick={doRun}>Exécuter <kbd>Ctrl</kbd>+<kbd>Entrée</kbd></button>
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled}>Valider ma réponse</button>
        {ex.starter && (
          <button type="button" className="btn ghost" onClick={() => onQuery(ex.starter ?? '')} disabled={disabled}>Réinitialiser</button>
        )}
      </div>
      <div aria-live="polite">
        {run && !run.ok && (
          <div className="verdict bad">
            <strong>Erreur ({run.error.kind})</strong> : {run.error.message}
            {run.error.line ? ` (ligne ${run.error.line}, colonne ${run.error.col})` : ''}
            {run.error.hint && <p className="muted" style={{ margin: '0.4rem 0 0' }}>Piste : {run.error.hint}</p>}
          </div>
        )}
        {run && run.ok && (
          <div className="stack">
            {run.notes.map((n, i) => (
              <p key={i} className="callout small">{n}</p>
            ))}
            <ResultTable table={run.table} />
          </div>
        )}
        {!run && <p className="muted small">Exécutez la requête pour voir le résultat sur les données visibles. La validation compare votre résultat à celui attendu (et à un second jeu de données).</p>}
      </div>
    </div>
  );
}

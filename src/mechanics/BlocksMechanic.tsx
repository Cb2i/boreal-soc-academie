import { useState } from 'react';
import type { KqlBlocks } from '../content/types.ts';
import { HighlightedCode } from '../components/CodeBlock.tsx';
import { ResultTable } from '../components/ResultTable.tsx';
import { SchemaPanel } from '../components/SchemaPanel.tsx';
import { blocksToQuery, execute, VISIBLE_SEED } from '../engine/validate.ts';
import type { Verdict } from '../engine/validate.ts';
import type { RunResult } from '../kql/index.ts';
import { SortableList } from './SortableList.tsx';
import { tr } from '../i18n/lang.ts';

interface Props {
  ex: KqlBlocks;
  ids: string[];
  onIds: (ids: string[]) => void;
  disabled: boolean;
  verdict: Verdict | null;
  announce: (m: string) => void;
  onSubmit: () => void;
}

export function BlocksMechanic({ ex, ids, onIds, disabled, announce, onSubmit }: Props) {
  const [run, setRun] = useState<RunResult | null>(null);
  const used = new Set(ids);
  const pool = ex.blocks.filter((b) => !used.has(b.id));
  const byId = new Map(ex.blocks.map((b) => [b.id, b]));
  const add = (id: string, index?: number) => {
    if (used.has(id)) return;
    const next = ids.slice();
    next.splice(index ?? next.length, 0, id);
    onIds(next);
    announce(tr(`Bloc ajouté en position ${(index ?? ids.length) + 1}.`, `Block added at position ${(index ?? ids.length) + 1}.`));
  };
  const preview = () => setRun(ids.length ? execute(ex.context, blocksToQuery(ex.blocks, ids), VISIBLE_SEED) : null);

  return (
    <div className="stack">
      <SchemaPanel context={ex.context} tables={ex.tables} />
      <div>
        <h3 id="pool-h">{tr('Blocs disponibles', 'Available blocks')}</h3>
        <p className="muted small">{tr('Glissez un bloc vers la requête, ou utilisez le bouton « Ajouter ». Au clavier : Tab pour naviguer, Entrée sur « Ajouter », puis Alt+flèches pour réordonner.', 'Drag a block into the query, or use the “Add” button. With the keyboard: Tab to navigate, Enter on “Add”, then Alt+arrows to reorder.')}</p>
        <div role="group" aria-labelledby="pool-h" className="stack" style={{ gap: '0.4rem' }}>
          {pool.length === 0 && <p className="muted small">{tr('Tous les blocs sont utilisés (ou retirez-en pour les remettre ici).', 'All blocks are used (or remove some to put them back here).')}</p>}
          {pool.map((b) => (
            <div
              key={b.id}
              className="dnd-item"
              draggable={!disabled}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', b.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              <span className="handle" aria-hidden="true">⋮⋮</span>
              <pre className="grow" style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                <HighlightedCode code={b.text} lang="kql" />
              </pre>
              <button type="button" className="btn small" onClick={() => add(b.id)} disabled={disabled}>{tr('Ajouter', 'Add')}</button>
            </div>
          ))}
        </div>
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const src = e.dataTransfer.getData('text/plain');
          if (src && !ids.includes(src) && byId.has(src)) add(src);
        }}
      >
        <h3>{tr('Votre requête', 'Your query')}</h3>
        {ids.length === 0 ? (
          <div className="zone">{tr('Déposez des blocs ici.', 'Drop blocks here.')}</div>
        ) : (
          <SortableList
            ariaLabel={tr('Blocs de la requête, dans l’ordre', 'Query blocks, in order')}
            announce={announce}
            disabled={disabled}
            items={ids.map((id) => ({
              id,
              label: byId.get(id)?.text ?? id,
              content: (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                  <HighlightedCode code={byId.get(id)?.text ?? ''} lang="kql" />
                </pre>
              ),
            }))}
            onChange={onIds}
            onRemove={(id) => onIds(ids.filter((x) => x !== id))}
            onDropExternal={(src, idx) => byId.has(src) && add(src, idx)}
          />
        )}
      </div>
      <div className="row">
        <button type="button" className="btn" onClick={preview} disabled={ids.length === 0}>{tr('Exécuter', 'Run')}</button>
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled || ids.length === 0}>{tr('Valider ma réponse', 'Submit my answer')}</button>
        <button type="button" className="btn ghost" onClick={() => onIds([])} disabled={disabled || ids.length === 0}>{tr('Tout retirer', 'Remove all')}</button>
      </div>
      <div aria-live="polite">
        {run && !run.ok && <div className="verdict bad">{run.error.message}{run.error.hint ? ` ${tr('Piste', 'Hint')} : ${run.error.hint}` : ''}</div>}
        {run && run.ok && <ResultTable table={run.table} />}
      </div>
    </div>
  );
}

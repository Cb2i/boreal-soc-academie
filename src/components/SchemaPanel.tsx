import { buildDataset, contextTables, DATASET_NOTE } from '../data/dataset.ts';
import type { KqlContext } from '../content/types.ts';
import { VISIBLE_SEED } from '../engine/validate.ts';

export function SchemaPanel({ context, tables }: { context: KqlContext; tables?: string[] }) {
  const ds = buildDataset(VISIBLE_SEED);
  const { tables: avail } = contextTables(ds, context);
  const names = (tables && tables.length ? tables : Object.keys(avail)).filter((n) => avail[n]);
  return (
    <details className="card" style={{ padding: '0.6rem 1rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
        Schéma des tables ({context === 'sentinel' ? 'Sentinel / Log Analytics' : 'Defender XDR, Advanced Hunting'})
      </summary>
      <div className="stack small" style={{ marginTop: '0.6rem' }}>
        {names.map((n) => {
          const t = avail[n];
          return (
            <div key={n}>
              <strong>{n}</strong> <span className="muted">({t.rows.length} lignes)</span>
              <div className="muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                {t.columns.map((c) => `${c}${t.kqlTypes?.[c] ? `:${t.kqlTypes[c]}` : ''}`).join(', ')}
              </div>
            </div>
          );
        })}
        <p className="muted">{DATASET_NOTE}</p>
      </div>
    </details>
  );
}

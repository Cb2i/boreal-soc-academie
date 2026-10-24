import { display } from '../kql/index.ts';
import type { Table } from '../kql/index.ts';
import { tr } from '../i18n/lang.ts';

export function ResultTable({ table, limit = 200, caption }: { table: Table; limit?: number; caption?: string }) {
  if (table.columns.length === 0) return <div className="state">{tr('Résultat sans colonnes.', 'Result without columns.')}</div>;
  const rows = table.rows.slice(0, limit);
  return (
    <div>
      <div className="table-wrap" tabIndex={0} role="region" aria-label={caption ?? tr('Résultat de la requête', 'Query result')}>
        <table className="results">
          <thead>
            <tr>
              <th scope="col" className="rownum">#</th>
              {table.columns.map((c) => (
                <th key={c} scope="col">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="rownum">{i + 1}</td>
                {table.columns.map((c) => {
                  const v = r[c];
                  return (
                    <td key={c} className={v === null ? 'null' : ''} title={display(v)}>
                      {v === null ? 'null' : display(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small" style={{ marginTop: '0.4rem' }}>
        {table.rows.length} {tr('ligne(s)', 'row(s)')}{table.rows.length > limit ? tr(`, ${limit} affichées`, `, ${limit} shown`) : ''}.
      </p>
    </div>
  );
}

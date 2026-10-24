import { analyze } from './analyze.ts';
import { executeAst } from './exec.ts';
import { AGGREGATES, FUNCTIONS } from './functions.ts';
import { parseQuery, SUPPORTED_OPERATORS } from './parser.ts';
import { KqlError } from './types.ts';
import type { RunOptions, RunResult } from './types.ts';

export * from './types.ts';
export { SUPPORTED_OPERATORS } from './parser.ts';
export { display, fmtDate, fmtSpan, normKey, toStr } from './values.ts';
export { highlight } from './highlight.ts';

export const SUPPORTED_FUNCTIONS: string[] = Object.keys(FUNCTIONS).sort();
export const SUPPORTED_AGGREGATES: string[] = [...AGGREGATES].sort();
export const SUPPORTED_OPERATOR_LIST: string[] = [...SUPPORTED_OPERATORS];

/** Exécute une requête KQL avec le moteur local. Ne lance jamais : retourne un résultat ok/erreur. */
export function runQuery(source: string, opts: RunOptions): RunResult {
  try {
    if (source.length > 20_000) throw new KqlError('limit', 'La requête est trop longue pour le moteur local (20 000 caractères maximum).');
    const ast = parseQuery(source);
    const features = analyze(ast, Object.keys(opts.tables));
    const notes: string[] = [];
    const table = executeAst(ast, opts, notes);
    const max = opts.maxResultRows ?? 100_000;
    const truncated = table.rows.length > max;
    return {
      ok: true,
      table: truncated ? { ...table, rows: table.rows.slice(0, max) } : table,
      truncated,
      totalRows: table.rows.length,
      notes,
      features,
    };
  } catch (e) {
    if (e instanceof KqlError) return { ok: false, error: e };
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: new KqlError('semantic', `Erreur interne du moteur local : ${msg}`) };
  }
}

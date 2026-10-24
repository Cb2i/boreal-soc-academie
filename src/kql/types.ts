// Types de base du moteur KQL local (sous-ensemble documenté).
// Le moteur n'utilise jamais eval() ni new Function() : les requêtes sont
// tokenisées, analysées en AST puis interprétées.

export class Timespan {
  ms: number;
  constructor(ms: number) {
    this.ms = ms;
  }
}

export type Dyn = null | boolean | number | string | Dyn[] | { [k: string]: Dyn };
export type Value = null | boolean | number | string | Date | Timespan | Dyn[] | { [k: string]: Dyn };

/** Types statiques simplifiés utilisés pour détecter certaines erreurs sémantiques. */
export type Ty = 'string' | 'number' | 'bool' | 'datetime' | 'timespan' | 'dynamic' | 'any';

export type Row = Record<string, Value>;

export interface Table {
  columns: string[];
  types: Record<string, Ty>;
  rows: Row[];
  /** Types KQL d'affichage (long, real, int...) quand ils sont connus. */
  kqlTypes?: Record<string, string>;
}

export type KqlErrorKind = 'syntax' | 'semantic' | 'unsupported' | 'limit';

export class KqlError extends Error {
  kind: KqlErrorKind;
  line?: number;
  col?: number;
  hint?: string;
  constructor(kind: KqlErrorKind, message: string, opts: { line?: number; col?: number; hint?: string } = {}) {
    super(message);
    this.name = 'KqlError';
    this.kind = kind;
    this.line = opts.line;
    this.col = opts.col;
    this.hint = opts.hint;
  }
}

export interface RunOptions {
  /** Tables disponibles (nom -> Table). */
  tables: Record<string, Table>;
  /** Horloge simulée utilisée par now() et ago(). */
  now: Date;
  /** Tables qui existent dans l'autre contexte (Sentinel / Defender XDR) : nom -> explication. */
  unavailableTables?: Record<string, string>;
  /** Limite de lignes retournées (la troncature est signalée dans les notes). */
  maxResultRows?: number;
  /** Budget d'opérations pour éviter les calculs explosifs. */
  stepBudget?: number;
}

export interface RunSuccess {
  ok: true;
  table: Table;
  truncated: boolean;
  totalRows: number;
  notes: string[];
  features: string[];
}

export interface RunFailure {
  ok: false;
  error: KqlError;
}

export type RunResult = RunSuccess | RunFailure;

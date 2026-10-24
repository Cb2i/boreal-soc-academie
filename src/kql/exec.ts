import type { Expr, LetDef, Named, Op, Pipeline, QueryAst, Source } from './ast.ts';
import { checkIdents, inferTy, typeCheck } from './check.ts';
import { evalBool, evalExpr, tick, toBoolValue } from './eval.ts';
import type { Ctx, Env } from './eval.ts';
import { AGGREGATES, FUNCTIONS } from './functions.ts';
import { KqlError } from './types.ts';
import type { Dyn, Row, RunOptions, Table, Ty, Value } from './types.ts';
import { compareValues, normKey, suggest, toNumber, toStr, typeOfValue } from './values.ts';
import { tr } from '../i18n/lang.ts';

const semantic = (msg: string, at?: { pos: { line: number; col: number } }, hint?: string) =>
  new KqlError('semantic', msg, { line: at?.pos.line, col: at?.pos.col, hint });

type Params = Record<string, Value> | null;

// -------------------------------------------------------------------- utilitaires

function envOf(ctx: Ctx, row: Row | null, params: Params): Env {
  return { ctx, row, params };
}

function colSet(t: Table): Set<string> {
  return new Set(t.columns);
}

function finalizeTypes(columns: string[], types: Record<string, Ty>, rows: Row[]): Record<string, Ty> {
  const out: Record<string, Ty> = {};
  for (const c of columns) {
    let ty = types[c] ?? 'any';
    if (ty === 'any') {
      for (const r of rows) {
        const v = r[c];
        if (v !== null && v !== undefined) {
          ty = typeOfValue(v);
          break;
        }
      }
    }
    out[c] = ty;
  }
  return out;
}

function simpleName(e: Expr): string | null {
  if (e.k === 'id') return e.name;
  if (e.k === 'member') {
    const base = simpleName(e.obj);
    return base ? `${base}_${e.name}` : null;
  }
  return null;
}

function autoName(e: Expr, counter: { n: number }, byClause = false): string {
  const s = simpleName(e);
  if (s) return s;
  if (byClause && e.k === 'call' && (e.name === 'bin' || e.name === 'floor') && e.args[0]) {
    const inner = simpleName(e.args[0]);
    if (inner) return inner;
  }
  counter.n += 1;
  return `Column${counter.n}`;
}

function resolveNames(items: Named[], byClause = false): string[] {
  const counter = { n: 0 };
  const names = items.map((it) => it.name ?? autoName(it.expr, counter, byClause));
  const seen = new Set<string>();
  names.forEach((n, i) => {
    if (seen.has(n)) {
      throw semantic(tr(`Nom de colonne dupliqué : « ${n} ».`, `Duplicate column name: “${n}”.`), items[i], tr('Donnez un nom différent avec « Nom = expression ».', 'Give it a different name with “Name = expression”.'));
    }
    seen.add(n);
  });
  return names;
}

function displayType(t: Table, c: string): string {
  const k = t.kqlTypes?.[c];
  if (k) return k;
  const ty = t.types[c] ?? 'any';
  switch (ty) {
    case 'number': {
      const allInt = t.rows.every((r) => r[c] === null || Number.isInteger(r[c]));
      return allInt ? 'long' : 'real';
    }
    case 'any':
      return 'string';
    case 'bool':
      return 'bool';
    default:
      return ty;
  }
}

function dotNetType(k: string): string {
  switch (k) {
    case 'string':
      return 'System.String';
    case 'long':
      return 'System.Int64';
    case 'int':
      return 'System.Int32';
    case 'real':
      return 'System.Double';
    case 'bool':
      return 'System.Boolean';
    case 'datetime':
      return 'System.DateTime';
    case 'timespan':
      return 'System.TimeSpan';
    default:
      return 'System.Object';
  }
}

// ------------------------------------------------------------------ pipeline

export function runPipeline(ctx: Ctx, p: Pipeline, params: Params): Table {
  if (ctx.depth > 40) throw new KqlError('limit', tr('Imbrication de requêtes trop profonde.', 'Query nesting is too deep.'));
  let t = resolveSource(ctx, p.source, params);
  for (const op of p.ops) t = applyOp(ctx, op, t, params);
  return t;
}

function resolveSource(ctx: Ctx, s: Source, params: Params): Table {
  switch (s.kind) {
    case 'expr':
      return resolveExprSource(ctx, s.expr, params);
    case 'datatable': {
      const cols = s.cols.map((c) => c.name);
      const rows: Row[] = [];
      const n = cols.length;
      for (let i = 0; i < s.values.length; i += n) {
        const row: Row = {};
        for (let j = 0; j < n; j++) row[cols[j]] = convertTyped(evalExpr(s.values[i + j], envOf(ctx, null, params)), s.cols[j].ty);
        rows.push(row);
      }
      const types: Record<string, Ty> = {};
      const kqlTypes: Record<string, string> = {};
      s.cols.forEach((c) => {
        types[c.name] = tyFromName(c.ty);
        kqlTypes[c.name] = c.ty;
      });
      return { columns: cols, types, rows, kqlTypes };
    }
    case 'print': {
      const names = resolveNames(s.items);
      const row: Row = {};
      const env = envOf(ctx, null, params);
      s.items.forEach((it, i) => {
        row[names[i]] = evalExpr(it.expr, env);
      });
      return { columns: names, types: finalizeTypes(names, {}, [row]), rows: [row] };
    }
    case 'union':
      return unionTables(ctx, [], s.items, s.withsource, params);
  }
}

function tyFromName(n: string): Ty {
  switch (n) {
    case 'string':
      return 'string';
    case 'long':
    case 'int':
    case 'real':
    case 'double':
    case 'decimal':
      return 'number';
    case 'bool':
    case 'boolean':
      return 'bool';
    case 'datetime':
      return 'datetime';
    case 'timespan':
    case 'time':
      return 'timespan';
    case 'dynamic':
      return 'dynamic';
    default:
      return 'any';
  }
}

function convertTyped(v: Value, ty: string): Value {
  if (v === null) return null;
  const f = FUNCTIONS[`to${ty}`] ?? FUNCTIONS[ty];
  if (ty === 'dynamic' || ty === 'string' && typeof v === 'string') return v;
  if (ty === 'datetime' && v instanceof Date) return v;
  if (!f) return v;
  return f.fn([v], { now: new Date(0) });
}

function resolveExprSource(ctx: Ctx, e: Expr, params: Params): Table {
  if (e.k === 'id') return resolveTableName(ctx, e, params);
  if (e.k === 'subquery') return runPipeline(ctx, e.q, params);
  if (e.k === 'call') {
    if (e.name === 'materialize') {
      const a = e.args[0];
      if (!a || a.k !== 'subquery') {
        if (a) return resolveExprSource(ctx, a, params);
        throw semantic(tr('materialize() attend une requête tabulaire.', 'materialize() expects a tabular query.'), e);
      }
      return runPipeline(ctx, a.q, params);
    }
    const def = ctx.lets.get(e.name);
    if (def && def.params !== null) {
      if (e.args.length !== def.params.length) {
        throw semantic(tr(`La fonction « ${e.name} » attend ${def.params.length} argument(s), ${e.args.length} fourni(s).`, `The function “${e.name}” expects ${def.params.length} argument(s), ${e.args.length} provided.`), e);
      }
      const p2: Record<string, Value> = {};
      def.params.forEach((p, i) => {
        p2[p.name] = evalExpr(e.args[i], envOf(ctx, null, params));
      });
      ctx.depth++;
      try {
        return runPipeline(ctx, def.body, p2);
      } finally {
        ctx.depth--;
      }
    }
    throw semantic(tr(`« ${e.name}() » ne retourne pas de table : une requête doit commencer par une table (ex. SigninLogs).`, `“${e.name}()” does not return a table: a query must start with a table (e.g. SigninLogs).`), e);
  }
  throw semantic(tr('Une requête doit commencer par le nom d’une table (ex. SigninLogs) ou une variable let tabulaire.', 'A query must start with a table name (e.g. SigninLogs) or a tabular let variable.'), e as { pos: { line: number; col: number } });
}

function resolveTableName(ctx: Ctx, e: Extract<Expr, { k: 'id' }>, params: Params): Table {
  const name = e.name;
  const def: LetDef | undefined = ctx.lets.get(name);
  if (def && def.params === null) {
    const cached = ctx.letCache.get(name);
    if (cached) return cached;
    const b = def.body;
    // « let x = 5; » utilisé comme table : erreur explicite
    if (b.ops.length === 0 && b.source.kind === 'expr' && b.source.expr.k !== 'id' && b.source.expr.k !== 'subquery' && b.source.expr.k !== 'call') {
      throw semantic(tr(`« ${name} » est une valeur scalaire, pas une table.`, `“${name}” is a scalar value, not a table.`), e);
    }
    ctx.depth++;
    try {
      const t = runPipeline(ctx, b, null);
      ctx.letCache.set(name, t);
      return t;
    } finally {
      ctx.depth--;
    }
  }
  if (params && Object.prototype.hasOwnProperty.call(params, name)) {
    throw semantic(tr(`« ${name} » est un paramètre scalaire, pas une table.`, `“${name}” is a scalar parameter, not a table.`), e);
  }
  const t = ctx.tables[name];
  if (t) return t;
  if (ctx.unavailable[name]) {
    throw semantic(tr(`La table « ${name} » n’existe pas dans ce contexte.`, `The table “${name}” does not exist in this context.`), e, ctx.unavailable[name]);
  }
  const all = [...Object.keys(ctx.tables), ...[...ctx.lets.keys()]];
  const cand = suggest(name, all);
  throw semantic(
    tr(`Table « ${name} » introuvable. Tables disponibles : ${Object.keys(ctx.tables).join(', ')}.`, `Table “${name}” not found. Available tables: ${Object.keys(ctx.tables).join(', ')}.`),
    e,
    cand ? (cand.toLowerCase() === name.toLowerCase() ? tr(`Les noms de tables sont sensibles à la casse : vouliez-vous dire « ${cand} » ?`, `Table names are case-sensitive: did you mean “${cand}”?`) : tr(`Vouliez-vous dire « ${cand} » ?`, `Did you mean “${cand}”?`)) : undefined,
  );
}

// ------------------------------------------------------------------ opérateurs

function mkTable(columns: string[], types: Record<string, Ty>, rows: Row[], kqlTypes?: Record<string, string>): Table {
  return { columns, types: finalizeTypes(columns, types, rows), rows, kqlTypes };
}

function applyOp(ctx: Ctx, op: Op, t: Table, params: Params): Table {
  switch (op.op) {
    case 'where':
      return opWhere(ctx, op, t, params);
    case 'project':
      return opProject(ctx, op, t, params);
    case 'extend':
      return opExtend(ctx, op, t, params);
    case 'project-away': {
      for (const c of op.cols) if (!t.columns.includes(c)) throw unknownCol(c, t, op);
      const cols = t.columns.filter((c) => !op.cols.includes(c));
      return projectCols(t, cols);
    }
    case 'project-keep': {
      for (const c of op.cols) if (!t.columns.includes(c)) throw unknownCol(c, t, op);
      const cols = t.columns.filter((c) => op.cols.includes(c));
      return projectCols(t, cols);
    }
    case 'project-rename': {
      const map = new Map<string, string>();
      for (const it of op.items) {
        if (!t.columns.includes(it.from)) throw unknownCol(it.from, t, op);
        map.set(it.from, it.to);
      }
      const columns = t.columns.map((c) => map.get(c) ?? c);
      if (new Set(columns).size !== columns.length) throw semantic(tr('Le renommage crée un nom de colonne dupliqué.', 'The rename creates a duplicate column name.'), op);
      const types: Record<string, Ty> = {};
      t.columns.forEach((c) => (types[map.get(c) ?? c] = t.types[c]));
      const rows = t.rows.map((r) => {
        const o: Row = {};
        t.columns.forEach((c) => (o[map.get(c) ?? c] = r[c]));
        return o;
      });
      return { columns, types, rows };
    }
    case 'take': {
      const n = evalExpr(op.n, envOf(ctx, null, params));
      if (typeof n !== 'number' || n < 0) throw semantic('take attend un nombre entier positif.', op);
      return { ...t, rows: t.rows.slice(0, n) };
    }
    case 'top': {
      const n = evalExpr(op.n, envOf(ctx, null, params));
      if (typeof n !== 'number' || n < 0) throw semantic('top attend un nombre entier positif (ex. top 10 by ...).', op);
      const sorted = sortRows(ctx, t, [{ expr: op.by, desc: op.desc, nullsFirst: op.nullsFirst }], params, op);
      return { ...t, rows: sorted.slice(0, n) };
    }
    case 'sort':
      return { ...t, rows: sortRows(ctx, t, op.keys, params, op) };
    case 'summarize':
      return opSummarize(ctx, op, t, params);
    case 'distinct': {
      if (op.star) {
        const seen = new Set<string>();
        const rows: Row[] = [];
        for (const r of t.rows) {
          tick(ctx);
          const k = t.columns.map((c) => normKey(r[c])).join('|');
          if (!seen.has(k)) {
            seen.add(k);
            rows.push(r);
          }
        }
        return { ...t, rows };
      }
      const proj = opProject(ctx, { op: 'project', items: op.cols, pos: op.pos }, t, params);
      const seen = new Set<string>();
      const rows: Row[] = [];
      for (const r of proj.rows) {
        const k = proj.columns.map((c) => normKey(r[c])).join('|');
        if (!seen.has(k)) {
          seen.add(k);
          rows.push(r);
        }
      }
      return { ...proj, rows };
    }
    case 'count':
      return mkTable(['Count'], { Count: 'number' }, [{ Count: t.rows.length }], { Count: 'long' });
    case 'getschema': {
      const rows: Row[] = t.columns.map((c, i) => {
        const k = displayType(t, c);
        return { ColumnName: c, ColumnOrdinal: i, DataType: dotNetType(k), ColumnType: k };
      });
      return mkTable(['ColumnName', 'ColumnOrdinal', 'DataType', 'ColumnType'], { ColumnName: 'string', ColumnOrdinal: 'number', DataType: 'string', ColumnType: 'string' }, rows);
    }
    case 'render':
      ctx.notes.push(tr('L’opérateur render est reconnu mais ignoré : le moteur local ne produit pas de graphiques (les résultats sont affichés en tableau).', 'The render operator is recognized but ignored: the local engine does not produce charts (results are shown as a table).'));
      return t;
    case 'join':
      return opJoin(ctx, op, t, params);
    case 'union':
      return unionTables(ctx, [t], op.items, op.withsource, params);
    case 'mv-expand':
      return opMvExpand(ctx, op, t, params);
  }
}

function unknownCol(c: string, t: Table, at: { pos: { line: number; col: number } }): KqlError {
  const cand = suggest(c, t.columns);
  return semantic(tr(`Colonne « ${c} » introuvable. Colonnes disponibles : ${t.columns.join(', ')}.`, `Column “${c}” not found. Available columns: ${t.columns.join(', ')}.`), at, cand ? tr(`Vouliez-vous dire « ${cand} » ?`, `Did you mean “${cand}”?`) : undefined);
}

function projectCols(t: Table, cols: string[]): Table {
  const types: Record<string, Ty> = {};
  cols.forEach((c) => (types[c] = t.types[c]));
  const rows = t.rows.map((r) => {
    const o: Row = {};
    cols.forEach((c) => (o[c] = r[c]));
    return o;
  });
  const kqlTypes: Record<string, string> = {};
  cols.forEach((c) => {
    if (t.kqlTypes?.[c]) kqlTypes[c] = t.kqlTypes[c];
  });
  return { columns: cols, types, rows, kqlTypes };
}

function opWhere(ctx: Ctx, op: Extract<Op, { op: 'where' }>, t: Table, params: Params): Table {
  checkIdents(op.pred, colSet(t), ctx, params);
  typeCheck(op.pred, t.types, ctx);
  const ty = inferTy(op.pred, t.types, ctx);
  if (ty === 'string' || ty === 'number' || ty === 'datetime' || ty === 'timespan') {
    throw semantic(tr('Le filtre where attend une condition booléenne (vrai/faux).', 'The where filter expects a boolean condition (true/false).'), op, tr('Comparez la valeur à quelque chose, par exemple : where Colonne == "valeur".', 'Compare the value to something, for example: where Column == "value".'));
  }
  const rows: Row[] = [];
  for (const r of t.rows) {
    tick(ctx);
    if (evalBool(op.pred, envOf(ctx, r, params))) rows.push(r);
  }
  return { ...t, rows };
}

function opProject(ctx: Ctx, op: Extract<Op, { op: 'project' }>, t: Table, params: Params): Table {
  const names = resolveNames(op.items);
  const cols = colSet(t);
  op.items.forEach((it) => {
    if (it.expr.k === 'star') throw semantic(tr('« project * » n’existe pas en KQL : listez les colonnes ou utilisez project-away.', '“project *” does not exist in KQL: list the columns or use project-away.'), it);
    checkIdents(it.expr, cols, ctx, params);
    typeCheck(it.expr, t.types, ctx);
  });
  const rows: Row[] = [];
  for (const r of t.rows) {
    tick(ctx);
    const env = envOf(ctx, r, params);
    const o: Row = {};
    op.items.forEach((it, i) => {
      o[names[i]] = evalExpr(it.expr, env);
    });
    rows.push(o);
  }
  const types: Record<string, Ty> = {};
  op.items.forEach((it, i) => (types[names[i]] = inferTy(it.expr, t.types, ctx)));
  const kqlTypes: Record<string, string> = {};
  op.items.forEach((it, i) => {
    if (it.expr.k === 'id' && t.kqlTypes?.[it.expr.name]) kqlTypes[names[i]] = t.kqlTypes[it.expr.name];
  });
  return mkTable(names, types, rows, kqlTypes);
}

function opExtend(ctx: Ctx, op: Extract<Op, { op: 'extend' }>, t: Table, params: Params): Table {
  const names = resolveNames(op.items);
  const columns = [...t.columns];
  const types: Record<string, Ty> = { ...t.types };
  const avail = new Set(columns);
  op.items.forEach((it, i) => {
    checkIdents(it.expr, avail, ctx, params);
    typeCheck(it.expr, types, ctx);
    types[names[i]] = inferTy(it.expr, types, ctx);
    if (!avail.has(names[i])) {
      columns.push(names[i]);
      avail.add(names[i]);
    }
  });
  const rows: Row[] = [];
  for (const r of t.rows) {
    tick(ctx);
    const o: Row = { ...r };
    op.items.forEach((it, i) => {
      o[names[i]] = evalExpr(it.expr, envOf(ctx, o, params));
    });
    rows.push(o);
  }
  return mkTable(columns, types, rows, t.kqlTypes);
}

function sortRows(ctx: Ctx, t: Table, keys: { expr: Expr; desc: boolean; nullsFirst?: boolean }[], params: Params, at: { pos: { line: number; col: number } }): Row[] {
  const cols = colSet(t);
  keys.forEach((k) => checkIdents(k.expr, cols, ctx, params));
  const decorated = t.rows.map((r, i) => {
    tick(ctx);
    return { r, i, k: keys.map((k) => evalExpr(k.expr, envOf(ctx, r, params))) };
  });
  decorated.sort((a, b) => {
    for (let j = 0; j < keys.length; j++) {
      const x = a.k[j];
      const y = b.k[j];
      const nullsFirst = keys[j].nullsFirst ?? !keys[j].desc;
      if (x === null && y === null) continue;
      if (x === null) return nullsFirst ? -1 : 1;
      if (y === null) return nullsFirst ? 1 : -1;
      const c = compareValues(x, y);
      if (c !== 0) return keys[j].desc ? -c : c;
    }
    return a.i - b.i;
  });
  void at;
  return decorated.map((d) => d.r);
}

// ----------------------------------------------------------------- summarize

interface Agg {
  names: string[];
  types: Ty[];
  make: () => { add: (row: Row) => void; result: () => Value[] };
}

function aggDefaultName(fn: string, args: Expr[]): string {
  const base = args[0] && simpleName(args[0]);
  switch (fn) {
    case 'count':
      return 'count_';
    case 'countif':
      return 'countif_';
    case 'dcount':
      return `dcount_${base ?? ''}`;
    case 'dcountif':
      return `dcountif_${base ?? ''}`;
    case 'sum':
      return `sum_${base ?? ''}`;
    case 'sumif':
      return `sumif_${base ?? ''}`;
    case 'avg':
      return `avg_${base ?? ''}`;
    case 'min':
      return `min_${base ?? ''}`;
    case 'max':
      return `max_${base ?? ''}`;
    case 'make_set':
      return `set_${base ?? ''}`;
    case 'make_list':
      return `list_${base ?? ''}`;
    case 'take_any':
    case 'any':
      return `any_${base ?? ''}`;
    case 'percentile':
      return `percentile_${base ?? ''}_${args[1] && args[1].k === 'num' ? args[1].v : ''}`;
    default:
      return `${fn}_`;
  }
}

function buildAgg(ctx: Ctx, item: Named, t: Table, byNames: string[], params: Params): Agg {
  const e = item.expr;
  if (e.k !== 'call' || !AGGREGATES.has(e.name)) {
    throw semantic(
      tr('Dans summarize, chaque agrégation doit être un appel direct à une fonction d’agrégation (count(), dcount(...), sum(...), arg_max(...), etc.).', 'In summarize, each aggregation must be a direct call to an aggregation function (count(), dcount(...), sum(...), arg_max(...), etc.).'),
      item,
      tr('Pour calculer à partir d’agrégats, faites un second opérateur (extend) après le summarize.', 'To compute from aggregates, use a second operator (extend) after the summarize.'),
    );
  }
  const fn = e.name;
  const args = e.args;
  const cols = colSet(t);
  const need = (min: number, max = min) => {
    if (args.length < min || args.length > max) {
      throw semantic(tr(`${fn}() attend ${min === max ? min : `${min} à ${max}`} argument(s), ${args.length} fourni(s).`, `${fn}() expects ${min === max ? min : `${min} to ${max}`} argument(s), ${args.length} provided.`), e);
    }
  };
  args.forEach((a) => {
    if (a.k !== 'star') {
      checkIdents(a, cols, ctx, params);
      typeCheck(a, t.types, ctx);
    }
  });
  const baseName = item.name ?? aggDefaultName(fn, args);
  const ev = (a: Expr, r: Row) => evalExpr(a, envOf(ctx, r, params));

  switch (fn) {
    case 'count':
      need(0);
      return { names: [baseName], types: ['number'], make: () => { let n = 0; return { add: () => { n++; }, result: () => [n] }; } };
    case 'countif':
      need(1);
      return { names: [baseName], types: ['number'], make: () => { let n = 0; return { add: (r) => { if (toBoolValue(ev(args[0], r)) === true) n++; }, result: () => [n] }; } };
    case 'dcount':
      need(1, 2);
      return { names: [baseName], types: ['number'], make: () => { const s = new Set<string>(); return { add: (r) => { const v = ev(args[0], r); if (v !== null) s.add(normKey(v)); }, result: () => [s.size] }; } };
    case 'dcountif':
      need(2, 3);
      return { names: [baseName], types: ['number'], make: () => { const s = new Set<string>(); return { add: (r) => { const v = ev(args[0], r); if (v !== null && toBoolValue(ev(args[1], r)) === true) s.add(normKey(v)); }, result: () => [s.size] }; } };
    case 'sum':
    case 'sumif':
      need(fn === 'sum' ? 1 : 2);
      return {
        names: [baseName],
        types: ['number'],
        make: () => {
          let s = 0;
          return {
            add: (r) => {
              if (fn === 'sumif' && toBoolValue(ev(args[1], r)) !== true) return;
              const v = ev(args[0], r);
              const n = toNumber(v);
              if (v !== null && n === null) throw semantic(tr(`${fn}() attend des valeurs numériques.`, `${fn}() expects numeric values.`), e, tr('Convertissez avec toint() ou todouble().', 'Convert with toint() or todouble().'));
              if (n !== null) s += n;
            },
            result: () => [s],
          };
        },
      };
    case 'avg':
      need(1);
      return {
        names: [baseName],
        types: ['number'],
        make: () => {
          let s = 0;
          let n = 0;
          return {
            add: (r) => {
              const v = ev(args[0], r);
              const x = toNumber(v);
              if (v !== null && x === null) throw semantic(tr('avg() attend des valeurs numériques.', 'avg() expects numeric values.'), e, tr('Convertissez avec toint() ou todouble().', 'Convert with toint() or todouble().'));
              if (x !== null) {
                s += x;
                n++;
              }
            },
            result: () => [n === 0 ? null : s / n],
          };
        },
      };
    case 'min':
    case 'max':
      need(1);
      return {
        names: [baseName],
        types: [inferTy(args[0], t.types, ctx)],
        make: () => {
          let best: Value = null;
          return {
            add: (r) => {
              const v = ev(args[0], r);
              if (v === null) return;
              if (best === null || (fn === 'min' ? compareValues(v, best) < 0 : compareValues(v, best) > 0)) best = v;
            },
            result: () => [best],
          };
        },
      };
    case 'make_set':
    case 'make_list': {
      need(1, 2);
      const max = args[1] ? toNumber(evalExpr(args[1], envOf(ctx, null, params))) : null;
      return {
        names: [baseName],
        types: ['dynamic'],
        make: () => {
          const list: Value[] = [];
          const seen = new Set<string>();
          return {
            add: (r) => {
              const v = ev(args[0], r);
              if (v === null) return;
              if (fn === 'make_set') {
                const k = normKey(v);
                if (seen.has(k)) return;
                seen.add(k);
              }
              if (max === null || list.length < max) list.push(v);
            },
            result: () => [fn === 'make_set' ? [...list].sort(compareValues) as Dyn[] : (list as Dyn[])],
          };
        },
      };
    }
    case 'take_any':
    case 'any':
      need(1);
      return {
        names: [baseName],
        types: [inferTy(args[0], t.types, ctx)],
        make: () => {
          let got = false;
          let val: Value = null;
          return {
            add: (r) => {
              if (!got) {
                val = ev(args[0], r);
                got = true;
              }
            },
            result: () => [val],
          };
        },
      };
    case 'percentile': {
      need(2);
      const p = toNumber(evalExpr(args[1], envOf(ctx, null, params)));
      if (p === null || p < 0 || p > 100) throw semantic(tr('percentile() : le centile doit être compris entre 0 et 100.', 'percentile(): the percentile must be between 0 and 100.'), e);
      return {
        names: [baseName],
        types: ['number'],
        make: () => {
          const xs: number[] = [];
          return {
            add: (r) => {
              const n = toNumber(ev(args[0], r));
              if (n !== null) xs.push(n);
            },
            result: () => {
              if (xs.length === 0) return [null];
              xs.sort((a, b) => a - b);
              const rank = Math.max(1, Math.ceil((p / 100) * xs.length));
              return [xs[rank - 1]];
            },
          };
        },
      };
    }
    case 'arg_max':
    case 'arg_min': {
      if (args.length < 2) throw semantic(tr(`${fn}() attend au moins 2 arguments : la valeur à maximiser/minimiser puis les colonnes à retourner (ou *).`, `${fn}() expects at least 2 arguments: the value to maximize/minimize, then the columns to return (or *).`), e);
      const key = args[0];
      const keyName = simpleName(key) ?? `${fn === 'arg_max' ? 'max' : 'min'}_`;
      let outCols: { name: string; expr: Expr; ty: Ty }[] = [];
      outCols.push({ name: keyName, expr: key, ty: inferTy(key, t.types, ctx) });
      const star = args.slice(1).some((a) => a.k === 'star');
      if (star) {
        for (const c of t.columns) {
          if (c === keyName || byNames.includes(c)) continue;
          outCols.push({ name: c, expr: { k: 'id', name: c, pos: e.pos }, ty: t.types[c] });
        }
      } else {
        for (const a of args.slice(1)) {
          const n = simpleName(a);
          if (!n) throw semantic(tr(`${fn}() : les colonnes retournées doivent être des noms de colonnes ou *.`, `${fn}(): the returned columns must be column names or *.`), a);
          if (n === keyName) continue;
          outCols.push({ name: n, expr: a, ty: inferTy(a, t.types, ctx) });
        }
      }
      // nom explicite (ex. Dernier = arg_max(...)) : non standard, on ignore pour conserver les noms de colonnes
      outCols = outCols.map((c) => c);
      return {
        names: outCols.map((c) => c.name),
        types: outCols.map((c) => c.ty),
        make: () => {
          let bestKey: Value = null;
          let bestRow: Row | null = null;
          return {
            add: (r) => {
              const k = ev(key, r);
              if (k === null && bestRow !== null) return;
              if (bestRow === null || (k !== null && (bestKey === null || (fn === 'arg_max' ? compareValues(k, bestKey) > 0 : compareValues(k, bestKey) < 0)))) {
                bestKey = k;
                bestRow = r;
              }
            },
            result: () => outCols.map((c) => (bestRow ? evalExpr(c.expr, envOf(ctx, bestRow, params)) : null)),
          };
        },
      };
    }
    default:
      throw semantic(tr(`Agrégation « ${fn}() » non reconnue.`, `Aggregation “${fn}()” not recognized.`), e);
  }
}

function opSummarize(ctx: Ctx, op: Extract<Op, { op: 'summarize' }>, t: Table, params: Params): Table {
  const cols = colSet(t);
  const byNames = resolveNames(op.by, true);
  op.by.forEach((b) => {
    checkIdents(b.expr, cols, ctx, params);
    typeCheck(b.expr, t.types, ctx);
  });
  const aggs = op.aggs.map((a) => buildAgg(ctx, a, t, byNames, params));
  const outNames: string[] = [...byNames];
  const outTypes: Record<string, Ty> = {};
  op.by.forEach((b, i) => (outTypes[byNames[i]] = inferTy(b.expr, t.types, ctx)));
  aggs.forEach((a) => {
    a.names.forEach((n, i) => {
      let name = n;
      while (outNames.includes(name)) name += '1';
      outNames.push(name);
      outTypes[name] = a.types[i];
    });
  });
  if (new Set(outNames).size !== outNames.length) throw semantic(tr('Noms de colonnes dupliqués dans summarize.', 'Duplicate column names in summarize.'), op);

  interface Group {
    by: Value[];
    states: ReturnType<Agg['make']>[];
  }
  const groups = new Map<string, Group>();
  const getGroup = (key: string, by: Value[]): Group => {
    let g = groups.get(key);
    if (!g) {
      g = { by, states: aggs.map((a) => a.make()) };
      groups.set(key, g);
    }
    return g;
  };
  for (const r of t.rows) {
    tick(ctx);
    const env = envOf(ctx, r, params);
    const by = op.by.map((b) => evalExpr(b.expr, env));
    const key = by.map(normKey).join('\u0001');
    const g = getGroup(key, by);
    for (const s of g.states) s.add(r);
  }
  if (op.by.length === 0 && groups.size === 0) getGroup('', []);
  const rows: Row[] = [];
  for (const g of groups.values()) {
    const o: Row = {};
    byNames.forEach((n, i) => (o[n] = g.by[i]));
    let idx = byNames.length;
    g.states.forEach((s) => {
      const res = s.result();
      res.forEach((v) => {
        o[outNames[idx++]] = v;
      });
    });
    rows.push(o);
  }
  return mkTable(outNames, outTypes, rows);
}

// ---------------------------------------------------------------------- join

const JOIN_KINDS = ['inner', 'innerunique', 'leftouter', 'rightouter', 'fullouter', 'leftanti', 'leftantisemi', 'rightanti', 'rightantisemi', 'leftsemi', 'rightsemi'];

function flattenAnd(e: Expr, out: Expr[]): void {
  if (e.k === 'bin' && e.op === 'and') {
    flattenAnd(e.l, out);
    flattenAnd(e.r, out);
  } else out.push(e);
}

function sideCol(e: Expr): { side: 'left' | 'right'; col: string } | null {
  if (e.k === 'member' && e.obj.k === 'id' && (e.obj.name === '$left' || e.obj.name === '$right')) {
    return { side: e.obj.name === '$left' ? 'left' : 'right', col: e.name };
  }
  return null;
}

function opJoin(ctx: Ctx, op: Extract<Op, { op: 'join' }>, left: Table, params: Params): Table {
  if (!JOIN_KINDS.includes(op.kind)) {
    throw semantic(tr(`Type de jointure inconnu : « ${op.kind} ».`, `Unknown join type: “${op.kind}”.`), op, tr(`Types pris en charge : ${JOIN_KINDS.join(', ')}.`, `Supported types: ${JOIN_KINDS.join(', ')}.`));
  }
  const right = runPipeline(ctx, op.right, params);
  const conds: Expr[] = [];
  op.on.forEach((c) => flattenAnd(c, conds));
  const keys: { l: string; r: string }[] = [];
  for (const c of conds) {
    if (c.k === 'id') {
      keys.push({ l: c.name, r: c.name });
    } else if (c.k === 'bin' && c.op === '==') {
      const a = sideCol(c.l);
      const b = sideCol(c.r);
      if (a && b && a.side !== b.side) {
        keys.push(a.side === 'left' ? { l: a.col, r: b.col } : { l: b.col, r: a.col });
      } else {
        throw semantic(tr('Condition de jointure invalide.', 'Invalid join condition.'), c, tr('Utilisez « on Colonne » (même nom des deux côtés) ou « on $left.A == $right.B ».', 'Use “on Column” (same name on both sides) or “on $left.A == $right.B”.'));
      }
    } else {
      throw semantic(tr('Condition de jointure invalide.', 'Invalid join condition.'), c, tr('Utilisez « on Colonne » (même nom des deux côtés) ou « on $left.A == $right.B ».', 'Use “on Column” (same name on both sides) or “on $left.A == $right.B”.'));
    }
  }
  for (const k of keys) {
    if (!left.columns.includes(k.l)) throw semantic(tr(`Colonne de jointure « ${k.l} » introuvable à gauche. Colonnes : ${left.columns.join(', ')}.`, `Join column “${k.l}” not found on the left. Columns: ${left.columns.join(', ')}.`), op, tr('Les noms doivent exister dans les deux tables, ou utilisez $left.A == $right.B.', 'The names must exist in both tables, or use $left.A == $right.B.'));
    if (!right.columns.includes(k.r)) throw semantic(tr(`Colonne de jointure « ${k.r} » introuvable à droite. Colonnes : ${right.columns.join(', ')}.`, `Join column “${k.r}” not found on the right. Columns: ${right.columns.join(', ')}.`), op, tr('Les noms doivent exister dans les deux tables, ou utilisez $left.A == $right.B.', 'The names must exist in both tables, or use $left.A == $right.B.'));
  }
  const keyOf = (r: Row, side: 'l' | 'r'): string | null => {
    const vals = keys.map((k) => r[side === 'l' ? k.l : k.r]);
    if (vals.some((v) => v === null)) return null;
    return vals.map(normKey).join('\u0001');
  };

  let kind = op.kind;
  if (kind === 'leftantisemi') kind = 'leftanti';
  if (kind === 'rightantisemi') kind = 'rightanti';

  let leftRows = left.rows;
  if (kind === 'innerunique') {
    const seen = new Set<string>();
    leftRows = [];
    for (const r of left.rows) {
      const k = keyOf(r, 'l');
      if (k === null) {
        leftRows.push(r);
        continue;
      }
      if (seen.has(k)) continue;
      seen.add(k);
      leftRows.push(r);
    }
  }
  const index = new Map<string, Row[]>();
  for (const r of right.rows) {
    tick(ctx);
    const k = keyOf(r, 'r');
    if (k === null) continue;
    const arr = index.get(k);
    if (arr) arr.push(r);
    else index.set(k, [r]);
  }

  // Colonnes de sortie
  const outCols: string[] = [];
  const outTypes: Record<string, Ty> = {};
  const rightMap = new Map<string, string>();
  const withLeft = !['rightsemi', 'rightanti'].includes(kind);
  const withRight = !['leftsemi', 'leftanti'].includes(kind);
  if (withLeft) {
    left.columns.forEach((c) => {
      outCols.push(c);
      outTypes[c] = left.types[c];
    });
  }
  if (withRight) {
    right.columns.forEach((c) => {
      let name = c;
      while (outCols.includes(name)) name = name.replace(/\d*$/, '') + String((parseInt(/(\d*)$/.exec(name)![1] || '0', 10) || 0) + 1);
      rightMap.set(c, name);
      outCols.push(name);
      outTypes[name] = right.types[c];
    });
  }
  const rows: Row[] = [];
  const mk = (l: Row | null, r: Row | null): Row => {
    const o: Row = {};
    if (withLeft) left.columns.forEach((c) => (o[c] = l ? l[c] : null));
    if (withRight) right.columns.forEach((c) => (o[rightMap.get(c)!] = r ? r[c] : null));
    return o;
  };
  const matchedRight = new Set<Row>();
  for (const l of leftRows) {
    tick(ctx);
    const k = keyOf(l, 'l');
    const ms = k === null ? undefined : index.get(k);
    switch (kind) {
      case 'inner':
      case 'innerunique':
        if (ms) for (const r of ms) { tick(ctx); rows.push(mk(l, r)); }
        break;
      case 'leftouter':
      case 'fullouter':
      case 'rightouter':
        if (ms) {
          for (const r of ms) {
            tick(ctx);
            matchedRight.add(r);
            rows.push(mk(l, r));
          }
        } else if (kind !== 'rightouter') rows.push(mk(l, null));
        break;
      case 'leftsemi':
        if (ms) rows.push(mk(l, null));
        break;
      case 'leftanti':
        if (!ms) rows.push(mk(l, null));
        break;
      case 'rightsemi':
      case 'rightanti':
        if (ms) ms.forEach((r) => matchedRight.add(r));
        break;
    }
  }
  if (kind === 'rightouter' || kind === 'fullouter') {
    for (const r of right.rows) if (!matchedRight.has(r)) rows.push(mk(null, r));
  }
  if (kind === 'rightsemi') for (const r of right.rows) if (matchedRight.has(r)) rows.push(mk(null, r));
  if (kind === 'rightanti') for (const r of right.rows) if (!matchedRight.has(r)) rows.push(mk(null, r));
  return mkTable(outCols, outTypes, rows);
}

// --------------------------------------------------------------------- union

function unionTables(ctx: Ctx, base: Table[], items: Pipeline[], withsource: string | undefined, params: Params): Table {
  const tables = [...base];
  const labels = base.map(() => 'T0');
  items.forEach((p, i) => {
    tables.push(runPipeline(ctx, p, params));
    const s = p.source;
    labels.push(p.ops.length === 0 && s.kind === 'expr' && s.expr.k === 'id' ? s.expr.name : `union_arg${i}`);
  });
  const columns: string[] = withsource ? [withsource] : [];
  const types: Record<string, Ty> = {};
  for (const t of tables) {
    for (const c of t.columns) {
      if (!columns.includes(c)) {
        columns.push(c);
        types[c] = t.types[c];
      } else if (types[c] !== t.types[c]) types[c] = 'any';
    }
  }
  if (withsource) types[withsource] = 'string';
  const rows: Row[] = [];
  tables.forEach((t, ti) => {
    for (const r of t.rows) {
      tick(ctx);
      const o: Row = {};
      for (const c of columns) o[c] = c === withsource && !t.columns.includes(c) ? labels[ti] : Object.prototype.hasOwnProperty.call(r, c) ? r[c] : null;
      rows.push(o);
    }
  });
  return mkTable(columns, types, rows);
}

// ----------------------------------------------------------------- mv-expand

function opMvExpand(ctx: Ctx, op: Extract<Op, { op: 'mv-expand' }>, t: Table, params: Params): Table {
  const cols = colSet(t);
  const names = op.items.map((it) => it.name ?? simpleName(it.expr));
  op.items.forEach((it, i) => {
    checkIdents(it.expr, cols, ctx, params);
    if (!names[i]) throw semantic(tr('mv-expand : donnez un nom avec « Nom = expression » pour les expressions calculées.', 'mv-expand: give a name with “Name = expression” for computed expressions.'), op);
  });
  const outCols = [...t.columns];
  const types: Record<string, Ty> = { ...t.types };
  names.forEach((n, i) => {
    if (!outCols.includes(n!)) outCols.push(n!);
    types[n!] = op.items[i].ty ? tyFromName(op.items[i].ty!) : 'dynamic';
  });
  const rows: Row[] = [];
  for (const r of t.rows) {
    tick(ctx);
    const env = envOf(ctx, r, params);
    const lists: Value[][] = op.items.map((it) => {
      const v = evalExpr(it.expr, env);
      if (Array.isArray(v)) return v as Value[];
      if (v !== null && typeof v === 'object' && !(v instanceof Date) && !('ms' in (v as object))) {
        return Object.entries(v as Record<string, Dyn>).map(([k, x]) => ({ [k]: x }) as Value);
      }
      return [v];
    });
    const len = Math.max(...lists.map((l) => l.length));
    for (let i = 0; i < len; i++) {
      tick(ctx);
      const o: Row = { ...r };
      lists.forEach((l, j) => {
        let v: Value = i < l.length ? l[i] : null;
        if (op.items[j].ty) v = convertTyped(v, op.items[j].ty!);
        o[names[j]!] = v;
      });
      rows.push(o);
    }
  }
  return mkTable(outCols, types, rows, t.kqlTypes);
}

// ---------------------------------------------------------------------- entrée

export function executeAst(ast: QueryAst, opts: RunOptions, notes: string[]): Table {
  const lets = new Map<string, LetDef>();
  for (const l of ast.lets) lets.set(l.name, l);
  const ctx: Ctx = {
    now: opts.now,
    tables: opts.tables,
    unavailable: opts.unavailableTables ?? {},
    lets,
    budget: { left: opts.stepBudget ?? 3_000_000 },
    runPipeline: (p, params) => runPipeline(ctx, p, params),
    letCache: new Map(),
    depth: 0,
    notes,
  };
  return runPipeline(ctx, ast.body, null);
}

export { toStr };

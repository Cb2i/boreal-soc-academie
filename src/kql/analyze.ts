import type { Expr, Pipeline, QueryAst } from './ast.ts';

/** Extrait les « traits » d'une requête (opérateurs, fonctions, ordre des étapes) pour les règles de raisonnement. */
export function analyze(ast: QueryAst, tableNames: string[]): string[] {
  const f = new Set<string>();
  const tables = new Set(tableNames);

  const walkExpr = (e: Expr, inWhere: boolean): void => {
    switch (e.k) {
      case 'call':
        f.add(`fn:${e.name}`);
        if (inWhere && (e.name === 'ago' || e.name === 'now')) {
          f.add('time:window');
          f.add('time:relative');
        }
        e.args.forEach((a) => walkExpr(a, inWhere));
        break;
      case 'bin':
        if (!['and', 'or', '+', '-', '*', '/', '%'].includes(e.op)) {
          if (['==', '!=', '<', '<=', '>', '>=', '=~', '!~'].includes(e.op)) f.add(`cmp:${e.op}`);
          else f.add(`strop:${e.op}`);
        }
        walkExpr(e.l, inWhere);
        walkExpr(e.r, inWhere);
        break;
      case 'in':
        f.add(e.neg ? 'strop:!in' : 'strop:in');
        walkExpr(e.l, inWhere);
        e.items.forEach((a) => walkExpr(a, inWhere));
        break;
      case 'between':
        f.add('strop:between');
        walkExpr(e.l, inWhere);
        walkExpr(e.lo, inWhere);
        walkExpr(e.hi, inWhere);
        if (inWhere && (e.lo.k === 'datetime' || e.lo.k === 'call')) f.add('time:window');
        break;
      case 'hasany':
        f.add(e.all ? 'strop:has_all' : 'strop:has_any');
        walkExpr(e.l, inWhere);
        e.items.forEach((a) => walkExpr(a, inWhere));
        break;
      case 'member':
        f.add('syntax:member');
        walkExpr(e.obj, inWhere);
        break;
      case 'index':
        f.add('syntax:index');
        walkExpr(e.obj, inWhere);
        walkExpr(e.idx, inWhere);
        break;
      case 'unary':
        walkExpr(e.e, inWhere);
        break;
      case 'datetime':
        if (inWhere) f.add('time:window');
        break;
      case 'subquery':
        walkPipeline(e.q);
        break;
      default:
        break;
    }
  };

  const walkPipeline = (p: Pipeline): void => {
    const s = p.source;
    if (s.kind === 'expr') {
      if (s.expr.k === 'id' && tables.has(s.expr.name)) f.add(`tbl:${s.expr.name}`);
      else walkExpr(s.expr, false);
    } else if (s.kind === 'datatable') {
      f.add('src:datatable');
    } else if (s.kind === 'print') {
      f.add('src:print');
      s.items.forEach((i) => walkExpr(i.expr, false));
    } else {
      f.add('op:union');
      s.items.forEach(walkPipeline);
    }
    let seenSummarize = false;
    let seenWhere = false;
    let seenSort = false;
    let seenTake = false;
    for (const op of p.ops) {
      const name = op.op === 'take' ? 'take' : op.op;
      f.add(`op:${name}`);
      switch (op.op) {
        case 'where':
          walkExpr(op.pred, true);
          if (!seenSummarize) seenWhere = true;
          if (seenSort) f.add('order:where-after-sort');
          if (seenSummarize) f.add('order:where-after-summarize');
          break;
        case 'project':
        case 'extend':
          op.items.forEach((i) => walkExpr(i.expr, false));
          break;
        case 'summarize':
          if (!seenWhere) f.add('order:summarize-without-prior-filter');
          else f.add('order:filter-before-summarize');
          seenSummarize = true;
          op.aggs.forEach((i) => walkExpr(i.expr, false));
          op.by.forEach((i) => walkExpr(i.expr, false));
          break;
        case 'sort':
          op.keys.forEach((k) => walkExpr(k.expr, false));
          if (seenTake) f.add('order:take-before-sort');
          seenSort = true;
          break;
        case 'top':
          walkExpr(op.by, false);
          break;
        case 'take':
          seenTake = true;
          break;
        case 'join':
          f.add(`join:${op.kind}`);
          walkPipeline(op.right);
          break;
        case 'union':
          op.items.forEach(walkPipeline);
          break;
        case 'mv-expand':
          op.items.forEach((i) => walkExpr(i.expr, false));
          break;
        case 'distinct':
          op.cols.forEach((i) => walkExpr(i.expr, false));
          break;
        default:
          break;
      }
    }
  };

  ast.lets.forEach((l) => {
    f.add('kw:let');
    if (l.params) f.add('kw:let-function');
    walkPipeline(l.body);
  });
  walkPipeline(ast.body);
  return [...f].sort();
}

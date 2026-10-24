import type { Expr } from './ast.ts';
import type { Ctx } from './eval.ts';
import { unknownNameError } from './eval.ts';
import { FUNCTIONS } from './functions.ts';
import { KqlError } from './types.ts';
import type { Ty } from './types.ts';
import { tr } from '../i18n/lang.ts';

/** Parcourt récursivement une expression (sans entrer dans les sous-requêtes). */
export function walk(e: Expr, fn: (n: Expr) => void): void {
  fn(e);
  switch (e.k) {
    case 'member':
      walk(e.obj, fn);
      break;
    case 'index':
      walk(e.obj, fn);
      walk(e.idx, fn);
      break;
    case 'call':
      e.args.forEach((a) => walk(a, fn));
      break;
    case 'unary':
      walk(e.e, fn);
      break;
    case 'bin':
      walk(e.l, fn);
      walk(e.r, fn);
      break;
    case 'in':
    case 'hasany':
      walk(e.l, fn);
      e.items.forEach((a) => walk(a, fn));
      break;
    case 'between':
      walk(e.l, fn);
      walk(e.lo, fn);
      walk(e.hi, fn);
      break;
    default:
      break;
  }
}

/** Vérifie que tous les identifiants d'une expression existent (colonnes, paramètres, let). */
export function checkIdents(e: Expr, columns: Set<string>, ctx: Ctx, params: Record<string, unknown> | null): void {
  walk(e, (n) => {
    if (n.k !== 'id') return;
    if (n.name.startsWith('$')) return;
    if (columns.has(n.name)) return;
    if (params && Object.prototype.hasOwnProperty.call(params, n.name)) return;
    if (ctx.lets.has(n.name)) return;
    if (ctx.tables[n.name]) return;
    throw unknownNameError(n.name, [...columns], [...ctx.lets.keys()], n);
  });
}

const CMP = new Set(['==', '!=', '<', '<=', '>', '>=']);

export function inferTy(e: Expr, types: Record<string, Ty>, ctx: Ctx, depth = 0): Ty {
  if (depth > 12) return 'any';
  switch (e.k) {
    case 'num':
      return 'number';
    case 'str':
      return 'string';
    case 'bool':
      return 'bool';
    case 'span':
      return 'timespan';
    case 'datetime':
      return 'datetime';
    case 'dyn':
      return 'dynamic';
    case 'null':
      return 'any';
    case 'id': {
      if (types[e.name]) return types[e.name];
      const def = ctx.lets.get(e.name);
      if (def && def.params === null && def.body.ops.length === 0 && def.body.source.kind === 'expr') {
        return inferTy(def.body.source.expr, types, ctx, depth + 1);
      }
      return 'any';
    }
    case 'member':
    case 'index':
      return 'dynamic';
    case 'unary':
      return inferTy(e.e, types, ctx, depth + 1);
    case 'call': {
      const fd = FUNCTIONS[e.name];
      if (e.name === 'iff' || e.name === 'iif') {
        const a = inferTy(e.args[1] ?? e, types, ctx, depth + 1);
        const b = inferTy(e.args[2] ?? e, types, ctx, depth + 1);
        return a === b ? a : 'any';
      }
      if (!fd) return 'any';
      if (fd.ret === 'arg0') return e.args[0] ? inferTy(e.args[0], types, ctx, depth + 1) : 'any';
      return fd.ret;
    }
    case 'bin': {
      if (CMP.has(e.op) || e.op === 'and' || e.op === 'or') return 'bool';
      if (['+', '-', '*', '/', '%'].includes(e.op)) {
        const a = inferTy(e.l, types, ctx, depth + 1);
        const b = inferTy(e.r, types, ctx, depth + 1);
        if (a === 'datetime' && b === 'datetime') return 'timespan';
        if (a === 'datetime' || b === 'datetime') return 'datetime';
        if (a === 'timespan' && b === 'timespan') return e.op === '/' ? 'number' : 'timespan';
        if (a === 'timespan' || b === 'timespan') return 'timespan';
        if (a === 'number' && b === 'number') return 'number';
        return 'any';
      }
      return 'bool';
    }
    case 'in':
    case 'between':
    case 'hasany':
      return 'bool';
    default:
      return 'any';
  }
}

const isLiteral = (e: Expr) => e.k === 'num' || e.k === 'str' || e.k === 'bool' || e.k === 'null' || (e.k === 'unary' && e.e.k === 'num');

/** Détecte les comparaisons entre colonnes de types incompatibles (erreur sémantique KQL). */
export function typeCheck(e: Expr, types: Record<string, Ty>, ctx: Ctx): void {
  walk(e, (n) => {
    if (n.k !== 'bin' || !CMP.has(n.op)) return;
    if (isLiteral(n.l) || isLiteral(n.r)) return;
    const a = inferTy(n.l, types, ctx);
    const b = inferTy(n.r, types, ctx);
    if ((a === 'string' && b === 'number') || (a === 'number' && b === 'string')) {
      throw new KqlError('semantic', tr(`Impossible de comparer des valeurs de types différents : ${a === 'number' ? 'long/real' : 'string'} et ${b === 'number' ? 'long/real' : 'string'}.`, `Cannot compare values of different types: ${a === 'number' ? 'long/real' : 'string'} and ${b === 'number' ? 'long/real' : 'string'}.`), {
        line: n.pos.line,
        col: n.pos.col,
        hint: tr('Ajoutez une conversion explicite : tostring(...), toint(...) ou todouble(...) selon le cas.', 'Add an explicit conversion: tostring(...), toint(...) or todouble(...) as appropriate.'),
      });
    }
  });
}

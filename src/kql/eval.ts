import type { Expr, LetDef, Pipeline } from './ast.ts';
import { AGGREGATES, FUNCTIONS, LAZY_FUNCTIONS, UNSUPPORTED_FUNCTIONS } from './functions.ts';
import { KqlError, Timespan } from './types.ts';
import type { Dyn, Row, Table, Value } from './types.ts';
import { escapeRegex, isDate, isObj, isSpan, looseEquals, compareValues, suggest, toNumber, toStr } from './values.ts';
import type { Ty } from './types.ts';

export interface Ctx {
  now: Date;
  tables: Record<string, Table>;
  unavailable: Record<string, string>;
  lets: Map<string, LetDef>;
  budget: { left: number };
  runPipeline: (p: Pipeline, params: Record<string, Value> | null) => Table;
  letCache: Map<string, Table>;
  depth: number;
  notes: string[];
}

export interface Env {
  ctx: Ctx;
  row: Row | null;
  params: Record<string, Value> | null;
}

const semantic = (msg: string, e?: { pos: { line: number; col: number } }, hint?: string) =>
  new KqlError('semantic', msg, { line: e?.pos.line, col: e?.pos.col, hint });

export function tick(ctx: Ctx, n = 1): void {
  ctx.budget.left -= n;
  if (ctx.budget.left < 0) {
    throw new KqlError('limit', 'Limite de calcul du moteur local atteinte : la requête est trop coûteuse pour s’exécuter dans le navigateur.', {
      hint: 'Ajoutez un filtre where plus tôt dans la requête, ou évitez les jointures produisant un très grand nombre de lignes.',
    });
  }
}

export function toBoolValue(v: Value): boolean | null {
  if (v === null) return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  return null;
}

export function evalBool(e: Expr, env: Env): boolean {
  return toBoolValue(evalExpr(e, env)) === true;
}

function lookupScalarLet(name: string, env: Env): { found: boolean; value: Value } {
  const def = env.ctx.lets.get(name);
  if (!def || def.params !== null) return { found: false, value: null };
  const b = def.body;
  if (b.ops.length === 0 && b.source.kind === 'expr') {
    if (env.ctx.depth > 30) throw new KqlError('limit', 'Récursion trop profonde dans les variables let.');
    const ctx = { ...env.ctx, depth: env.ctx.depth + 1 };
    return { found: true, value: evalExpr(b.source.expr, { ctx, row: null, params: null }) };
  }
  return { found: false, value: null };
}

export function columnsOf(env: Env): string[] {
  return env.row ? Object.keys(env.row) : [];
}

export function unknownNameError(name: string, cols: string[], lets: string[], at?: { pos: { line: number; col: number } }): KqlError {
  const cand = suggest(name, [...cols, ...lets]);
  let hint = '';
  if (cand && cand !== name) {
    hint = cand.toLowerCase() === name.toLowerCase() ? `Les noms de colonnes sont sensibles à la casse : vouliez-vous dire « ${cand} » ?` : `Vouliez-vous dire « ${cand} » ?`;
  } else {
    hint = `Si « ${name} » est une valeur texte, mettez-la entre guillemets (par exemple "${name}").`;
  }
  const list = cols.length ? ` Colonnes disponibles : ${cols.slice(0, 24).join(', ')}${cols.length > 24 ? ', …' : ''}.` : '';
  return new KqlError('semantic', `Nom « ${name} » introuvable.${list}`, { line: at?.pos.line, col: at?.pos.col, hint });
}

/** Un identifiant qui désigne une table ou un let tabulaire (et non une colonne ni un scalaire). */
function isTabularName(e: Expr, env: Env): boolean {
  if (e.k !== 'id') return false;
  if (env.params && Object.prototype.hasOwnProperty.call(env.params, e.name)) return false;
  if (env.row && Object.prototype.hasOwnProperty.call(env.row, e.name)) return false;
  if (lookupScalarLet(e.name, env).found) return false;
  return Boolean(env.ctx.tables[e.name]) || env.ctx.lets.get(e.name)?.params === null;
}

export function evalExpr(e: Expr, env: Env): Value {
  switch (e.k) {
    case 'num':
      return e.v;
    case 'str':
      return e.v;
    case 'bool':
      return e.v;
    case 'null':
      return null;
    case 'span':
      return new Timespan(e.ms);
    case 'datetime':
      return new Date(e.v);
    case 'dyn':
      return e.v;
    case 'id': {
      if (env.params && Object.prototype.hasOwnProperty.call(env.params, e.name)) return env.params[e.name];
      if (env.row && Object.prototype.hasOwnProperty.call(env.row, e.name)) return env.row[e.name];
      const r = lookupScalarLet(e.name, env);
      if (r.found) return r.value;
      if (env.ctx.tables[e.name] || (env.ctx.lets.get(e.name)?.params === null)) {
        throw semantic(`« ${e.name} » est une table : elle ne peut pas être utilisée comme valeur scalaire ici.`, e, 'Utilisez toscalar(...) pour obtenir une valeur ou placez la table au début de la requête.');
      }
      throw unknownNameError(e.name, columnsOf(env), [...env.ctx.lets.keys()], e);
    }
    case 'member': {
      const o = evalExpr(e.obj, env);
      if (o === null) return null;
      if (typeof o === 'string') {
        throw semantic(`Impossible d’accéder au champ « ${e.name} » : la valeur est une chaîne (string), pas un objet dynamic.`, e, 'Convertissez d’abord avec parse_json() ou todynamic() (ex. parse_json(Colonne).' + e.name + ').');
      }
      if (isObj(o)) return Object.prototype.hasOwnProperty.call(o, e.name) ? (o[e.name] as Value) : null;
      return null;
    }
    case 'index': {
      const o = evalExpr(e.obj, env);
      const i = evalExpr(e.idx, env);
      if (o === null || i === null) return null;
      if (Array.isArray(o)) {
        const n = toNumber(i);
        if (n === null) return null;
        const k = n < 0 ? o.length + n : n;
        return (o[k] as Value) ?? null;
      }
      if (isObj(o)) return Object.prototype.hasOwnProperty.call(o, toStr(i)) ? (o[toStr(i)] as Value) : null;
      if (typeof o === 'string') {
        throw semantic('Indexation impossible sur une chaîne.', e, 'Utilisez parse_json() ou split() pour obtenir un tableau.');
      }
      return null;
    }
    case 'star':
      throw semantic('Le symbole * n’est pas valide ici.', e);
    case 'unary': {
      const v = evalExpr(e.e, env);
      if (v === null) return null;
      if (e.op === '+') return v;
      if (typeof v === 'number') return -v;
      if (isSpan(v)) return new Timespan(-v.ms);
      throw semantic('L’opérateur unaire « - » attend un nombre ou une durée.', e);
    }
    case 'subquery':
      throw semantic('Une sous-requête tabulaire ne peut pas être utilisée comme valeur scalaire.', e, 'Utilisez toscalar(...) ou « in (...) ».');
    case 'in': {
      const l = evalExpr(e.l, env);
      const vals: Value[] = [];
      for (const it of e.items) {
        const tab = it.k === 'subquery' ? it.q : isTabularName(it, env) ? { source: { kind: 'expr' as const, expr: it }, ops: [] } : null;
        if (tab) {
          const t = env.ctx.runPipeline(tab, env.params);
          if (t.columns.length !== 1) throw semantic('La sous-requête de « in » doit retourner une seule colonne.', it, 'Ajoutez « | project Colonne ».');
          for (const r of t.rows) vals.push(r[t.columns[0]]);
        } else {
          const v = evalExpr(it, env);
          if (Array.isArray(v)) vals.push(...(v as Value[]));
          else vals.push(v);
        }
      }
      if (l === null) return e.neg ? true : false;
      let found = false;
      for (const v of vals) {
        if (v === null) continue;
        if (e.ci && typeof l === 'string' && typeof v === 'string' ? l.toLowerCase() === v.toLowerCase() : looseEquals(l, v)) {
          found = true;
          break;
        }
      }
      return e.neg ? !found : found;
    }
    case 'between': {
      const x = evalExpr(e.l, env);
      const lo = evalExpr(e.lo, env);
      const hi = evalExpr(e.hi, env);
      if (x === null || lo === null || hi === null) return false;
      const ok = compareOrdered(x, lo) >= 0 && compareOrdered(x, hi) <= 0;
      return e.neg ? !ok : ok;
    }
    case 'hasany': {
      const l = evalExpr(e.l, env);
      const vals: Value[] = [];
      for (const it of e.items) {
        if (it.k === 'subquery') {
          const t = env.ctx.runPipeline(it.q, env.params);
          for (const r of t.rows) vals.push(r[t.columns[0]]);
        } else {
          const v = evalExpr(it, env);
          if (Array.isArray(v)) vals.push(...(v as Value[]));
          else vals.push(v);
        }
      }
      if (l === null) return false;
      const s = toStr(l);
      const test = (v: Value) => v !== null && hasTerm(s, toStr(v), false);
      return e.all ? vals.every(test) : vals.some(test);
    }
    case 'bin':
      return evalBinary(e, env);
    case 'call':
      return evalCall(e, env);
  }
}

function compareOrdered(a: Value, b: Value): number {
  let x = a;
  let y = b;
  if (isDate(x) && typeof y === 'string') {
    const d = new Date(y.includes('T') ? y : y.replace(' ', 'T') + 'Z');
    if (!Number.isNaN(d.getTime())) y = d;
  } else if (isDate(y) && typeof x === 'string') {
    const d = new Date(x.includes('T') ? x : x.replace(' ', 'T') + 'Z');
    if (!Number.isNaN(d.getTime())) x = d;
  } else if (typeof x === 'number' && typeof y === 'string') {
    const n = toNumber(y);
    if (n !== null) y = n;
  } else if (typeof x === 'string' && typeof y === 'number') {
    const n = toNumber(x);
    if (n !== null) x = n;
  }
  return compareValues(x, y);
}

/** Sémantique de l'opérateur « has » : terme complet délimité par des caractères non alphanumériques. */
export function hasTerm(s: string, term: string, cs: boolean, mode: 'any' | 'prefix' | 'suffix' = 'any'): boolean {
  if (term === '') return false;
  const t = escapeRegex(term);
  const pattern =
    mode === 'any' ? `(?:^|[^A-Za-z0-9])${t}(?![A-Za-z0-9])` : mode === 'prefix' ? `(?:^|[^A-Za-z0-9])${t}` : `${t}(?:[^A-Za-z0-9]|$)`;
  return new RegExp(pattern, cs ? '' : 'i').test(s);
}

function stringOp(op: string, a: Value, b: Value, at: Expr): boolean {
  const neg = op.startsWith('!') && op !== '!~';
  const base = neg ? op.slice(1) : op;
  if (a === null || b === null) return neg ? true : false;
  const s = toStr(a);
  const t = toStr(b);
  let r: boolean;
  switch (base) {
    case 'contains':
      r = s.toLowerCase().includes(t.toLowerCase());
      break;
    case 'contains_cs':
      r = s.includes(t);
      break;
    case 'startswith':
      r = s.toLowerCase().startsWith(t.toLowerCase());
      break;
    case 'startswith_cs':
      r = s.startsWith(t);
      break;
    case 'endswith':
      r = s.toLowerCase().endsWith(t.toLowerCase());
      break;
    case 'endswith_cs':
      r = s.endsWith(t);
      break;
    case 'has':
      r = hasTerm(s, t, false);
      break;
    case 'has_cs':
      r = hasTerm(s, t, true);
      break;
    case 'hasprefix':
      r = hasTerm(s, t, false, 'prefix');
      break;
    case 'hasprefix_cs':
      r = hasTerm(s, t, true, 'prefix');
      break;
    case 'hassuffix':
      r = hasTerm(s, t, false, 'suffix');
      break;
    case 'hassuffix_cs':
      r = hasTerm(s, t, true, 'suffix');
      break;
    case 'matches regex': {
      if (t.length > 300 || /\((?:[^()\\]|\\.)*[+*](?:[^()\\]|\\.)*\)[+*{]/.test(t)) {
        throw new KqlError('limit', 'Expression régulière trop longue ou risquée pour le moteur local.', { line: at.pos.line, col: at.pos.col });
      }
      try {
        r = new RegExp(t).test(s);
      } catch {
        throw semantic(`Expression régulière invalide : « ${t} ».`, at);
      }
      break;
    }
    default:
      throw semantic(`Opérateur inconnu : ${op}`, at);
  }
  return neg ? !r : r;
}

function evalBinary(e: Extract<Expr, { k: 'bin' }>, env: Env): Value {
  const op = e.op;
  if (op === 'and') {
    const l = toBoolValue(evalExpr(e.l, env));
    if (l === false) return false;
    const r = toBoolValue(evalExpr(e.r, env));
    if (r === false) return false;
    return l === null || r === null ? null : true;
  }
  if (op === 'or') {
    const l = toBoolValue(evalExpr(e.l, env));
    if (l === true) return true;
    const r = toBoolValue(evalExpr(e.r, env));
    if (r === true) return true;
    return l === null || r === null ? null : false;
  }
  const a = evalExpr(e.l, env);
  const b = evalExpr(e.r, env);
  switch (op) {
    case '==':
      if (a === null || b === null) return false;
      return compareEq(a, b);
    case '!=':
      if (a === null || b === null) return true;
      return !compareEq(a, b);
    case '=~':
      if (a === null || b === null) return false;
      return toStr(a).toLowerCase() === toStr(b).toLowerCase();
    case '!~':
      if (a === null || b === null) return true;
      return toStr(a).toLowerCase() !== toStr(b).toLowerCase();
    case '<':
    case '<=':
    case '>':
    case '>=': {
      if (a === null || b === null) return false;
      const c = compareOrdered(a, b);
      return op === '<' ? c < 0 : op === '<=' ? c <= 0 : op === '>' ? c > 0 : c >= 0;
    }
    case '+':
    case '-':
    case '*':
    case '/':
    case '%':
      return arithmetic(op, a, b, e);
    default:
      return stringOp(op, a, b, e);
  }
}

function compareEq(a: Value, b: Value): boolean {
  if (isDate(a) && typeof b === 'string') return compareOrdered(a, b) === 0;
  if (isDate(b) && typeof a === 'string') return compareOrdered(a, b) === 0;
  return looseEquals(a, b);
}

function arithmetic(op: string, a: Value, b: Value, e: Expr): Value {
  if (a === null || b === null) return null;
  if (typeof a === 'string' && typeof b === 'string' && op === '+') {
    throw semantic('L’opérateur « + » ne concatène pas des chaînes en KQL.', e, 'Utilisez strcat(a, b) pour concaténer du texte.');
  }
  if (isDate(a) || isDate(b) || isSpan(a) || isSpan(b)) {
    if (isDate(a) && isDate(b) && op === '-') return new Timespan(a.getTime() - b.getTime());
    if (isDate(a) && isSpan(b)) {
      if (op === '+') return new Date(a.getTime() + b.ms);
      if (op === '-') return new Date(a.getTime() - b.ms);
    }
    if (isSpan(a) && isDate(b) && op === '+') return new Date(b.getTime() + a.ms);
    if (isSpan(a) && isSpan(b)) {
      if (op === '+') return new Timespan(a.ms + b.ms);
      if (op === '-') return new Timespan(a.ms - b.ms);
      if (op === '/') return b.ms === 0 ? null : a.ms / b.ms;
    }
    if (isSpan(a) && typeof b === 'number') {
      if (op === '*') return new Timespan(a.ms * b);
      if (op === '/') return b === 0 ? null : new Timespan(a.ms / b);
    }
    if (typeof a === 'number' && isSpan(b) && op === '*') return new Timespan(a * b.ms);
    throw semantic(`Opération « ${op} » non valide entre ces types de valeurs (datetime/timespan).`, e);
  }
  const x = toNumber(a);
  const y = toNumber(b);
  if (x === null || y === null) {
    throw semantic(`L’opérateur « ${op} » attend des nombres.`, e, 'Convertissez avec toint(), tolong() ou todouble().');
  }
  switch (op) {
    case '+':
      return x + y;
    case '-':
      return x - y;
    case '*':
      return x * y;
    case '/':
      return y === 0 ? null : x / y;
    default:
      return y === 0 ? null : x % y;
  }
}

function evalCall(e: Extract<Expr, { k: 'call' }>, env: Env): Value {
  const { name, args } = e;
  if (LAZY_FUNCTIONS.has(name)) {
    switch (name) {
      case 'iff':
      case 'iif': {
        if (args.length !== 3) throw semantic(`${name}() attend 3 arguments : condition, valeur si vrai, valeur si faux.`, e);
        return toBoolValue(evalExpr(args[0], env)) === true ? evalExpr(args[1], env) : evalExpr(args[2], env);
      }
      case 'case': {
        if (args.length < 3 || args.length % 2 === 0) throw semantic('case() attend des paires (condition, valeur) suivies d’une valeur par défaut.', e);
        for (let i = 0; i + 1 < args.length; i += 2) {
          if (toBoolValue(evalExpr(args[i], env)) === true) return evalExpr(args[i + 1], env);
        }
        return evalExpr(args[args.length - 1], env);
      }
      case 'coalesce': {
        for (const a of args) {
          const v = evalExpr(a, env);
          if (v !== null && v !== '') return v;
        }
        return null;
      }
      case 'toscalar': {
        if (args.length !== 1) throw semantic('toscalar() attend un argument.', e);
        const a = args[0];
        if (a.k !== 'subquery') return evalExpr(a, env);
        const t = env.ctx.runPipeline(a.q, env.params);
        if (t.rows.length === 0 || t.columns.length === 0) return null;
        return t.rows[0][t.columns[0]];
      }
      default:
        throw semantic('materialize() ne peut être utilisé que comme source tabulaire (ex. let t = materialize(Table | ...)).', e);
    }
  }

  const def = env.ctx.lets.get(name);
  if (def && def.params !== null) {
    if (args.length !== def.params.length) {
      throw semantic(`La fonction « ${name} » attend ${def.params.length} argument(s), ${args.length} fourni(s).`, e);
    }
    const params: Record<string, Value> = {};
    def.params.forEach((p, i) => {
      params[p.name] = evalExpr(args[i], env);
    });
    const b = def.body;
    if (b.ops.length === 0 && b.source.kind === 'expr') {
      if (env.ctx.depth > 30) throw new KqlError('limit', 'Récursion trop profonde dans les fonctions let.');
      const ctx = { ...env.ctx, depth: env.ctx.depth + 1 };
      return evalExpr(b.source.expr, { ctx, row: null, params });
    }
    throw semantic(`La fonction « ${name} » retourne une table : utilisez-la au début d’une requête, pas comme valeur scalaire.`, e);
  }

  if (AGGREGATES.has(name) && !FUNCTIONS[name]) {
    throw semantic(`${name}() est une fonction d’agrégation : elle n’est utilisable que dans summarize.`, e, `Exemple : | summarize ${name}(...) by Colonne`);
  }
  const fd = FUNCTIONS[name];
  if (!fd) {
    if (UNSUPPORTED_FUNCTIONS.has(name)) {
      throw new KqlError('unsupported', `La fonction « ${name}() » est valide en KQL mais n’est pas prise en charge par le moteur local.`, {
        line: e.pos.line,
        col: e.pos.col,
        hint: 'Consultez la page « Limites et opérateurs pris en charge ».',
      });
    }
    const cand = suggest(name, [...Object.keys(FUNCTIONS), ...env.ctx.lets.keys()]);
    throw semantic(`Fonction « ${name}() » inconnue.`, e, cand ? `Vouliez-vous dire « ${cand}() » ? Les noms de fonctions sont sensibles à la casse.` : undefined);
  }
  if (args.length < fd.min || (fd.max !== undefined && args.length > fd.max)) {
    const exp = fd.max === undefined ? `au moins ${fd.min}` : fd.min === fd.max ? `${fd.min}` : `entre ${fd.min} et ${fd.max}`;
    throw semantic(`${name}() attend ${exp} argument(s), ${args.length} fourni(s).`, e);
  }
  const vals = args.map((a) => {
    if (a.k === 'star') throw semantic(`Le symbole * n’est pas valide comme argument de ${name}().`, a);
    return evalExpr(a, env);
  });
  return fd.fn(vals, { now: env.ctx.now });
}

export type { Dyn, Ty };

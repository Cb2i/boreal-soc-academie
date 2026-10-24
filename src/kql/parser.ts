import { lex } from './lexer.ts';
import type { Token } from './lexer.ts';
import type { Expr, LetDef, Named, Op, Pipeline, Pos, QueryAst, SortKey, Source } from './ast.ts';
import { KqlError } from './types.ts';
import type { Dyn } from './types.ts';

export const SUPPORTED_OPERATORS = [
  'where',
  'filter',
  'project',
  'project-away',
  'project-keep',
  'project-rename',
  'extend',
  'take',
  'limit',
  'top',
  'sort',
  'order',
  'summarize',
  'distinct',
  'count',
  'join',
  'union',
  'mv-expand',
  'getschema',
  'render',
] as const;

/** Opérateurs KQL valides mais non pris en charge par le moteur local. */
const UNSUPPORTED_OPERATORS = new Set([
  'parse',
  'parse-where',
  'make-series',
  'evaluate',
  'lookup',
  'search',
  'find',
  'serialize',
  'scan',
  'sample',
  'sample-distinct',
  'invoke',
  'mv-apply',
  'project-reorder',
  'top-nested',
  'top-hitters',
  'as',
  'fork',
  'partition',
  'facet',
  'range',
  'externaldata',
  'consume',
  'reduce',
]);

const SQL_HINTS: Record<string, string> = {
  select: "KQL n'a pas de SELECT : utilisez « project » pour choisir des colonnes.",
  from: "KQL n'a pas de FROM : la requête commence directement par le nom de la table.",
  group: 'Pour regrouper, utilisez « summarize <agrégation> by <colonne> ».',
  having: 'KQL n’a pas de HAVING : placez un « where » après le « summarize ».',
  insert: 'KQL est un langage de lecture seule : INSERT n’existe pas.',
  update: 'KQL est un langage de lecture seule : UPDATE n’existe pas.',
  delete: 'KQL est un langage de lecture seule : DELETE n’existe pas.',
};

const CMP_OPS = new Set(['==', '!=', '<>', '<', '<=', '>', '>=', '=~', '!~']);
const WORD_CMP = new Set([
  'contains',
  'contains_cs',
  'startswith',
  'startswith_cs',
  'endswith',
  'endswith_cs',
  'has',
  'has_cs',
  'hasprefix',
  'hasprefix_cs',
  'hassuffix',
  'hassuffix_cs',
  'matches',
  'in',
  'between',
  'has_any',
  'has_all',
]);

const TYPED_NULLS = new Set(['long', 'int', 'real', 'double', 'string', 'bool', 'boolean', 'datetime', 'timespan', 'time', 'dynamic', 'guid', 'decimal']);

function pos(t: Token): Pos {
  return { line: t.line, col: t.col };
}

export function parseDatetimeLiteral(raw: string): number | null {
  const s = raw.trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?Z?$/.exec(s);
  if (m) {
    const frac = m[7] ? Math.round(parseFloat('0.' + m[7]) * 1000) : 0;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] ? +m[6] : 0, frac);
  }
  return null;
}

function parseTimespanLiteral(raw: string): number | null {
  const s = raw.trim();
  const m = /^(-?)(?:(\d+)\.)?(\d+):(\d+):(\d+)(?:\.(\d+))?$/.exec(s);
  if (m) {
    const ms = (+(m[2] ?? 0) * 86400 + +m[3] * 3600 + +m[4] * 60 + +m[5]) * 1000 + (m[6] ? Math.round(parseFloat('0.' + m[6]) * 1000) : 0);
    return m[1] ? -ms : ms;
  }
  const u = /^(-?\d+(?:\.\d+)?)(ms|s|m|h|d)$/.exec(s);
  if (u) {
    const f: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return parseFloat(u[1]) * f[u[2]];
  }
  return null;
}

class Parser {
  toks: Token[];
  i = 0;
  src: string;

  constructor(src: string) {
    this.src = src;
    this.toks = lex(src);
  }

  peek(o = 0): Token {
    return this.toks[Math.min(this.i + o, this.toks.length - 1)];
  }
  next(): Token {
    const t = this.toks[this.i];
    if (t.t !== 'eof') this.i++;
    return t;
  }
  isP(v: string, o = 0): boolean {
    const t = this.peek(o);
    return t.t === 'punct' && t.v === v;
  }
  isId(v: string, o = 0): boolean {
    const t = this.peek(o);
    return t.t === 'ident' && t.v === v;
  }
  err(msg: string, t: Token = this.peek(), hint?: string): never {
    throw new KqlError('syntax', msg, { line: t.line, col: t.col, hint });
  }
  describe(t: Token): string {
    if (t.t === 'eof') return 'la fin de la requête';
    if (t.t === 'str') return `la chaîne « ${t.v} »`;
    return `« ${t.v} »`;
  }
  expectP(v: string, ctx?: string): Token {
    if (!this.isP(v)) {
      const t = this.peek();
      this.err(`Attendu « ${v} »${ctx ? ' ' + ctx : ''}, trouvé ${this.describe(t)}.`, t);
    }
    return this.next();
  }
  acceptP(v: string): boolean {
    if (this.isP(v)) {
      this.next();
      return true;
    }
    return false;
  }
  expectIdent(ctx: string): Token {
    const t = this.peek();
    if (t.t !== 'ident') this.err(`Attendu un nom ${ctx}, trouvé ${this.describe(t)}.`, t);
    return this.next();
  }

  // ------------------------------------------------------------------ requête
  parseQuery(): QueryAst {
    const lets: LetDef[] = [];
    while (this.isId('let')) {
      lets.push(this.parseLet());
      if (!this.acceptP(';')) {
        this.err('Il manque un point-virgule « ; » à la fin de l’instruction let.', this.peek(), 'Chaque « let » se termine par « ; ».');
      }
    }
    if (this.peek().t === 'eof') {
      this.err('La requête est vide : il manque la requête principale (par exemple le nom d’une table).', this.peek());
    }
    const body = this.parsePipeline();
    this.acceptP(';');
    if (this.peek().t !== 'eof') this.unexpectedAfterQuery();
    return { lets, body };
  }

  unexpectedAfterQuery(): never {
    const t = this.peek();
    if (t.t === 'ident') {
      const lower = t.v.toLowerCase();
      if ((SUPPORTED_OPERATORS as readonly string[]).includes(lower) || UNSUPPORTED_OPERATORS.has(lower)) {
        this.err(`Opérateur « ${t.v} » inattendu : il manque probablement un « | » (pipe) devant.`, t, 'Chaque opérateur d’une requête est précédé de « | ».');
      }
    }
    if (t.t === 'punct' && t.v === '=') {
      this.err('Symbole « = » inattendu.', t, 'Pour comparer deux valeurs, utilisez « == ». Le signe « = » sert à nommer une colonne calculée (extend, project, summarize).');
    }
    this.err(`Élément inattendu : ${this.describe(t)}.`, t, 'Vérifiez les virgules, parenthèses et pipes « | » de la requête.');
  }

  parseLet(): LetDef {
    const start = this.next(); // let
    const name = this.expectIdent('après « let »');
    this.expectP('=', 'après le nom de la variable');
    let params: LetDef['params'] = null;
    let body: Pipeline;
    if (this.isP('(') && this.looksLikeFunctionParams()) {
      this.next();
      params = [];
      while (!this.isP(')')) {
        const pn = this.expectIdent('de paramètre');
        let ty: string | undefined;
        if (this.acceptP(':')) ty = this.expectIdent('de type').v;
        params.push({ name: pn.v, ty });
        if (!this.acceptP(',')) break;
      }
      this.expectP(')');
      this.expectP('{', 'avant le corps de la fonction');
      body = this.parsePipeline();
      this.acceptP(';');
      this.expectP('}', 'à la fin du corps de la fonction');
    } else {
      body = this.parsePipeline();
    }
    return { name: name.v, params, body, pos: pos(start) };
  }

  /** Distingue « let f = (x:string) { ... } » de « let t = (Table | take 5) ». */
  looksLikeFunctionParams(): boolean {
    let depth = 0;
    let j = this.i;
    for (; j < this.toks.length; j++) {
      const t = this.toks[j];
      if (t.t === 'punct' && t.v === '(') depth++;
      else if (t.t === 'punct' && t.v === ')') {
        depth--;
        if (depth === 0) break;
      }
      if (t.t === 'eof') return false;
    }
    const after = this.toks[j + 1];
    return !!after && after.t === 'punct' && after.v === '{';
  }

  parsePipeline(): Pipeline {
    const first = this.peek();
    let source: Source;
    if (first.t === 'ident' && first.v === 'datatable' && this.isP('(', 1)) source = this.parseDatatable();
    else if (first.t === 'ident' && first.v === 'print') source = this.parsePrint();
    else if (first.t === 'ident' && first.v === 'union') {
      this.next();
      const u = this.parseUnionTail();
      source = { kind: 'union', withsource: u.withsource, items: u.items, pos: pos(first) };
    } else source = { kind: 'expr', expr: this.parseExpr() };
    const ops: Op[] = [];
    while (this.isP('|')) {
      this.next();
      ops.push(this.parseOp());
    }
    return { source, ops };
  }

  /** Parse soit un scalaire, soit un sous-pipeline tabulaire. */
  parsePipelineOrExpr(): Expr {
    const start = this.peek();
    const p = this.parsePipeline();
    if (p.ops.length === 0 && p.source.kind === 'expr') return p.source.expr;
    return { k: 'subquery', q: p, pos: pos(start) };
  }

  parseDatatable(): Source {
    const start = this.next();
    this.expectP('(');
    const cols: { name: string; ty: string }[] = [];
    while (!this.isP(')')) {
      const n = this.expectIdent('de colonne');
      this.expectP(':', 'après le nom de colonne (ex. Nom:string)');
      const ty = this.expectIdent('de type');
      cols.push({ name: n.v, ty: ty.v });
      if (!this.acceptP(',')) break;
    }
    this.expectP(')');
    this.expectP('[', 'avant les valeurs du datatable');
    const values: Expr[] = [];
    while (!this.isP(']')) {
      values.push(this.parseExpr());
      if (!this.acceptP(',')) break;
    }
    this.expectP(']', 'à la fin des valeurs du datatable');
    if (cols.length === 0 || values.length % cols.length !== 0) {
      this.err(`Le nombre de valeurs (${values.length}) n’est pas un multiple du nombre de colonnes (${cols.length}).`, start);
    }
    return { kind: 'datatable', cols, values, pos: pos(start) };
  }

  parsePrint(): Source {
    const start = this.next();
    const items: Named[] = [];
    do {
      items.push(this.parseNamed());
    } while (this.acceptP(','));
    return { kind: 'print', items, pos: pos(start) };
  }

  parseUnionTail(): { withsource?: string; items: Pipeline[] } {
    let withsource: string | undefined;
    while ((this.isId('withsource') || this.isId('kind')) && this.isP('=', 1)) {
      const key = this.next().v;
      this.next();
      const val = this.next();
      if (key === 'withsource') withsource = val.v;
    }
    const items: Pipeline[] = [];
    do {
      if (this.isP('(')) {
        this.next();
        items.push(this.parsePipeline());
        this.expectP(')');
      } else {
        const t = this.expectIdent('de table dans union');
        items.push({ source: { kind: 'expr', expr: { k: 'id', name: t.v, pos: pos(t) } }, ops: [] });
      }
    } while (this.acceptP(','));
    return { withsource, items };
  }

  // ---------------------------------------------------------------- opérateurs
  parseOp(): Op {
    const t = this.peek();
    if (t.t !== 'ident') {
      this.err(`Après « | », un nom d’opérateur est attendu (where, project, summarize...), trouvé ${this.describe(t)}.`, t);
    }
    const name = t.v;
    const p = pos(t);
    const lower = name.toLowerCase();
    if (name !== lower && ((SUPPORTED_OPERATORS as readonly string[]).includes(lower) || UNSUPPORTED_OPERATORS.has(lower))) {
      this.err(`Opérateur « ${name} » inconnu.`, t, `KQL est sensible à la casse pour les opérateurs : écrivez « ${lower} » en minuscules.`);
    }
    if (SQL_HINTS[lower] && !(SUPPORTED_OPERATORS as readonly string[]).includes(lower)) {
      this.err(`« ${name} » n'est pas un opérateur KQL.`, t, SQL_HINTS[lower]);
    }
    if (UNSUPPORTED_OPERATORS.has(name)) {
      throw new KqlError('unsupported', `L’opérateur « ${name} » est valide en KQL mais n’est pas pris en charge par le moteur local de cette plateforme.`, {
        line: t.line,
        col: t.col,
        hint: 'Consultez la page « Limites et opérateurs pris en charge ». Vous pouvez tester cet opérateur dans un vrai espace de travail Log Analytics (démo ou labo).',
      });
    }
    this.next();
    switch (name) {
      case 'where':
      case 'filter': {
        const pred = this.parseExpr();
        if (this.isP('=')) {
          this.err('Symbole « = » inattendu dans le filtre.', this.peek(), 'Pour tester l’égalité, utilisez « == » (ou « =~ » pour ignorer la casse). Le signe « = » sert uniquement à nommer une colonne.');
        }
        return { op: 'where', pred, pos: p };
      }
      case 'project': {
        const items = this.parseNamedList();
        return { op: 'project', items, pos: p };
      }
      case 'extend': {
        const items = this.parseNamedList();
        return { op: 'extend', items, pos: p };
      }
      case 'project-away':
      case 'project-keep': {
        const cols: string[] = [];
        do {
          cols.push(this.expectIdent('de colonne').v);
        } while (this.acceptP(','));
        return { op: name, cols, pos: p } as Op;
      }
      case 'project-rename': {
        const items: { to: string; from: string }[] = [];
        do {
          const to = this.expectIdent('de colonne').v;
          this.expectP('=', 'dans project-rename (nouveauNom = ancienNom)');
          const from = this.expectIdent('de colonne').v;
          items.push({ to, from });
        } while (this.acceptP(','));
        return { op: 'project-rename', items, pos: p };
      }
      case 'take':
      case 'limit': {
        const n = this.parseExpr();
        return { op: 'take', n, pos: p };
      }
      case 'top': {
        const n = this.parseExpr();
        if (!this.isId('by')) this.err('Il manque « by » après le nombre dans « top » (ex. top 5 by Count desc).', this.peek());
        this.next();
        const by = this.parseExpr();
        let desc = true;
        let nullsFirst: boolean | undefined;
        if (this.isId('asc')) {
          this.next();
          desc = false;
        } else if (this.isId('desc')) {
          this.next();
        }
        if (this.isId('nulls')) {
          this.next();
          nullsFirst = this.next().v === 'first';
        }
        return { op: 'top', n, by, desc, nullsFirst, pos: p };
      }
      case 'sort':
      case 'order': {
        if (!this.isId('by')) this.err(`Il manque « by » après « ${name} » (ex. ${name} by TimeGenerated desc).`, this.peek());
        this.next();
        const keys: SortKey[] = [];
        do {
          const expr = this.parseExpr();
          let desc = true;
          let nullsFirst: boolean | undefined;
          if (this.isId('asc')) {
            this.next();
            desc = false;
          } else if (this.isId('desc')) {
            this.next();
          }
          if (this.isId('nulls')) {
            this.next();
            nullsFirst = this.next().v === 'first';
          }
          keys.push({ expr, desc, nullsFirst });
        } while (this.acceptP(','));
        return { op: 'sort', keys, pos: p };
      }
      case 'summarize': {
        const aggs: Named[] = [];
        const by: Named[] = [];
        if (!this.isId('by')) {
          do {
            aggs.push(this.parseNamed());
          } while (this.acceptP(','));
        }
        if (this.isId('by')) {
          this.next();
          do {
            by.push(this.parseNamed());
          } while (this.acceptP(','));
        }
        return { op: 'summarize', aggs, by, pos: p };
      }
      case 'distinct': {
        if (this.isP('*')) {
          this.next();
          return { op: 'distinct', cols: [], star: true, pos: p };
        }
        const cols: Named[] = [];
        do {
          cols.push(this.parseNamed());
        } while (this.acceptP(','));
        return { op: 'distinct', cols, star: false, pos: p };
      }
      case 'count':
        return { op: 'count', pos: p };
      case 'getschema':
        return { op: 'getschema', pos: p };
      case 'render': {
        const kind = this.peek().t === 'ident' ? this.next().v : '';
        while (!this.isP('|') && this.peek().t !== 'eof' && !this.isP(';')) this.next();
        return { op: 'render', kind, pos: p };
      }
      case 'join':
        return this.parseJoin(p);
      case 'union': {
        const u = this.parseUnionTail();
        return { op: 'union', withsource: u.withsource, items: u.items, pos: p };
      }
      case 'mv-expand': {
        const items: { name?: string; expr: Expr; ty?: string }[] = [];
        while (this.isId('bagexpansion') || this.isId('with_itemindex')) {
          this.next();
          this.expectP('=');
          this.next();
        }
        do {
          const n = this.parseNamed();
          let ty: string | undefined;
          if (this.isId('to')) {
            this.next();
            if (!this.isId('typeof')) this.err('Attendu « typeof(...) » après « to ».');
            this.next();
            this.expectP('(');
            ty = this.expectIdent('de type').v;
            this.expectP(')');
          }
          items.push({ name: n.name, expr: n.expr, ty });
        } while (this.acceptP(','));
        return { op: 'mv-expand', items, pos: p };
      }
      default:
        this.err(`Opérateur « ${name} » inconnu.`, t, 'Opérateurs pris en charge : ' + SUPPORTED_OPERATORS.join(', ') + '.');
    }
  }

  parseJoin(p: Pos): Op {
    let kind = 'innerunique';
    for (;;) {
      if (this.isId('kind') && this.isP('=', 1)) {
        this.next();
        this.next();
        kind = this.expectIdent('de type de jointure').v;
        continue;
      }
      if (this.isId('hint') && this.isP('.', 1)) {
        this.next();
        this.next();
        this.next();
        this.expectP('=');
        this.next();
        continue;
      }
      break;
    }
    let right: Pipeline;
    if (this.isP('(')) {
      this.next();
      right = this.parsePipeline();
      this.expectP(')', 'à la fin de la table de droite du join');
    } else {
      const t = this.peek();
      if (t.t !== 'ident') this.err('Après « join », indiquez la table de droite (nom de table ou sous-requête entre parenthèses).', t);
      this.next();
      right = { source: { kind: 'expr', expr: { k: 'id', name: t.v, pos: pos(t) } }, ops: [] };
    }
    if (!this.isId('on')) {
      this.err('Il manque « on » avec la clé de jointure (ex. join (Table2) on UserPrincipalName).', this.peek(), 'KQL n’autorise pas de jointure sans clé « on ».');
    }
    this.next();
    const on: Expr[] = [];
    do {
      on.push(this.parseExpr());
    } while (this.acceptP(','));
    return { op: 'join', kind, right, on, pos: p };
  }

  parseNamedList(): Named[] {
    const items: Named[] = [];
    do {
      items.push(this.parseNamed());
    } while (this.acceptP(','));
    return items;
  }

  parseNamed(): Named {
    const t = this.peek();
    if (t.t === 'ident' && this.isP('=', 1)) {
      this.next();
      this.next();
      return { name: t.v, expr: this.parseExpr(), pos: pos(t) };
    }
    if (this.isP('[') && this.peek(1).t === 'str' && this.isP(']', 2) && this.isP('=', 3)) {
      const n = this.peek(1).v;
      this.i += 4;
      return { name: n, expr: this.parseExpr(), pos: pos(t) };
    }
    return { expr: this.parseExpr(), pos: pos(t) };
  }

  // --------------------------------------------------------------- expressions
  parseExpr(): Expr {
    return this.parseOr();
  }

  parseOr(): Expr {
    let l = this.parseAnd();
    while (this.isId('or')) {
      const t = this.next();
      const r = this.parseAnd();
      l = { k: 'bin', op: 'or', l, r, pos: pos(t) };
    }
    return l;
  }

  parseAnd(): Expr {
    let l = this.parseCmp();
    while (this.isId('and')) {
      const t = this.next();
      const r = this.parseCmp();
      l = { k: 'bin', op: 'and', l, r, pos: pos(t) };
    }
    return l;
  }

  parseCmp(): Expr {
    const l = this.parseAdd();
    const t = this.peek();
    if (t.t === 'punct' && CMP_OPS.has(t.v)) {
      this.next();
      const r = this.parseAdd();
      return { k: 'bin', op: t.v === '<>' ? '!=' : t.v, l, r, pos: pos(t) };
    }
    let neg = false;
    let wordTok = t;
    if (t.t === 'punct' && t.v === '!' && this.peek(1).t === 'ident' && WORD_CMP.has(this.peek(1).v)) {
      neg = true;
      this.next();
      wordTok = this.peek();
    }
    if (wordTok.t === 'ident' && WORD_CMP.has(wordTok.v)) {
      const w = wordTok.v;
      this.next();
      const p = pos(wordTok);
      if (w === 'in') {
        let ci = false;
        if (this.isP('~')) {
          this.next();
          ci = true;
        }
        const items = this.parseListInParens('in');
        return { k: 'in', neg, ci, l, items, pos: p };
      }
      if (w === 'has_any' || w === 'has_all') {
        const items = this.parseListInParens(w);
        return { k: 'hasany', all: w === 'has_all', l, items, pos: p };
      }
      if (w === 'between') {
        this.expectP('(', 'après « between »');
        const lo = this.parseAdd();
        this.expectP('..', 'entre les bornes de « between » (ex. between (1 .. 10))');
        const hi = this.parseAdd();
        this.expectP(')');
        return { k: 'between', neg, l, lo, hi, pos: p };
      }
      if (w === 'matches') {
        if (!this.isId('regex')) this.err('Attendu « regex » après « matches » (ex. x matches regex "^a.*").');
        this.next();
        const r = this.parseAdd();
        return { k: 'bin', op: neg ? '!matches regex' : 'matches regex', l, r, pos: p };
      }
      const r = this.parseAdd();
      return { k: 'bin', op: neg ? '!' + w : w, l, r, pos: p };
    }
    if (t.t === 'punct' && t.v === '!' ) {
      this.err('Symbole « ! » inattendu.', t, 'Pour la négation, utilisez « != », « !contains », « !has », « !in » ou la fonction not().');
    }
    return l;
  }

  parseListInParens(w: string): Expr[] {
    this.expectP('(', `après « ${w} »`);
    const items: Expr[] = [];
    if (!this.isP(')')) {
      do {
        items.push(this.parsePipelineOrExpr());
      } while (this.acceptP(','));
    }
    this.expectP(')', `à la fin de la liste « ${w} »`);
    return items;
  }

  parseAdd(): Expr {
    let l = this.parseMul();
    for (;;) {
      const t = this.peek();
      if (t.t === 'punct' && (t.v === '+' || t.v === '-')) {
        this.next();
        const r = this.parseMul();
        l = { k: 'bin', op: t.v, l, r, pos: pos(t) };
      } else break;
    }
    return l;
  }

  parseMul(): Expr {
    let l = this.parseUnary();
    for (;;) {
      const t = this.peek();
      if (t.t === 'punct' && (t.v === '*' || t.v === '/' || t.v === '%')) {
        this.next();
        const r = this.parseUnary();
        l = { k: 'bin', op: t.v, l, r, pos: pos(t) };
      } else break;
    }
    return l;
  }

  parseUnary(): Expr {
    const t = this.peek();
    if (t.t === 'punct' && (t.v === '-' || t.v === '+')) {
      this.next();
      const e = this.parseUnary();
      if (t.v === '-' && e.k === 'num') return { k: 'num', v: -e.v, pos: pos(t) };
      return { k: 'unary', op: t.v, e, pos: pos(t) };
    }
    return this.parsePostfix();
  }

  parsePostfix(): Expr {
    let e = this.parsePrimary();
    for (;;) {
      const t = this.peek();
      if (t.t === 'punct' && t.v === '.' && this.peek(1).t === 'ident') {
        this.next();
        const n = this.next();
        e = { k: 'member', obj: e, name: n.v, pos: pos(n) };
      } else if (t.t === 'punct' && t.v === '[') {
        this.next();
        const idx = this.parseExpr();
        this.expectP(']', 'à la fin de l’indice');
        e = { k: 'index', obj: e, idx, pos: pos(t) };
      } else break;
    }
    return e;
  }

  parsePrimary(): Expr {
    const t = this.peek();
    const p = pos(t);
    switch (t.t) {
      case 'num':
        this.next();
        return { k: 'num', v: t.n!, pos: p };
      case 'span':
        this.next();
        return { k: 'span', ms: t.n!, pos: p };
      case 'str':
        this.next();
        return { k: 'str', v: t.v, pos: p };
      case 'punct': {
        if (t.v === '(') {
          this.next();
          const e = this.parsePipelineOrExpr();
          this.expectP(')', 'pour fermer la parenthèse');
          return e;
        }
        if (t.v === '[' && this.peek(1).t === 'str' && this.isP(']', 2)) {
          const name = this.peek(1).v;
          this.i += 3;
          return { k: 'id', name, pos: p };
        }
        if (t.v === '*') {
          this.next();
          return { k: 'star', pos: p };
        }
        this.err(`Expression attendue, trouvé ${this.describe(t)}.`, t);
        break;
      }
      case 'ident':
        return this.parseIdentPrimary();
      case 'eof':
        this.err('Expression attendue, mais la requête se termine ici.', t);
    }
    return this.err(`Expression attendue, trouvé ${this.describe(t)}.`, t);
  }

  parseIdentPrimary(): Expr {
    const t = this.next();
    const p = pos(t);
    const name = t.v;
    if (name === 'true' || name === 'false') return { k: 'bool', v: name === 'true', pos: p };
    if (this.isP('(')) {
      // littéraux typés et fonctions
      if (name === 'dynamic') {
        this.next();
        const v = this.parseDynamicValue();
        this.expectP(')', 'à la fin de dynamic(...)');
        return { k: 'dyn', v, pos: p };
      }
      if (name === 'datetime' || name === 'time' || name === 'timespan') {
        this.next();
        const open = this.i;
        let depth = 1;
        while (depth > 0) {
          const x = this.next();
          if (x.t === 'eof') this.err(`Parenthèse fermante manquante après ${name}(`, t);
          if (x.t === 'punct' && x.v === '(') depth++;
          if (x.t === 'punct' && x.v === ')') depth--;
        }
        const closeTok = this.toks[this.i - 1];
        const rawStart = this.toks[open].pos;
        const raw = this.src.slice(rawStart, closeTok.pos).trim();
        if (raw === 'null') return { k: 'null', ty: name, pos: p };
        if (name === 'datetime') {
          const v = parseDatetimeLiteral(raw);
          if (v === null) this.err(`Littéral datetime invalide : « ${raw} ».`, t, 'Format attendu : datetime(2026-03-12) ou datetime(2026-03-12 14:30:00).');
          return { k: 'datetime', v, pos: p };
        }
        const ms = parseTimespanLiteral(raw);
        if (ms === null) this.err(`Littéral timespan invalide : « ${raw} ».`, t, 'Exemples : 30m, 1d, time(01:30:00).');
        return { k: 'span', ms, pos: p };
      }
      if (TYPED_NULLS.has(name) && this.peek(1).t === 'ident' && this.peek(1).v === 'null' && this.isP(')', 2)) {
        this.i += 3;
        return { k: 'null', ty: name, pos: p };
      }
      this.next(); // (
      const args: Expr[] = [];
      if (!this.isP(')')) {
        do {
          if (name === 'toscalar' || name === 'materialize') args.push(this.parsePipelineOrExpr());
          else if (this.isP('*')) {
            const s = this.next();
            args.push({ k: 'star', pos: pos(s) });
          } else args.push(this.parseExpr());
        } while (this.acceptP(','));
      }
      this.expectP(')', `à la fin de l’appel de « ${name}( »`);
      return { k: 'call', name, args, pos: p };
    }
    return { k: 'id', name, pos: p };
  }

  parseDynamicValue(): Dyn {
    const t = this.peek();
    if (t.t === 'punct' && t.v === '[') {
      this.next();
      const arr: Dyn[] = [];
      while (!this.isP(']')) {
        arr.push(this.parseDynamicValue());
        if (!this.acceptP(',')) break;
      }
      this.expectP(']');
      return arr;
    }
    if (t.t === 'punct' && t.v === '{') {
      this.next();
      const obj: { [k: string]: Dyn } = {};
      while (!this.isP('}')) {
        const kt = this.next();
        if (kt.t !== 'str' && kt.t !== 'ident') this.err('Clé d’objet dynamic attendue.', kt);
        this.expectP(':');
        obj[kt.v] = this.parseDynamicValue();
        if (!this.acceptP(',')) break;
      }
      this.expectP('}');
      return obj;
    }
    if (t.t === 'punct' && t.v === '-' && this.peek(1).t === 'num') {
      this.next();
      return -this.next().n!;
    }
    if (t.t === 'num') {
      this.next();
      return t.n!;
    }
    if (t.t === 'str') {
      this.next();
      return t.v;
    }
    if (t.t === 'ident' && (t.v === 'true' || t.v === 'false')) {
      this.next();
      return t.v === 'true';
    }
    if (t.t === 'ident' && t.v === 'null') {
      this.next();
      return null;
    }
    if (t.t === 'ident' && t.v === 'dynamic' && this.isP('(', 1)) {
      this.next();
      this.next();
      const v = this.parseDynamicValue();
      this.expectP(')');
      return v;
    }
    return this.err(`Valeur dynamic invalide : ${this.describe(t)}.`, t);
  }
}

export function parseQuery(src: string): QueryAst {
  return new Parser(src).parseQuery();
}

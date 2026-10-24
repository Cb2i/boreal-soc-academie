import { KqlError, Timespan } from './types.ts';
import type { Dyn, Ty, Value } from './types.ts';
import { escapeRegex, isDate, isObj, isSpan, stableJson, toNumber, toStr } from './values.ts';

export interface FnCtx {
  now: Date;
}

export interface FnDef {
  fn: (args: Value[], ctx: FnCtx) => Value;
  /** Type de retour statique ('arg0' = type du premier argument). */
  ret: Ty | 'arg0';
  min: number;
  max?: number;
}

export const AGGREGATES = new Set([
  'count',
  'countif',
  'dcount',
  'dcountif',
  'sum',
  'sumif',
  'avg',
  'min',
  'max',
  'make_set',
  'make_list',
  'arg_max',
  'arg_min',
  'take_any',
  'any',
  'percentile',
]);

/** Fonctions KQL valides mais hors du périmètre du moteur local. */
export const UNSUPPORTED_FUNCTIONS = new Set([
  'parse_xml',
  'parse_url',
  'parse_urlquery',
  'parse_path',
  'parse_user_agent',
  'parse_command_line',
  'parse_csv',
  'extract_all',
  'extractjson',
  'extract_json',
  'geo_info_from_ip_address',
  'ipv4_lookup',
  'ipv4_compare',
  'parse_ipv4',
  'parse_ipv6',
  'ipv6_is_match',
  'hash',
  'hash_sha256',
  'hash_md5',
  'new_guid',
  'rand',
  'row_number',
  'prev',
  'next',
  'row_cumsum',
  'series_decompose_anomalies',
  'series_decompose',
  'series_fir',
  'series_iir',
  'series_stats',
  'array_sort_asc',
  'array_sort_desc',
  'array_slice',
  'array_concat',
  'array_sum',
  'bag_merge',
  'bag_unpack',
  'zip',
  'stdev',
  'variance',
  'make_bag',
  'make_series',
  'dcount_hll',
  'tdigest',
  'sort_array',
  'datetime_part',
  'weekofyear',
  'endofweek',
  'endofmonth',
  'endofyear',
  'base64_encode_fromarray',
  'gettype',
  'invoke',
  'externaldata',
  'current_principal',
  'ingestion_time',
  'estimate_data_size',
  'bin_at',
  'bin_auto',
  'format_timespan',
  'unixtime_seconds_todatetime',
  'todecimal',
  'toguid',
  'tohex',
  'ceil',
  'log',
  'log2',
  'log10',
  'exp',
  'sin',
  'cos',
  'strcmp',
  'translate',
  'reverse',
  'repeat',
  'make_string',
  'punycode_domain_to_string',
  'regex_quote',
  'dynamic_to_json',
  'treepath',
]);

const mkDate = (ms: number) => new Date(ms);
const DAY = 86_400_000;

function str(v: Value): string {
  return toStr(v);
}

function num(v: Value, name: string, what = 'nombre'): number | null {
  if (v === null) return null;
  const n = toNumber(v);
  if (n === null) {
    throw new KqlError('semantic', `${name}() attend un ${what}, reçu « ${toStr(v)} ».`);
  }
  return n;
}

function toDateValue(v: Value): Date | null {
  if (v === null) return null;
  if (isDate(v)) return v;
  if (typeof v === 'string') {
    const t = Date.parse(v.includes('T') || v.length <= 10 ? v : v.replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(v) ? '' : 'Z'));
    if (Number.isNaN(t)) return null;
    // Date.parse('2026-03-10') est en UTC ; avec heure sans fuseau, forcer UTC
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(v)) return mkDate(Date.parse(v + 'Z'));
    return mkDate(t);
  }
  return null;
}

function needDate(v: Value, name: string): Date | null {
  if (v === null) return null;
  const d = toDateValue(v);
  if (!d) throw new KqlError('semantic', `${name}() attend un datetime, reçu « ${toStr(v)} ».`);
  return d;
}

function binNum(x: number, size: number): number {
  return Math.floor(x / size) * size;
}

function safeRegex(pattern: string, flags = ''): RegExp {
  if (pattern.length > 300) throw new KqlError('limit', 'Expression régulière trop longue pour le moteur local.');
  // Heuristique simple contre le « catastrophic backtracking » : quantificateurs imbriqués.
  if (/\((?:[^()\\]|\\.)*[+*](?:[^()\\]|\\.)*\)[+*{]/.test(pattern)) {
    throw new KqlError('limit', 'Expression régulière jugée risquée (quantificateurs imbriqués) : le moteur local la refuse.', {
      hint: 'KQL utilise le moteur RE2 (sans retour arrière). Simplifiez le motif.',
    });
  }
  try {
    return new RegExp(pattern, flags);
  } catch {
    throw new KqlError('semantic', `Expression régulière invalide : « ${pattern} ».`);
  }
}

function partMs(part: string): number | null {
  switch (part) {
    case 'second':
      return 1000;
    case 'minute':
      return 60_000;
    case 'hour':
      return 3_600_000;
    case 'day':
      return DAY;
    case 'week':
      return 7 * DAY;
    default:
      return null;
  }
}

function startOfWeek(d: Date): Date {
  const day = d.getUTCDay();
  return mkDate(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
}

function dateDiff(part: string, a: Date, b: Date): number {
  if (part === 'month') return (a.getUTCFullYear() * 12 + a.getUTCMonth()) - (b.getUTCFullYear() * 12 + b.getUTCMonth());
  if (part === 'year') return a.getUTCFullYear() - b.getUTCFullYear();
  if (part === 'quarter') return Math.floor((a.getUTCFullYear() * 12 + a.getUTCMonth()) / 3) - Math.floor((b.getUTCFullYear() * 12 + b.getUTCMonth()) / 3);
  if (part === 'week') return Math.round((startOfWeek(a).getTime() - startOfWeek(b).getTime()) / (7 * DAY));
  if (part === 'millisecond') return a.getTime() - b.getTime();
  const ms = partMs(part);
  if (ms === null) throw new KqlError('semantic', `Partie de date inconnue : « ${part} ». Valeurs : second, minute, hour, day, week, month, year.`);
  return Math.floor(a.getTime() / ms) - Math.floor(b.getTime() / ms);
}

function dateAdd(part: string, n: number, d: Date): Date {
  const ms = partMs(part);
  if (ms !== null) return mkDate(d.getTime() + n * ms);
  const r = new Date(d.getTime());
  if (part === 'month') r.setUTCMonth(r.getUTCMonth() + n);
  else if (part === 'year') r.setUTCFullYear(r.getUTCFullYear() + n);
  else if (part === 'quarter') r.setUTCMonth(r.getUTCMonth() + 3 * n);
  else if (part === 'millisecond') return mkDate(d.getTime() + n);
  else throw new KqlError('semantic', `Partie de date inconnue : « ${part} ».`);
  return r;
}

function formatDatetime(d: Date, fmt: string): string {
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  const map: [RegExp, string][] = [
    [/yyyy/g, p(d.getUTCFullYear(), 4)],
    [/yy/g, p(d.getUTCFullYear() % 100)],
    [/MM/g, p(d.getUTCMonth() + 1)],
    [/dd/g, p(d.getUTCDate())],
    [/HH/g, p(d.getUTCHours())],
    [/mm/g, p(d.getUTCMinutes())],
    [/ss/g, p(d.getUTCSeconds())],
  ];
  let out = fmt;
  for (const [re, val] of map) out = out.replace(re, val);
  return out;
}

function ipv4ToInt(ip: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip.trim());
  if (!m) return null;
  const parts = [+m[1], +m[2], +m[3], +m[4]];
  if (parts.some((x) => x > 255)) return null;
  return ((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3];
}

function inCidr(ip: string, cidr: string): boolean | null {
  const [base, bitsStr] = cidr.split('/');
  const a = ipv4ToInt(ip);
  const b = ipv4ToInt(base);
  if (a === null || b === null) return null;
  const bits = bitsStr === undefined ? 32 : parseInt(bitsStr, 10);
  if (Number.isNaN(bits) || bits < 0 || bits > 32) return null;
  if (bits === 0) return true;
  const size = 2 ** (32 - bits);
  return Math.floor(a / size) === Math.floor(b / size);
}

function toDynamic(v: Value): Value {
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as Dyn;
    } catch {
      return null;
    }
  }
  return v;
}

function toTimespan(v: Value): Timespan | null {
  if (v === null) return null;
  if (isSpan(v)) return v;
  if (typeof v === 'number') return new Timespan(v);
  if (typeof v === 'string') {
    const m = /^(-?)(?:(\d+)\.)?(\d+):(\d+):(\d+)(?:\.(\d+))?$/.exec(v.trim());
    if (m) {
      const ms = (+(m[2] ?? 0) * 86400 + +m[3] * 3600 + +m[4] * 60 + +m[5]) * 1000 + (m[6] ? Math.round(parseFloat('0.' + m[6]) * 1000) : 0);
      return new Timespan(m[1] ? -ms : ms);
    }
  }
  return null;
}

function toBool(v: Value): boolean | null {
  if (v === null) return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return null;
}

function toIntValue(v: Value): number | null {
  const n = toNumber(v);
  if (n === null) return null;
  return Math.trunc(n);
}

export const FUNCTIONS: Record<string, FnDef> = {
  // ----------------------------------------------------------------- texte
  strlen: { ret: 'number', min: 1, max: 1, fn: ([s]) => (s === null ? null : str(s).length) },
  tolower: { ret: 'string', min: 1, max: 1, fn: ([s]) => str(s).toLowerCase() },
  toupper: { ret: 'string', min: 1, max: 1, fn: ([s]) => str(s).toUpperCase() },
  substring: {
    ret: 'string',
    min: 2,
    max: 3,
    fn: ([s, a, b]) => {
      const text = str(s);
      let start = num(a, 'substring') ?? 0;
      if (start < 0) start = Math.max(0, text.length + start);
      const len = b === undefined || b === null ? text.length : (num(b, 'substring') ?? 0);
      return text.slice(start, start + len);
    },
  },
  strcat: { ret: 'string', min: 1, fn: (args) => args.map(str).join('') },
  strcat_delim: {
    ret: 'string',
    min: 3,
    fn: ([d, ...rest]) => rest.map(str).join(str(d)),
  },
  split: {
    ret: 'dynamic',
    min: 2,
    max: 3,
    fn: ([s, d, idx]) => {
      const parts = str(s).split(str(d));
      if (idx !== undefined && idx !== null) return parts[num(idx, 'split') ?? 0] ?? null;
      return parts;
    },
  },
  replace_string: { ret: 'string', min: 3, max: 3, fn: ([s, a, b]) => str(s).split(str(a)).join(str(b)) },
  replace_regex: {
    ret: 'string',
    min: 3,
    max: 3,
    fn: ([s, re, rep]) => str(s).replace(safeRegex(str(re), 'g'), str(rep).replace(/\\(\d)/g, '$$$1')),
  },
  trim: {
    ret: 'string',
    min: 2,
    max: 2,
    fn: ([re, s]) => {
      const r = str(re);
      return str(s).replace(safeRegex(`^(?:${r})|(?:${r})$`, 'g'), '');
    },
  },
  trim_start: { ret: 'string', min: 2, max: 2, fn: ([re, s]) => str(s).replace(safeRegex(`^(?:${str(re)})`), '') },
  trim_end: { ret: 'string', min: 2, max: 2, fn: ([re, s]) => str(s).replace(safeRegex(`(?:${str(re)})$`), '') },
  extract: {
    ret: 'string',
    min: 3,
    max: 3,
    fn: ([re, g, s]) => {
      if (s === null) return null;
      const m = safeRegex(str(re)).exec(str(s));
      if (!m) return null;
      const group = num(g, 'extract') ?? 0;
      return m[group] ?? null;
    },
  },
  indexof: {
    ret: 'number',
    min: 2,
    max: 2,
    fn: ([s, sub]) => (s === null ? null : str(s).indexOf(str(sub))),
  },
  url_decode: {
    ret: 'string',
    min: 1,
    max: 1,
    fn: ([s]) => {
      try {
        return decodeURIComponent(str(s).replace(/\+/g, ' '));
      } catch {
        return str(s);
      }
    },
  },
  base64_decode_tostring: {
    ret: 'string',
    min: 1,
    max: 1,
    fn: ([s]) => {
      try {
        const bin = atob(str(s));
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      } catch {
        return null;
      }
    },
  },
  base64_encode_tostring: {
    ret: 'string',
    min: 1,
    max: 1,
    fn: ([s]) => {
      const bytes = new TextEncoder().encode(str(s));
      let bin = '';
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      return btoa(bin);
    },
  },
  // ----------------------------------------------------------- conversions
  tostring: { ret: 'string', min: 1, max: 1, fn: ([v]) => str(v) },
  string: { ret: 'string', min: 1, max: 1, fn: ([v]) => str(v) },
  toint: { ret: 'number', min: 1, max: 1, fn: ([v]) => toIntValue(v) },
  tolong: { ret: 'number', min: 1, max: 1, fn: ([v]) => toIntValue(v) },
  int: { ret: 'number', min: 1, max: 1, fn: ([v]) => toIntValue(v) },
  long: { ret: 'number', min: 1, max: 1, fn: ([v]) => toIntValue(v) },
  todouble: { ret: 'number', min: 1, max: 1, fn: ([v]) => toNumber(v) },
  toreal: { ret: 'number', min: 1, max: 1, fn: ([v]) => toNumber(v) },
  real: { ret: 'number', min: 1, max: 1, fn: ([v]) => toNumber(v) },
  double: { ret: 'number', min: 1, max: 1, fn: ([v]) => toNumber(v) },
  tobool: { ret: 'bool', min: 1, max: 1, fn: ([v]) => toBool(v) },
  toboolean: { ret: 'bool', min: 1, max: 1, fn: ([v]) => toBool(v) },
  bool: { ret: 'bool', min: 1, max: 1, fn: ([v]) => toBool(v) },
  todatetime: { ret: 'datetime', min: 1, max: 1, fn: ([v]) => toDateValue(v) },
  totimespan: { ret: 'timespan', min: 1, max: 1, fn: ([v]) => toTimespan(v) },
  parse_json: { ret: 'dynamic', min: 1, max: 1, fn: ([v]) => toDynamic(v) },
  todynamic: { ret: 'dynamic', min: 1, max: 1, fn: ([v]) => toDynamic(v) },
  // --------------------------------------------------------------- nullité
  isnull: { ret: 'bool', min: 1, max: 1, fn: ([v]) => v === null },
  isnotnull: { ret: 'bool', min: 1, max: 1, fn: ([v]) => v !== null },
  isempty: { ret: 'bool', min: 1, max: 1, fn: ([v]) => v === null || v === '' },
  isnotempty: { ret: 'bool', min: 1, max: 1, fn: ([v]) => !(v === null || v === '') },
  not: { ret: 'bool', min: 1, max: 1, fn: ([v]) => (v === null ? null : !toBool(v)) },
  // ------------------------------------------------------------------ dates
  ago: {
    ret: 'datetime',
    min: 1,
    max: 1,
    fn: ([t], ctx) => {
      if (!isSpan(t)) throw new KqlError('semantic', 'ago() attend une durée (ex. ago(1d), ago(30m)).');
      return mkDate(ctx.now.getTime() - t.ms);
    },
  },
  now: {
    ret: 'datetime',
    min: 0,
    max: 1,
    fn: ([off], ctx) => mkDate(ctx.now.getTime() + (off && isSpan(off) ? off.ms : 0)),
  },
  datetime_add: {
    ret: 'datetime',
    min: 3,
    max: 3,
    fn: ([part, n, d]) => {
      const date = needDate(d, 'datetime_add');
      if (!date) return null;
      return dateAdd(str(part), num(n, 'datetime_add') ?? 0, date);
    },
  },
  datetime_diff: {
    ret: 'number',
    min: 3,
    max: 3,
    fn: ([part, a, b]) => {
      const da = needDate(a, 'datetime_diff');
      const db = needDate(b, 'datetime_diff');
      if (!da || !db) return null;
      return dateDiff(str(part), da, db);
    },
  },
  startofday: { ret: 'datetime', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'startofday'); return x ? mkDate(Math.floor(x.getTime() / DAY) * DAY) : null; } },
  startofweek: { ret: 'datetime', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'startofweek'); return x ? startOfWeek(mkDate(Math.floor(x.getTime() / DAY) * DAY)) : null; } },
  startofmonth: { ret: 'datetime', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'startofmonth'); return x ? mkDate(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), 1)) : null; } },
  startofyear: { ret: 'datetime', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'startofyear'); return x ? mkDate(Date.UTC(x.getUTCFullYear(), 0, 1)) : null; } },
  endofday: { ret: 'datetime', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'endofday'); return x ? mkDate((Math.floor(x.getTime() / DAY) + 1) * DAY - 1) : null; } },
  hourofday: { ret: 'number', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'hourofday'); return x ? x.getUTCHours() : null; } },
  dayofweek: { ret: 'timespan', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'dayofweek'); return x ? new Timespan(x.getUTCDay() * DAY) : null; } },
  dayofmonth: { ret: 'number', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'dayofmonth'); return x ? x.getUTCDate() : null; } },
  dayofyear: {
    ret: 'number',
    min: 1,
    max: 1,
    fn: ([d]) => {
      const x = needDate(d, 'dayofyear');
      return x ? Math.floor((x.getTime() - Date.UTC(x.getUTCFullYear(), 0, 1)) / DAY) + 1 : null;
    },
  },
  getyear: { ret: 'number', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'getyear'); return x ? x.getUTCFullYear() : null; } },
  getmonth: { ret: 'number', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'getmonth'); return x ? x.getUTCMonth() + 1 : null; } },
  monthofyear: { ret: 'number', min: 1, max: 1, fn: ([d]) => { const x = needDate(d, 'monthofyear'); return x ? x.getUTCMonth() + 1 : null; } },
  format_datetime: {
    ret: 'string',
    min: 2,
    max: 2,
    fn: ([d, f]) => {
      const x = needDate(d, 'format_datetime');
      return x ? formatDatetime(x, str(f)) : null;
    },
  },
  // ---------------------------------------------------------------- maths
  bin: {
    ret: 'arg0',
    min: 2,
    max: 2,
    fn: ([x, size]) => {
      if (x === null || size === null) return null;
      if (isDate(x)) {
        const s = isSpan(size) ? size.ms : toNumber(size);
        if (!s || s <= 0) throw new KqlError('semantic', 'bin() : la taille de regroupement doit être positive.');
        return mkDate(binNum(x.getTime(), s));
      }
      if (isSpan(x)) {
        const s = isSpan(size) ? size.ms : toNumber(size);
        if (!s || s <= 0) throw new KqlError('semantic', 'bin() : la taille de regroupement doit être positive.');
        return new Timespan(binNum(x.ms, s));
      }
      const n = toNumber(x);
      const s = toNumber(size);
      if (n === null || s === null || s <= 0) throw new KqlError('semantic', 'bin() attend un nombre, un datetime ou un timespan et une taille positive.');
      return binNum(n, s);
    },
  },
  floor: {
    ret: 'arg0',
    min: 1,
    max: 2,
    fn: ([x, size]) => {
      if (x === null) return null;
      if (size === undefined) {
        const n = toNumber(x);
        return n === null ? null : Math.floor(n);
      }
      return FUNCTIONS.bin.fn([x, size], { now: new Date(0) });
    },
  },
  ceiling: { ret: 'number', min: 1, max: 1, fn: ([x]) => { const n = toNumber(x); return n === null ? null : Math.ceil(n); } },
  round: {
    ret: 'number',
    min: 1,
    max: 2,
    fn: ([x, d]) => {
      const n = toNumber(x);
      if (n === null) return null;
      const digits = d === undefined ? 0 : (num(d, 'round') ?? 0);
      const f = 10 ** digits;
      return Math.round(n * f) / f;
    },
  },
  abs: { ret: 'number', min: 1, max: 1, fn: ([x]) => { const n = toNumber(x); return n === null ? null : Math.abs(n); } },
  sqrt: { ret: 'number', min: 1, max: 1, fn: ([x]) => { const n = toNumber(x); return n === null || n < 0 ? null : Math.sqrt(n); } },
  pow: { ret: 'number', min: 2, max: 2, fn: ([a, b]) => { const x = toNumber(a); const y = toNumber(b); return x === null || y === null ? null : x ** y; } },
  min_of: { ret: 'any', min: 2, fn: (args) => { const ns = args.map(toNumber); return ns.some((n) => n === null) ? null : Math.min(...(ns as number[])); } },
  max_of: { ret: 'any', min: 2, fn: (args) => { const ns = args.map(toNumber); return ns.some((n) => n === null) ? null : Math.max(...(ns as number[])); } },
  // ------------------------------------------------------- dynamic / tableaux
  array_length: { ret: 'number', min: 1, max: 1, fn: ([a]) => (Array.isArray(a) ? a.length : null) },
  set_has_element: {
    ret: 'bool',
    min: 2,
    max: 2,
    fn: ([a, v]) => (Array.isArray(a) ? a.some((x) => stableJson(x) === stableJson(v) || (typeof x !== 'object' && toStr(x as Value) === toStr(v))) : false),
  },
  array_index_of: {
    ret: 'number',
    min: 2,
    max: 2,
    fn: ([a, v]) => (Array.isArray(a) ? a.findIndex((x) => stableJson(x) === stableJson(v)) : null),
  },
  pack_array: { ret: 'dynamic', min: 0, fn: (args) => args as Dyn[] },
  bag_keys: { ret: 'dynamic', min: 1, max: 1, fn: ([o]) => (isObj(o) ? Object.keys(o) : null) },
  bag_pack: {
    ret: 'dynamic',
    min: 0,
    fn: (args) => {
      const o: { [k: string]: Dyn } = {};
      for (let i = 0; i + 1 < args.length; i += 2) o[str(args[i])] = args[i + 1] as Dyn;
      return o;
    },
  },
  // ------------------------------------------------------------------ réseau
  ipv4_is_private: {
    ret: 'bool',
    min: 1,
    max: 1,
    fn: ([ip]) => {
      if (ip === null) return null;
      const s = str(ip);
      if (ipv4ToInt(s) === null) return null;
      return inCidr(s, '10.0.0.0/8') === true || inCidr(s, '172.16.0.0/12') === true || inCidr(s, '192.168.0.0/16') === true;
    },
  },
  ipv4_is_in_range: {
    ret: 'bool',
    min: 2,
    max: 2,
    fn: ([ip, range]) => (ip === null ? null : inCidr(str(ip), str(range))),
  },
};

/** Fonctions à évaluation paresseuse, gérées par l'évaluateur. */
export const LAZY_FUNCTIONS = new Set(['iff', 'iif', 'case', 'coalesce', 'toscalar', 'materialize']);

export const FUNCTION_RETURN_TYPES: Record<string, Ty | 'arg0' | 'special'> = {
  iff: 'special',
  iif: 'special',
  case: 'special',
  coalesce: 'special',
  toscalar: 'any',
  materialize: 'any',
};

export { escapeRegex };

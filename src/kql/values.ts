import { Timespan } from './types.ts';
import type { Dyn, Ty, Value } from './types.ts';

export const isDate = (v: unknown): v is Date => v instanceof Date;
export const isSpan = (v: unknown): v is Timespan => v instanceof Timespan;
export const isObj = (v: unknown): v is { [k: string]: Dyn } =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof Timespan);

export function typeOfValue(v: Value): Ty {
  if (v === null) return 'any';
  if (typeof v === 'string') return 'string';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'bool';
  if (v instanceof Date) return 'datetime';
  if (v instanceof Timespan) return 'timespan';
  return 'dynamic';
}

export function fmtDate(d: Date): string {
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().replace('.000Z', 'Z');
}

export function fmtSpan(t: Timespan): string {
  let ms = Math.round(t.ms);
  const sign = ms < 0 ? '-' : '';
  ms = Math.abs(ms);
  const d = Math.floor(ms / 86_400_000);
  ms -= d * 86_400_000;
  const h = Math.floor(ms / 3_600_000);
  ms -= h * 3_600_000;
  const m = Math.floor(ms / 60_000);
  ms -= m * 60_000;
  const s = Math.floor(ms / 1000);
  const frac = ms - s * 1000;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${sign}${d > 0 ? d + '.' : ''}${pad(h)}:${pad(m)}:${pad(s)}${frac ? '.' + String(frac).padStart(3, '0') : ''}`;
}

/** Conversion en texte à la manière de tostring() (null -> chaîne vide). */
export function toStr(v: Value): string {
  if (v === null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v instanceof Date) return fmtDate(v);
  if (v instanceof Timespan) return fmtSpan(v);
  return JSON.stringify(v);
}

/** Texte affiché dans les tableaux de résultats. */
export function display(v: Value): string {
  if (v === null) return '';
  return toStr(v);
}

export function stableJson(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stableJson).join(',') + ']';
  const o = v as Record<string, unknown>;
  return '{' + Object.keys(o).sort().map((k) => JSON.stringify(k) + ':' + stableJson(o[k])).join(',') + '}';
}

/** Clé de regroupement et de comparaison (typée). */
export function normKey(v: Value): string {
  if (v === null) return 'null';
  if (typeof v === 'string') return 's:' + v;
  if (typeof v === 'number') return 'n:' + (Number.isInteger(v) ? v : Number(v.toPrecision(12)));
  if (typeof v === 'boolean') return 'b:' + v;
  if (v instanceof Date) return 'd:' + v.getTime();
  if (v instanceof Timespan) return 't:' + v.ms;
  return 'j:' + stableJson(v);
}

export function toNumber(v: Value): number | null {
  if (v === null) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const s = v.trim();
    if (s === '') return null;
    const n = Number(s);
    return Number.isNaN(n) ? null : n;
  }
  if (v instanceof Timespan) return v.ms;
  if (v instanceof Date) return v.getTime();
  return null;
}

const typeRank = (v: Value): number => {
  if (v === null) return 0;
  if (typeof v === 'boolean') return 1;
  if (typeof v === 'number') return 2;
  if (v instanceof Date) return 3;
  if (v instanceof Timespan) return 4;
  if (typeof v === 'string') return 5;
  return 6;
};

/** Comparaison d'ordre pour deux valeurs non nulles. */
export function compareValues(a: Value, b: Value): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (a instanceof Timespan && b instanceof Timespan) return a.ms - b.ms;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  const ra = typeRank(a);
  const rb = typeRank(b);
  if (ra !== rb) return ra - rb;
  const sa = toStr(a);
  const sb = toStr(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

/** Égalité souple (utilisée par ==, in) : un nombre et une chaîne sont comparés textuellement. */
export function looseEquals(a: Value, b: Value): boolean {
  if (a === null || b === null) return a === b;
  if (typeof a === typeof b && typeof a !== 'object') return a === b;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof Timespan && b instanceof Timespan) return a.ms === b.ms;
  if (typeof a === 'string' && typeof b === 'number') return a === String(b);
  if (typeof a === 'number' && typeof b === 'string') return String(a) === b;
  if (typeof a === 'object' || typeof b === 'object') return normKey(a) === normKey(b);
  return false;
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 99;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

/** Suggestion « vouliez-vous dire » parmi des noms candidats. */
export function suggest(name: string, candidates: string[]): string | null {
  const lower = name.toLowerCase();
  const ci = candidates.find((c) => c.toLowerCase() === lower);
  if (ci) return ci;
  let best: string | null = null;
  // seuil adapté à la longueur : évite de suggérer « IP » pour « RU »
  const maxD = name.length <= 3 ? 0 : name.length <= 5 ? 1 : 2;
  let bestD = maxD + 1;
  for (const c of candidates) {
    const d = levenshtein(lower, c.toLowerCase());
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

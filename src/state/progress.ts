import { tr } from '../i18n/lang.ts';
// Progression locale (localStorage), sans compte. Fonctions pures + petit store observable.

export const STORAGE_KEY = 'boreal.progress.v1';
export const SCHEMA_VERSION = 1;

export interface DoneRecord {
  xp: number;
  firstAt: number;
  lastAt: number;
  attempts: number;
  hintsUsed: number;
  status: string;
  /** Boîte de révision (Leitner, 1 à 5) et prochaine échéance (ms). */
  box: number;
  due: number;
}

export interface Settings {
  theme: 'auto' | 'dark' | 'light';
  unlockAll: boolean;
  reducedMotion: 'auto' | 'on' | 'off';
  /** Objectif hebdomadaire : nombre de réussites par semaine (1 à 50). */
  weeklyGoal: number;
}

export interface Progress {
  v: number;
  done: Record<string, DoneRecord>;
  /** Tentatives non réussies par exercice. */
  failed: Record<string, number>;
  favorites: string[];
  lessonsDone: string[];
  drafts: Record<string, string>;
  /** Étapes d'enquête réussies : exerciseId -> ids d'étapes. */
  steps: Record<string, string[]>;
  labsChecked: Record<string, string[]>;
  last: { route: string; title: string; at: number } | null;
  settings: Settings;
  /** Activité par jour local (AAAA-MM-JJ) : nombre de réussites. Sert à la série et à l'objectif. */
  activity: Record<string, number>;
  /** Nom affiché sur les certificats. Reste sur cet appareil. */
  certName: string;
  /** Niveau de départ par parcours (choix libre ou test de niveau), 1 à 4. */
  startLevel: Record<string, number>;
  createdAt: number;
}

export const DAY = 86_400_000;
export const DEFAULT_WEEKLY_GOAL = 5;

/** Clé de jour local AAAA-MM-JJ. */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export const LEITNER_DAYS = [1, 3, 7, 14, 30];

export function emptyProgress(now = Date.now()): Progress {
  return {
    v: SCHEMA_VERSION,
    done: {},
    failed: {},
    favorites: [],
    lessonsDone: [],
    drafts: {},
    steps: {},
    labsChecked: {},
    last: null,
    settings: { theme: 'auto', unlockAll: false, reducedMotion: 'auto', weeklyGoal: DEFAULT_WEEKLY_GOAL },
    activity: {},
    certName: '',
    startLevel: {},
    createdAt: now,
  };
}

function cleanActivity(x: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (x && typeof x === 'object' && !Array.isArray(x)) {
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && v > 0) out[k] = Math.min(9999, Math.floor(v));
    }
  }
  return out;
}

function cleanStart(x: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (x && typeof x === 'object' && !Array.isArray(x)) {
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isInteger(v) && v >= 2 && v <= 4) out[k] = v;
    }
  }
  return out;
}

export function sanitize(raw: unknown): Progress {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<Progress>;
  const obj = <T,>(x: unknown, d: T): T => (x && typeof x === 'object' && !Array.isArray(x) ? (x as T) : d);
  const arr = (x: unknown): string[] => (Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string') : []);
  const s = obj<Partial<Settings>>(r.settings, {});
  return {
    v: SCHEMA_VERSION,
    done: obj(r.done, {}),
    failed: obj(r.failed, {}),
    favorites: arr(r.favorites),
    lessonsDone: arr(r.lessonsDone),
    drafts: obj(r.drafts, {}),
    steps: obj(r.steps, {}),
    labsChecked: obj(r.labsChecked, {}),
    last: r.last && typeof r.last === 'object' ? r.last : null,
    settings: {
      theme: s.theme === 'dark' || s.theme === 'light' ? s.theme : 'auto',
      unlockAll: s.unlockAll === true,
      reducedMotion: s.reducedMotion === 'on' || s.reducedMotion === 'off' ? s.reducedMotion : 'auto',
      weeklyGoal: typeof s.weeklyGoal === 'number' && Number.isFinite(s.weeklyGoal) ? Math.min(50, Math.max(1, Math.round(s.weeklyGoal))) : DEFAULT_WEEKLY_GOAL,
    },
    activity: cleanActivity(r.activity),
    startLevel: cleanStart(r.startLevel),
    certName: typeof r.certName === 'string' ? r.certName.slice(0, 60) : '',
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : base.createdAt,
  };
}

export function recordSuccess(p: Progress, id: string, xp: number, status: string, hintsUsed: number, attempts: number, now = Date.now()): Progress {
  const prev = p.done[id];
  const box = prev ? Math.min(5, prev.box + 1) : 1;
  const rec: DoneRecord = {
    xp: prev ? Math.max(prev.xp, xp) : xp,
    firstAt: prev?.firstAt ?? now,
    lastAt: now,
    attempts: (prev?.attempts ?? 0) + attempts,
    hintsUsed: Math.min(prev?.hintsUsed ?? 99, hintsUsed),
    status: prev && prev.xp > xp ? prev.status : status,
    box,
    due: now + LEITNER_DAYS[box - 1] * DAY,
  };
  const k = dayKey(now);
  return { ...p, done: { ...p.done, [id]: rec }, activity: { ...p.activity, [k]: (p.activity[k] ?? 0) + 1 } };
}

export function recordFailure(p: Progress, id: string): Progress {
  const d = p.done[id];
  const done = d ? { ...p.done, [id]: { ...d, box: 1, due: Date.now() + DAY } } : p.done;
  return { ...p, failed: { ...p.failed, [id]: (p.failed[id] ?? 0) + 1 }, done };
}

export function totalXp(p: Progress): number {
  return Object.values(p.done).reduce((a, d) => a + d.xp, 0);
}

export function dueForReview(p: Progress, now = Date.now()): string[] {
  return Object.entries(p.done)
    .filter(([, d]) => d.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}

export function toggleFavorite(p: Progress, id: string): Progress {
  return { ...p, favorites: p.favorites.includes(id) ? p.favorites.filter((x) => x !== id) : [...p.favorites, id] };
}

export function exportProgress(p: Progress): string {
  return JSON.stringify(p, null, 2);
}

export function importProgress(text: string): Progress {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(tr('Le fichier n’est pas un JSON valide.', 'The file is not valid JSON.'));
  }
  if (!raw || typeof raw !== 'object' || (raw as { v?: unknown }).v !== SCHEMA_VERSION) {
    throw new Error(tr('Ce fichier n’est pas une sauvegarde de progression compatible (version attendue : 1).', 'This file is not a compatible progress backup (expected version: 1).'));
  }
  return sanitize(raw);
}

// ----------------------------------------------------------------------------- store

type Listener = () => void;
let state: Progress = emptyProgress();
let loaded = false;
let storageOk = true;
const listeners = new Set<Listener>();

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function load(): void {
  if (loaded) return;
  loaded = true;
  const s = storage();
  if (!s) {
    storageOk = false;
    return;
  }
  try {
    const t = s.getItem(STORAGE_KEY);
    if (t) state = sanitize(JSON.parse(t));
  } catch {
    state = emptyProgress();
  }
}

function persist(): void {
  const s = storage();
  if (!s) {
    storageOk = false;
    return;
  }
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(state));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}

export const store = {
  get(): Progress {
    load();
    return state;
  },
  set(updater: (p: Progress) => Progress): void {
    load();
    state = updater(state);
    persist();
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  storageAvailable(): boolean {
    load();
    return storageOk;
  },
  /** Pour les tests. */
  reset(): void {
    state = emptyProgress();
    loaded = true;
    persist();
    listeners.forEach((l) => l());
  },
  /** Synchronisation inter-onglets. */
  reload(): void {
    const s = storage();
    if (!s) return;
    try {
      const t = s.getItem(STORAGE_KEY);
      state = t ? sanitize(JSON.parse(t)) : emptyProgress();
      listeners.forEach((l) => l());
    } catch {
      /* ignore */
    }
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) store.reload();
  });
}

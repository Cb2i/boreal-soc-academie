// Progression des parcours « moteur d'exercices » (Agentic AI, Defender XDR, Intune Sécurité, scénarios croisés).
// Chaque parcours a sa clé de stockage : aucune migration nécessaire, aucune donnée existante n'est touchée.
import { useSyncExternalStore } from 'react';

export const AI_STORAGE_KEY = 'boube.agentic.v1';
export const AI_SCHEMA = 1;

export interface ItemRecord {
  attempts: number;
  /** Meilleur score obtenu (0 à 1). */
  best: number;
  /** Score de la dernière tentative. */
  last: number;
  passed: boolean;
  at: number;
}

export interface EvalRecord {
  at: number;
  score: number;
  /** Score par exercice lors de la dernière passation. */
  items: Record<string, number>;
  attempts: number;
  best: number;
}

export type ProjectStatus = 'idee' | 'en-cours' | 'realise';

export interface ProjectRecord {
  status: ProjectStatus;
  checks: string[];
  notes: string;
  at: number;
}

export interface AiProgress {
  v: number;
  /** Leçons consultées (date de première consultation). Consulter n'est pas valider une compétence. */
  lessonsSeen: Record<string, number>;
  items: Record<string, ItemRecord>;
  evals: Record<string, EvalRecord>;
  /** Autoévaluation des compétences : critère -> 0 à 3. */
  grids: Record<string, Record<string, number>>;
  projects: Record<string, ProjectRecord>;
  /** Travaux ouverts : critères cochés et notes de l'apprenant. */
  open: Record<string, { checked: string[]; text: string; at: number }>;
  last: { route: string; title: string; at: number } | null;
  createdAt: number;
}

export function emptyAi(now = Date.now()): AiProgress {
  return { v: AI_SCHEMA, lessonsSeen: {}, items: {}, evals: {}, grids: {}, projects: {}, open: {}, last: null, createdAt: now };
}

const rec = <T,>(x: unknown): Record<string, T> => (x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, T>) : {});
const num = (x: unknown, d = 0): number => (typeof x === 'number' && Number.isFinite(x) ? x : d);

export function sanitizeAi(raw: unknown): AiProgress {
  const base = emptyAi();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AiProgress>;
  const items: Record<string, ItemRecord> = {};
  for (const [k, v] of Object.entries(rec<Partial<ItemRecord>>(r.items))) {
    if (v && typeof v === 'object') items[k] = { attempts: Math.max(0, Math.floor(num(v.attempts))), best: Math.min(1, Math.max(0, num(v.best))), last: Math.min(1, Math.max(0, num(v.last))), passed: v.passed === true, at: num(v.at) };
  }
  const evals: Record<string, EvalRecord> = {};
  for (const [k, v] of Object.entries(rec<Partial<EvalRecord>>(r.evals))) {
    if (v && typeof v === 'object') {
      const its: Record<string, number> = {};
      for (const [i, s] of Object.entries(rec<unknown>(v.items))) its[i] = Math.min(1, Math.max(0, num(s)));
      evals[k] = { at: num(v.at), score: Math.min(1, Math.max(0, num(v.score))), items: its, attempts: Math.max(1, Math.floor(num(v.attempts, 1))), best: Math.min(1, Math.max(0, num(v.best, num(v.score)))) };
    }
  }
  const grids: Record<string, Record<string, number>> = {};
  for (const [k, v] of Object.entries(rec<unknown>(r.grids))) {
    const g: Record<string, number> = {};
    for (const [c, s] of Object.entries(rec<unknown>(v))) g[c] = Math.min(3, Math.max(0, Math.round(num(s))));
    grids[k] = g;
  }
  const projects: Record<string, ProjectRecord> = {};
  for (const [k, v] of Object.entries(rec<Partial<ProjectRecord>>(r.projects))) {
    if (v && typeof v === 'object') {
      projects[k] = {
        status: v.status === 'realise' || v.status === 'en-cours' ? v.status : 'idee',
        checks: Array.isArray(v.checks) ? v.checks.filter((s): s is string => typeof s === 'string') : [],
        notes: typeof v.notes === 'string' ? v.notes.slice(0, 4000) : '',
        at: num(v.at),
      };
    }
  }
  const open: AiProgress['open'] = {};
  for (const [k, v] of Object.entries(rec<{ checked?: unknown; text?: unknown; at?: unknown }>(r.open))) {
    if (v && typeof v === 'object') open[k] = { checked: Array.isArray(v.checked) ? v.checked.filter((s): s is string => typeof s === 'string') : [], text: typeof v.text === 'string' ? v.text.slice(0, 8000) : '', at: num(v.at) };
  }
  const seen: Record<string, number> = {};
  for (const [k, v] of Object.entries(rec<unknown>(r.lessonsSeen))) seen[k] = num(v);
  return {
    v: AI_SCHEMA,
    lessonsSeen: seen,
    items,
    evals,
    grids,
    projects,
    open,
    last: r.last && typeof r.last === 'object' && typeof r.last.route === 'string' ? { route: r.last.route, title: String(r.last.title ?? ''), at: num(r.last.at) } : null,
    createdAt: num(r.createdAt, base.createdAt),
  };
}

// --------------------------------------------------------- fonctions pures

export function recordItem(p: AiProgress, id: string, score: number, passed: boolean, now = Date.now()): AiProgress {
  const prev = p.items[id];
  return { ...p, items: { ...p.items, [id]: { attempts: (prev?.attempts ?? 0) + 1, best: Math.max(prev?.best ?? 0, score), last: score, passed: (prev?.passed ?? false) || passed, at: now } } };
}

export function markLessonSeen(p: AiProgress, id: string, now = Date.now()): AiProgress {
  return p.lessonsSeen[id] ? p : { ...p, lessonsSeen: { ...p.lessonsSeen, [id]: now } };
}

export function recordEval(p: AiProgress, moduleId: string, items: Record<string, number>, now = Date.now()): AiProgress {
  const vals = Object.values(items);
  const score = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const prev = p.evals[moduleId];
  return { ...p, evals: { ...p.evals, [moduleId]: { at: now, score, items, attempts: (prev?.attempts ?? 0) + 1, best: Math.max(prev?.best ?? 0, score) } } };
}

export function exportAi(p: AiProgress, storageKey?: string): string {
  return JSON.stringify(storageKey ? { track: storageKey, ...p } : p, null, 2);
}

export function importProgress(text: string, label: string, storageKey?: string): AiProgress {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Le fichier n’est pas un JSON valide.');
  }
  if (!raw || typeof raw !== 'object' || (raw as { v?: unknown }).v !== AI_SCHEMA) throw new Error(`Ce fichier n’est pas une sauvegarde de la section ${label} (version attendue : 1).`);
  const from = (raw as { track?: unknown }).track;
  if (storageKey && typeof from === 'string' && from !== storageKey) throw new Error(`Cette sauvegarde appartient à un autre parcours (${from}) : importez-la dans le parcours correspondant.`);
  return sanitizeAi(raw);
}

export function importAi(text: string): AiProgress {
  return importProgress(text, 'Agentic AI');
}

// ----------------------------------------------------------------- store

type Listener = () => void;

export interface ProgressStore {
  key: string;
  get(): AiProgress;
  set(updater: (p: AiProgress) => AiProgress): void;
  subscribe(l: Listener): () => void;
  storageAvailable(): boolean;
  reset(): void;
  reload(): void;
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Fabrique un magasin de progression indépendant, adossé à sa propre clé localStorage. */
export function createProgressStore(key: string): ProgressStore {
  let state: AiProgress = emptyAi();
  let loaded = false;
  let storageOk = true;
  const listeners = new Set<Listener>();

  const load = (): void => {
    if (loaded) return;
    loaded = true;
    const s = storage();
    if (!s) {
      storageOk = false;
      return;
    }
    try {
      const t = s.getItem(key);
      if (t) state = sanitizeAi(JSON.parse(t));
    } catch {
      state = emptyAi();
    }
  };
  const persist = (): void => {
    const s = storage();
    if (!s) {
      storageOk = false;
      return;
    }
    try {
      s.setItem(key, JSON.stringify(state));
      storageOk = true;
    } catch {
      storageOk = false;
    }
  };
  const store: ProgressStore = {
    key,
    get() {
      load();
      return state;
    },
    set(updater) {
      load();
      state = updater(state);
      persist();
      listeners.forEach((l) => l());
    },
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    storageAvailable() {
      load();
      return storageOk;
    },
    reset() {
      state = emptyAi();
      loaded = true;
      persist();
      listeners.forEach((l) => l());
    },
    reload() {
      const s = storage();
      if (!s) return;
      try {
        const t = s.getItem(key);
        state = t ? sanitizeAi(JSON.parse(t)) : emptyAi();
        listeners.forEach((l) => l());
      } catch {
        /* ignore */
      }
    },
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key) store.reload();
    });
  }
  return store;
}

export const aiStore = createProgressStore(AI_STORAGE_KEY);

export function useStoreProgress(store: ProgressStore): AiProgress {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function useAi(): AiProgress {
  return useStoreProgress(aiStore);
}

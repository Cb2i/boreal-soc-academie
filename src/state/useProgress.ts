import { useSyncExternalStore } from 'react';
import { store } from './progress.ts';
import type { Progress } from './progress.ts';

export function useProgress(): Progress {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

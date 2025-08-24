import type { StoreApi } from 'zustand';
import type { EditorState } from '@/types/editor';
import { idbStorage } from './idb';

interface PersistState {
  saveQueue: number[];
  lastSavedAt: number | null;
  isOffline: boolean;
}

let store: StoreApi<EditorState & PersistState> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const KEY = 'uibuilder:save-queue';

export function initPersist(s: StoreApi<EditorState & PersistState>) {
  store = s;
  if (typeof window === 'undefined') return;
  window.addEventListener('online', flush);
  window.addEventListener('offline', () => {
    store?.setState({ isOffline: true });
  });
  // load any pending queue from idb
  idbStorage.getItem(KEY).then((raw) => {
    if (!raw) return;
    try {
      const q = JSON.parse(raw) as number[];
      if (q.length) {
        store?.setState({ saveQueue: q, isOffline: true });
        flush();
      }
    } catch {
      /* ignore */
    }
  });
}

export function schedulePersist() {
  if (!store) return;
  store.setState((s) => ({ saveQueue: [...s.saveQueue, Date.now()] }));
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 500);
}

async function flush() {
  if (!store) return;
  const s = store.getState();
  if (!navigator.onLine) {
    await idbStorage.setItem(KEY, JSON.stringify(s.saveQueue));
    store.setState({ isOffline: true });
    return;
  }
  if (s.saveQueue.length === 0) {
    store.setState({ isOffline: false });
    return;
  }
  await idbStorage.removeItem(KEY).catch(() => {});
  store.setState({ saveQueue: [], lastSavedAt: Date.now(), isOffline: false });
}

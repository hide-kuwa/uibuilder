// append-only history bridge; wire real history when available
export type HistoryInsert = (args: { parentId: string; index: number; nodeId: string }) => void;

declare global {
  interface Window {
    builder?: { pushInsertHistory?: HistoryInsert };
  }
}

export function registerHistoryInsert(fn: HistoryInsert) {
  (window as any).builder = (window as any).builder || {};
  (window as any).builder.pushInsertHistory = fn;
}

// default listener: convert the CustomEvent to the bridge call (no-op if not registered)
(function wireHistoryListener() {
  const h = (e: Event) => {
    const detail = (e as CustomEvent).detail || {};
    const fn = (window as any).builder?.pushInsertHistory;
    if (typeof fn === 'function' && detail?.type === 'insert' && detail?.nodeId) {
      fn({ parentId: detail.parentId, index: detail.index, nodeId: String(detail.nodeId) });
    }
  };
  window.addEventListener('builder.history', h as any);
})();

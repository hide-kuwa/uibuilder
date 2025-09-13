import { rehydrateFromStagedIfNewer, getLastIndexedTs, putToIndexedDb } from '@/lib/persist/snapshot'

let bootRehydrateDone = false
export function ensureEarlyRehydrate() {
  if (bootRehydrateDone || typeof window === 'undefined') return
  bootRehydrateDone = true
  void rehydrateFromStagedIfNewer(getLastIndexedTs, putToIndexedDb)
  // BFCache restore
  window.addEventListener('pageshow', (e: any) => {
    if (e?.persisted) {
      void rehydrateFromStagedIfNewer(getLastIndexedTs, putToIndexedDb)
    }
  }, { once: false })

  // Discard restore (Chromium: PerformanceNavigationTiming.wasDiscarded)
  try {
    const nav = (performance as any).getEntriesByType?.('navigation')?.[0] as any
    if (nav?.wasDiscarded) {
      void rehydrateFromStagedIfNewer(getLastIndexedTs, putToIndexedDb)
    }
  } catch {}
}

ensureEarlyRehydrate()

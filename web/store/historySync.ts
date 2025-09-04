'use client'
import { useBuilderStore } from '@/store/builderStore'
import { useDesignTokens } from '@/store/designTokensStore'
import { useHistoryStore, makeSnapshot } from '@/store/historyStore'
import { fingerprint, debounce } from '@/lib/history/fingerprint'
import { saveProject } from '@/lib/project/io'

let mounted = false
export function mountHistorySync() {
  if (mounted || typeof window === 'undefined') return
  mounted = true
  let last = ''
  const pushIfChanged = debounce(() => {
    const snap = makeSnapshot()
    const fp = fingerprint(snap.elements, snap.meta, snap.designTokens)
    if (fp !== last) {
      last = fp
      useHistoryStore.getState().push(snap)
      saveProject({ schemaVersion: 1, meta: snap.meta, elements: snap.elements, designTokens: snap.designTokens, assets: [] })
    }
  }, 1000)

  useHistoryStore.getState().initFromCurrent()

  useBuilderStore.subscribe((_s) => {
    if (useHistoryStore.getState().busy) return
    pushIfChanged()
  })
  useDesignTokens.subscribe((_s) => {
    if (useHistoryStore.getState().busy) return
    pushIfChanged()
  })
}


'use client'
import { useBuilderStore } from '@/store/builderStore'

const CH = 'builder-sync'
let mounted = false
let echoGuard = false

export function mountLiveSync(role: 'builder' | 'preview') {
  if (mounted || typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return
  mounted = true
  const ch = new BroadcastChannel(CH)
  ch.onmessage = (e) => {
    if (!e?.data) return
    if (e.data.type === 'state') {
      echoGuard = true
      useBuilderStore.setState({ elements: e.data.payload.elements, meta: e.data.payload.meta || {} })
      echoGuard = false
    }
  }
  useBuilderStore.subscribe((s) => {
    if (echoGuard) return
    ch.postMessage({ type: 'state', role, payload: { elements: s.elements, meta: (s as any).meta || {} } })
  })
}

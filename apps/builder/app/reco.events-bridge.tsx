// apps/builder/app/reco.events-bridge.tsx
'use client'
import React from 'react'

export function RecoEventsBridge() {
  React.useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<any>).detail ?? {}
      if (d && typeof d === 'object' && 'leftId' in d && 'rightId' in d) {
        try { window.dispatchEvent(new CustomEvent('reco:confirmed', { detail: d })) } catch {}
      } else if (d && typeof d === 'object' && 'amountTolerance' in d) {
        try { window.dispatchEvent(new CustomEvent('reco:tolerance', { detail: d })) } catch {}
      }
    }
    const legacy = ['reco', 'reco\n']
    legacy.forEach(t => window.addEventListener(t, handler as EventListener))
    return () => legacy.forEach(t => window.removeEventListener(t, handler as EventListener))
  }, [])
  return null
}


// apps/builder/app/bindings.events-bridge.tsx
'use client'
import React from 'react'

export default function BindingsEventsBridge() {
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as any
      if (!detail || !detail.formula) return
      ;(window as any).__bindingsInsert = detail
      if (e.type === 'binding:insert') {
        try { window.dispatchEvent(new CustomEvent('bindings:insert', { detail })) } catch {}
      }
    }
    window.addEventListener('binding:insert', handler as any)
    window.addEventListener('bindings:insert', handler as any)
    return () => {
      window.removeEventListener('binding:insert', handler as any)
      window.removeEventListener('bindings:insert', handler as any)
    }
  }, [])
  return null
}


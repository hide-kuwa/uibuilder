// apps/builder/components/bindings/useBindingsInsert.ts
'use client'
import * as React from 'react'

export type InsertDetail = { key?: string; formula: string }

// 直近の「bindings:insert」を購読して保持
export function useBindingsInsert() {
  const [last, setLast] = React.useState<InsertDetail | null>(() => {
    return (typeof window !== 'undefined' && (window as any).__bindingsInsert) || null
  })

  React.useEffect(() => {
    const onInsert = (e: Event) => {
      const d = (e as CustomEvent)?.detail as InsertDetail | undefined
      if (!d?.formula) return
      setLast(d)
    }
    window.addEventListener('bindings:insert', onInsert as any)
    return () => window.removeEventListener('bindings:insert', onInsert as any)
  }, [])

  return last
}


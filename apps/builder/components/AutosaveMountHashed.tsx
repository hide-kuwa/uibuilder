// apps/builder/components/AutosaveMountHashed.tsx
'use client'
import * as React from 'react'
import { useAutosave } from '@/src/hooks/useAutosave'

function stableStringify(x: any) {
  try {
    if (x && typeof x === 'object') {
      const keys = Object.keys(x as any).sort()
      const obj: any = {}
      for (const k of keys) obj[k] = (x as any)[k]
      return JSON.stringify(obj)
    }
    return JSON.stringify(x)
  } catch {
    return JSON.stringify(String(x))
  }
}

export function AutosaveMountHashed({ page, debounceMs = 800 }: { page: any; debounceMs?: number }) {
  const lastHash = React.useRef<string>('')
  const computeHash = React.useCallback(() => stableStringify(page ?? {}), [page])

  useAutosave({
    key: `page:${page?.id ?? 'unknown'}`,
    data: page,
    save: async (p) => {
      const next = computeHash()
      if (next === lastHash.current) return
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      })
      if (!res.ok) throw new Error('save failed')
      lastHash.current = next
    },
    debounceMs,
  })

  React.useEffect(() => {
    lastHash.current = computeHash()
  }, [computeHash])

  return null
}


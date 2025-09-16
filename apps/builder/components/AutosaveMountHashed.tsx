// apps/builder/components/AutosaveMountHashed.tsx
'use client'
import * as React from 'react'
import { useAutosave } from '@/src/hooks/useAutosave'
import { recordSavedAt } from '@/stores/saveQueue'

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
      try {
        const payload = await res.json()
        const savedAtRaw = typeof payload?.savedAt === 'string'
          ? Date.parse(payload.savedAt)
          : typeof payload?.savedAt === 'number'
            ? Number(payload.savedAt)
            : Date.now()
        const savedAt = Number.isFinite(savedAtRaw) ? savedAtRaw : Date.now()
        const lastWriteTs = typeof payload?.lastWriteTs === 'number' ? Number(payload.lastWriteTs) : undefined
        recordSavedAt(savedAt, lastWriteTs)
      } catch {
        recordSavedAt(Date.now())
      }
      lastHash.current = next
    },
    debounceMs,
  })

  React.useEffect(() => {
    lastHash.current = computeHash()
  }, [computeHash])

  return null
}


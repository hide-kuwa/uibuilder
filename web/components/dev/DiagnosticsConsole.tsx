'use client'

import { useEffect, useState } from 'react'

import { DIAGNOSTICS_EVENT_NAME } from '@/lib/diagnostics'

declare global {
  interface Window {
    __diag?: {
      hydrationWarnings: string[]
      _hydrationHookInstalled?: boolean
    }
  }
}

export default function DiagnosticsConsole() {
  const [warnings, setWarnings] = useState<string[]>([])
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const diag = (window.__diag ??= { hydrationWarnings: [] })
    if (!Array.isArray(diag.hydrationWarnings)) {
      diag.hydrationWarnings = []
    }
    const update = () => {
      setWarnings([...diag.hydrationWarnings])
    }
    update()
    const handler: EventListener = () => {
      update()
    }
    window.addEventListener(DIAGNOSTICS_EVENT_NAME, handler)
    return () => {
      window.removeEventListener(DIAGNOSTICS_EVENT_NAME, handler)
    }
  }, [])

  useEffect(() => {
    if (warnings.length > 0) {
      setOpen(true)
    }
  }, [warnings.length])

  if (!warnings.length || !open) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md rounded border border-amber-500 bg-amber-950/90 p-4 text-sm text-amber-50 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-amber-200">Diagnostics</div>
          <div className="font-semibold">Hydration warnings ({warnings.length})</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-amber-200 transition hover:text-white"
        >
          閉じる
        </button>
      </div>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
        {warnings.join('\n')}
      </pre>
    </div>
  )
}

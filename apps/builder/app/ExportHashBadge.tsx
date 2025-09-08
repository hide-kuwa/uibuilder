// use client - append-only new client component
'use client'
import { useEffect, useState } from 'react'

/**
 * Export 実行後の manifest.contentHash を右下バッジで表示する軽量インジケータ。
 * 取得方法は多系統で冗長化：
 *  1) window.__lastExport?.manifest?.contentHash
 *  2) window.__lastExportManifest?.contentHash
 *  3) CustomEvent（detail.contentHash or detail.manifest.contentHash）
 *     - 'tmd:export:manifest' / 'export:done' / 'export:manifest'
 *
 * 既存行は変更せず append-only。
 */
export default function ExportHashBadge() {
  const [hash, setHash] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const updateFromGlobals = () => {
      try {
        // @ts-expect-error - accessing window bags
        const g1 = window.__lastExport?.manifest?.contentHash as string | undefined
        // @ts-expect-error
        const g2 = window.__lastExportManifest?.contentHash as string | undefined
        const h = g1 || g2 || null
        if (h && h !== hash) setHash(h)
      } catch {
        /* noop */
      }
    }
    const onEvt = (e: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyE = e as any
      const d = anyE?.detail
      const h =
        (d?.contentHash as string | undefined) ||
        (d?.manifest?.contentHash as string | undefined) ||
        null
      if (h) setHash(h)
    }
    const id = setInterval(updateFromGlobals, 1000)
    updateFromGlobals()
    window.addEventListener('tmd:export:manifest', onEvt as EventListener)
    window.addEventListener('export:done', onEvt as EventListener)
    window.addEventListener('export:manifest', onEvt as EventListener)
    return () => {
      clearInterval(id)
      window.removeEventListener('tmd:export:manifest', onEvt as EventListener)
      window.removeEventListener('export:done', onEvt as EventListener)
      window.removeEventListener('export:manifest', onEvt as EventListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!hash) return null
  return (
    <div
      className="fixed bottom-4 right-4 z-[1000] rounded-xl px-3 py-2 shadow-lg border text-xs
                 bg-black/70 text-white backdrop-blur-sm"
      role="status"
      aria-live="polite"
      data-export-hash-badge
    >
      <span className="opacity-70">contentHash:</span>{' '}
      <code className="font-mono break-all">{hash}</code>
    </div>
  )
}


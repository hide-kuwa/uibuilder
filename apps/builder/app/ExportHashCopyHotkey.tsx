// use client - append-only new client component
'use client'
import { useEffect, useState } from 'react'

/**
 * Export の manifest.contentHash をホットキーでコピーする補助。
 * Shortcut: Ctrl+Alt+C（Windows/Linux） / ⌘+Alt+C（macOS）
 * 取得元は ExportHashBadge と同様に冗長化（window bags）。
 */
export default function ExportHashCopyHotkey() {
  const [notice, setNotice] = useState<{ hash: string; at: number } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const pickHash = (): string | null => {
      try {
        // @ts-expect-error - window bags
        const g1 = window.__lastExport?.manifest?.contentHash as string | undefined
        // @ts-expect-error
        const g2 = window.__lastExportManifest?.contentHash as string | undefined
        return g1 || g2 || null
      } catch {
        return null
      }
    }
    const copy = async (text: string) => {
      try {
        await navigator.clipboard?.writeText?.(text)
      } catch {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
      const main = isMac ? e.metaKey : e.ctrlKey
      if (main && e.altKey && (e.key.toLowerCase() === 'c' || e.code === 'KeyC')) {
        const h = pickHash()
        if (!h) return
        copy(h)
        setNotice({ hash: h, at: Date.now() })
      }
    }
    window.addEventListener('keydown', onKey)
    const id = setInterval(() => {
      if (notice && Date.now() - notice.at > 1500) setNotice(null)
    }, 250)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice?.at])

  if (!notice) return null
  const short = `${notice.hash}`.slice(0, 10)
  return (
    <div
      className="fixed top-4 right-4 z-[1000] rounded-lg px-3 py-2 border shadow bg-black/70 text-white text-xs"
      role="status"
      aria-live="polite"
      data-export-hash-copied
    >
      Copied contentHash: <code className="font-mono">{short}…</code>
    </div>
  )
}


// use client - append-only new client component
'use client'
import { useEffect, useRef, useState } from 'react'

type Status = 'ok' | 'warn' | 'down'

/**
 * /events（SSE）ストリームのハートビート監視。
 * 直近受信からの経過で色を切替：<5s=緑 / <20s=黄 / それ以上 or 切断=赤。
 * 既存実装に非干渉の軽量バッジ。append-only。
 */
export default function EventStreamHealth() {
  const [status, setStatus] = useState<Status>('down')
  const [lastMs, setLastMs] = useState<number | null>(null)
  const [usingUrl, setUsingUrl] = useState<string | null>(null)
  const lastAtRef = useRef<number>(0)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const urls = ['/events', '/bindings-events']
    let idx = 0
    const open = (url: string) => {
      try {
        const es = new EventSource(url)
        esRef.current = es
        setUsingUrl(url)
        es.addEventListener('message', (ev) => {
          lastAtRef.current = Date.now()
          // 任意フォーマット許容、受信時に即OKへ
          setStatus('ok')
        })
        es.addEventListener('error', () => {
          // 失敗時は次URLへフォールバック
          try {
            es.close()
          } catch {}
          esRef.current = null
          if (idx + 1 < urls.length) {
            idx += 1
            open(urls[idx])
          } else {
            setStatus('down')
          }
        })
      } catch {
        setStatus('down')
      }
    }
    open(urls[idx])

    const id = window.setInterval(() => {
      const now = Date.now()
      const last = lastAtRef.current
      if (!last) {
        setStatus('down')
        setLastMs(null)
        return
      }
      const delta = now - last
      setLastMs(delta)
      setStatus(delta < 5000 ? 'ok' : delta < 20000 ? 'warn' : 'down')
    }, 2000)
    return () => {
      if (esRef.current) {
        try {
          esRef.current.close()
        } catch {}
      }
      clearInterval(id)
    }
  }, [])

  const color =
    status === 'ok' ? 'bg-emerald-500' : status === 'warn' ? 'bg-amber-500' : 'bg-rose-500'
  const title = `events: ${status}${
    lastMs != null ? ` (last ${Math.floor(lastMs / 1000)}s)` : ''
  }${usingUrl ? ` @ ${usingUrl}` : ''}`

  return (
    <div
      className="fixed top-4 left-4 z-[1000] flex items-center gap-2 px-2 py-1 rounded-md border bg-black/60 text-white text-xs backdrop-blur"
      role="status"
      aria-live="polite"
      title={title}
      data-events-health
    >
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="opacity-80">events</span>
      {lastMs != null && <span className="tabular-nums">{Math.floor(lastMs / 1000)}s</span>}
    </div>
  )
}


'use client'
import { useEffect, useState } from 'react'

type Item = { t: string } & Record<string, any>

export default function AuditPage() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch('/api/audit?limit=400', { cache: 'no-store' })
        const j = await r.json()
        if (alive && j?.ok) setItems(j.items)
      } catch {}
    }
    load()
    const id = setInterval(load, 2000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1>Audit</h1>
      <p style={{ color: '#666' }}>Tail of /api/audit (auto-refresh)</p>
      <ol style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        {items.map((it, i) => (<li key={i}>{JSON.stringify(it)}</li>))}
      </ol>
    </div>
  )
}


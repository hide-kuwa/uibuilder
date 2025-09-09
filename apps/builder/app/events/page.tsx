// apps/builder/app/events/page.tsx
'use client'
import React from 'react'

type Ev = { op?: string } & Record<string, any>

export default function EventsPage() {
  const [items, setItems] = React.useState<Ev[]>([])
  const [hiddenOps, setHiddenOps] = React.useState<string[]>(['heartbeat', 'binding.sync'])

  React.useEffect(() => {
    let alive = true
    try {
      const es = new EventSource('/events')
      es.addEventListener('message', (e) => {
        if (!alive) return
        const data = (e as MessageEvent).data
        let obj: Ev
        try { obj = JSON.parse(data) } catch { obj = { raw: String(data) } as any }
        setItems((prev) => {
          const next = prev.concat(obj)
          // keep tail reasonably small
          return next.length > 500 ? next.slice(next.length - 500) : next
        })
      })
      es.addEventListener('error', () => { /* swallow to keep UI light */ })
      return () => { alive = false; es.close() }
    } catch {
      return () => { /* noop */ }
    }
  }, [])

  const toggle = (op: string) => {
    setHiddenOps((prev) => (prev.includes(op) ? prev.filter((x) => x !== op) : prev.concat(op)))
  }

  const visible = items.filter((row) => (row?.op ? !hiddenOps.includes(row.op) : true))

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-1">Events</h1>
      <p className="text-sm text-gray-600 mb-2">/events stream (live)</p>

      {/* --- append-only: Hide ops filter --- */}
      <div className="mb-3">
        <label className="text-sm font-semibold mr-2">Hide ops:</label>
        <label className="mr-2 text-sm">
          <input
            type="checkbox"
            checked={hiddenOps.includes('heartbeat')}
            onChange={() => toggle('heartbeat')}
            className="mr-1"
          />
          heartbeat
        </label>
        <label className="mr-2 text-sm">
          <input
            type="checkbox"
            checked={hiddenOps.includes('binding.sync')}
            onChange={() => toggle('binding.sync')}
            className="mr-1"
          />
          binding.sync
        </label>
      </div>

      <ol className="font-mono whitespace-pre-wrap text-xs">
        {visible.map((it, i) => (
          <li key={i}>{JSON.stringify(it)}</li>
        ))}
      </ol>
    </div>
  )
}


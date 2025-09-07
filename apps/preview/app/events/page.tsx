'use client'

import React from 'react'

type Log = { t: string; type: string; detail: any }

export default function EventsPage() {
  const [logs, setLogs] = React.useState<Log[]>([])

  React.useEffect(() => {
    const push = (type: string) => (e: any) => {
      setLogs((prev) => [
        { t: new Date().toISOString(), type, detail: (e as CustomEvent)?.detail ?? null },
        ...prev,
      ])
    }

    // autosave 系
    const a1 = window.addEventListener('autosave:queued', push('autosave:queued') as any)
    const a2 = window.addEventListener('autosave:saved', push('autosave:saved') as any)
    const a3 = window.addEventListener('autosave:error', push('autosave:error') as any)

    // reco 系（互換 + 正式）
    const r0 = window.addEventListener('reco', push('reco') as any)
    const r1 = window.addEventListener('reco:confirmed', push('reco:confirmed') as any)
    const r2 = window.addEventListener('reco:tolerance', push('reco:tolerance') as any)

    return () => {
      window.removeEventListener('autosave:queued', push('autosave:queued') as any)
      window.removeEventListener('autosave:saved', push('autosave:saved') as any)
      window.removeEventListener('autosave:error', push('autosave:error') as any)
      window.removeEventListener('reco', push('reco') as any)
      window.removeEventListener('reco:confirmed', push('reco:confirmed') as any)
      window.removeEventListener('reco:tolerance', push('reco:tolerance') as any)
    }
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Events (autosave & reco)</h1>
      <p style={{ marginBottom: 12, color: '#666' }}>
        左で操作（Autosave / Reco）→ ここにイベントが流れます
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {logs.map((l, i) => (
          <div
            key={i}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 8,
              background: '#fafafa',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            <div style={{ fontSize: 12, color: '#999' }}>{l.t}</div>
            <div style={{ fontWeight: 600 }}>{l.type}</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(l.detail, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}


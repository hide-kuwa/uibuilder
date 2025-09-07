// apps/builder/app/reco-confirmed/page.tsx
'use client'
import React from 'react'

const KEY = 'reco.confirmed'

export default function RecoConfirmedPage() {
  const [rows, setRows] = React.useState<any[]>([])

  React.useEffect(() => {
    try { setRows(JSON.parse(sessionStorage.getItem(KEY) || '[]')) } catch { setRows([]) }
    const onRecv = () => {
      try { setRows(JSON.parse(sessionStorage.getItem(KEY) || '[]')) } catch {}
    }
    window.addEventListener('reco', onRecv)
    window.addEventListener('reco:confirmed', onRecv)
    return () => {
      window.removeEventListener('reco', onRecv)
      window.removeEventListener('reco:confirmed', onRecv)
    }
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Reco confirmed (session)</h1>
      <p style={{ marginBottom: 8, color: '#666' }}>
        Reco/Reco+ で「確定」したペアが sessionStorage に保存されます。
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, background: '#fafafa' }}>
            <div style={{ fontSize: 12, color: '#999' }}>{r.t}</div>
            <div><b>left</b>: {r.leftId} / <b>right</b>: {r.rightId}</div>
            {r.amount != null && <div><b>amount</b>: {r.amount}</div>}
            {r.score != null && <div><b>score</b>: {r.score}</div>}
          </div>
        ))}
        {rows.length === 0 && <div style={{ color: '#999' }}>（まだ確定履歴がありません）</div>}
      </div>
    </div>
  )
}


// apps/builder/components/rightpane/DsTestPanelPlus.tsx
'use client'
import { useState } from 'react'
import { auditPost } from '@/src/lib/audit'

export default function DsTestPanelPlus() {
  const [url, setUrl] = useState('')
  const [timeoutMs, setTimeoutMs] = useState(8000)
  const [retries, setRetries] = useState(1)
  const [backoffMs, setBackoffMs] = useState(400)
  const [out, setOut] = useState('')

  const post = async () => {
    setOut('loading…')
    try {
      // append-only: POST audit for DS v2 invocation
      auditPost('ds.fetch.v2', { url, timeoutMs, retries, backoffMs })
      const res = await fetch('/api/ds-fetch3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, opts: { timeoutMs, retries, backoffMs } }),
      })
      const json = await res.json()
      setOut(JSON.stringify(json, null, 2))
    } catch (e: any) {
      setOut(String(e?.message || e))
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <input
          placeholder="https://example.com/data.json"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <label>timeoutMs <input type="number" value={timeoutMs} onChange={(e) => setTimeoutMs(Number(e.target.value))} style={{ width: 120 }} /></label>
          <label>retries <input type="number" value={retries} onChange={(e) => setRetries(Number(e.target.value))} style={{ width: 120 }} /></label>
          <label>backoffMs <input type="number" value={backoffMs} onChange={(e) => setBackoffMs(Number(e.target.value))} style={{ width: 120 }} /></label>
        </div>
        <button onClick={post}>POST /api/ds-fetch3</button>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#fafafa', border: '1px solid #eee', padding: 8, maxHeight: 300, overflow: 'auto' }}>
          {out}
        </pre>
      </div>
    </div>
  )
}

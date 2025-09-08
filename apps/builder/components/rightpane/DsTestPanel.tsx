// apps/builder/components/rightpane/DsTestPanel.tsx
'use client'
import * as React from 'react'

export default function DsTestPanel() {
  const [url, setUrl] = React.useState('https://jsonplaceholder.typicode.com/todos/1')
  const [result, setResult] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchDirect = async () => {
    setLoading(true); setError(null)
    try {
      console.info('[audit]', { op: 'ds.fetch', kind: 'direct', url })
      const res = await fetch(url, { cache: 'no-store' })
      const text = await res.text()
      setResult({ ok: res.ok, status: res.status, len: text.length, preview: text.slice(0, 800) })
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  const fetchViaApi = async () => {
    setLoading(true); setError(null)
    try {
      console.info('[audit]', { op: 'ds.fetch', kind: 'api', url })
      const res = await fetch('/api/ds-fetch2', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) })
      const json = await res.json()
      setResult(json)
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>DataSource テスト</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          style={{ flex: 1, padding: 6, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <button onClick={fetchDirect} disabled={loading}>fetchJSON(url)</button>
        <button onClick={fetchViaApi} disabled={loading}>POST /api/ds-fetch2</button>
      </div>
      {loading && <div style={{ marginTop: 8 }}>Loading…</div>}
      {error && <div style={{ marginTop: 8, color: 'crimson' }}>Error: {error}</div>}
      {result && (
        <pre style={{ marginTop: 8, maxHeight: 280, overflow: 'auto', background: '#f7f7f7', padding: 8, borderRadius: 6 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
      <div style={{ marginTop: 8, color: '#666' }}>※ 先頭800文字までプレビュー。POSTルートはサーバ側ガード込み。</div>
    </div>
  )
}


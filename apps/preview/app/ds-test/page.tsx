'use client'
import React from 'react'
import { fetchJSON } from '@chizu/ui/ds/fetcher'

export default function Page() {
  const [url, setUrl] = React.useState('https://httpbin.org/get')
  const [status, setStatus] = React.useState<string>('idle')
  const [out, setOut] = React.useState<any>(null)

  const run = async () => {
    setStatus('running')
    try {
      const data = await fetchJSON('/api/ds-fetch2', {
        timeoutMs: 5000,
        retries: 1,
        headers: { 'content-type': 'application/json' }
      } as any)
      setOut(data); setStatus('ok')
    } catch (e:any) {
      setOut({ error: String(e?.message || e) }); setStatus('error')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>DS Test</h1>
      <input value={url} onChange={e=>setUrl(e.target.value)} style={{ width:'100%', maxWidth:480 }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={async ()=>{
          setStatus('running')
          try {
            const data = await fetchJSON(url, { timeoutMs: 5000, retries: 1 })
            setOut({ ok:true, sample: (typeof data==='string'? data.slice(0,120): data) }); setStatus('ok')
          } catch(e:any) {
            setOut({ error: String(e?.message || e) }); setStatus('error')
          }
        }}>fetchJSON(url)</button>
        <button style={{ marginLeft: 8 }} onClick={run}>POST /api/ds-fetch2</button>
      </div>
      <div style={{ marginTop: 8, color:'#666' }}>status: {status}</div>
      <pre style={{ marginTop: 8, background:'#fafafa', padding:8, borderRadius:6 }}>
        {JSON.stringify(out, null, 2)}
      </pre>
    </div>
  )
}


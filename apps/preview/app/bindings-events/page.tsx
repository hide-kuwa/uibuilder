'use client'
import React from 'react'

export default function BindingsEventsPage() {
  const [rows, setRows] = React.useState<any[]>([])
  React.useEffect(() => {
    const push = (type: string, d: any) => setRows(r => [{ t: new Date().toISOString(), type, d }, ...r].slice(0,300))
    const h1 = (e: Event) => push('binding:insert', (e as CustomEvent).detail)
    const h2 = (e: Event) => push('bindings:insert', (e as CustomEvent).detail)
    window.addEventListener('binding:insert', h1 as any)
    window.addEventListener('bindings:insert', h2 as any)
    return () => {
      window.removeEventListener('binding:insert', h1 as any)
      window.removeEventListener('bindings:insert', h2 as any)
    }
  }, [])
  return (
    <div style={{ padding:16 }}>
      <h1 style={{ fontSize:20, fontWeight:700 }}>bindings events</h1>
      <div style={{ display:'grid', gap:8, marginTop:8 }}>
        {rows.map((r,i) => (
          <div key={i} style={{ border:'1px solid #eee', borderRadius:8, padding:8, background:'#fafafa' }}>
            <div style={{ fontSize:12, color:'#999' }}>{r.t}</div>
            <div><b>{r.type}</b></div>
            <pre style={{ marginTop:6 }}>{JSON.stringify(r.d, null, 2)}</pre>
          </div>
        ))}
        {rows.length===0 && <div style={{ color:'#999' }}>（イベント待ち）</div>}
      </div>
    </div>
  )
}


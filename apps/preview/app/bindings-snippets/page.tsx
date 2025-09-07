'use client'
import React from 'react'
import { BINDING_SNIPPETS } from '@chizu/ui/bindings/snippets'
import { suggestSnippets } from '@chizu/ui/bindings/suggest'

export default function Page() {
  const [cat, setCat] = React.useState<string>('all')
  const list = cat === 'all' ? BINDING_SNIPPETS : suggestSnippets({ want: [cat as any] })
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text) } catch {} }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Bindings Snippets</h1>
      <div style={{ margin: '8px 0' }}>
        <label>カテゴリ: </label>
        <select value={cat} onChange={(e)=>setCat(e.target.value)}>
          <option value="all">all</option>
          <option value="number">number</option>
          <option value="date">date</option>
          <option value="format">format</option>
          <option value="safety">safety</option>
        </select>
      </div>
      <ul style={{ display:'grid', gap:8, padding:0, listStyle:'none' }}>
        {list.map(s => (
          <li key={s.key} style={{ border:'1px solid #eee', borderRadius:8, padding:8 }}>
            <div style={{ fontWeight:600 }}>{s.label}</div>
            <div style={{ color:'#666', fontSize:12 }}>{s.key} {s.category ? `(${s.category})` : ''}</div>
            <pre style={{ margin:'6px 0', background:'#fafafa', padding:8, borderRadius:6 }}>{s.formula}</pre>
            <button onClick={()=>copy(s.formula)}>コピー</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


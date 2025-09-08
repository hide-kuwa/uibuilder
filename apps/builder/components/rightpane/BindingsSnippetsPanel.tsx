// apps/builder/components/rightpane/BindingsSnippetsPanel.tsx
'use client'
import React from 'react'
import { suggestSnippets } from '@chizu/ui/bindings/suggest'

export default function BindingsSnippetsPanel() {
  const [cat, setCat] = React.useState<string>('all')
  const list = cat === 'all'
    ? suggestSnippets()
    : suggestSnippets({ want: [cat as any] })

  const onInsert = (key: string, formula: string) => {
    const detail = { key, formula }
    // 互換: binding:insert（legacy）
    window.dispatchEvent(new CustomEvent('binding:insert', { detail }))
    // 正式: bindings:insert
    window.dispatchEvent(new CustomEvent('bindings:insert', { detail }))
    // 軽い監査ログ
    // console.info('[audit]', { op: 'bindings:insert', key })
    // フォーカス中の入力へ即適用（あれば）
    ;(window as any).__setBindingFormula?.(formula)
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
        <b>Bindings Snippets</b>
        <select value={cat} onChange={(e)=>setCat(e.target.value)} style={{ marginLeft:'auto' }}>
          <option value="all">all</option>
          <option value="number">number</option>
          <option value="date">date</option>
          <option value="format">format</option>
          <option value="safety">safety</option>
        </select>
      </div>
      <div style={{ display:'grid', gap:8 }}>
        {list.map((s: any) => (
          <div key={s.key} style={{ border:'1px solid #eee', borderRadius:8, padding:8 }}>
            <div style={{ fontWeight:600 }}>{s.label}</div>
            <div style={{ color:'#666', fontSize:12 }}>{s.key}{s.category ? ` (${s.category})` : ''}</div>
            <pre style={{ margin:'6px 0', background:'#fafafa', padding:8, borderRadius:6 }}>{s.formula}</pre>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>onInsert(s.key, s.formula)}>挿入</button>
              <button onClick={async ()=>{ try { await navigator.clipboard.writeText(s.formula) } catch {} }}>コピー</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

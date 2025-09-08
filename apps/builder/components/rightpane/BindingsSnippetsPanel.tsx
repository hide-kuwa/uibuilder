// apps/builder/components/rightpane/BindingsSnippetsPanel.tsx
'use client'
import React from 'react'
import { useState } from 'react' // append-only
import { suggestSnippets } from '@chizu/ui/bindings/suggest'
import { audit } from '@/src/lib/audit' // append-only

// --- append-only: snippets insert audit (capture) ---
function __bindingsSnippetsAuditClick(e: MouseEvent) {
  try {
    const t = e.target as HTMLElement | null
    if (!t) return
    // 探索：data-snippet-key or data-key を親方向に遡って取得
    let el: HTMLElement | null = t
    let key: string | null = null
    while (el) {
      const ds: any = (el as any).dataset
      if (ds && (ds.snippetKey || ds.key)) {
        key = (ds.snippetKey as string) || (ds.key as string)
        break
      }
      // 「挿入 / Insert」ボタン経由のケース：親行から key を拾う
      if (el.tagName === 'BUTTON' && /挿入|Insert/i.test(el.textContent || '')) {
        const row = el.closest('[data-snippet-key],[data-key]') as HTMLElement | null
        if (row) {
          const dr: any = (row as any).dataset
          key = (dr?.snippetKey as string) || (dr?.key as string) || null
        }
        break
      }
      el = el.parentElement
    }
    if (!key) return
    // フォーミュラ textarea を推定（name/data-role/id のいずれか）
    const ta =
      (document.querySelector(
        'textarea[name="formula"], textarea[data-role="formula"], textarea#formula, textarea.formula'
      ) as HTMLTextAreaElement | null) ||
      (t.closest('form')?.querySelector('textarea') as HTMLTextAreaElement | null)
    const formulaLen = ta?.value?.length ?? 0
    // 監査ログ（既存 audit() を使用）
    audit('bindings.insert', { key, formulaLen })
  } catch {
    /* noop: 監査失敗はUIに影響させない */
  }
}

// グローバル一度きりでキャプチャ登録（append-only）
if (typeof window !== 'undefined' && !(window as any).__snippetAuditInstalled) {
  ;(window as any).__snippetAuditInstalled = true
  document.addEventListener('click', __bindingsSnippetsAuditClick, true) // capture
}

export default function BindingsSnippetsPanel() {
  const [cat, setCat] = React.useState<string>('all')
  // append-only: bindings type-hint from focused input
  const wantCtx = (typeof window !== 'undefined' && (window as any).__bindingContext?.want) as string[] | undefined;
  // append-only: show current context hint
  const wantHint = Array.isArray(wantCtx) && wantCtx.length > 0 ? wantCtx.join(', ') : null;
  const [, setBump] = useState(0) // append-only: rerender trigger for clearing context
  const clearCtx = () => { // append-only
    if (typeof window !== 'undefined' && (window as any).__bindingContext) (window as any).__bindingContext = undefined
    // append-only: audit log for context clear
    const prev = Array.isArray(wantCtx) && wantCtx.length > 0 ? wantCtx : null
    audit('bindings.ctx.clear', { prev })
    setBump(v => v + 1)
  }
  const list = cat === 'all'
    ? suggestSnippets(wantCtx ? { want: wantCtx } : {})
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
      {wantHint && (
        <div style={{ margin: '6px 0' }}>
          <span
            aria-label={`snippet context ${wantHint}`}
            title={`Snippets filtered by: ${wantHint}`}
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              fontSize: 12,
              color: '#111827',
              background: '#f9fafb'
            }}
          >
            context: {wantHint}
          </span>
          {/* append-only: clear button */}
          <button
            type="button"
            onClick={clearCtx}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearCtx() } }}
            aria-label="clear snippet context"
            title="コンテキストをクリア"
            style={{
              marginLeft: 6,
              padding: '0 6px',
              height: 22,
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              background: '#ffffff',
              cursor: 'pointer',
              fontSize: 12,
              lineHeight: '20px'
            }}
          >
            ×
          </button>
        </div>
      )}
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

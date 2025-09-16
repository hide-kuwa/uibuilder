'use client'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import type { Page, ComponentNode, Frame } from '@chizu/types'
import * as REG from '@chizu/registry'
import { AutosaveMountHashed } from '@/components/AutosaveMountHashed'
import { ApplyLastSnippetButton } from '@/components/bindings/ApplyLastSnippetButton'
import { DEFAULT_BUILDER_MANIFEST } from '@/lib/meta/builderManifest'
import { loadBuilderManifest, saveBuilderManifest } from '@/lib/meta/storage'

const fetcher = (u: string) => fetch(u).then((r) => r.json())

const BASE_FRAMES: Frame[] = [
  {
    id: 'frame-basic',
    name: 'Basic',
    slots: [
      { name: 'header' },
      { name: 'sidebar' },
      { name: 'content', required: true },
      { name: 'footer' },
    ],
  },
  {
    id: 'frame-top',
    name: 'TopOnly',
    slots: [
      { name: 'header' },
      { name: 'content', required: true },
    ],
  },
  {
    id: 'frame-wide',
    name: 'Wide',
    slots: [
      { name: 'content', required: true },
      { name: 'footer' },
    ],
  },
]

const META_FRAME: Frame = {
  id: 'frame-builder',
  name: 'Builder UI',
  slots: [
    { name: 'leftSidebar' },
    { name: 'canvas', required: true },
    { name: 'rightPanel' },
  ],
}

const DEFAULT_PAGE = (id = 'map-home'): Page => ({
  id,
  title: '新規ページ',
  frameId: 'frame-basic',
  content: [],
  slotAssignments: {}
})

const CATALOG: Array<{type:string; label:string; defaultProps?:Record<string,any>}> = [
  { type:'Text', label:'Text', defaultProps:{ text:'テキスト' } },
  { type:'Image', label:'Image', defaultProps:{ src:'', alt:'' } },
  { type:'Hero', label:'Hero', defaultProps:{ title:'タイトル' } },
  { type:'TopNav', label:'TopNav' },
  { type:'PrefList', label:'PrefList' }
]

type SlotName = 'header'|'sidebar'|'content'|'footer'|'leftSidebar'|'rightPanel'|'canvas'

const META_SLOTS: SlotName[] = ['leftSidebar', 'canvas', 'rightPanel']

function clone<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

// Builder-side lightweight runtime preview data for bindings
const PREVIEW_API: Record<string, any> = {
  prefStats: {
    '01': { name: '北海道', population: 5224614 },
    '13': { name: '東京都', population: 14047594 },
  },
}

// ---- diff utilities ----
function indexById(nodes: ComponentNode[] = []) {
  const m = new Map<string, ComponentNode>()
  nodes.forEach(n => m.set(n.id, n))
  return m
}
function ids(nodes: ComponentNode[] = []) { return nodes.map(n=>n.id) }
function diffArrays<T>(oldArr: T[], newArr: T[]) {
  const oldSet = new Set(oldArr as any[])
  const newSet = new Set(newArr as any[])
  const added = [...newSet].filter(x=>!oldSet.has(x))
  const removed = [...oldSet].filter(x=>!newSet.has(x))
  const same = [...newSet].filter(x=>oldSet.has(x))
  return { added, removed, same }
}
function shallowEqual(a:any,b:any){ return JSON.stringify(a)===JSON.stringify(b) }
function diffPropsBindings(oldN?:ComponentNode, newN?:ComponentNode){
  const changes: Array<{key:string; from:any; to:any; kind:'prop'|'binding'}> = []
  if (!oldN || !newN) return changes
  const pKeys = new Set([...(Object.keys(oldN.props??{})), ...(Object.keys(newN.props??{}))])
  pKeys.forEach(k=>{
    const ov = (oldN.props as any)?.[k]; const nv = (newN.props as any)?.[k]
    if (!shallowEqual(ov,nv)) changes.push({ key:k, from:ov, to:nv, kind:'prop' })
  })
  const bKeys = new Set([...(Object.keys(oldN.bindings??{})), ...(Object.keys(newN.bindings??{}))])
  bKeys.forEach(k=>{
    const ov = (oldN.bindings as any)?.[k]; const nv = (newN.bindings as any)?.[k]
    if (!shallowEqual(ov,nv)) changes.push({ key:k, from:ov, to:nv, kind:'binding' })
  })
  return changes
}
function getSlotNodes(p: Page, slot: SlotName): ComponentNode[] {
  if (slot === 'content' || slot === 'canvas') {
    return p.content ?? []
  }
  return p.slotAssignments?.[slot] ?? []
}
function diffPage(oldP: Page, newP: Page, frameIdOld: string, frameIdNew: string){
  const slots: SlotName[] = ['header','sidebar','content','footer','leftSidebar','rightPanel']
  const slotDiffs = slots.map(slot=>{
    const o = getSlotNodes(oldP, slot)
    const n = getSlotNodes(newP, slot)
    const oIds = ids(o); const nIds = ids(n)
    const { added, removed, same } = diffArrays(oIds, nIds)
    const oldMap = indexById(o); const newMap = indexById(n)
    const moved: string[] = []
    same.forEach(id=>{ if (oIds.indexOf(id) !== nIds.indexOf(id)) moved.push(id) })
    const modified = same
      .map(id => ({ id, changes: diffPropsBindings(oldMap.get(id), newMap.get(id)) }))
      .filter(x => x.changes.length>0)
    return { slot, added, removed, moved, modified }
  })
  const titleChanged = !shallowEqual(oldP.title, newP.title)
  const frameChanged = frameIdOld !== frameIdNew
  return { titleChanged, frameChanged, slotDiffs }
}

function PropsEditor({node, onChange}:{node:ComponentNode; onChange:(k:string,v:any)=>void}){
  const schema = (REG as any).getSchema?.(node.type) as any
  if(!schema?.properties) return <div>Propsなし</div>
  // fetch hover preset options
  const { data: hoverList } = useSWR<{ items: Array<{ id: string; name: string }> }>(
    '/api/hover',
    fetcher
  )
  const options = hoverList?.items ?? []
  return (
    <div style={{display:'grid', gap:10}}>
      {Object.entries(schema.properties).map(([key, spec]: any)=>{
        // single select
        if (key === 'hoverPresetId') {
          const val = (node.props as any)?.[key] ?? spec.default ?? ''
          return (
            <div key={key}>
              <div style={{fontSize:12,color:'#666'}}>{spec.title || key}</div>
              <select
                value={val}
                onChange={e=>onChange(key, (e.target as HTMLSelectElement).value)}
                style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:8}}
              >
                <option value="">（なし）</option>
                {options.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name ?? ''}</option>)}
              </select>
            </div>
          )
        }
        // multi select
        if (key === 'hoverPresetIds') {
          const val: string[] = (node.props as any)?.[key] ?? spec.default ?? []
          return (
            <div key={key}>
              <div style={{fontSize:12,color:'#666'}}>{spec.title || key}</div>
              <select
                multiple
                value={val}
                onChange={e=>{
                  const selected = Array.from((e.currentTarget as HTMLSelectElement).selectedOptions).map(o=>o.value)
                  onChange(key, selected)
                }}
                size={Math.min(6, Math.max(3, options.length))}
                style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:8}}
              >
                {options.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name ?? ''}</option>)}
              </select>
              <div style={{fontSize:12, color:'#666', marginTop:4}}>選択順＝合成順（後の方が上書き）</div>
            </div>
          )
        }
        // default input
        return (
          <div key={key}>
            <div style={{fontSize:12,color:'#666'}}>{spec.title || key}</div>
            <input
              value={(node.props as any)?.[key] ?? spec.default ?? ''}
              onChange={e=>onChange(key, (e.target as HTMLInputElement).value)}
              style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:8}}
            />
          </div>
        )
      })}
    </div>
  )
}

function BindingsEditor({
  node,
  onChange,
  pageRoot,
}: {
  node: ComponentNode
  onChange: (next: ComponentNode) => void
  pageRoot: any
}) {
  const schema: any = REG.getSchema(node.type)
  const propKeys: string[] = Object.keys(schema?.properties ?? {})
  const currentBindings = node.bindings ?? {}
  const { data: ds } = useSWR<{items:Array<{key:string;url:string;ttlSec?:number}>}>('/api/ds', fetcher)
  const apiKeys = (ds?.items ?? []).map(x=>x.key)
  const isMetaMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('meta') === '1'

  const initialProp =
    (node.meta as any)?.lastBindingProp ||
    Object.keys(currentBindings)[0] ||
    propKeys[0] ||
    ''

  const [targetProp, setTargetProp] = useState<string>(initialProp)

  const cur = currentBindings[targetProp]
  const [rows, setRows] = useState<Array<{ scope: 'page'|'api', path: string }>>(
    cur?.inputs?.length
      ? cur.inputs.map((r: any) => ({ scope: r.scope, path: r.path }))
      : [{ scope: 'page', path: 'prefCode' }]
  )
  const [expr, setExpr] = useState<string>(
    cur?.formula?.expr ?? '`値: ${$0}`'
  )
  const [suggestIdx, setSuggestIdx] = useState<number>(-1)

  // 行操作
  const addRow = () => setRows(rs => [...rs, { scope: 'page', path: '' }])
  const delRow = (i: number) => setRows(rs => rs.filter((_, idx) => idx !== i))
  const moveRow = (i: number, dir: -1|1) => setRows(rs => {
    const j = i + dir; if (j<0 || j>=rs.length) return rs
    const a = [...rs]; [a[i], a[j]] = [a[j], a[i]]; return a
  })
  const setRow = (i: number, patch: Partial<{scope:'page'|'api', path:string}>) =>
    setRows(rs => rs.map((r, idx) => idx===i ? { ...r, ...patch } : r))

  // ライブプレビュー：簡易ランタイム
  const PREVIEW_PAGE = { prefCode: '13' }
  const PREVIEW_API  = {
    prefStats: {
      '01': { name: '北海道', population: 5224614 },
      '13': { name: '東京都', population: 14047594 }
    }
  }

  const inputsPreview: any[] = rows.map(r => {
    if (r.scope === 'page') {
      // dot-walk（最小）
      return r.path.split('.').reduce((acc:any,k)=>acc?.[k], PREVIEW_PAGE)
    } else {
      return r.path.split('.').reduce((acc:any,k)=>acc?.[k], PREVIEW_API)
    }
  })

  const previewValue = (() => {
    try {
      // 安全策：式は文字列＆長さ制限
      if (typeof expr !== 'string' || expr.length > 500) return '(式が長すぎます)'
      // eslint-disable-next-line no-new-func
      const f = new Function(...inputsPreview.map((_,i)=>`$${i}`), `return (${expr})`)
      return String(f(...inputsPreview))
    } catch {
      return '(式エラー)'
    }
  })()

  // API key preview helpers
  function dottedGet(obj:any, path:string){
    if(!path) return obj
    return path.split('.').reduce((a:any,k:string)=>a?.[k], obj)
  }
  function pretty(v:any, limit=250){
    try {
      const s = JSON.stringify(v, null, 2) ?? 'null'
      return s.length>limit ? s.slice(0,limit)+'\n…' : s
    } catch {
      return String(v)
    }
  }
  // suggest helpers (shared by api/page scopes)
  function splitPathForSuggest(path: string): { parent: string; token: string } {
    const safe = String(path || '')
    // trim accidental leading/trailing dots while keeping intentional trailing dot for empty token
    const hasTrailingDot = safe.endsWith('.')
    const trimmed = hasTrailingDot ? safe.slice(0, -1) : safe
    const parts = trimmed.split('.').filter(Boolean)
    let parent = parts.slice(0, -1).join('.')
    let token = parts.length ? parts[parts.length - 1] : ''
    if (hasTrailingDot) { parent = trimmed; token = '' }
    return { parent, token }
  }
  function getParentObject(root: any, parentPath: string) {
    if (!parentPath) return root
    return parentPath.split('.').reduce((acc: any, k: string) => (acc == null ? undefined : acc[k]), root)
  }
  function listKeysForSuggest(obj: any): string[] {
    if (obj == null) return []
    if (Array.isArray(obj)) {
      const limit = Math.min(obj.length, 20)
      const indices = Array.from({ length: limit }, (_, i) => String(i))
      return ['length', ...indices]
    }
    if (typeof obj === 'object') {
      try { return Object.keys(obj) } catch { return [] }
    }
    return []
  }
  const activeApiKey = (rows.find(r=>r.scope==='api')?.path?.split('.')?.[0] || '') as string
  const { data: preview } = useSWR(activeApiKey ? `/api/ds-preview?key=${encodeURIComponent(activeApiKey)}` : null, fetcher, { revalidateOnFocus:false })

  const apply = () => {
    const nextBindings = {
      ...(node.bindings ?? {}),
      [targetProp]: {
        inputs: rows.map(r => ({ scope: r.scope, path: r.path })),
        formula: { expr }
      }
    }
    const next: ComponentNode = {
      ...node,
      bindings: nextBindings,
      meta: { ...(node.meta ?? {}), lastBindingProp: targetProp }
    }
    onChange(next)
  }

  const remove = () => {
    const nb = { ...(node.bindings ?? {}) } as any
    delete nb[targetProp]
    const next: ComponentNode = {
      ...node,
      bindings: Object.keys(nb).length ? nb : undefined,
      meta: { ...(node.meta ?? {}), lastBindingProp: targetProp }
    }
    onChange(next)
  }

  // targetProp 変更時にUIを既存値へ
  useEffect(() => {
    const b = (node.bindings ?? {})[targetProp] as any
    setRows(
      b?.inputs?.length
        ? b.inputs.map((r: any) => ({ scope: r.scope, path: r.path }))
        : [{ scope: 'page', path: 'prefCode' }]
    )
    setExpr(b?.formula?.expr ?? '`値: ${$0}`')
  }, [targetProp, node.bindings])

  return (
    <div style={{display:'grid', gap:10}}>
      <div>
        <div style={{fontSize:12,color:'#666'}}>prop</div>
        <select value={targetProp} onChange={e=>setTargetProp((e.target as HTMLSelectElement).value)} style={{width:'100%'}}>
          {propKeys.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div style={{fontSize:12,color:'#666', marginTop:4}}>inputs（$0…$n）</div>
      <div style={{display:'grid', gap:8}}>
        {rows.map((r, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'64px 1fr auto', gap:8, alignItems:'center'}}>
            <span style={{fontSize:12, color:'#666'}}>${i}</span>
            <div style={{display:'grid', gridTemplateColumns:'120px 1fr', gap:8}}>
              <select value={r.scope} onChange={e=>setRow(i, { scope: (e.target as HTMLSelectElement).value as any })}>
                <option value="page">page</option>
                <option value="api">api</option>
              </select>
              {r.scope === 'api' ? (
                <div style={{position:'relative', display:'grid', gridTemplateColumns:'1fr 140px', gap:8}}>
                  <input
                    value={r.path}
                    onChange={e=>{ setSuggestIdx(-1); setRow(i, { path: (e.target as HTMLInputElement).value }) }}
                    onKeyDown={e=>{
                      if (!preview?.data) return
                      const baseKey = r.path.split('.')[0] || ''
                      const baseObj = preview.data
                      if (!baseKey || !baseObj) return
                      const { parent, token } = splitPathForSuggest(r.path)
                      const parentObj = getParentObject(preview.data, parent)
                      const all = listKeysForSuggest(parentObj)
                      const filtered = all.filter(k => k.toLowerCase().startsWith(token.toLowerCase()))
                      if (filtered.length===0) return

                      if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestIdx(p=> Math.min(filtered.length-1, p+1)); }
                      if (e.key === 'ArrowUp')   { e.preventDefault(); setSuggestIdx(p=> Math.max(-1, p-1)); }
                      if (e.key === 'Tab' || e.key === 'Enter') {
                        const pick = filtered[Math.max(0, suggestIdx)]
                        if (pick) {
                          e.preventDefault()
                          const newPath = parent ? `${parent}.${pick}` : pick
                          setRow(i, { path: newPath })
                          setSuggestIdx(-1)
                        }
                      }
                      if (e.key === 'Escape') { setSuggestIdx(-1) }
                    }}
                    placeholder="prefStats や prefStats.13.name など"
                  />
                  <select value={(r.path.split('.')[0]||'')} onChange={e=>{ const base=(e.target as HTMLSelectElement).value; const rest=r.path.includes('.')?r.path.split('.').slice(1).join('.'):''; setRow(i, { path: rest?`${base}.${rest}`:base }) }}>
                    <option value="">（apiキー）</option>
                    {apiKeys.map(k=> <option key={k} value={k}>{k}</option>)}
                  </select>
                  {(() => {
                    if (!preview?.data) return null
                    const { parent, token } = splitPathForSuggest(r.path)
                    const parentObj = getParentObject(preview.data, parent)
                    const all = listKeysForSuggest(parentObj)
                    const filtered = token ? all.filter(k => k.toLowerCase().startsWith(token.toLowerCase())) : all
                    if (!filtered.length) return null
                    return (
                      <div style={{ position:'absolute', top:'100%', left:0, right:148, zIndex:5, border:'1px solid #ddd', background:'#fff', borderRadius:8, marginTop:4, maxHeight:160, overflow:'auto', boxShadow:'0 6px 20px rgba(0,0,0,.08)' }}>
                        {filtered.map((k,idx)=> (
                          <div
                            key={k}
                            onMouseDown={(e)=>{ e.preventDefault(); const newPath = parent ? `${parent}.${k}` : k; setRow(i, { path: newPath }); setSuggestIdx(-1) }}
                            onMouseEnter={()=>setSuggestIdx(idx)}
                            style={{ padding:'6px 10px', background: idx===suggestIdx ? '#eef' : '#fff', cursor:'pointer', fontFamily:'ui-monospace, Menlo, monospace' }}
                          >
                            {k}
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div style={{position:'relative'}}>
                  <input
                    value={r.path}
                    onChange={e=>{ setSuggestIdx(-1); setRow(i, { path: (e.target as HTMLInputElement).value }) }}
                    onKeyDown={e=>{
                      const PAGE_SUGGEST_ROOT = { id: pageRoot?.id, title: pageRoot?.title, frameId: pageRoot?.frameId, prefCode: (pageRoot as any)?.prefCode ?? '', ...(pageRoot as any) }
                      const { parent, token } = splitPathForSuggest(r.path)
                      const parentObj = getParentObject(PAGE_SUGGEST_ROOT, parent)
                      const all = listKeysForSuggest(parentObj)
                      const filtered = token ? all.filter(k => k.toLowerCase().startsWith(token.toLowerCase())) : all
                      if (filtered.length===0) return
                      if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestIdx(p=> Math.min(filtered.length-1, p+1)); }
                      if (e.key === 'ArrowUp')   { e.preventDefault(); setSuggestIdx(p=> Math.max(-1, p-1)); }
                      if (e.key === 'Tab' || e.key === 'Enter') {
                        const pick = filtered[Math.max(0, suggestIdx)]
                        if (pick) {
                          e.preventDefault()
                          const newPath = parent ? `${parent}.${pick}` : pick
                          setRow(i, { path: newPath })
                          setSuggestIdx(-1)
                        }
                      }
                      if (e.key === 'Escape') { setSuggestIdx(-1) }
                    }}
                    placeholder="prefCode や 任意の page.* パス"
                  />
                  {(() => {
                    const PAGE_SUGGEST_ROOT = { id: pageRoot?.id, title: pageRoot?.title, frameId: pageRoot?.frameId, prefCode: (pageRoot as any)?.prefCode ?? '', ...(pageRoot as any) }
                    const { parent, token } = splitPathForSuggest(r.path)
                    const parentObj = getParentObject(PAGE_SUGGEST_ROOT, parent)
                    const all = listKeysForSuggest(parentObj)
                    const filtered = token ? all.filter(k => k.toLowerCase().startsWith(token.toLowerCase())) : all
                    if (!filtered.length) return null
                    return (
                      <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:5, border:'1px solid #ddd', background:'#fff', borderRadius:8, marginTop:4, maxHeight:160, overflow:'auto', boxShadow:'0 6px 20px rgba(0,0,0,.08)' }}>
                        {filtered.map((k,idx)=> (
                          <div
                            key={k}
                            onMouseDown={(e)=>{ e.preventDefault(); const { parent } = splitPathForSuggest(r.path); const newPath = parent ? `${parent}.${k}` : k; setRow(i, { path: newPath }); setSuggestIdx(-1) }}
                            onMouseEnter={()=>setSuggestIdx(idx)}
                            style={{ padding:'6px 10px', background: idx===suggestIdx ? '#eef' : '#fff', cursor:'pointer', fontFamily:'ui-monospace, Menlo, monospace' }}
                          >
                            {k}
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
            <div style={{display:'flex', gap:6}}>
              <button onClick={()=>moveRow(i,-1)} disabled={i===0}>↑</button>
              <button onClick={()=>moveRow(i, 1)} disabled={i===rows.length-1}>↓</button>
              <button onClick={()=>delRow(i)}>削除</button>
            </div>
          </div>
        ))}
        <button onClick={addRow} style={{width:'fit-content'}}>+ input</button>
      </div>

      {activeApiKey && (
        <div style={{border:'1px solid #eee', borderRadius:8, padding:10, background:'#fafafa'}}>
          <div style={{fontSize:12, color:'#666', marginBottom:6}}>
            プレビュー: <b>api.{activeApiKey}</b>
          </div>
          <pre style={{margin:0, whiteSpace:'pre-wrap'}}>
            {pretty(dottedGet(preview?.data, (rows.find(r=>r.scope==='api')?.path?.split('.').slice(1).join('.') ?? '')))}
          </pre>
        </div>
      )}

      {rows.some(x=>x.scope==='page') && (
        (() => {
          const PAGE_SUGGEST_ROOT = { id: pageRoot?.id, title: pageRoot?.title, frameId: pageRoot?.frameId, prefCode: (pageRoot as any)?.prefCode ?? '', ...(pageRoot as any) }
          const firstPageRow = rows.find(x=>x.scope==='page')!
          const tail = firstPageRow.path
          const val = dottedGet(PAGE_SUGGEST_ROOT, tail)
          return (
            <div style={{border:'1px solid #eee', borderRadius:8, padding:10, background:'#fafafa', marginTop:8}}>
              <div style={{fontSize:12, color:'#666', marginBottom:6}}>
                プレビュー: <b>page.{tail || '(empty)'}</b>
              </div>
              <pre style={{margin:0, whiteSpace:'pre-wrap'}}>{pretty(val)}</pre>
            </div>
          )
        })()
      )}

      <div>
        <div style={{fontSize:12,color:'#666'}}>expr</div>
        <textarea
          value={expr}
          onChange={e => setExpr((e.target as HTMLTextAreaElement).value)}
          rows={3}
          style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, fontFamily: 'monospace' }}

          /* append-only: bindings auto-apply bridge */
          onFocus={() => { (window as any).__setBindingFormula = (v: string) => setExpr(v) }}
          onBlur={() => { if ((window as any).__setBindingFormula) (window as any).__setBindingFormula = undefined }}
          onKeyDown={(e) => {
            // IME変換中はスキップ（Enter確定と衝突させない）
            // @ts-ignore
            if ((e as any).nativeEvent?.isComposing) return;
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              const d = (window as any).__bindingsInsert
              if (d?.formula) setExpr(d.formula)
            }
          }}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          title="Ctrl(⌘)+Enter で最後の挿入を適用"
        />
        <div style={{ marginTop: 6 }}>
          <ApplyLastSnippetButton onApply={(f)=> setExpr(f)} />
        </div>
        <div style={{fontSize:12, color:'#666', marginTop:6}}>
          使い方例：<code>`名前: ${'$'}{$0}</code>、<code>`人口: ${'$'}{$1?.population}`</code>
        </div>
      </div>

      <div style={{fontSize:12,color:'#666'}}>preview</div>
      <div style={{padding:'8px 10px', border:'1px dashed #ccc', borderRadius:8, background:'#fafafa'}}>{previewValue}</div>

      <div style={{display:'flex', gap:8}}>
        <button onClick={apply} style={{padding:'6px 10px', borderRadius:8, background:'#111', color:'#fff'}}>適用</button>
        <button onClick={remove} style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff'}}>解除</button>
      </div>
      {!isMetaMode && <AutosaveMountHashed page={pageRoot} debounceMs={800} />}
    </div>
  )
}

export default function Builder() {
  const [isMetaMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('meta') === '1'
  })

  const [page, setPage] = useState<Page>(() => {
    const meta = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('meta') === '1'
    if (meta) {
      return clone(DEFAULT_BUILDER_MANIFEST)
    }
    const p = DEFAULT_PAGE('map-home')
    p.content.push({ id: 'hero_init', type: 'Hero', props: { title: '地図で集める旅' } })
    p.slotAssignments = { header: [{ id: 'nav', type: 'TopNav' }], sidebar: [{ id: 'list', type: 'PrefList' }] }
    return p
  })

  const frames = useMemo(() => (isMetaMode ? [...BASE_FRAMES, META_FRAME] : BASE_FRAMES), [isMetaMode])
  const primarySlot: SlotName = isMetaMode ? 'canvas' : 'content'
  const [frameId, setFrameId] = useState<string>(() => (isMetaMode ? META_FRAME.id : 'frame-basic'))
  const currentFrame = useMemo(() => frames.find((f) => f.id === frameId) ?? frames[0], [frames, frameId])

  const [selSlot, setSelSlot] = useState<SlotName>(() => primarySlot)
  const currentNodes = useMemo(() => {
    return selSlot === 'content' || selSlot === 'canvas'
      ? (page.content ?? [])
      : (page.slotAssignments?.[selSlot] ?? [])
  }, [page, selSlot])

  const [selId,setSelId] = useState<string|undefined>(undefined)
  const [history,setHistory] = useState<Page[]>([])
  const [inspectorTab, setInspectorTab] = useState<'props'|'bindings'>('props')
  const [lastSaved, setLastSaved] = useState<string>('')
  const [dirty, setDirty] = useState<boolean>(true)
  const [showDiff, setShowDiff] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const v = localStorage.getItem('chizu:showDiff')
    return v === '1'
  })
  const parsedLast = useMemo(() => {
    try { return JSON.parse(lastSaved || '{}') as { page?:Page; frameId?:string } } catch { return {} as any }
  }, [lastSaved])
  const diffs = useMemo(()=>{
    if (!(parsedLast as any)?.page) return null as any
    return diffPage((parsedLast as any).page as Page, page, ((parsedLast as any).frameId as string) ?? 'frame-basic', frameId)
  }, [parsedLast, page, frameId])

  useEffect(() => {
    localStorage.setItem('chizu:showDiff', showDiff ? '1' : '0')
  }, [showDiff])

  const diffCount = useMemo(() => {
    const d: any = diffs as any
    if (!d) return 0
    const base = d.slotDiffs.reduce((acc: number, s: any) => acc + s.added.length + s.removed.length + s.moved.length + s.modified.length, 0)
    return base + (d.titleChanged ? 1 : 0) + (d.frameChanged ? 1 : 0)
  }, [diffs])
  const push = (next: Page) => { setHistory(h=>[...h.slice(-49), page]); setPage(next) }

  useEffect(() => {
    if (!isMetaMode) return
    let cancelled = false
    loadBuilderManifest()
      .then((manifest) => {
        if (cancelled) return
        const next = clone(manifest)
        const fid = next.frameId ?? META_FRAME.id
        setPage(next)
        setFrameId(fid)
        setSelSlot(primarySlot)
        setHistory([])
        setSelId(undefined)
        setLastSaved(JSON.stringify({ page: next, frameId: fid }))
        setDirty(false)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isMetaMode])

  const { data: list } = useSWR<{ ids: string[] }>(
    isMetaMode ? null : '/api/pages',
    fetcher,
    { refreshInterval: 2000 }
  )

  useEffect(() => {
    const last = typeof window !== 'undefined' ? localStorage.getItem('chizu:lastPageId') : null
    if (!last || isMetaMode) return
    fetch(`/api/page?id=${encodeURIComponent(last)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.page) {
          setPage(j.page as Page)
          setSelId(undefined)
          setSelSlot(primarySlot)
          setHistory([])
          if ((j.page as Page).frameId) setFrameId((j.page as Page).frameId as string)
          const fid = ((j.page as Page).frameId as string) || 'frame-basic'
          setLastSaved(JSON.stringify({ page: j.page as Page, frameId: fid }))
        }
      })
      .catch(() => {})
  }, [])

  const loadPage = async (id: string) => {
    if (isMetaMode) return
    const res = await fetch(`/api/page?id=${encodeURIComponent(id)}`)
    if (!res.ok) return alert('読み込みに失敗しました')
    const { page: loaded } = (await res.json()) as { page: Page }
    setHistory([])
    setSelId(undefined)
    setSelSlot(primarySlot)
    setPage(loaded)
    const fid = loaded.frameId ?? 'frame-basic'
    setFrameId(fid)
    setLastSaved(JSON.stringify({ page: loaded, frameId: fid }))
    localStorage.setItem('chizu:lastPageId', loaded.id)
  }

  const deletePage = async (id: string) => {
    if (isMetaMode) return
    if (!confirm(`Delete page "${id}"? この操作は元に戻せません。`)) return
    const res = await fetch(`/api/page?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) return alert('削除に失敗しました')
    if (id === page.id) {
      setHistory([])
      setSelId(undefined)
      setSelSlot(primarySlot)
      setPage(DEFAULT_PAGE('map-home'))
      setFrameId('frame-basic')
      localStorage.removeItem('chizu:lastPageId')
    }
  }

  const duplicatePage = async (id: string) => {
    if (isMetaMode) return
    const to = prompt(`複製先の pageId`, `${id}-copy`)
    if (!to || to===id) return
    const res = await fetch('/api/duplicate', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ sourceId: id, newId: to }) })
    if (res.status===409) { show('同じ pageId が存在します'); return }
    if (!res.ok) { show('処理に失敗しました'); return }
    show('完了しました')
  }

  const ensureSlot = (p: Page, name: SlotName) => {
    if (!p.slotAssignments) p.slotAssignments = {}
    if (!p.slotAssignments[name]) p.slotAssignments[name] = []
  }

  function getSlotArray(p: Page, slot: SlotName) {
    return slot === 'content' || slot === 'canvas' ? (p.content ?? []) : (p.slotAssignments?.[slot] ?? [])
  }
  function setSlotArray(p: Page, slot: SlotName, arr: ComponentNode[]) {
    if (slot === 'content' || slot === 'canvas') p.content = arr
    else { if(!p.slotAssignments) p.slotAssignments = {}; p.slotAssignments[slot] = arr }
  }

  function remapSlotsOnFrameChange(p: Page, from: Frame, to: Frame): Page {
    const keep = new Set(to.slots.map(s => s.name))
    const out: Page = structuredClone(p)
    out.frameId = to.id

    const nextAssign: Record<string, ComponentNode[]> = {}
    if (out.slotAssignments) {
      for (const [slot, nodes] of Object.entries(out.slotAssignments)) {
        if (keep.has(slot)) nextAssign[slot] = nodes as ComponentNode[]
      }
    }

    const goneNodes: ComponentNode[] = []
    if (out.slotAssignments) {
      for (const [slot, nodes] of Object.entries(out.slotAssignments)) {
        if (!keep.has(slot)) goneNodes.push(...((nodes as ComponentNode[]) ?? []))
      }
    }
    out.content = [...(out.content ?? []), ...goneNodes]
    out.slotAssignments = nextAssign
    return out
  }

  const addNode = (type:string) => {
    const id = `${type.toLowerCase()}_${Math.random().toString(36).slice(2,7)}`
    const def = CATALOG.find(c=>c.type===type)?.defaultProps ?? {}
    const n: ComponentNode = { id, type, props: def }
    if (selSlot === 'content' || selSlot === 'canvas') {
      push({ ...page, content: [...(page.content ?? []), n] })
    } else {
      const next = structuredClone(page)
      ensureSlot(next, selSlot)
      next.slotAssignments![selSlot]!.push(n)
      push(next)
    }
    setSelId(id)
  }

  const updateProp = (k:string, v:any) => {
    if (!selId) return
    if (selSlot === 'content' || selSlot === 'canvas') {
      push({ ...page, content: (page.content ?? []).map(n => n.id===selId ? ({ ...n, props: { ...(n.props??{}), [k]: v } }) : n ) })
    } else {
      const next = structuredClone(page)
      ensureSlot(next, selSlot)
      next.slotAssignments![selSlot] = (next.slotAssignments![selSlot] ?? []).map(n => n.id===selId ? ({ ...n, props: { ...(n.props??{}), [k]: v } }) : n )
      push(next)
    }
  }

  const removeSel = () => {
    if (!selId) return
    if (selSlot === 'content' || selSlot === 'canvas') {
      push({ ...page, content: (page.content ?? []).filter(n=>n.id!==selId) })
    } else {
      const next = structuredClone(page)
      ensureSlot(next, selSlot)
      next.slotAssignments![selSlot] = (next.slotAssignments![selSlot] ?? []).filter(n=>n.id!==selId)
      push(next)
    }
    setSelId(undefined)
  }

  const moveSel = (dir:-1|1) => {
    if (!selId) return
    const arr = selSlot === 'content' || selSlot === 'canvas'
      ? [...(page.content ?? [])]
      : [...(page.slotAssignments?.[selSlot] ?? [])]
    const i = arr.findIndex(n=>n.id===selId); if(i<0) return
    const j = i + dir; if (j<0 || j>=arr.length) return
    ;[arr[i],arr[j]]=[arr[j],arr[i]]
    if (selSlot === 'content' || selSlot === 'canvas') push({ ...page, content: arr })
    else {
      const next = structuredClone(page)
      ensureSlot(next, selSlot)
      next.slotAssignments![selSlot] = arr
      push(next)
    }
  }

  const duplicateSel = (slotOverride?: SlotName, idOverride?: string) => {
    const targetSlot = slotOverride ?? selSlot
    const targetId = idOverride ?? selId
    if (!targetId) return
    const list = getSlotArray(page, targetSlot)
    const i = list.findIndex((n) => n.id === targetId)
    if (i < 0) return
    const src = list[i]
    const copy: ComponentNode = clone(src)
    copy.id = `${src.type.toLowerCase()}_${Math.random().toString(36).slice(2, 7)}`
    const next = clone(page)
    const arr = getSlotArray(next, targetSlot)
    arr.splice(i + 1, 0, copy)
    setSlotArray(next, targetSlot, arr)
    push(next)
    setSelSlot(targetSlot)
    setSelId(copy.id)
  }

  const moveSelToSlot = (dest: SlotName, sourceSlot?: SlotName, nodeId?: string) => {
    const fromSlot = sourceSlot ?? selSlot
    const id = nodeId ?? selId
    if (!id || dest === fromSlot) return
    const next = clone(page)
    const fromArr = getSlotArray(next, fromSlot)
    const i = fromArr.findIndex((n) => n.id === id)
    if (i < 0) return
    const [node] = fromArr.splice(i, 1)
    setSlotArray(next, fromSlot, fromArr)
    const toArr = getSlotArray(next, dest)
    toArr.push(node)
    setSlotArray(next, dest, toArr)
    push(next)
    setSelSlot(dest)
    setSelId(node.id)
  }

  const renderNodeList = (nodes: ComponentNode[], slot: SlotName) => (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
      {nodes.map((n) => {
        const isActive = selSlot === slot && selId === n.id
        return (
          <li
            key={n.id}
            onClick={() => {
              setSelSlot(slot)
              setSelId(n.id)
            }}
            style={{
              padding: '10px',
              border: '2px solid ' + (isActive ? '#111' : '#ddd'),
              borderRadius: 10,
              background: '#fafafa',
              cursor: 'pointer',
              outline: isActive ? '2px solid #111' : 'none',
            }}
            onMouseEnter={(e) => {
              if (isActive) return
              e.currentTarget.style.outline = '2px dashed #bbb'
            }}
            onMouseLeave={(e) => {
              if (isActive) return
              e.currentTarget.style.outline = 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>{n.type}</div>
                <div style={{ fontWeight: 600 }}>
                  {n.type === 'Text'
                    ? (n.props as any)?.text
                    : n.type === 'Hero'
                    ? (n.props as any)?.title
                    : `[${n.type}]`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelSlot(slot)
                    setSelId(n.id)
                    duplicateSel(slot, n.id)
                  }}
                >
                  複製
                </button>
                <select
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const value = (e.target as HTMLSelectElement).value as SlotName
                    if (!value) return
                    setSelSlot(slot)
                    setSelId(n.id)
                    moveSelToSlot(value, slot, n.id)
                  }}
                >
                  <option value="">→ slot</option>
                  {slotOrder
                    .filter((name) => name !== slot)
                    .map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </li>
        )
      })}
      {nodes.length === 0 && (
        <li style={{ color: '#888' }}>（このスロットにはまだ要素がありません）</li>
      )}
    </ul>
  )

  const undo = () => {
    const prev = history.at(-1); if(!prev) return
    setHistory(h=>h.slice(0,-1))
    setPage(prev)
    setSelId(undefined)
  }

  const selected = useMemo(() => currentNodes.find(n=>n.id===selId), [currentNodes, selId])

  // keyboard shortcuts
  const slotOrder: SlotName[] = isMetaMode ? META_SLOTS : ['header','sidebar','content','footer']
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selId) return
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSel() }
      if (e.key === 'ArrowUp')  { e.preventDefault(); moveSel(-1) }
      if (e.key === 'ArrowDown'){ e.preventDefault(); moveSel( 1) }
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault()
        const idx = slotOrder.indexOf(selSlot)
        const nextIdx = e.key === 'ArrowLeft' ? Math.max(0, idx-1) : Math.min(slotOrder.length-1, idx+1)
        const dest = slotOrder[nextIdx]
        if (dest !== selSlot) moveSelToSlot(dest)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selId, page, selSlot, slotOrder])

  // dirty tracking and save
  useEffect(()=>{
    const cur = JSON.stringify({ page, frameId })
    setDirty(cur !== lastSaved)
  }, [page, frameId, lastSaved])

  const save = async () => {
    if (!dirty) return
    if (isMetaMode) {
      const snapshot: Page = { ...page, frameId }
      await saveBuilderManifest(snapshot)
      const snap = JSON.stringify({ page: snapshot, frameId })
      setLastSaved(snap)
      return
    }
    const frame = currentFrame
    await fetch('/api/save', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ page, frame })
    })
    const snap = JSON.stringify({ page, frameId })
    setLastSaved(snap)
    localStorage.setItem('chizu:lastPageId', page.id)
  }

  useEffect(()=>{ setLastSaved(JSON.stringify({ page, frameId })) },[]) // initial snapshot

  useEffect(()=>{
    if (!dirty) return
    const t = setTimeout(()=>{ save().catch(()=>{}) }, 1500)
    return ()=>clearTimeout(t)
  }, [dirty])

  // auto open diff when dirty
  useEffect(()=>{ if (dirty) setShowDiff(true) }, [dirty])
  // optionally close on save completion
  useEffect(()=>{ if (!dirty && showDiff) setShowDiff(false) }, [dirty, showDiff])

  const newPage = () => {
    if (isMetaMode) return
    const id = prompt('新しい pageId を入力してください（例：map-about）','map-about')
    if (!id) return
    setHistory([])
    setSelSlot(primarySlot)
    setSelId(undefined)
    const np = DEFAULT_PAGE(id)
    setPage(np)
    setFrameId('frame-basic')
    setLastSaved(JSON.stringify({ page: np, frameId: 'frame-basic' }))
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr 340px', height:'100vh'}}>
      {/* 左ペイン：パレット＋Slot切替 */}
      <div style={{borderRight:'1px solid #eee', padding:12, display:'grid', gridTemplateRows:'auto auto auto 1fr auto', gap:12}}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={newPage} disabled={isMetaMode} style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff', opacity: isMetaMode ? 0.6 : 1}}>New Page</button>
          <button
            onClick={async()=>{
              if (isMetaMode) return
              const to = prompt('新しい pageId を入力', page.id)
              if(!to || to===page.id) return
              const res = await fetch('/api/rename', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ oldId: page.id, newId: to }) })
              if (res.status===409) { show('同じ pageId が存在します'); return }
              if(!res.ok) { show('処理に失敗しました'); return }
              const j: any = await res.json()
              await loadPage(j.id)
              localStorage.setItem('chizu:lastPageId', j.id)
              show(`Renamed → ${j.id}`)
            }}
            disabled={isMetaMode}
            style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff', opacity: isMetaMode ? 0.6 : 1}}>Rename</button>
          <button
            onClick={()=>setShowDiff(v=>!v)}
            style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff'}}
            title="ページのDraftとPublishedの差分を表示"
          >
            変更点を見る{diffCount>0 ? `（${diffCount}）` : ''}
          </button>
          <button onClick={save} disabled={!dirty} style={{padding:'6px 10px', borderRadius:8, background: dirty ? '#111' : '#888', color:'#fff'}}>保存→生成 {dirty ? '●' : '✓'}</button>

          <select
            value={frameId}
            disabled={isMetaMode}
            onChange={(e) => {
              const nextId = (e.target as HTMLSelectElement).value
              const nextFrame = frames.find((f) => f.id === nextId)!
              const prevFrame = frames.find((f) => f.id === frameId)!
              const missing = Object.keys(page.slotAssignments ?? {}).filter(s => !nextFrame.slots.some(ns => ns.name===s))
              if (missing.length) {
                const ok = confirm(`次のslotが新しいFrameに存在しません: ${missing.join(', ')}\ncontent末尾へ退避します。続行しますか？`)
                if (!ok) return
              }
              const remapped = remapSlotsOnFrameChange(page, prevFrame, nextFrame)
              setHistory(h=>[...h.slice(-49), page])
              setPage(remapped)
              setFrameId(nextId)
              setSelSlot(primarySlot)
              setSelId(undefined)
            }}
            style={{marginLeft:'auto', padding:'6px 8px', border:'1px solid #ddd', borderRadius:8}}
            title="Frameを変更（未対応slotはcontentへ退避）"
          >
            {frames.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        {/* Pages List */}
        <div>
          <h3 style={{margin:'8px 0'}}>Pages</h3>
          <div style={{maxHeight:180, overflow:'auto', display:'grid', gap:6}}>
            {list?.ids?.length ? (
              list.ids.map((id) => (
                <div key={id} style={{display:'grid', gridTemplateColumns:'1fr auto auto', gap:8}}>
                  <button
                    onClick={() => loadPage(id)}
                    disabled={isMetaMode}
                    style={{
                      padding:'6px 8px', border:'1px solid #ddd', borderRadius:8,
                      background: id===page.id ? '#eef' : '#fff', textAlign:'left', opacity: isMetaMode ? 0.6 : 1
                    }}
                  >
                    {id}
                  </button>
                  <button
                    onClick={() => duplicatePage(id)}
                    disabled={isMetaMode}
                    style={{padding:'6px 8px', border:'1px solid #ddd', borderRadius:8, background:'#fff', opacity: isMetaMode ? 0.6 : 1}}
                  >
                    複製
                  </button>
                  <button
                    onClick={() => deletePage(id)}
                    disabled={isMetaMode}
                    style={{padding:'6px 8px', border:'1px solid #f0c', color:'#c00', background:'#fff', borderRadius:8, opacity: isMetaMode ? 0.6 : 1}}
                  >
                    削除
                  </button>
                </div>
              ))
            ) : (
              <div style={{color:'#888'}}>（保存済みページなし）</div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{margin:'8px 0'}}>Slots</h3>
          <div style={{display:'grid', gridTemplateColumns:`repeat(${slotOrder.length},1fr)`, gap:8}}>
            {slotOrder.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelSlot(s)
                  setSelId(undefined)
                }}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  background: selSlot === s ? '#111' : '#fff',
                  color: selSlot === s ? '#fff' : '#111',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{margin:'8px 0'}}>Components</h3>
          <div style={{display:'grid', gap:8}}>
            {CATALOG.map(c => (
              <button key={c.type} onClick={()=>addNode(c.type)} style={{padding:'8px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff', textAlign:'left'}}>{c.label}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button onClick={undo}>Undo</button>
            <button onClick={()=>moveSel(-1)} disabled={!selId}>↑</button>
            <button onClick={()=>moveSel(1)} disabled={!selId}>↓</button>
            <button onClick={removeSel} disabled={!selId}>削除</button>
          </div>
        </div>
      </div>

      {/* 中央：キャンバス */}
      <div style={{ padding: 12 }}>
        {isMetaMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 320px', gap: 12 }}>
            {META_SLOTS.map((slot) => (
              <div key={slot} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff' }}>
                <h3 style={{ margin: '8px 0' }}>Canvas ({slot})</h3>
                {renderNodeList(getSlotNodes(page, slot), slot)}
              </div>
            ))}
          </div>
        ) : (
          <>
            <h3 style={{ margin: '8px 0' }}>Canvas ({selSlot})</h3>
            {renderNodeList(currentNodes, selSlot)}
          </>
        )}
      </div>

      {/* 右：Inspector（Props / Bindings タブ） */}
      <div style={{borderLeft:'1px solid #eee', padding:12}}>
        <h3 style={{margin:'8px 0'}}>Inspector</h3>
        <div style={{display:'flex', gap:8, marginBottom:8}}>
          <button onClick={()=>setInspectorTab('props')} style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background: inspectorTab==='props'?'#111':'#fff', color: inspectorTab==='props'?'#fff':'#111'}}>Props</button>
          <button onClick={()=>setInspectorTab('bindings')} style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background: inspectorTab==='bindings'?'#111':'#fff', color: inspectorTab==='bindings'?'#fff':'#111'}}>Bindings</button>
        </div>

        <div style={{fontSize:12, color:'#666', marginBottom:8}}>pageId: <b>{page.id}</b> / slot: <b>{selSlot}</b></div>
        <div style={{fontSize:12, color:'#666', margin:'6px 0 12px'}}>frame: <b>{currentFrame.name}</b> / slots: {currentFrame.slots.map(s=>s.name).join(', ')}</div>

        {selected ? (
          inspectorTab==='props' ? (
            <PropsEditor node={selected} onChange={(k,v)=>updateProp(k,v)} />
          ) : (
            <BindingsEditor pageRoot={page} node={selected} onChange={(next)=>{
              if (selSlot === 'content' || selSlot === 'canvas') {
                push({ ...page, content: (page.content ?? []).map(n => n.id===selected.id ? next : n) })
              } else {
                const draft = structuredClone(page)
                draft.slotAssignments![selSlot] = (draft.slotAssignments?.[selSlot] ?? []).map(n => n.id===selected.id ? next : n)
                push(draft)
              }
            }} />
          )
        ) : <div>要素を選択してください</div>}

        {showDiff && diffs && (
          <div style={{marginTop:16, padding:12, border:'1px solid #eee', borderRadius:10, background:'#fcfcfc'}}>
            <h4 style={{margin:'0 0 8px'}}>差分プレビュー</h4>
            {(diffs as any).titleChanged && <div>・タイトルが変更されました</div>}
            {(diffs as any).frameChanged && <div>・フレームが <b>{(parsedLast as any).frameId as any}</b> → <b>{frameId}</b> に変更</div>}
            {(diffs as any).slotDiffs.map((s:any) => (
              <div key={s.slot} style={{marginTop:8}}>
                <div style={{fontWeight:600}}>[{s.slot}]</div>
                {s.added.length===0 && s.removed.length===0 && s.moved.length===0 && s.modified.length===0 ? (
                  <div style={{color:'#888'}}>変更なし</div>
                ) : (
                  <div style={{display:'grid', gap:4}}>
                    {s.added.map((id:string)=> <button key={`a-${id}`} onClick={()=>{ const exists = getSlotNodes(page, s.slot).some(n=>n.id===id); if (!exists) return; setSelSlot(s.slot); setSelId(id) }} style={{textAlign:'left'}}>＋ 追加: {id}</button>)}
                    {s.removed.map((id:string)=> <div key={`r-${id}`}>－ 削除: {id}</div>)}
                    {s.moved.map((id:string)=> <button key={`m-${id}`} onClick={()=>{ const exists = getSlotNodes(page, s.slot).some(n=>n.id===id); if (!exists) return; setSelSlot(s.slot); setSelId(id) }} style={{textAlign:'left'}}>↕ 並び替え: {id}</button>)}
                    {s.modified.map((m:any) => {
                      const onlyBinding = m.changes.length>0 && m.changes.every((c:any) => c.kind === 'binding')
                      return (
                        <button key={`c-${m.id}`} onClick={()=>{ const exists = getSlotNodes(page, s.slot).some(n=>n.id===m.id); if (!exists) return; setSelSlot(s.slot); setSelId(m.id); if (onlyBinding) setInspectorTab('bindings') }} style={{textAlign:'left'}}>
                          ✎ 変更: {m.id}（{m.changes.map((c:any)=> (c.kind==='prop'?`prop:${c.key}`:`binding:${c.key}`)).join(', ')}）
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

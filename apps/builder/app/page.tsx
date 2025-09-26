'use client'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import type { Page, ComponentNode, Frame } from '@chizu/types'
import { CanvasRenderer } from '@/components/CanvasRenderer'
import { Palette } from '@/components/palette/Palette'
import { DEFAULT_BUILDER_MANIFEST } from '@/lib/meta/builderManifest'
import { loadBuilderManifest, saveBuilderManifest } from '@/lib/meta/storage'
import { PropsEditor } from './builder/components/PropsEditor'
import { BindingsEditor } from './builder/components/BindingsEditor'
import {
  BASE_FRAMES,
  META_FRAME,
  DEFAULT_PAGE,
  CATALOG,
  META_SLOTS,
  PREVIEW_API,
  type SlotName,
} from './builder/constants'
import { buildPreviewTree, clone, jsonFetcher } from './builder/utils'
import { diffPage, getSlotNodes } from './builder/diff'

function show(msg: string) {
  // TODO: 蠕後〒繝医・繧ｹ繝医↓蟾ｮ縺玲崛縺亥庄閭ｽ縺ｪ證ｫ螳壹い繝ｩ繝ｼ繝・
  if (typeof window !== 'undefined') alert(msg)
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
    p.content.push({ id: 'hero_init', type: 'Hero', props: { title: '蝨ｰ蝗ｳ縺ｧ蟾｡繧区羅' } })
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
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string; slotId?: SlotName }>).detail || {}
      if (detail.slotId) {
        setSelSlot(detail.slotId as SlotName)
      }
      setSelId(typeof detail.id === 'string' ? detail.id : undefined)
    }
    window.addEventListener('builder.selectNode', handler as EventListener)
    return () => window.removeEventListener('builder.selectNode', handler as EventListener)
  }, [])
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
    jsonFetcher,
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
    if (!res.ok) return alert('隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆')
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
    if (!confirm(`Delete page "${id}"? 縺薙・謫堺ｽ懊ｒ蜈・↓謌ｻ縺帙∪縺帙ｓ縲Ａ)) return
    const res = await fetch(`/api/page?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) return alert('蜑企勁縺ｫ螟ｱ謨励＠縺ｾ縺励◆')
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
    const to = prompt(`隍・｣ｽ蜈医・ pageId`, `${id}-copy`)
    if (!to || to===id) return
    const res = await fetch('/api/duplicate', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ sourceId: id, newId: to }) })
    if (res.status===409) { show('蜷後§ pageId 縺悟ｭ伜惠縺励∪縺・); return }
    if (!res.ok) { show('蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆'); return }
    show('螳御ｺ・＠縺ｾ縺励◆')
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
                  隍・｣ｽ
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
                  <option value="">遘ｻ蜍募・ slot 繧帝∈謚・/option>
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
        <li style={{ color: '#888' }}>縺薙・繧ｹ繝ｭ繝・ヨ縺ｫ縺ｯ縺ｾ縺隕∫ｴ縺後≠繧翫∪縺帙ｓ</li>
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
  const previewTree = useMemo(() => buildPreviewTree(page, frameId), [page, frameId])
  const previewRuntime = useMemo(
    () => ({
      page: { prefCode: (page as any)?.prefCode ?? '13' },
      frame: { id: frameId },
      api: PREVIEW_API,
      app: {},
    }),
    [page, frameId],
  )

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
    const id = prompt('譁ｰ縺励＞ pageId 繧貞・蜉帙＠縺ｦ縺上□縺輔＞ (萓・ map-about)', 'map-about')
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
      {/* 蟾ｦ繝壹う繝ｳ: 繝代Ξ繝・ヨ & Slot 蛻・*/}
      <div style={{borderRight:'1px solid #eee', padding:12, display:'grid', gridTemplateRows:'auto auto auto 1fr auto', gap:12}}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={newPage} disabled={isMetaMode} style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff', opacity: isMetaMode ? 0.6 : 1}}>New Page</button>
          <button
            onClick={async()=>{
              if (isMetaMode) return
              const to = prompt('譁ｰ縺励＞ pageId 繧貞・蜉帙＠縺ｦ縺上□縺輔＞', page.id)
              if(!to || to===page.id) return
              const res = await fetch('/api/rename', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ oldId: page.id, newId: to }) })
              if (res.status===409) { show('蜷後§ pageId 縺悟ｭ伜惠縺励∪縺・); return }
              if(!res.ok) { show('陷・ｽｦ騾・・竊楢棔・ｱ隰ｨ蜉ｱ・邵ｺ・ｾ邵ｺ蜉ｱ笳・); return }
              const j: any = await res.json()
              await loadPage(j.id)
              localStorage.setItem('chizu:lastPageId', j.id)
              show(`${j.id} 縺ｫ繝ｪ繝阪・繝縺励∪縺励◆`)
            }}
            disabled={isMetaMode}
            style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff', opacity: isMetaMode ? 0.6 : 1}}>Rename</button>
          <button
            onClick={()=>setShowDiff(v=>!v)}
            style={{padding:'6px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff'}}
            title="繝壹・繧ｸ縺ｮ Draft 縺ｨ Published 縺ｮ蟾ｮ蛻・ｒ陦ｨ遉ｺ"
          >
            螟画峩轤ｹ繧定ｦ九ｋ{diffCount > 0 ? `・・{diffCount}・荏 : ''}
          </button>
          <button onClick={save} disabled={!dirty} style={{padding:'6px 10px', borderRadius:8, background: dirty ? '#111' : '#888', color:'#fff'}}>菫晏ｭ倪・逕滓・ {dirty ? '笳・ : 'ﾃ・}</button>

          <select
            value={frameId}
            disabled={isMetaMode}
            onChange={(e) => {
              const nextId = (e.target as HTMLSelectElement).value
              const nextFrame = frames.find((f) => f.id === nextId)!
              const prevFrame = frames.find((f) => f.id === frameId)!
              const missing = Object.keys(page.slotAssignments ?? {}).filter(s => !nextFrame.slots.some(ns => ns.name===s))
              if (missing.length) {
                const ok = confirm(`谺｡縺ｮslot縺梧眠縺励＞Frame縺ｫ蟄伜惠縺励∪縺帙ｓ: ${missing.join(', ')}\ncontent譛ｫ蟆ｾ縺ｸ騾驕ｿ縺励∪縺吶らｶ夊｡後＠縺ｾ縺吶°・歔)
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
            title="Frame繧貞､画峩・域悴蟇ｾ蠢徭lot縺ｯcontent縺ｸ騾驕ｿ・・
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
                    隍・｣ｽ
                  </button>
                  <button
                    onClick={() => deletePage(id)}
                    disabled={isMetaMode}
                    style={{padding:'6px 8px', border:'1px solid #f0c', color:'#c00', background:'#fff', borderRadius:8, opacity: isMetaMode ? 0.6 : 1}}
                  >
                    蜑企勁
                  </button>
                </div>
              ))
            ) : (
              <div style={{color:'#888'}}>菫晏ｭ俶ｸ医∩繝壹・繧ｸ縺ｪ縺暦ｼ・/div>
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
          <Palette />
        </div>

        <div>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button onClick={undo}>Undo</button>
            <button onClick={() => moveSel(-1)} disabled={!selId}>竊・/button>
            <button onClick={() => moveSel(1)} disabled={!selId}>竊・/button>
            <button onClick={removeSel} disabled={!selId}>蜑企勁</button>
          </div>
        </div>
      </div>

      {/* 荳ｭ螟ｮ繧ｭ繝｣繝ｳ繝舌せ */}
      {/* Canvas preview */}
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: '8px 0' }}>Canvas</h3>
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff', marginBottom: 12 }}>
          <CanvasRenderer\r\n            tree={previewTree}\r\n            runtime={previewRuntime}\r\n            builderManifest={isMetaMode ? previewTree : undefined}\r\n            isMetaMode={isMetaMode}\r\n            pageId={page.id}\r\n          />
        </div>
      </div>

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

      {/* 蜿ｳ繝壹う繝ｳ: Inspector・・rops / Bindings 繧ｿ繝厄ｼ・*/}
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
        ) : <div>隕∫ｴ繧帝∈謚槭＠縺ｦ縺上□縺輔＞</div>}

        {showDiff && diffs && (
          <div style={{marginTop:16, padding:12, border:'1px solid #eee', borderRadius:10, background:'#fcfcfc'}}>
            <h4 style={{margin:'0 0 8px'}}>蟾ｮ蛻・Ξ繝薙Η繝ｼ</h4>
            {(diffs as any).titleChanged && <div>繝ｻ繧ｿ繧､繝医Ν縺悟､画峩縺輔ｌ縺ｾ縺励◆</div>}
            {(diffs as any).frameChanged && (
              <div>繝ｻ繝輔Ξ繝ｼ繝縺・<b>{(parsedLast as any).frameId as any}</b> 竊・<b>{frameId}</b> 縺ｫ螟画峩</div>
            )}
            {(diffs as any).slotDiffs.map((s: any) => (
              <div key={s.slot} style={{marginTop:8}}>
                <div style={{fontWeight:600}}>[{s.slot}]</div>
                {s.added.length === 0 && s.removed.length === 0 && s.moved.length === 0 && s.modified.length === 0 ? (
                  <div style={{color:'#888'}}>螟画峩縺ｪ縺・/div>
                ) : (
                  <div style={{display:'grid', gap:4}}>
                    {s.added.map((id: string) => (
                      <button
                        key={`a-${id}`}
                        onClick={() => {
                          const exists = getSlotNodes(page, s.slot).some((n) => n.id === id)
                          if (!exists) return
                          setSelSlot(s.slot)
                          setSelId(id)
                        }}
                        style={{textAlign:'left'}}
                      >
                        霑ｽ蜉: {id}
                      </button>
                    ))}
                    {s.removed.map((id: string) => (
                      <div key={`r-${id}`}>蜑企勁: {id}</div>
                    ))}
                    {s.moved.map((id: string) => (
                      <button
                        key={`m-${id}`}
                        onClick={() => {
                          const exists = getSlotNodes(page, s.slot).some((n) => n.id === id)
                          if (!exists) return
                          setSelSlot(s.slot)
                          setSelId(id)
                        }}
                        style={{textAlign:'left'}}
                      >
                        荳ｦ縺ｳ譖ｿ縺・ {id}
                      </button>
                    ))}
                    {s.modified.map((m: any) => {
                      const onlyBinding = m.changes.length > 0 && m.changes.every((c: any) => c.kind === 'binding')
                      const summary = m.changes.map((c: any) => (c.kind === 'prop' ? `prop:${c.key}` : `binding:${c.key}`)).join(', ')
                      return (
                        <button
                          key={`c-${m.id}`}
                          onClick={() => {
                            const exists = getSlotNodes(page, s.slot).some((n) => n.id === m.id)
                            if (!exists) return
                            setSelSlot(s.slot)
                            setSelId(m.id)
                            if (onlyBinding) setInspectorTab('bindings')
                          }}
                          style={{textAlign:'left'}}
                        >
                          螟画峩: {m.id}・・summary || '螟画峩蜀・ｮｹ縺ｪ縺・}・・
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




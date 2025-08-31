'use client'
import React, { useMemo, useState } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { usePageStore } from '@/store/pageStore'
import { Interaction, TransitionKind } from '@/lib/interaction/types'

function useSelection() {
  const selectedIds = useBuilderStore(s => s.selectedIds)
  const elements = useBuilderStore(s => s.elements)
  const el = useMemo(()=> elements.find((e) => e.id === selectedIds[0]), [elements, selectedIds])
  return el
}

export default function InteractionPanel() {
  const el = useSelection()
  const setElements = useBuilderStore(s => s.setElements)
  const elements = useBuilderStore(s => s.elements)
  const pages = usePageStore(s => s.pages || [])
  const allNodes = elements as any[]

  if (!el) return null

  function update(onClick: Interaction | null) {
    const next = allNodes.map((e) => e.id === el.id ? { ...e, interactions: { ...(e as any).interactions, onClick } } : e)
    setElements(next)
  }

  const current: Interaction | null = (el as any).interactions?.onClick || null
  const [mode, setMode] = useState<'none'|'navigate'|'openUrl'|'scrollTo'|'openModal'|'closeModal'>(() => current ? current.type as any : 'none')

  const [pageId, setPageId] = useState<string>(() => (current && current.type === 'navigate') ? current.pageId : (pages[0]?.id || ''))
  const [trans, setTrans] = useState<TransitionKind>(() => (current && current.type === 'navigate' && current.transition) ? current.transition : 'instant')
  const [dur, setDur] = useState<number>(() => (current && current.type === 'navigate' && typeof current.durationMs === 'number') ? current.durationMs : 200)

  const [url, setUrl] = useState<string>(() => (current && current.type === 'openUrl') ? current.url : '')
  const [target, setTarget] = useState<'_self'|'_blank'>(() => (current && current.type === 'openUrl' && current.target) ? current.target : '_blank')

  const [targetNodeId, setTargetNodeId] = useState<string>(() => (current && current.type === 'scrollTo') ? current.targetNodeId : (allNodes[0]?.id || ''))
  const [behavior, setBehavior] = useState<'auto'|'smooth'>(() => (current && current.type === 'scrollTo' && current.behavior) ? current.behavior : 'smooth')
  const [block, setBlock] = useState<'start'|'center'|'end'|'nearest'>(() => (current && current.type === 'scrollTo' && current.block) ? current.block : 'start')

  const [contentNodeId, setContentNodeId] = useState<string>(() => (current && current.type === 'openModal') ? current.contentNodeId : (allNodes[0]?.id || ''))

  function apply() {
    if (mode === 'none') return update(null)
    if (mode === 'navigate') return update({ type: 'navigate', pageId, transition: trans, durationMs: dur })
    if (mode === 'openUrl') return update({ type: 'openUrl', url, target })
    if (mode === 'scrollTo') return update({ type: 'scrollTo', targetNodeId, behavior, block })
    if (mode === 'openModal') return update({ type: 'openModal', contentNodeId })
    if (mode === 'closeModal') return update({ type: 'closeModal' })
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">Interactions</div>
      <div className="flex gap-2">
        <select className="border rounded h-8 px-2 text-sm" value={mode} onChange={(e)=>setMode(e.target.value as any)}>
          <option value="none">none</option>
          <option value="navigate">navigate</option>
          <option value="openUrl">openUrl</option>
          <option value="scrollTo">scrollTo</option>
          <option value="openModal">openModal</option>
          <option value="closeModal">closeModal</option>
        </select>
        <button className="border rounded h-8 px-2 text-sm" onClick={apply}>Apply</button>
      </div>

      {mode === 'navigate' && (
        <div className="grid grid-cols-2 gap-2">
          <select className="border rounded h-8 px-2 text-sm" value={pageId} onChange={(e)=>setPageId(e.target.value)}>
            {pages.map((p:any)=> <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
          </select>
          <select className="border rounded h-8 px-2 text-sm" value={trans} onChange={(e)=>setTrans(e.target.value as TransitionKind)}>
            <option value="instant">instant</option>
            <option value="dissolve">dissolve</option>
            <option value="slide">slide</option>
          </select>
          <input type="number" className="border rounded h-8 px-2 text-sm" value={dur} onChange={(e)=>setDur(parseInt(e.target.value||'0',10))} />
          <div className="text-xs opacity-70 self-center">ms</div>
        </div>
      )}

      {mode === 'openUrl' && (
        <div className="grid grid-cols-2 gap-2">
          <input className="border rounded h-8 px-2 text-sm col-span-2" value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://example.com" />
          <select className="border rounded h-8 px-2 text-sm" value={target} onChange={(e)=>setTarget(e.target.value as any)}>
            <option value="_blank">_blank</option>
            <option value="_self">_self</option>
          </select>
        </div>
      )}

      {mode === 'scrollTo' && (
        <div className="grid grid-cols-2 gap-2">
          <select className="border rounded h-8 px-2 text-sm col-span-2" value={targetNodeId} onChange={(e)=>setTargetNodeId(e.target.value)}>
            {allNodes.map((n:any)=> <option key={n.id} value={n.id}>{n.name || n.id}</option>)}
          </select>
          <select className="border rounded h-8 px-2 text-sm" value={behavior} onChange={(e)=>setBehavior(e.target.value as any)}>
            <option value="smooth">smooth</option>
            <option value="auto">auto</option>
          </select>
          <select className="border rounded h-8 px-2 text-sm" value={block} onChange={(e)=>setBlock(e.target.value as any)}>
            <option value="start">start</option>
            <option value="center">center</option>
            <option value="end">end</option>
            <option value="nearest">nearest</option>
          </select>
        </div>
      )}

      {mode === 'openModal' && (
        <div className="grid grid-cols-2 gap-2">
          <select className="border rounded h-8 px-2 text-sm col-span-2" value={contentNodeId} onChange={(e)=>setContentNodeId(e.target.value)}>
            {allNodes.map((n:any)=> <option key={n.id} value={n.id}>{n.name || n.id}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

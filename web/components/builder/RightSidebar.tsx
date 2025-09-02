'use client'
import React from 'react'
import { VariantPanelCompat } from '@/components/panel/VariantPanelCompat'
import { OverridePanelCompat } from '@/components/panel/OverridePanelCompat'
import { AutoPropertyPanel } from '@/components/panel/AutoPropertyPanel'
import { InteractionPanel } from '@/components/panel/InteractionPanel'
import { useBuilderStore } from '@/store/builderStore'

export function RightSidebar() {
  const selectedIds = useBuilderStore(s=>s.selectedIds)
  const elements = useBuilderStore(s=>s.elements as any)
  const updateProp = useBuilderStore(s=>s.updateProp as any)
  const updateActions = useBuilderStore(s=>s.updateActions as any)
  const setMeta = useBuilderStore(s=>s.setMeta as any)
  const node = React.useMemo(()=>{
    const id = selectedIds?.[0]
    if (!id) return null
    return (elements as any[]).find(e=>e.id===id) || null
  }, [selectedIds, elements])
  if (!node) return <div className="p-2 text-sm text-gray-500">No selection</div>
  const meta = (node.meta || {}) as any
  return (
    <div className="td-form-scope flex flex-col gap-4">
      <VariantPanelCompat componentKey={String(node.componentId || node.type)} value={meta.variant ?? null} onChange={(v)=>setMeta(node.id, { ...meta, variant: v })} />
      <AutoPropertyPanel componentKey={String(node.componentId || node.type)} propValues={node.propValues} onChange={(k,v)=>updateProp(node.id, k, v)} />
      <OverridePanelCompat value={meta.overrides} onChange={(v)=>setMeta(node.id, { ...meta, overrides: v })} />
      <InteractionPanel value={node.actions} onChange={(v)=>updateActions(node.id, v)} />
    </div>
  )
}

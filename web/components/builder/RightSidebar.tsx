'use client'
import React from 'react'
import { AutoPropertyPanel } from '@/components/panel/AutoPropertyPanel'
import { useBuilderStore } from '@/store/builderStore'

export function RightSidebar() {
  const selectedIds = useBuilderStore(s=>s.selectedIds)
  const tree = useBuilderStore(s=>s.tree as any)
  const updateProp = useBuilderStore(s=>s.updateProp as any)
  const node = React.useMemo(()=>{
    const id = selectedIds?.[0]
    if (!id) return null
    const q: any[] = [...(tree||[])]
    while (q.length) {
      const n: any = q.shift()
      if (n?.id === id) return n
      if (n?.children) q.push(...n.children)
    }
    return null
  }, [selectedIds, tree])

  if (!node || node.type !== 'instance') return <div className="p-2 text-sm text-gray-500">No selection</div>

  return (
    <AutoPropertyPanel
      componentKey={node.componentId}
      propValues={node.propValues}
      onChange={(k,v)=>updateProp(node.id, k, v)}
    />
  )
}

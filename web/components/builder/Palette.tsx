'use client'
import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { listDefs } from '@/lib/registry'
import '@/lib/componentRegistryLoader'
import { componentRegistry as registry } from '@/lib/componentRegistry'
import { useBuilderStore } from '@/store/builderStore'

function Item({ comp }: { comp: { key: string; label: string } }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'palette:' + comp.key,
    data: { from: 'palette', type: 'instance', meta: { componentId: comp.key } },
  })
  return (
    <button ref={setNodeRef} {...attributes} {...listeners} className="w-full text-left px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800" title={comp.key}>
      {comp.label}
    </button>
  )
}

function NewRegistryGroup() {
  // Group new registry by group name
  const groups = React.useMemo(() => {
    const g: Record<string, string[]> = {}
    Object.values(registry).forEach((def) => {
      const grp = def.meta.group ?? 'General'
      ;(g[grp] ??= []).push(def.meta.id)
    })
    return g
  }, [])

  const addFromPalette = useBuilderStore((s) => s.addFromPalette)
  const updateProp = useBuilderStore((s) => s.updateProp)

  const createInstanceFromRegistry = (componentId: string) => {
    // Add a new element using existing builder primitives
    addFromPalette(componentId as any, { x: 40, y: 40 })
    const lastId = useBuilderStore.getState().selectedId
    const def = registry[componentId]
    if (lastId && def) {
      def.meta.props.forEach((p) => {
        try { updateProp(lastId, p.id, p.default as any) } catch {}
      })
    }
  }

  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([g, ids]) => (
        <div key={g} className="mb-2">
          <div className="text-xs uppercase text-muted mb-1">{g}</div>
          <div className="grid gap-2">
            {ids.map((id) => (
              <button key={id} className="btn btn-sm" onClick={() => createInstanceFromRegistry(id)}>
                {registry[id].meta.displayName}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Palette() {
  const defs = listDefs()
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs opacity-70">Elements</div>
        <div className="grid grid-cols-1 gap-2">
          {defs.map((d) => <Item key={d.key} comp={d} />)}
        </div>
      </div>
      <NewRegistryGroup />
    </div>
  )
}
export default Palette

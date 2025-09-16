'use client'
import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { registry, type RegistryItem } from '@/lib/registry'
import { usePresetStore } from '@/store/presetStore'
import PresetsSection from '../palette/PresetsSection'

function useVisibleDefs() {
  const rules = usePresetStore(s => s.active().palette)
  const defs = Object.values(registry)

  return defs.filter(d => {
    const id = d.meta.id
    const group = d.meta.group ?? ''
    const inInclude = rules.include?.length ? rules.include.includes(id) : false
    const groupAllowed = !rules.groups?.length || rules.groups.includes(group)
    const notExcluded = !rules.exclude?.includes(id)
    return inInclude || (groupAllowed && notExcluded)
  })
}

function Item({ comp }: { comp: RegistryItem }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'palette:' + comp.meta.id,
    data: { from: 'palette', type: 'instance', meta: { componentId: comp.meta.id } },
  })
  const Preview = comp.meta.preview
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="w-full text-left px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800 flex items-center gap-2"
      title={comp.meta.id}
    >
      {Preview && (
        <div className="w-8 h-8 flex items-center justify-center">
          <Preview />
        </div>
      )}
      <div className="flex flex-col">
        <span>{comp.meta.displayName}</span>
        {comp.meta.description && (
          <span className="text-xs text-zinc-400">{comp.meta.description}</span>
        )}
        {comp.meta.tags?.length ? (
          <span className="text-[10px] text-zinc-500">
            {comp.meta.tags.join(', ')}
          </span>
        ) : null}
      </div>
    </button>
  )
}

export function Palette() {
  const defs = useVisibleDefs()
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="text-xs opacity-70">Elements</div>
        <div className="grid grid-cols-1 gap-2">
          {defs.length === 0 ? (
            <div className="rounded border border-dashed border-zinc-700 px-2 py-2 text-xs text-zinc-400">
              Registry 未解決/0件
            </div>
          ) : (
            defs.map((d) => <Item key={d.meta.id} comp={d} />)
          )}
        </div>
      </section>
      <PresetsSection />
    </div>
  )
}

export default Palette

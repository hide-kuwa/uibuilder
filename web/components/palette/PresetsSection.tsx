'use client'
import React, { useMemo } from 'react'
import { PRESETS, type PresetDef } from '@/lib/presets'
import { useBuilderStore } from '@/store/builderStore'
import PresetsFilterBar from './PresetsFilterBar'
import { usePresetsFilter } from '@/store/presetsFilterStore'
import { useDraggable } from '@dnd-kit/core'

function PresetItem({ preset }: { preset: PresetDef }) {
  const placePreset = useBuilderStore((s) => s.placePreset)
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'preset:' + preset.id,
    data: {
      from: 'palette',
      type: 'preset',
      meta: { presetId: preset.id },
    },
  })
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => placePreset(preset.id)}
      className="border rounded-lg p-2 text-left hover:bg-accent"
      title={preset.tags.join(', ')}
    >
      <div className="text-sm font-medium">{preset.displayName}</div>
      <div className="text-[10px] text-muted-foreground">{preset.id}</div>
    </button>
  )
}

export default function PresetsSection() {
  const { activeDomains, alwaysShowCommon } = usePresetsFilter()

  const activeSet = useMemo(
    () => new Set(Object.entries(activeDomains).filter(([, v]) => v).map(([k]) => k)),
    [activeDomains],
  )

  const shouldShow = (p: PresetDef) => {
    if (alwaysShowCommon && p.tags.includes('common')) return true
    if (activeSet.size === 0) return true
    return p.tags.some((t) => activeSet.has(t as any))
  }

  const list = PRESETS.filter(shouldShow)

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground">Presets</h3>
      <PresetsFilterBar />
      <div className="grid grid-cols-2 gap-2">
        {list.map((p) => (
          <PresetItem key={p.id} preset={p} />
        ))}
      </div>
    </section>
  )
}

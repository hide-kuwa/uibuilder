'use client'
import MotionEffectsPanel from './MotionEffectsPanel'
import type { MotionEffect } from '@/types/motion'

export default function EffectsPanel({
  visualPane,
  selectedNode,
  onChangeSelectedNode,
}: {
  visualPane: React.ReactNode
  selectedNode: any
  onChangeSelectedNode: (updater: (prev: any) => any) => void
}) {
  const motion: MotionEffect[] = selectedNode?.effects?.motion ?? []
  const setMotion = (next: MotionEffect[]) =>
    onChangeSelectedNode((prev) => ({
      ...prev,
      effects: { ...(prev.effects ?? {}), motion: next },
    }))

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
        <div className="mb-2 text-xs uppercase tracking-wider text-white/60">Effects (visual)</div>
        {visualPane}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
        <MotionEffectsPanel
          value={motion}
          onChange={setMotion}
          defaultTargetNodeId={selectedNode?.id}
        />
      </div>
    </div>
  )
}

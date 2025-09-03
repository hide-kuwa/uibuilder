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
    <div className="space-y-6">
      {/* 既存：Effects (visual) */}
      {visualPane}

      {/* 追加：Motion (anime.js) — visual の下に表示 */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <MotionEffectsPanel
          value={motion}
          onChange={setMotion}
          defaultTargetNodeId={selectedNode?.id}
        />
      </div>
    </div>
  )
}

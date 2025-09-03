'use client'

import dynamic from 'next/dynamic'

import TriggersCard from './TriggersCard'
import ActionsCard from './ActionsCard'
import EffectsCard from './EffectsCard'

// Motion panel with placeholder when missing
const MotionEffectsPanel = dynamic(
  () =>
    import('@/components/panels/MotionEffectsPanel').catch(() => ({
      default: () => (
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-2 text-sm font-medium text-gray-700">Animation (anime.js)</div>
          <p className="text-xs text-gray-500">
            MotionEffectsPanel が見つかりません。<code>components/panels/MotionEffectsPanel.tsx</code>
            を追加してください。
          </p>
        </div>
      ),
    })),
  { ssr: false }
)

import { builderStore, useBuilderStore } from '@/store/builderStore'
import type { MotionEffect } from '@/types/motion'

export default function DevActionsPage() {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const selectedNode = useBuilderStore(
    (s) => (selectedId ? s.elements.find((e) => e.id === selectedId) : null)
  ) as any

  const updateSelectedNode = (updater: (prev: any) => any) => {
    if (!selectedId) return
    builderStore.setState((state) => {
      const update = (el: any) => (el.id === selectedId ? updater(el) : el)
      return {
        ...state,
        elements: state.elements.map(update),
        tree: state.tree.map(update),
      }
    })
  }

  const motion: MotionEffect[] = selectedNode?.effects?.motion ?? []
  const setMotion = (next: MotionEffect[]) =>
    updateSelectedNode((prev: any) => ({
      ...prev,
      effects: { ...(prev.effects ?? {}), motion: next },
    }))

  return (
    // 2×2 grid: left-top Triggers, right-top Actions, left-bottom Effects, right-bottom Animation
    <div id="dev-actions-grid" className="grid gap-4 lg:grid-cols-2">
      {/* 左上：Triggers */}
      <section className="rounded-2xl border bg-white p-4">
        <TriggersCard />
      </section>

      {/* 右上：Actions */}
      <section className="rounded-2xl border bg-white p-4">
        <ActionsCard />
      </section>

      {/* 左下：Effects (visual) */}
      <section className="rounded-2xl border bg-white p-4">
        <EffectsCard />
      </section>

      {/* 右下：Animation (anime.js) */}
      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium text-gray-700">Animation (anime.js)</div>
        <MotionEffectsPanel
          value={motion}
          onChange={setMotion}
          defaultTargetNodeId={selectedNode?.id}
        />
      </section>
    </div>
  )
}


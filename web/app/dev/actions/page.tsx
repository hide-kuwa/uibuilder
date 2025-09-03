'use client'

import dynamic from 'next/dynamic'

import TriggersCard from './TriggersCard'
import ActionsCard from './ActionsCard'
import EffectsCard from './EffectsCard'
import MotionEffectsPanel from '@/components/panels/MotionEffectsPanel'

const PresetsSidebar = dynamic(
  () =>
    import('@/components/panels/PresetsSidebar').catch(() => ({
      default: () => (
        <div className="rounded-2xl border bg-white p-4 text-sm text-gray-500">
          PresetsSidebar が見つかりません。<code>components/panels/PresetsSidebar.tsx</code>
          を用意してください。
        </div>
      ),
    })),
  { ssr: false }
)

const PreviewPane = dynamic(
  () =>
    import('@/components/panels/PreviewPane').catch(() => ({
      default: () => (
        <div className="rounded-2xl border bg-white p-4 text-sm text-gray-500">
          PreviewPane が見つかりません。<code>components/panels/PreviewPane.tsx</code>
          を用意してください。
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
    // 3カラム：左=Presets／中央=2×2／右=Preview
    <div className="grid gap-4 xl:grid-cols-[260px_1fr_320px]">
      {/* 左：Presets（スクロール追従） */}
      <aside className="xl:sticky xl:top-4 xl:self-start">
        <PresetsSidebar />
      </aside>

      {/* 中央：2×2 グリッド */}
      <main className="grid gap-4 lg:grid-cols-2">
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
        {/* 右下：Animation (preset) */}
        <section className="rounded-2xl border bg-white p-4">
          <MotionEffectsPanel
            value={motion}
            onChange={setMotion}
            defaultTargetNodeId={selectedNode?.id}
            mode="simple"
          />
        </section>
      </main>

      {/* 右：Preview（スクロール追従） */}
      <aside className="xl:sticky xl:top-4 xl:self-start">
        <PreviewPane />
      </aside>
    </div>
  )
}


'use client'

import { useEffect, useMemo, useState } from 'react'
import { useBuilderLayout, type BuilderLayout } from '@/stores/builderLayout'
import clsx from 'clsx'

type PanelKey = 'palette' | 'inspector' | 'toolbar'
const ALL_PANELS: PanelKey[] = ['palette', 'inspector', 'toolbar']

const panelLabel: Record<PanelKey, string> = {
  palette: 'Palette（コンポーネント辞書）',
  inspector: 'Inspector（プロパティ編集）',
  toolbar: 'Toolbar（操作バー）',
}

function DraggablePanelCard({ id, disabled = false }: { id: PanelKey; disabled?: boolean }) {
  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => {
        if (disabled) return
        e.dataTransfer.setData('text/panel', id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      className={clsx(
        'rounded-xl border px-3 py-2 text-sm shadow-sm select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
        'bg-zinc-900/40 border-zinc-700'
      )}
      title={panelLabel[id]}
    >
      <div className="font-medium">{id}</div>
      <div className="text-xs text-zinc-400">{panelLabel[id]}</div>
    </div>
  )
}

function DropSlot({
  title,
  slotKey,
  value,
  onDropPanel,
  onClear,
}: {
  title: string
  slotKey: keyof BuilderLayout
  value?: string | ''
  onDropPanel: (slot: keyof BuilderLayout, panel: PanelKey) => void
  onClear: (slot: keyof BuilderLayout) => void
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-400">{title}</div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const panel = e.dataTransfer.getData('text/panel') as PanelKey
          if (!panel) return
          onDropPanel(slotKey, panel)
        }}
        className={clsx(
          'min-h-[72px] rounded-xl border border-dashed px-3 py-2',
          'bg-zinc-900/30 border-zinc-700'
        )}
      >
        {value ? (
          <div className="flex items-center justify-between gap-2">
            <DraggablePanelCard id={value as PanelKey} disabled />
            <button
              className="text-xs text-zinc-300 hover:text-red-400 transition"
              onClick={() => onClear(slotKey)}
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="text-xs text-zinc-500">ここにドラッグして配置</div>
        )}
      </div>
    </div>
  )
}

export default function BuilderLayoutEditorPage() {
  const { layout, setLayout, resetLayout } = useBuilderLayout()
  const [draft, setDraft] = useState<BuilderLayout>(layout)

  useEffect(() => setDraft(layout), [layout])

  const assigned = useMemo(() => new Set(Object.values(draft).filter(Boolean) as string[]), [draft])

  const place = (slot: keyof BuilderLayout, panel: PanelKey) => {
    // 同一パネルは一意にする: 既存配置から取り外してから新しい slot に置く
    const next: BuilderLayout = { ...draft }
    ;(['left', 'right', 'top', 'bottom'] as (keyof BuilderLayout)[]).forEach((k) => {
      if (next[k] === panel) next[k] = ''
    })
    next[slot] = panel
    setDraft(next)
  }

  const clearSlot = (slot: keyof BuilderLayout) => {
    setDraft((d) => ({ ...d, [slot]: '' }))
  }

  const availablePanels = ALL_PANELS.filter((p) => !assigned.has(p))

  return (
    <div className="h-[calc(100vh-64px)] p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Builder Layout Editor</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border px-3 py-1.5 text-sm bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800"
            onClick={() => setDraft(layout)}
          >
            Revert
          </button>
          <button
            className="rounded-lg border px-3 py-1.5 text-sm bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800"
            onClick={resetLayout}
          >
            Reset to Default
          </button>
          <button
            className="rounded-lg border px-3 py-1.5 text-sm bg-blue-600/80 border-blue-500 hover:bg-blue-600"
            onClick={() => setLayout(draft)}
          >
            Apply
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* 左ペイン: 未配置パネル */}
        <aside className="col-span-3 space-y-2">
          <div className="text-xs text-zinc-400">未配置のパネル</div>
          <div className="space-y-2">
            {availablePanels.length === 0 ? (
              <div className="text-xs text-zinc-500">すべて配置済みです</div>
            ) : (
              availablePanels.map((p) => <DraggablePanelCard key={p} id={p} />)
            )}
          </div>
          <div className="mt-4 text-xs text-zinc-500">
            パネルをドラッグして右側のスロットに配置できます。
          </div>
        </aside>

        {/* 右ペイン: 配置グリッド（Top / Left / Center(Canvas固定) / Right / Bottom） */}
        <main className="col-span-9">
          <div className="grid grid-rows-[64px_minmax(240px,1fr)_64px] grid-cols-[260px_1fr_280px] gap-4">
            {/* Top */}
            <div className="col-span-3">
              <DropSlot
                title="Top"
                slotKey="top"
                value={draft.top}
                onDropPanel={place}
                onClear={clearSlot}
              />
            </div>

            {/* Left / Center / Right */}
            <div className="col-span-1">
              <DropSlot
                title="Left"
                slotKey="left"
                value={draft.left}
                onDropPanel={place}
                onClear={clearSlot}
              />
            </div>

            <div className="col-span-1">
              <div className="space-y-2">
                <div className="text-xs text-zinc-400">Center（Canvas 固定）</div>
                <div className="rounded-xl border bg-zinc-900/30 border-zinc-700 h-full min-h-[240px] p-3">
                  <div className="text-xs text-zinc-500">
                    ここは Canvas 領域です（固定）。プレビュー的にダミーを表示しています。
                  </div>
                  <div className="mt-3 h-32 rounded-lg border border-zinc-700 bg-zinc-900/40" />
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <DropSlot
                title="Right"
                slotKey="right"
                value={draft.right}
                onDropPanel={place}
                onClear={clearSlot}
              />
            </div>

            {/* Bottom */}
            <div className="col-span-3">
              <DropSlot
                title="Bottom"
                slotKey="bottom"
                value={draft.bottom}
                onDropPanel={place}
                onClear={clearSlot}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


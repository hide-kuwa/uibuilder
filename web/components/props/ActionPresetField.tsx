'use client'

import * as React from 'react'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { useEditorStore } from '@/store/editorStore'

type Props = {
  nodeId: string
  /** 既存ノードの現在値（presetId or presetIds[0]） */
  value?: string | null
}

/** プロパティパネル用：アクションプリセットの単一選択 */
export default function ActionPresetField({ nodeId, value }: Props) {
  const { presets } = useInteractionRegistry()
  const updateNode = useEditorStore((s) => s.updateNode)
  const selectedIds = useEditorStore((s) => (s.selectedIds as string[]) ?? [])

  const applyTo = React.useCallback(
    (ids: string[], presetId: string | null) => {
      ids.forEach((id) => {
        const node = useEditorStore.getState().tree.find((n) => n.id === id)
        if (!node) return
        const prev = node.props || {}
        const next = {
          ...prev,
          presetId: presetId ?? null,
          presetIds: presetId ? [presetId] : [],
        }
        updateNode(id, { props: next })
      })
    },
    [updateNode]
  )

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value || null
    applyTo([nodeId], next)
  }

  const onApplyToSelection = () => {
    const dropdown = document.getElementById(`preset-select-${nodeId}`) as HTMLSelectElement | null
    const next = dropdown?.value || ''
    applyTo(selectedIds.length ? selectedIds : [nodeId], next || null)
  }

  // ドロップダウンが空のときに備えたUI
  const noPresets = presets.length === 0

  return (
    <div className="mt-3">
      <div className="mb-1 text-xs text-neutral-300">Action Preset</div>
      <div className="flex gap-2 items-center">
        <select
          id={`preset-select-${nodeId}`}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
          value={value ?? ''}
          onChange={onChange}
          disabled={noPresets}
        >
          <option value="">（なし）</option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <a
          href="/dev/actions"
          className="px-2 py-1 bg-neutral-800 rounded text-xs whitespace-nowrap"
        >
          Open Designer
        </a>
      </div>

      <div className="mt-2 flex gap-6 items-center">
        <button
          type="button"
          className="px-2 py-[6px] bg-neutral-800 rounded text-xs disabled:opacity-40"
          onClick={onApplyToSelection}
          disabled={noPresets}
          title="ドロップダウンの選択を現在の選択すべてへ適用"
        >
          Apply to selection
        </button>

        {noPresets && (
          <span className="text-[11px] text-neutral-500">
            まだプリセットがありません。Designerで作成してください。
          </span>
        )}
      </div>
    </div>
  )
}


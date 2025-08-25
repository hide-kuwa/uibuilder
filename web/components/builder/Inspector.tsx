'use client'
import React from 'react'
import { useBuilderStore } from '@/store/builderStore'

export function Inspector() {
  const selId = useBuilderStore((s) => s.selectedId)
  const elm = useBuilderStore((s) => s.elements.find((e) => e.id === s.selectedId) ?? null)
  const updateProps = useBuilderStore((s) => s.updateProps)
  const deleteSelected = useBuilderStore((s) => s.deleteSelected)
  const bringToFront = useBuilderStore((s) => s.bringToFront)
  const sendToBack = useBuilderStore((s) => s.sendToBack)
  const move = useBuilderStore((s) => s.move)
  const resize = useBuilderStore((s) => s.resize)

  if (!selId || !elm) {
    return <div className="text-xs text-zinc-400">要素を選択すると編集できます。</div>
  }
  return (
    <div className="space-y-3">
      <div className="text-xs text-zinc-400">ID: {elm.id}</div>
      <div className="text-sm font-medium">基本</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <label className="flex flex-col gap-1">
          x
          <input
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            value={elm.x}
            onChange={(e) => move(elm.id, { x: Number(e.target.value), y: elm.y })}
            type="number"
          />
        </label>
        <label className="flex flex-col gap-1">
          y
          <input
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            value={elm.y}
            onChange={(e) => move(elm.id, { x: elm.x, y: Number(e.target.value) })}
            type="number"
          />
        </label>
        <label className="flex flex-col gap-1">
          w
          <input
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            value={elm.w}
            onChange={(e) => resize(elm.id, { w: Number(e.target.value), h: elm.h })}
            type="number"
          />
        </label>
        <label className="flex flex-col gap-1">
          h
          <input
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            value={elm.h}
            onChange={(e) => resize(elm.id, { w: elm.w, h: Number(e.target.value) })}
            type="number"
          />
        </label>
      </div>

      <div className="text-sm font-medium">見た目</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <label className="flex flex-col gap-1 col-span-2">
          text
          <input
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            value={elm.props?.text ?? ''}
            onChange={(e) => updateProps(elm.id, { text: e.target.value })}
            type="text"
          />
        </label>
        <label className="flex flex-col gap-1">
          bg
          <input
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            value={elm.props?.bg ?? ''}
            onChange={(e) => updateProps(elm.id, { bg: e.target.value })}
            type="text"
            placeholder="#0ea5e9"
          />
        </label>
        <label className="flex flex-col gap-1">
          color
          <input
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            value={elm.props?.color ?? ''}
            onChange={(e) => updateProps(elm.id, { color: e.target.value })}
            type="text"
            placeholder="#e5e7eb"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          className="px-2 py-1 text-xs rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
          onClick={() => bringToFront(elm.id)}
        >
          Front
        </button>
        <button
          className="px-2 py-1 text-xs rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
          onClick={() => sendToBack(elm.id)}
        >
          Back
        </button>
        <button
          className="ml-auto px-2 py-1 text-xs rounded bg-rose-900/60 border border-rose-700 hover:bg-rose-800/60"
          onClick={() => deleteSelected()}
        >
          Delete
        </button>
      </div>
    </div>
  )
}


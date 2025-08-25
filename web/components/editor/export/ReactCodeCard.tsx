'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'
import { generateReactTSX } from '@/lib/export/react-codegen'

export default function ReactCodeCard() {
  const components = useEditorStore((s) => s.components)

  const download = (filename: string, content: string, type = 'text/tsx') => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
  }

  return (
    <div className="rounded-lg border border-zinc-700 p-3 bg-zinc-900/50">
      <div className="text-sm font-medium mb-2">React Code</div>
      <p className="text-xs text-zinc-400 mb-3">
        Component を <code>.tsx</code> 出力します（Props/Variants/最小Overrides対応）。
      </p>
      <ul className="space-y-1">
        {Object.values(components).length === 0 && (
          <li className="text-xs text-zinc-500">Components がありません。</li>
        )}
        {Object.values(components).map((def) => (
          <li key={def.id} className="flex items-center justify-between gap-3">
            <div className="text-xs truncate">{def.name}</div>
            <button
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
              onClick={() => {
                const { filename, code } = generateReactTSX(def)
                download(filename, code)
              }}
            >
              Download TSX
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 text-[11px] text-zinc-500">
        注: レイアウト/スタイルは inline style で最小限を出力。±1px差異は手調整の前提です。
      </div>
    </div>
  )
}

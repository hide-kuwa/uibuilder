'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'
import { exportPNG } from '@/lib/exporters/png'

function findNodeById(nodes: any[], id: string): any | null {
  for (const n of nodes || []) {
    if (n.id === id) return n
    const found = findNodeById(n.children, id)
    if (found) return found
  }
  return null
}

export default function PngExportCard() {
  const selection = useEditorStore((s) => s.selectedIds)
  const tree = useEditorStore((s) => s.tree)

  const onExport = async () => {
    let target: HTMLElement | null = null
    let fileName = 'artboard'
    if (selection.length > 0) {
      const id = selection[selection.length - 1]
      target = document.querySelector(`[data-node-id="${id}"]`)
      const node = findNodeById(tree, id)
      if (node?.name) fileName = node.name
      else fileName = `selection-${id}`
    } else {
      target = document.querySelector('[data-canvas-root]')
    }
    if (!target) return
    await exportPNG(target as HTMLElement, { kind: 'png', fileName })
  }

  return (
    <div className="rounded-lg border border-zinc-700 p-3 bg-zinc-900/50">
      <div className="text-sm font-medium mb-2">PNG Export</div>
      <p className="text-xs text-zinc-400 mb-3">選択範囲またはアートボード全体をPNGとして保存します。</p>
      <button
        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
        onClick={onExport}
      >
        Export PNG
      </button>
    </div>
  )
}

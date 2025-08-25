'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'
import { exportChanged } from '@/lib/export'

export default function DiffExportCard() {
  const tree = useEditorStore((s) => s.tree)
  const dirtyIds = useEditorStore((s) => Object.keys(s.dirtyNodes))
  const lastExportAt = useEditorStore((s) => s.lastExportAt)
  const clearDirty = useEditorStore((s) => s.clearDirtyAfterExport)

  const download = (filename: string, content: string, type = 'application/json') => {
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

  const handle = () => {
    if (!dirtyIds.length) return
    const { json, meta } = exportChanged(tree, dirtyIds)
    const stamp = new Date(meta.exportedAt).toISOString().replace(/[:.]/g, '-')
    download(`diff-${stamp}.json`, json)
    clearDirty()
  }

  return (
    <div className="rounded-lg border border-zinc-700 p-3 bg-zinc-900/50">
      <div className="text-sm font-medium mb-2">Diff Export</div>
      <p className="text-xs text-zinc-400 mb-3">
        変更されたノードのみを書き出します（ストアの <code>dirtyNodes</code> を参照）。
      </p>
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm disabled:opacity-60"
          onClick={handle}
          disabled={!dirtyIds.length}
          title={dirtyIds.length ? '' : '変更がありません'}
        >
          Export Changed ({dirtyIds.length})
        </button>
        <span className="text-xs text-zinc-500">
          last: {lastExportAt ? new Date(lastExportAt).toLocaleString() : '—'}
        </span>
      </div>
    </div>
  )
}

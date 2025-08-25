'use client'
import React, { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { buildAssetMapJSON } from '@/lib/export'

export default function AssetMapCard() {
  const tree = useEditorStore((s) => s.tree)
  const [busy, setBusy] = useState(false)
  const [stats, setStats] = useState<{ total: number; unique: number; duplicates: number } | null>(null)

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

  const handle = async () => {
    try {
      setBusy(true)
      const { json, map } = await buildAssetMapJSON(tree)
      download('asset-map.json', json)
      setStats(map.stats)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-700 p-3 bg-zinc-900/50">
      <div className="text-sm font-medium mb-2">Asset Map</div>
      <p className="text-xs text-zinc-400 mb-3">
        画像アセットをハッシュで重複判定し、参照先一覧とともに <code>asset-map.json</code> を出力します。
        <br />
        <span className="text-[11px]">
          data:URL は <b>SHA-256</b>、その他URLは <b>FNV-1a</b>（文字列）でハッシュ（MVP）。
        </span>
      </p>
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm disabled:opacity-60"
          onClick={handle}
          disabled={busy}
        >
          {busy ? 'Building…' : 'Build & Download Map'}
        </button>
        {stats && (
          <span className="text-xs text-zinc-400">
            total: {stats.total} / unique: {stats.unique}{' '}
            {stats.duplicates > 0 && <>(dup: {stats.duplicates})</>}
          </span>
        )}
      </div>
    </div>
  )
}

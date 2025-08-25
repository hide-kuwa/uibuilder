'use client'
import React, { useMemo } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { extractTokensFromTree, tokensToJSON, tokensToTS } from '@/lib/export/tokens'

export default function DesignTokensCard() {
  const tree = useEditorStore((s) => s.tree)
  const tokens = useMemo(() => extractTokensFromTree(tree), [tree])

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

  return (
    <div className="rounded-lg border border-zinc-700 p-3 bg-zinc-900/50">
      <div className="text-sm font-medium mb-2">Design Tokens</div>
      <p className="text-xs text-zinc-400 mb-3">
        現在のドキュメントから <code>colors / typography / spacing</code> を抽出します。
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
          onClick={() => download('tokens.json', tokensToJSON(tokens))}
        >
          Download JSON
        </button>
        <button
          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
          onClick={() => download('tokens.ts', tokensToTS(tokens))}
        >
          Download TS
        </button>
      </div>
      {/* preview (抜粋) */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs mb-1 text-zinc-400">Colors</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tokens.colors).slice(0, 8).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-sm" style={{ background: v }} />
                <span className="text-xs">{k}</span>
              </div>
            ))}
            {Object.keys(tokens.colors).length === 0 && (
              <div className="text-xs text-zinc-500">—</div>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs mb-1 text-zinc-400">Typography</div>
          <div className="text-xs text-zinc-300 space-y-1">
            <div>fonts: {tokens.typography.fonts.join(', ') || '—'}</div>
            <div>fontSizes(px): {tokens.typography.fontSizes.join(', ') || '—'}</div>
            <div>lineHeights(px): {tokens.typography.lineHeights.join(', ') || '—'}</div>
            <div>letterSpacing(px): {tokens.typography.letterSpacing.join(', ') || '—'}</div>
            <div>fontWeights: {tokens.typography.fontWeights.join(', ') || '—'}</div>
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-xs mb-1 text-zinc-400">Spacing(px)</div>
          <div className="text-xs text-zinc-300">
            {tokens.spacing.space.join(', ') || '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

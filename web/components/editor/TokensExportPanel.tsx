'use client'
import React, { useMemo, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { extractTokensFromTree, tokensToJSON, tokensToTS } from '@/lib/export/tokens'
import { buildAssetMapJSON } from '@/lib/export'
import { generateReactTSX } from '@/lib/export/react-codegen'

/**
 * v12-2: Design Tokens Export Panel
 * - 現在のドキュメント（tree）から tokens を抽出し、JSON / TS としてダウンロード
 * v12-1 追記:
 * - コンポーネントごとの React .tsx コード生成
 */
export default function TokensExportPanel() {
  const tree = useEditorStore((s) => s.tree)
  const tokens = useMemo(() => extractTokensFromTree(tree), [tree])
  const [assetStats, setAssetStats] = useState<{ total: number; unique: number; duplicates: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const components = useEditorStore((s) => s.components)

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

  const handleDownloadAssetMap = async () => {
    try {
      setBusy(true)
      const { json, map } = await buildAssetMapJSON(tree)
      download('asset-map.json', json)
      setAssetStats(map.stats)
    } catch {
      // no-op
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-zinc-400">Export</div>
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
        {/* プレビュー（抜粋） */}
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

      {/* v12-3: Asset Map */}
      <div className="rounded-lg border border-zinc-700 p-3 bg-zinc-900/50">
        <div className="text-sm font-medium mb-2">Asset Map</div>
        <p className="text-xs text-zinc-400 mb-3">
          画像アセットをハッシュで重複判定し、参照先一覧とともに <code>asset-map.json</code> を出力します。
          <br />
          <span className="text-[11px]">
            data:URL は <b>SHA-256</b>、それ以外のURLは <b>FNV-1a(文字列)</b> でハッシュ化（MVP）。
          </span>
        </p>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm disabled:opacity-60"
            onClick={handleDownloadAssetMap}
            disabled={busy}
          >
            {busy ? 'Building…' : 'Build & Download Map'}
          </button>
          {assetStats && (
            <span className="text-xs text-zinc-400">
              total: {assetStats.total} / unique: {assetStats.unique}{' '}
              {assetStats.duplicates > 0 && <>(dup: {assetStats.duplicates})</>}
            </span>
          )}
        </div>
      </div>

      {/* v12-1: React Codegen */}
      <div className="rounded-lg border border-zinc-700 p-3 bg-zinc-900/50">
        <div className="text-sm font-medium mb-2">React Code</div>
        <p className="text-xs text-zinc-400 mb-3">
          Component を <code>.tsx</code> として出力します（Props/Variants（一部）/visible・text・color の最小 Overrides 対応）。
        </p>
        <ul className="space-y-1">
          {Object.values(components).length === 0 && (
            <li className="text-xs text-zinc-500">Components がありません。</li>
          )}
          {Object.values(components).map((def) => (
            <li key={def.id} className="flex items-center justify-between gap-3">
              <div className="text-xs truncate">{def.name}</div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
                  onClick={() => {
                    try {
                      const { filename, code } = generateReactTSX(def)
                      download(filename, code, 'text/tsx')
                    } catch {
                      // no-op
                    }
                  }}
                >
                  Download TSX
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-[11px] text-zinc-500">
          注: レイアウト/スタイルは inline style で最小限を出力します。Canvas と±1pxの一致を目標にしていますが、差異が出る場合は手調整してください。
        </div>
      </div>
    </div>
  )
}

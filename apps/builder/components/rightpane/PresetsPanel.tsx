'use client'
import React from 'react'
import { getPreset, getPresetNames } from '@/lib/presets/registry'
import type { Preset } from '@/lib/presets/types'
import { applyPreset } from '@/lib/presets/apply'
import { logEvent } from '@/lib/utils/telemetry'
import DiffPreview from '@/components/common/DiffPreview'

export default function PresetsPanel({ slug }: { slug?: string }) {
  const [names, setNames] = React.useState<string[]>([])
  const [name, setName] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [diff, setDiff] = React.useState<string | undefined>(undefined)
  const [snapshot, setSnapshot] = React.useState<any | null>(null)

  React.useEffect(() => {
    ;(async () => {
      const ns = await getPresetNames()
      setNames(ns)
      if (!name && ns[0]) setName(ns[0])
    })()
  }, [])

  const onApply = async () => {
    setLoading(true)
    try {
      const p = name ? await getPreset(name) : null
      if (!p) return
      // fetch current tree
      const id = slug || new URLSearchParams(window.location.search).get('slug') || 'sample'
      const r = await fetch(`/pages/${encodeURIComponent(id)}.json`, { cache: 'no-store' })
      const cur = await r.json()
      const tree = Array.isArray(cur?.tree) ? cur.tree : Array.isArray(cur) ? cur : []
      setSnapshot(tree)
      const { nextTree, diffText } = applyPreset(tree, p as Preset)
      logEvent('applyPreset', { slug: id, name: sel?.name })
      setDiff(diffText)
      // Raise event for host to apply draft
      try { window.dispatchEvent(new CustomEvent('builder:applyPreset', { detail: { slug: id, name, nextTree } })) } catch {}
      // Save debounced
      try { (await import('@/lib/save/applyAndSave')).saveDebounced(id, nextTree) } catch {}
      // Refresh score (best-effort)
      try { await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(id)}`, { cache: 'no-store' }) } catch {}
    } finally {
      setLoading(false)
    }
  }

  const onUndo = async () => {
    if (!snapshot) return
    const id = slug || new URLSearchParams(window.location.search).get('slug') || 'sample'
    try { window.dispatchEvent(new CustomEvent('builder:applyPreset', { detail: { slug: id, name: 'undo', nextTree: snapshot } })) } catch {}
    logEvent('applyPreset.undo', { slug: id })
    try { (await import('@/lib/save/applyAndSave')).saveDebounced(id, snapshot) } catch {}
    setSnapshot(null)
    setDiff(undefined)
    try { await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(id)}`, { cache: 'no-store' }) } catch {}
  }

  return (
    <div className="p-2 space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <b>Presets</b>
        <select value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-0.5 text-xs">
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button className={`underline ${loading ? 'opacity-60 pointer-events-none' : ''}`} onClick={onApply}>
          Apply
        </button>
      </div>
      {diff && (
        <div>
          <div className="text-xs opacity-70 mb-1">Preview</div>
          <DiffPreview before={diff.split('@@\n-')[1]?.split('\n+')[0]} after={diff.split('\n+')[1]} />
          <div className="mt-2 flex items-center gap-3">
            <button className="underline" onClick={() => navigator.clipboard.writeText(diff || '')}>Copy .diff</button>
            <button className="underline text-gray-600" onClick={onUndo} disabled={!snapshot}>Undo</button>
          </div>
        </div>
      )}
    </div>
  )
}

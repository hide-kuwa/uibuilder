'use client'
import React from 'react'
import { applyPreset } from '@/lib/presets/apply'
import DiffPreview from '@/components/common/DiffPreview'

type PresetIndexItem = { name: string; title?: string; tags?: string[]; thumb?: string; minScore?: number }

async function fetchIndex(): Promise<PresetIndexItem[]> {
  try {
    const r = await fetch('/presets/index.json', { cache: 'no-store' })
    if (!r.ok) return []
    const j = await r.json()
    return Array.isArray(j) ? (j as PresetIndexItem[]) : []
  } catch { return [] }
}

async function fetchPreset(name: string): Promise<any | null> {
  try {
    const r = await fetch(`/presets/${encodeURIComponent(name)}.json`, { cache: 'no-store' })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export default function PresetGallery({ slug }: { slug?: string }) {
  const [list, setList] = React.useState<PresetIndexItem[]>([])
  const [q, setQ] = React.useState('')
  const [tag, setTag] = React.useState('')
  const [sel, setSel] = React.useState<PresetIndexItem | null>(null)
  const [diff, setDiff] = React.useState<string | undefined>(undefined)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => { void (async () => setList(await fetchIndex()))() }, [])

  const filtered = list.filter((p) => {
    const okQ = !q || (p.title || p.name).toLowerCase().includes(q.toLowerCase())
    const okT = !tag || (p.tags || []).some((t) => t.toLowerCase().includes(tag.toLowerCase()))
    return okQ && okT
  })

  const apply = async () => {
    if (!sel) return
    setLoading(true)
    try {
      const id = slug || new URLSearchParams(window.location.search).get('slug') || 'sample'
      const p = await fetchPreset(sel.name)
      if (!p) return
      const r = await fetch(`/pages/${encodeURIComponent(id)}.json`, { cache: 'no-store' })
      const cur = await r.json()
      const tree = Array.isArray(cur?.tree) ? cur.tree : Array.isArray(cur) ? cur : []
      const { nextTree, diffText } = applyPreset(tree, p)
      setDiff(diffText)
      // emit + save
      try { window.dispatchEvent(new CustomEvent('builder:applyPreset', { detail: { slug: id, name: sel.name, nextTree } })) } catch {}
      try { (await import('@/lib/save/applyAndSave')).saveDebounced(id, nextTree) } catch {}
      // refresh score (best-effort)
      try { await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(id)}`, { cache: 'no-store' }) } catch {}
    } finally {
      setLoading(false)
    }
  }

  const badge = (s?: number) => s == null ? '' : s >= 80 ? 'text-green-700' : s >= 70 ? 'text-amber-700' : 'text-rose-700'

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="border rounded px-2 py-1 text-sm" />
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" className="border rounded px-2 py-1 text-sm" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((p) => (
          <button key={p.name} className="border rounded p-2 text-left" onClick={() => { setSel(p); setDiff(undefined) }}>
            {p.thumb ? <img src={p.thumb} alt={p.name} className="w-full h-24 object-cover rounded mb-1" /> : null}
            <div className="font-semibold text-sm">{p.title || p.name}</div>
            <div className={`text-xs ${badge(p.minScore)}`}>minScore: {p.minScore ?? '—'}</div>
            {p.tags && p.tags.length > 0 ? <div className="text-[11px] opacity-70">{p.tags.join(', ')}</div> : null}
          </button>
        ))}
      </div>
      {sel && (
        <div className="border rounded p-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{sel.title || sel.name}</div>
            {sel.minScore != null && (
              <span className={`text-xs ${badge(sel.minScore)}`}>minScore: {sel.minScore}</span>
            )}
            <button className={`ml-auto underline ${loading ? 'opacity-60 pointer-events-none' : ''}`} onClick={apply}>Apply</button>
          </div>
          {sel.minScore != null && sel.minScore < 70 ? (
            <div className="mt-1 text-xs text-amber-700">Warning: This preset minimum score is below 70</div>
          ) : null}
          {diff && (
            <div className="mt-2">
              <div className="text-xs opacity-70 mb-1">Diff</div>
              <DiffPreview before={diff.split('@@\n-')[1]?.split('\n+')[0]} after={diff.split('\n+')[1]} />
              <button className="underline mt-2" onClick={() => navigator.clipboard.writeText(diff || '')}>Copy .diff</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


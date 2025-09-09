// apps/builder/app/dev/pages/edit/page.tsx
'use client'
import React from 'react'
import SaveBadge from '@/components/common/SaveBadge'
import { sanitizeSlug } from '@/lib/utils/sanitize'

type PageMeta = {
  slug: string
  title: string
  tags: string[]
  description?: string
  hidden?: boolean
  updatedAt: string
  contentHash?: string
}

export default function EditPage() {
  const [slug, setSlug] = React.useState<string>('')
  const [meta, setMeta] = React.useState<PageMeta | null>(null)
  const [title, setTitle] = React.useState('')
  const [tagsText, setTagsText] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [hidden, setHidden] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [msg, setMsg] = React.useState<string | null>(null)
  const [score, setScore] = React.useState<number | null>(null)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('slug') || ''
    setSlug(s)
    async function load() {
      if (!s) return
      try {
        const r = await fetch(`/api/pages/${encodeURIComponent(s)}`, { cache: 'no-store' })
        const j = await r.json()
        if (j?.ok && j.item) {
          const m = j.item as PageMeta
          setMeta(m)
          setTitle(m.title || '')
          setTagsText(Array.isArray(m.tags) ? m.tags.join(', ') : '')
          setDescription(m.description || '')
          setHidden(!!m.hidden)
        }
      } catch {}
      try {
        const r2 = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(s)}`, { cache: 'no-store' })
        const j2 = await r2.json()
        const v = typeof j2?.scores?.average === 'number' ? j2.scores.average : null
        setScore(v)
      } catch {}
    }
    void load()
  }, [])

  const onSave = async () => {
    if (!slug) return
    setSaving(true)
    setMsg(null)
    try {
      const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean)
      const body: Partial<PageMeta> = { title, tags, description: description || undefined, hidden }
      const r = await fetch(`/api/pages/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await r.json()
      if (!r.ok || !j?.ok) throw new Error(String(j?.error || r.status))
      setMsg('Saved')
      setMeta(j.item as PageMeta)
    } catch (err: any) {
      setMsg(`Save failed: ${String(err?.message || err)}`)
    } finally {
      setSaving(false)
    }
  }

  if (!slug) return <main className="p-4 text-sm">Missing slug</main>

  return (
    <main className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Edit Page: {slug}</h1>
        <button data-testid="export-button"
          className="text-xs underline"
          onClick={async () => {
            try {
              const s = sanitizeSlug(slug)
              const res = await fetch(`/api/exports.zip/${encodeURIComponent(s)}`)
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${s}.zip`
              a.click()
              URL.revokeObjectURL(url)
            } catch {}
          }}
        >
          Export
        </button>
        <div className="ml-auto"><SaveBadge data-testid="save-badge" /></div>
      </div>
      {meta ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <label className="block text-sm">
              <span className="block text-xs opacity-70">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded px-2 py-1 w-full" />
            </label>
            <label className="block text-sm">
              <span className="block text-xs opacity-70">Tags (comma separated)</span>
              <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className="border rounded px-2 py-1 w-full" />
            </label>
            <label className="block text-sm">
              <span className="block text-xs opacity-70">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border rounded px-2 py-1 w-full h-24" />
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
              <span>Hidden</span>
            </label>
            <div className="flex items-center gap-2">
              <button disabled={saving} onClick={onSave} className={`px-3 py-1 border rounded text-sm ${saving ? 'opacity-60 pointer-events-none' : ''}`}>Save</button>
              {msg && <span className="text-xs text-gray-600">{msg}</span>}
              <a className="text-sm underline ml-auto" href="/dev/pages">Back to list</a>
            </div>
          </div>
          <div className="space-y-2">
            <div className="border rounded p-2 text-sm">
              <div className="text-xs opacity-70">UI-Audit Score (average)</div>
              <div className="text-xl font-semibold">{score == null ? '—' : Math.round(score)}</div>
            </div>
            <div className="border rounded p-2 text-xs text-gray-600">
              <div className="opacity-70 mb-1">Meta</div>
              <div>updatedAt: {meta.updatedAt}</div>
              {meta.contentHash ? <div>hash: {meta.contentHash}</div> : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600">Loading...</div>
      )}
    </main>
  )
}

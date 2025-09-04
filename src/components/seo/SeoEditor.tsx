'use client'
import React from 'react'
import { usePageStore } from '../../../web/store/pageStore'

export default function SeoEditor() {
  const pageId = usePageStore((s) => s.currentPageId)
  const meta = usePageStore((s) => {
    const p = s.pages.find((p) => p.id === s.currentPageId)
    return p?.meta || { title: '', description: '', ogImage: { mode: 'auto' as const } }
  })
  const setMeta = usePageStore((s) => s.setMeta)
  const update = (patch: any) => setMeta({ ...meta, ...patch })
  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-sm font-medium">SEO</h3>
      <label className="flex flex-col gap-1 text-xs">
        Title
        <input
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
          value={meta.title || ''}
          onChange={(e) => update({ title: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Description
        <textarea
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
          value={meta.description || ''}
          onChange={(e) => update({ description: e.target.value })}
        />
      </label>
      <div className="text-xs">OG Image</div>
      <div className="flex items-center gap-2 text-xs">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={meta.ogImage?.mode !== 'custom'}
            onChange={() => update({ ogImage: { mode: 'auto' } })}
          />
          Auto
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={meta.ogImage?.mode === 'custom'}
            onChange={() => update({ ogImage: { mode: 'custom', url: meta.ogImage?.url || '' } })}
          />
          Custom
        </label>
      </div>
      {meta.ogImage?.mode === 'custom' ? (
        <input
          className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs"
          placeholder="Image URL"
          value={meta.ogImage?.url || ''}
          onChange={(e) => update({ ogImage: { mode: 'custom', url: e.target.value } })}
        />
      ) : (
        <img
          src={`/api/og?pageId=${pageId}`}
          alt="OG preview"
          className="w-full h-32 object-cover border border-dashed border-zinc-700 rounded"
        />
      )}
    </div>
  )
}

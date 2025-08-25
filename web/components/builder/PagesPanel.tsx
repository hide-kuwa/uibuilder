'use client'
import React from 'react'
import { usePageStore } from '@/store/pageStore'

export function PagesPanel() {
  const pages = usePageStore((s) => s.pages)
  const current = usePageStore((s) => s.currentPageId)
  const selectPage = usePageStore((s) => s.selectPage)
  const addPage = usePageStore((s) => s.addPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Pages</h2>
        <button
          className="px-1 text-xs border border-zinc-700 rounded"
          onClick={() => addPage()}
        >
          +
        </button>
      </div>
      <ul className="space-y-1">
        {pages.map((p) => (
          <li key={p.id}>
            <button
              className={`w-full text-left px-2 py-1 rounded text-xs ${
                p.id === current
                  ? 'bg-zinc-700 text-white'
                  : 'bg-transparent text-zinc-300 hover:bg-zinc-800'
              }`}
              onClick={() => selectPage(p.id)}
            >
              {p.title} <span className="text-[10px] text-zinc-400">{p.path}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}


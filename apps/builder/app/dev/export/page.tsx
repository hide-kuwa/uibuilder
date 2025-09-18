// apps/builder/app/dev/export/page.tsx
'use client'
import React from 'react'
import { ExportButton } from '@/components/ExportButton'
// --- append-only: autosave mount import ---
import { AutosaveMount } from '@/components/AutosaveMount'
import { ExportButtonDeterministic } from '@/components/ExportButtonDeterministic'
import { ExportHashPreview } from '@/components/ExportHashPreview'

export default function Page() {
  // TODO: replace with builder store; temporary dummy
  const getPage = () => ({ id: 'sample', title: 'Sample', content: [] })
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-lg font-semibold">Export (dev)</h1>
      <ExportButton getPage={getPage} />
      {/* --- append-only: autosave mount --- */}
      <AutosaveMount page={getPage()} />
      <div style={{ marginTop: 16 }}>
        <ExportButtonDeterministic getPage={getPage} />
      </div>
      <ExportHashPreview page={getPage()} />
      <p className="text-sm opacity-70">※ ストア接続前の暫定版です。</p>
    </main>
  )
}

// --- append-only: tags input + POST body augmentation for export ---
;(() => {
  if (typeof window === 'undefined') return
  const w = window as any
  if (w.__exportTagsInjected) return
  w.__exportTagsInjected = true

  let tagsText = ''
  let inputEl: HTMLInputElement | null = null

  const findMount = () => {
    const h1s = Array.from(document.querySelectorAll('h1')) as HTMLHeadingElement[]
    const h1 = h1s.find((n) => (n.textContent || '').includes('Export'))
    return h1?.parentElement || document.body
  }

  const renderUI = () => {
    const mount = findMount()
    if (!mount) return
    if (mount.querySelector('[data-export-tags]')) return
    const wrap = document.createElement('div')
    wrap.setAttribute('data-export-tags', '1')
    wrap.className = 'w-full'
    const label = document.createElement('label')
    label.className = 'block text-sm mb-1'
    label.textContent = 'Tags (comma separated):'
    inputEl = document.createElement('input')
    inputEl.type = 'text'
    inputEl.placeholder = 'example: travel, summer, JP'
    inputEl.className = 'text-sm px-2 py-1 border rounded mb-2 w-full'
    inputEl.addEventListener('input', () => { tagsText = inputEl!.value })
    wrap.appendChild(label)
    wrap.appendChild(inputEl)
    // insert after h1 if present, else prepend
    const h1 = mount.querySelector('h1')
    if (h1?.parentElement) {
      h1.parentElement.insertBefore(wrap, h1.nextSibling)
    } else {
      mount.insertBefore(wrap, mount.firstChild)
    }
  }

  const origFetch = window.fetch.bind(window)
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as URL).toString?.() ?? ''
    const isExport = /\/api\/export(\?|$)/.test(url)
    if (!isExport) return origFetch(input as any, init as any)
    // ensure UI exists
    renderUI()
    const nextInit: RequestInit = { ...(init || {}) }
    try {
      const current = (tagsText || '').split(',').map((t) => t.trim()).filter(Boolean)
      if (typeof nextInit.body === 'string') {
        try {
          const parsed = JSON.parse(nextInit.body as string)
          nextInit.body = JSON.stringify({ ...parsed, tags: current })
        } catch {
          nextInit.body = JSON.stringify({ tags: current })
        }
      } else if (!nextInit.body) {
        nextInit.body = JSON.stringify({ tags: current })
      }
      if (!nextInit.headers) nextInit.headers = { 'Content-Type': 'application/json' }
      if (nextInit.headers && typeof nextInit.headers === 'object' && !(nextInit.headers as any)['Content-Type']) {
        ;(nextInit.headers as any)['Content-Type'] = 'application/json'
      }
    } catch {
      // ignore augmentation errors; fall back to original
    }
    return origFetch(input as any, nextInit as any)
  }) as any

  // mount on load and after small delays to be safe
  const init = () => renderUI()
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
  setTimeout(init, 0)
  setTimeout(init, 300)
})()

'use client'
import React, { useRef, useState } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { encodeShare, serializeProject } from '@/lib/share'

export function ShareMenu() {
  const state = useBuilderStore(s => ({ elements: s.elements, meta: s.meta }))
  const [msg, setMsg] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  React.useEffect(() => { setMounted(true) }, [])

  function currentUrl() {
    // Build relative URL; compute only after mount to keep SSR/CSR markup identical
    return '/preview?d=' + encodeShare(serializeProject(state))
  }

  async function copyUrl() {
    const url = currentUrl()
    await navigator.clipboard.writeText(url)
    setMsg('Copied')
    setTimeout(() => setMsg(''), 1200)
  }

  async function exportJson() {
    const data = serializeProject(state)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `project-${data.createdAt}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importJson(file: File | null) {
    if (!file) return
    const txt = await file.text()
    try {
      const parsed = JSON.parse(txt)
      if (parsed?.elements) {
        useBuilderStore.setState({ elements: parsed.elements, tree: parsed.elements, meta: parsed.meta ?? {} })
        setMsg('Imported')
        setTimeout(() => setMsg(''), 1200)
      }
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <button className="border rounded px-2 h-7" onClick={copyUrl}>Copy URL</button>
      <a
        className="border rounded px-2 h-7 flex items-center"
        href={mounted ? currentUrl() : '#'}
        target="_blank"
        rel="noreferrer"
      >
        Preview
      </a>
      <button className="border rounded px-2 h-7" onClick={exportJson}>Export JSON</button>
      <button className="border rounded px-2 h-7" onClick={() => fileRef.current?.click()}>Import JSON</button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => importJson(e.target.files?.[0] ?? null)} />
      {msg && <span className="text-xs text-green-500">{msg}</span>}
    </div>
  )
}

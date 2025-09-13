'use client'
import React, { useRef } from 'react'
import { exportDocAsFile } from '@/lib/io/exportDoc'
import { importDocFromFile, type ImportMode } from '@/lib/io/importDoc'

export default function ExportImportButtons() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const onExport = async () => {
    try { await exportDocAsFile() } catch (e) { console.error(e) }
  }
  const onImportClick = () => fileRef.current?.click()
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const mode: ImportMode = window.confirm('Import mode: OK=Overwrite, Cancel=Merge') ? 'overwrite' : 'merge'
      const m = await importDocFromFile(f, mode)
      toast('Import completed', m.notes?.length ? `Notes: ${m.notes.join('; ')}` : undefined)
    } catch (err) {
      toast('Import failed', err instanceof Error ? err.message : String(err))
    } finally {
      e.target.value = ''
    }
  }
  return (
    <div className="flex items-center gap-2">
      <button className="btn" onClick={onExport}>Export</button>
      <button className="btn" onClick={onImportClick}>Import</button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
    </div>
  )
}

function toast(title: string, description?: string) {
  try {
    // shadcn style toast if wired globally
    // @ts-expect-error runtime probing
    const t = (globalThis as any)?.useToast?.().toast as undefined | ((opts: { title?: string; description?: string }) => void)
    if (t) return t({ title, description })
  } catch {}
  try {
    // global toast fallback
    // @ts-expect-error runtime probing
    const g = (window as any).__toast as undefined | ((msg: string) => void)
    if (g) return g(title)
  } catch {}
  console.info(`[toast] ${title}${description ? ' — ' + description : ''}`)
}


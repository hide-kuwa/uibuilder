'use client'
import { useRef } from 'react'
import { useAutoSave } from '@/components/hooks/useAutoSave'
import { loadLatest } from '@/lib/idb'

type Props = { projectId: string; schemaVersion: number }

export function SaveIndicator({ projectId, schemaVersion }: Props) {
  const st = useAutoSave(projectId, schemaVersion)
  const fileRef = useRef<HTMLInputElement | null>(null)

  async function exportJson() {
    const latest = await loadLatest(projectId)
    const blob = new Blob([JSON.stringify(latest?.data ?? {}, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJson(file: File | null) {
    if (!file) return
    const txt = await file.text()
    let data: any
    try { data = JSON.parse(txt) } catch { return }
    ;(window as any).useBuilderStore?.setState ? (window as any).useBuilderStore.setState({ ...(data || {}) }) : null
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span>{st.saving ? '保存中…' : st.error ? '保存エラー' : st.lastSavedAt ? '保存済み' : '待機中'}</span>
      <button className="border rounded px-2 h-7" onClick={exportJson}>エクスポート</button>
      <button className="border rounded px-2 h-7" onClick={()=>fileRef.current?.click()}>インポート</button>
      <button className="border rounded px-2 h-7" onClick={()=>location.reload()}>再読み込み</button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e)=>importJson(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

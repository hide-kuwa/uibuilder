'use client'
import React, { useState } from 'react'
import { usePrefPaint } from '@/store/prefPaintStore'

export default function SaveMapBar() {
  const exportB64 = usePrefPaint(s => s.exportB64)
  const importB64 = usePrefPaint(s => s.importB64)
  const [msg, setMsg] = useState<string | null>(null)

  const save = () => {
    const b64 = exportB64()
    localStorage.setItem('prefPaintB64', b64)
    const p = b64
    const share = `${location.origin}/s/p/${p}`
    navigator.clipboard?.writeText(share)
    setMsg('保存してリンクコピー')
    setTimeout(() => setMsg(null), 1000)
  }

  const load = () => {
    const b64 = localStorage.getItem('prefPaintB64')
    if (b64) {
      importB64(b64)
      setMsg('読み込んだよ')
    } else {
      setMsg('保存なし')
    }
    setTimeout(() => setMsg(null), 1000)
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <button className="px-2 py-1 border rounded" onClick={save}>
        保存
      </button>
      <button className="px-2 py-1 border rounded" onClick={load}>
        読み込み
      </button>
      {msg && <span className="text-muted-foreground">{msg}</span>}
    </div>
  )
}

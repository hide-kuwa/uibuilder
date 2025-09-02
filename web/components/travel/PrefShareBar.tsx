'use client'
import React, { useEffect, useState } from 'react'
import { usePrefPaint } from '@/store/prefPaintStore'

export default function PrefShareBar() {
  const exportB64 = usePrefPaint(s => s.exportB64)
  const importB64 = usePrefPaint(s => s.importB64)
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    const b64 = exportB64()
    const url = new URL(location.href)
    url.searchParams.set('p', b64)
    navigator.clipboard?.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  useEffect(() => {
    const p = new URLSearchParams(location.search).get('p')
    if (p) importB64(p)
  }, [importB64])

  return (
    <div className="flex items-center gap-2 text-xs">
      <button className="px-2 py-1 border rounded" onClick={copyLink}>
        {copied ? 'コピーした！' : 'シェアリンクをコピー'}
      </button>
      <span className="text-muted-foreground">リンクを送れば同じ塗りが再現されるよ</span>
    </div>
  )
}

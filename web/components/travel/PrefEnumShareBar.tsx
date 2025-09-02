'use client'
import React, { useEffect, useState } from 'react'
import { usePrefPaintEnum } from '@/store/prefPaintEnumStore'

export default function PrefEnumShareBar() {
  const exportEnumB64 = usePrefPaintEnum(s => s.exportEnumB64)
  const importEnumB64 = usePrefPaintEnum(s => s.importEnumB64)
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    const b64 = exportEnumB64()
    const url = new URL(location.href)
    url.searchParams.set('pe', b64) // enum: paint enum
    navigator.clipboard?.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  useEffect(() => {
    const pe = new URLSearchParams(location.search).get('pe')
    if (pe) importEnumB64(pe)
  }, [importEnumB64])

  return (
    <div className="flex items-center gap-2 text-xs">
      <button className="px-2 py-1 border rounded" onClick={copyLink}>
        {copied ? 'コピーした！' : 'シェア（enum）'}
      </button>
      <span className="text-muted-foreground">?pe= を使って列挙塗りを共有</span>
    </div>
  )
}

'use client'
import React, { useEffect, useState } from 'react'
import { usePrefPaint } from '@/store/prefPaintStore'
import { createMap, onUser } from '@/services/travel'

export default function PrefShareBar() {
  const exportB64 = usePrefPaint(s => s.exportB64)
  const importB64 = usePrefPaint(s => s.importB64)
  const [user, setUser] = useState<any>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => onUser(setUser), [])

  const saveLink = async () => {
    const b64 = exportB64()
    if (!user) {
      setMsg('ログインしてね')
      setTimeout(() => setMsg(null), 1000)
      return
    }
    const id = await createMap(user.uid, { paintB64: b64 })
    const p = b64
    const share = `${location.origin}/s/p/${p}`
    const doc = `${location.origin}/u/${user.uid}/m/${id}`
    await navigator.clipboard?.writeText(share)
    void doc
    setMsg('コピーした！')
    setTimeout(() => setMsg(null), 1000)
  }

  useEffect(() => {
    const p = new URLSearchParams(location.search).get('p')
    if (p) importB64(p)
  }, [importB64])

  return (
    <div className="flex items-center gap-2 text-xs">
      <button className="px-2 py-1 border rounded" onClick={saveLink}>
        {msg ? msg : '保存してリンクをコピー'}
      </button>
      <span className="text-muted-foreground">リンクを送れば同じ塗りが再現されるよ</span>
    </div>
  )
}

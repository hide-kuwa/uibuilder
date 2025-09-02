'use client'
import React, { useEffect, useState } from 'react'
import { usePrefPaintEnum } from '@/store/prefPaintEnumStore'
import { onUser, createMap } from '@/services/travel'

export default function SaveMapBarEnum() {
  const exportEnumB64 = usePrefPaintEnum(s => s.exportEnumB64)
  const [uid, setUid] = useState<string | undefined>()
  const [link, setLink] = useState<string>('')

  useEffect(() => onUser(u => setUid(u?.uid)), [])

  const save = async () => {
    if (!uid) return alert('ログインしてください')
    const id = await createMap(uid, {
      title: '列挙ぬりマップ',
      paintB64: exportEnumB64(), // ← 既存フィールドにそのまま保存（互換読み込みは後述）
      visibility: 'public',
    })
    const url = `${location.origin}/u/${uid}/m/${id}`
    setLink(url)
    await navigator.clipboard?.writeText(url)
    alert('保存してリンクをコピーしました')
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <button className="px-2 py-1 border rounded" onClick={save}>
        保存してリンクコピー
      </button>
      {link && <a className="underline" href={link}>開く</a>}
    </div>
  )
}

'use client'
import React, { useEffect, useState } from 'react'
import { usePrefPaintEnum } from '@/store/prefPaintEnumStore'
import { onUser, createMap } from '@/services/travel'
import { useMapTheme } from '@/contexts/MapThemeContext'

export default function SaveMapBarEnum() {
  const exportEnumB64 = usePrefPaintEnum(s => s.exportEnumB64)
  const [uid, setUid] = useState<string | undefined>()
  const [link, setLink] = useState<string>('')
  const { paletteId = 'default' } = useMapTheme()

  useEffect(() => onUser(u => setUid(u?.uid)), [])

  const save = async () => {
    if (!uid) return alert('ログインしてください')
    const id = await createMap(uid, {
      title: '列挙ぬりマップ',
      paintB64: exportEnumB64(), // ← 既存フィールドにそのまま保存（互換読み込みは後述）
      visibility: 'public',
    })
    const pe = exportEnumB64()
    const share = `${location.origin}/s/${pe}?t=${paletteId}`                    // ← 共有は /s/[pe]?t=...
    const doc = `${location.origin}/u/${uid}/m/${id}`            // ← 詳細ページも保持
    setLink(share)
    await navigator.clipboard?.writeText(share)
    void doc
    alert('保存して共有リンクをコピーしました')
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

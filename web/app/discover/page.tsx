'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { listPublicMaps, getUserProfile, type MapDoc } from '@/services/travel'

type CardItem = MapDoc & { ownerName?: string; ownerIcon?: string }

export default function DiscoverPage() {
  const [items, setItems] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const m = await listPublicMaps(30)
      const withNames = await Promise.all(
        m.map(async it => {
          const prof = await getUserProfile(it._owner!)
          return {
            ...it,
            ownerName: prof?.displayName ?? it._owner,
            ownerIcon: prof?.photoURL,
          }
        }),
      )
      setItems(withNames)
      setLoading(false)
    })()
  }, [])

  return (
    <div className="p-6 mx-auto max-w-4xl space-y-4">
      <h1 className="text-xl font-bold">Discover – 公開マップ</h1>
      {loading ? (
        <p>読み込み中…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {items.map(it => (
            <div key={`${it._owner}/${it._id}`} className="border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                {it.ownerIcon && <img src={it.ownerIcon} className="w-6 h-6 rounded-full" alt="" />}
                <span className="text-sm">{it.ownerName}</span>
              </div>
              <div className="font-medium">{it.title ?? 'Untitled Map'}</div>
              <div className="text-xs text-muted-foreground mb-2">visibility: {it.visibility}</div>
              <Link className="text-sm underline" href={`/u/${it._owner}/m/${it._id}`}>開く</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { onUser } from '@/services/travel'
import { listFollowingFeed, getUserProfile, type MapDoc } from '@/services/travel'

type CardItem = MapDoc & { ownerName?: string; ownerIcon?: string }

export default function FeedPage() {
  const [me, setMe] = useState<string | null>(null)
  const [items, setItems] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => onUser(u => setMe(u?.uid ?? null)), [])
  useEffect(() => {
    if (!me) { setItems([]); setLoading(false); return }
    ;(async () => {
      setLoading(true)
      const maps = await listFollowingFeed(me, 5)
      const withNames = await Promise.all(maps.map(async m => {
        const prof = await getUserProfile(m._owner!)
        return { ...m, ownerName: prof?.displayName ?? m._owner, ownerIcon: prof?.photoURL }
      }))
      setItems(withNames)
      setLoading(false)
    })()
  }, [me])

  if (!me) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-2">フォロー中の新着</h1>
        <p className="text-sm text-muted-foreground">ログインすると、承認されたユーザーの新着マップが表示されます。</p>
        <p className="mt-4"><a className="underline" href="/discover">Discover を見る</a></p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">フォロー中の新着</h1>
      {loading ? <p>読み込み中…</p> : items.length ? (
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
      ) : (
        <div className="text-sm text-muted-foreground">
          まだフィードに表示できるマップがありません。<br />
          <a className="underline" href="/discover">Discover</a> から公開ユーザーを見つけてフォロー申請→承認してもらってね。
        </div>
      )}
    </div>
  )
}

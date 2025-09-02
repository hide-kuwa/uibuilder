'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { listUserMaps, getUserProfile, type MapDoc } from '@/services/travel'
import { onUser } from '@/services/travel'

export default function UserProfilePage({ params }: { params: { uid: string } }) {
  const uid = params.uid
  const [maps, setMaps] = useState<MapDoc[]>([])
  const [me, setMe] = useState<string | undefined>()
  const [prof, setProf] = useState<{ displayName?: string; photoURL?: string } | null>(null)
  useEffect(() => onUser(u => setMe(u?.uid ?? undefined)), [])
  useEffect(() => {
    ;(async () => {
      setProf(await getUserProfile(uid))
      setMaps(await listUserMaps(uid))
    })()
  }, [uid])

  const isOwner = me === uid

  return (
    <div className="p-6 mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        {prof?.photoURL && <img src={prof.photoURL} className="w-12 h-12 rounded-full" alt="" />}
        <div>
          <div className="text-xl font-bold">{prof?.displayName ?? uid}</div>
          {!isOwner && (
            <Link className="text-sm underline" href={`/u/${uid}/m/new`}>
              このユーザーの新着をみる（準備中）
            </Link>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-2">マップ</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {maps.map(m => (
          <div key={m._id} className="border rounded-xl p-3">
            <div className="font-medium">{m.title ?? 'Untitled Map'}</div>
            <div className="text-xs text-muted-foreground mb-2">visibility: {m.visibility}</div>
            <Link className="text-sm underline" href={`/u/${uid}/m/${m._id}`}>
              開く
            </Link>
          </div>
        ))}
      </div>
      {!maps.length && <div className="text-sm text-muted-foreground">まだマップがありません</div>}
    </div>
  )
}

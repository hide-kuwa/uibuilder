'use client'
import React, { useRef, useState, useEffect } from 'react'
import { uploadMapPhoto } from '@/services/travel'
import { db } from '@/lib/firebase.client'
import { collection, onSnapshot } from 'firebase/firestore'

export default function PhotoUploader({
  uid,
  mapId,
}: {
  uid: string
  mapId: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [photos, setPhotos] = useState<{ url: string }[]>([])
  useEffect(() =>
    onSnapshot(collection(db, 'users', uid, 'maps', mapId, 'photos'), s => {
      setPhotos(s.docs.map(d => d.data() as any))
    }),
  [uid, mapId])
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true)
    try {
      await uploadMapPhoto(uid, mapId, f)
    } finally {
      setBusy(false)
    }
    inputRef.current!.value = ''
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={pick}
          className="hidden"
        />
        <button
          className="px-3 py-2 border rounded"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'アップ中…' : '写真を追加'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <img
            key={i}
            src={p.url}
            alt=""
            className="w-full h-24 object-cover rounded border"
          />
        ))}
      </div>
    </div>
  )
}

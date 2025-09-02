'use client'
import React, { useEffect, useState } from 'react'
import { uploadMapPhoto, getMapPhotos, onUser } from '@/services/travel'

type Props = { uid: string; mapId: string }

export default function PhotoUploader({ uid, mapId }: Props) {
  const [photos, setPhotos] = useState<string[]>([])
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    getMapPhotos(uid, mapId).then(setPhotos)
    return onUser(u => setIsOwner(u?.uid === uid))
  }, [uid, mapId])

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = await uploadMapPhoto(uid, mapId, file)
      setPhotos(p => [...p, url])
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2 text-xs">
      {isOwner && <input type="file" accept="image/*" onChange={upload} />}
      <div className="flex gap-2 flex-wrap">
        {photos.map((p, i) => (
          <img key={i} src={p} className="w-24 h-24 object-cover" />
        ))}
      </div>
    </div>
  )
}

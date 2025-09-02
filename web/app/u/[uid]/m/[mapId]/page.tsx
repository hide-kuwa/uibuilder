'use client'
import React, { useEffect, useState } from 'react'
import PrefGridMap from '@/components/travel/PrefGridMap'
import FollowButton from '@/components/travel/FollowButton'
import VisibilityToggle from '@/components/travel/VisibilityToggle'
import PhotoUploader from '@/components/travel/PhotoUploader'
import ApproveFollower from '@/components/travel/ApproveFollower'
import { usePrefPaint } from '@/store/prefPaintStore'
import { getMap, onUser } from '@/services/travel'

export default function MapPage({ params }: { params: { uid: string; mapId: string } }) {
  const importB64 = usePrefPaint(s => s.importB64)
  const [allowed, setAllowed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => onUser(setUser), [])

  useEffect(() => {
    getMap(params.uid, params.mapId).then(b64 => {
      if (b64) {
        importB64(b64)
        setAllowed(true)
      }
      setLoaded(true)
    })
  }, [params.uid, params.mapId, importB64])

  const isOwner = user?.uid === params.uid

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">塗り地図</h1>
      {!isOwner && <FollowButton ownerUid={params.uid} />}
      {allowed ? (
        <div className="space-y-2">
          {isOwner && (
            <VisibilityToggle uid={params.uid} mapId={params.mapId} />
          )}
          <PrefGridMap />
          <PhotoUploader uid={params.uid} mapId={params.mapId} />
          {isOwner && <ApproveFollower ownerUid={params.uid} />}
        </div>
      ) : (
        loaded && <p className="text-sm">閲覧できません</p>
      )}
    </div>
  )
}


'use client'
import React, { useEffect, useState } from 'react'
import PrefGridMap from '@/components/travel/PrefGridMap'
import { FollowButton } from '@/components/travel/FollowControls'
import VisibilityToggle from '@/components/travel/VisibilityToggle'
import PhotoUploader from '@/components/travel/PhotoUploader'
import { usePrefPaint } from '@/store/prefPaintStore'
import { getMap, onUser } from '@/services/travel'
import DownloadPNG from '@/components/util/DownloadPNG'

export default function MapPage({
  params,
}: {
  params: { uid: string; mapId: string }
}) {
  const importB64 = usePrefPaint(s => s.importB64)
  const [allowed, setAllowed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public')

  useEffect(() => onUser(setUser), [])

  useEffect(() => {
    getMap(params.uid, params.mapId)
      .then(doc => {
        if (doc) {
          importB64(doc.paintB64)
          setVisibility(doc.visibility)
          setAllowed(true)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [params.uid, params.mapId, importB64])

  const isOwner = user?.uid === params.uid

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">塗り地図</h1>
      {!allowed && !isOwner && <FollowButton ownerUid={params.uid} />}
      {allowed ? (
        <div id="mapCard" className="rounded-2xl border shadow-sm p-4 space-y-3 bg-background">
          {isOwner && (
            <VisibilityToggle
              uid={params.uid}
              mapId={params.mapId}
              value={visibility}
            />
          )}
          <PrefGridMap />
          {isOwner && <PhotoUploader uid={params.uid} mapId={params.mapId} />}
          <div className="flex items-center gap-2">
            <DownloadPNG targetId="mapCard" fileName={`${params.uid}-${params.mapId}.png`} />
          </div>
        </div>
      ) : (
        loaded && <p className="text-sm">閲覧できません</p>
      )}
    </div>
  )
}

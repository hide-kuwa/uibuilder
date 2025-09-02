'use client'
import React, { useEffect } from 'react'
import PrefGridMap from '@/components/travel/PrefGridMap'
import { usePrefPaint } from '@/store/prefPaintStore'
import { getMap } from '@/services/travel'

export default function MapPage({ params }: { params: { uid: string; mapId: string } }) {
  const importB64 = usePrefPaint(s => s.importB64)

  useEffect(() => {
    getMap(params.uid, params.mapId).then(b64 => {
      if (b64) importB64(b64)
    })
  }, [params.uid, params.mapId, importB64])

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">塗り地図</h1>
      <PrefGridMap />
    </div>
  )
}


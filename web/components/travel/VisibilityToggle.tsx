'use client'
import React, { useEffect, useState } from 'react'
import { getVisibility, setVisibility } from '@/services/travel'

type Props = { uid: string; mapId: string }

export default function VisibilityToggle({ uid, mapId }: Props) {
  const [vis, setVis] = useState<'public' | 'followers' | 'private'>('public')

  useEffect(() => {
    getVisibility(uid, mapId).then(v => setVis(v))
  }, [uid, mapId])

  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as 'public' | 'followers' | 'private'
    setVis(v)
    setVisibility(uid, mapId, v)
  }

  return (
    <select value={vis} onChange={change} className="border rounded p-1 text-xs">
      <option value="public">public</option>
      <option value="followers">followers</option>
      <option value="private">private</option>
    </select>
  )
}

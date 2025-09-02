'use client'
import React from 'react'
import { setVisibility } from '@/services/travel'

export default function VisibilityToggle({
  uid,
  mapId,
  value,
}: {
  uid: string
  mapId: string
  value: 'public' | 'followers' | 'private'
}) {
  return (
    <select
      className="border rounded px-2 py-1"
      defaultValue={value}
      onChange={e => setVisibility(uid, mapId, e.target.value as any)}
    >
      <option value="public">公開</option>
      <option value="followers">フォロワーのみ</option>
      <option value="private">非公開</option>
    </select>
  )
}

'use client'
import React, { useEffect, useState } from 'react'
import { PendingFollowers } from '@/components/travel/FollowControls'
import { onUser } from '@/services/travel'

export default function FollowersSettingsPage() {
  const [uid, setUid] = useState<string | null>(null)
  useEffect(() => onUser(u => setUid(u?.uid ?? null)), [])
  if (!uid) return null
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">フォロー承認</h1>
      <PendingFollowers meUid={uid} />
    </div>
  )
}

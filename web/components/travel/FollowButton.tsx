'use client'
import React, { useEffect, useState } from 'react'
import { onUser, requestFollow, isFollower, hasPendingFollow } from '@/services/travel'

type Props = { ownerUid: string }

export default function FollowButton({ ownerUid }: Props) {
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState<'none' | 'pending' | 'follow'>('none')

  useEffect(() => onUser(setUser), [])

  useEffect(() => {
    if (user) {
      if (isFollower(ownerUid, user.uid)) setStatus('follow')
      else if (hasPendingFollow(ownerUid, user.uid)) setStatus('pending')
    }
  }, [user, ownerUid])

  const req = async () => {
    await requestFollow(ownerUid)
    setStatus('pending')
  }

  if (!user || user.uid === ownerUid) return null

  return (
    <button
      className="px-2 py-1 border rounded text-xs"
      onClick={req}
      disabled={status !== 'none'}
    >
      {status === 'pending'
        ? '申請中'
        : status === 'follow'
        ? 'フォロー中'
        : 'フォロー申請'}
    </button>
  )
}

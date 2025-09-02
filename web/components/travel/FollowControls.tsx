'use client'
import React, { useEffect, useState } from 'react'
import { requestFollow, approveFollower, onUser } from '@/services/travel'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

export function FollowButton({ ownerUid }: { ownerUid: string }) {
  const [me, setMe] = useState<string | null>(null)
  useEffect(() => onUser(u => setMe(u?.uid ?? null)), [])
  if (!me || me === ownerUid) return null
  return (
    <button className="px-3 py-2 border rounded" onClick={() => requestFollow(ownerUid)}>
      フォロー申請
    </button>
  )
}

export function PendingFollowers({ meUid }: { meUid: string }) {
  const [reqs, setReqs] = useState<any[]>([])
  useEffect(() => {
    const q = query(
      collection(db, 'users', meUid, 'followers'),
      where('status', '==', 'requested'),
    )
    return onSnapshot(q, snap =>
      setReqs(snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) }))),
    )
  }, [meUid])
  if (!reqs.length)
    return <div className="text-xs text-muted-foreground">申請はありません</div>
  return (
    <div className="space-y-2">
      {reqs.map(r => (
        <div key={r.uid} className="flex items-center gap-2 text-sm">
          <span>{r.uid}</span>
          <button
            className="px-2 py-1 border rounded"
            onClick={() => approveFollower(r.uid)}
          >
            承認
          </button>
        </div>
      ))}
    </div>
  )
}

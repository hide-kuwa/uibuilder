'use client'
import React, { useEffect, useState } from 'react'
import { getFollowRequests, approveFollower } from '@/services/travel'

type Props = { ownerUid: string }

export default function ApproveFollower({ ownerUid }: Props) {
  const [reqs, setReqs] = useState<string[]>([])

  const load = () => {
    getFollowRequests(ownerUid).then(setReqs)
  }

  useEffect(load, [ownerUid])

  const approve = async (uid: string) => {
    await approveFollower(ownerUid, uid)
    load()
  }

  if (reqs.length === 0) return null

  return (
    <div className="space-y-1 text-xs">
      {reqs.map(r => (
        <div key={r} className="flex items-center gap-2">
          <span>{r}</span>
          <button className="px-1 border rounded" onClick={() => approve(r)}>
            承認
          </button>
        </div>
      ))}
    </div>
  )
}

'use client'
import { useEffect } from 'react'
import { useSaveStore } from '@/stores/saveQueue'

export default function SaveBadge() {
  const { offline, queued, lastSavedAt, boot } = useSaveStore()
  useEffect(() => {
    void boot()
  }, [boot])
  return (
    <div className="text-xs px-2 py-1 rounded border inline-flex items-center gap-2">
      <span>{offline ? 'Offline' : 'Online'}</span>
      <span>Queue:{queued}</span>
      {lastSavedAt ? <span>{new Date(lastSavedAt).toLocaleTimeString()}</span> : null}
    </div>
  )
}


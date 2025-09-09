'use client'
import { create } from 'zustand'
import { db } from '@/lib/db/dexie'

const now = () => Date.now()

type SaveState = {
  offline: boolean
  queued: number
  lastSavedAt?: number
  queueChange: (id: string, data: any) => Promise<void>
  flush: () => Promise<void>
  boot: () => Promise<void>
}

export const useSaveStore = create<SaveState>(() => ({
  offline: typeof navigator !== 'undefined' && !navigator.onLine,
  queued: 0,
  async queueChange(id, data) {
    await db.drafts.put({ id, data, updatedAt: now() })
    const send = async () =>
      fetch(`/api/drafts/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data, updatedAt: now() }),
      })
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await send()
      } catch {
        await db.outbox.add({ target: `/api/drafts/${id}`, method: 'PUT', body: { data, updatedAt: now() }, createdAt: now() })
      }
    } else {
      await db.outbox.add({ target: `/api/drafts/${id}`, method: 'PUT', body: { data, updatedAt: now() }, createdAt: now() })
    }
    const cnt = await db.outbox.count()
    ;(useSaveStore as any).setState({ queued: cnt })
  },
  async flush() {
    const items = await db.outbox.toArray()
    for (const it of items) {
      try {
        await fetch(it.target, { method: it.method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(it.body) })
        await db.outbox.delete(it.id!)
      } catch {
        break
      }
    }
    const cnt = await db.outbox.count()
    ;(useSaveStore as any).setState({ queued: cnt, lastSavedAt: now() })
  },
  async boot() {
    const cnt = await db.outbox.count()
    ;(useSaveStore as any).setState({ queued: cnt })
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        ;(useSaveStore as any).setState({ offline: false })
        useSaveStore.getState().flush()
      })
      window.addEventListener('offline', () => {
        ;(useSaveStore as any).setState({ offline: true })
      })
    }
  },
}))


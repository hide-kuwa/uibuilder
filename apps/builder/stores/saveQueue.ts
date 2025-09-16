'use client'
import { create } from 'zustand'
import { db } from '@/lib/db/dexie'

const now = () => Date.now()

type SaveState = {
  offline: boolean
  queued: number
  lastSavedAt?: number
  lastWriteTs?: number
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
    useSaveStore.setState({ queued: cnt })
  },
  async flush() {
    const items = await db.outbox.toArray()
    let lastWrite: number | undefined
    for (const it of items) {
      try {
        await fetch(it.target, { method: it.method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(it.body) })
        await db.outbox.delete(it.id!)
        const candidate = typeof (it.body as any)?.updatedAt === 'number' ? Number((it.body as any).updatedAt) : undefined
        lastWrite = typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : now()
      } catch {
        break
      }
    }
    const cnt = await db.outbox.count()
    const savedAt = now()
    useSaveStore.setState({ queued: cnt, lastSavedAt: savedAt, lastWriteTs: lastWrite ?? savedAt })
  },
  async boot() {
    const cnt = await db.outbox.count()
    useSaveStore.setState({ queued: cnt })
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        useSaveStore.setState({ offline: false })
        useSaveStore.getState().flush()
      })
      window.addEventListener('offline', () => {
        useSaveStore.setState({ offline: true })
      })
    }
  },
}))

export function recordSavedAt(savedAt: number, lastWriteTs?: number) {
  useSaveStore.setState({ lastSavedAt: savedAt, lastWriteTs })
}


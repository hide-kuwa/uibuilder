export type OutboxItem = { id: string; target?: string; body: any }

export function createOutbox() {
  const q: OutboxItem[] = []
  return {
    async enqueue(it: OutboxItem) {
      q.push(it)
    },
    async size() {
      return q.length
    },
    async peek() {
      return q[0]
    },
    async shift() {
      return q.shift()
    },
  }
}

export async function flushQueue(
  ob: ReturnType<typeof createOutbox>,
  client: { post: (url: string, body: any) => Promise<{ ok: boolean }> } = { post: async () => ({ ok: true }) }
) {
  let item = await ob.peek()
  while (item) {
    try {
      const res = await client.post(item.target || '/draft', item.body)
      if (!res.ok) throw new Error('post failed')
      await ob.shift()
    } catch (e) {
      // retry once per item
      try {
        const res2 = await client.post(item.target || '/draft', item.body)
        if (!res2.ok) throw new Error('post failed')
        await ob.shift()
      } catch {
        break
      }
    }
    item = await ob.peek()
  }
}

// append-only: optional cancel-aware helper (既存APIは不変)
export type CancelToken = { cancelled: boolean }
export const createCancelToken = (): CancelToken => ({ cancelled: false })
export async function flushQueueCancellable<T>(
  items: T[],
  consume: (x: T) => Promise<void> | void,
  token: CancelToken
) {
  for (const it of items) {
    if (token.cancelled) break
    await consume(it)
  }
}

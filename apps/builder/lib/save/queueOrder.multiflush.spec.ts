import { describe, it, expect, vi } from 'vitest'
import { createOutbox, flushQueue } from './outbox'

describe('outbox FIFO across multi-flush with retry', () => {
  it('keeps order when #2 fails then retries', async () => {
    const ob = createOutbox()
    await ob.enqueue({ id: '1', body: { id: '1', a: 1 } })
    await ob.enqueue({ id: '2', body: { id: '2', b: 2 } })

    const post = vi
      .fn()
      .mockResolvedValueOnce({ ok: true }) // id 1
      .mockRejectedValueOnce(new Error('net')) // id 2 (fail)
      .mockResolvedValueOnce({ ok: true }) // id 2 retry

    // First flush (our implementation retries within the same flush)
    await flushQueue(ob, { post: post as any })
    expect(post.mock.calls.map((c: any[]) => c[1].id)).toEqual(['1', '2', '2'])
    expect(await ob.size()).toBe(0)

    // Second flush (no-ops, but keeps order invariant)
    await flushQueue(ob, { post: post as any })
    expect(post.mock.calls[2][1].id).toBe('2')
    expect(await ob.size()).toBe(0)
  })
})


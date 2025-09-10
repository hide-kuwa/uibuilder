import { describe, it, expect, vi } from 'vitest'
import { createOutbox, flushQueue } from './outbox'

describe('outbox FIFO order', () => {
  it('posts in enqueue order', async () => {
    const ob = createOutbox()
    await ob.enqueue({ id: '1', body: { id: '1', a: 1 } })
    await ob.enqueue({ id: '2', body: { id: '2', b: 2 } })
    const post = vi.fn().mockResolvedValue({ ok: true })
    await flushQueue(ob, { post: post as any })
    expect(post.mock.calls.map((c: any[]) => c[1].id)).toEqual(['1', '2'])
  })
})

import { describe, it, expect, vi } from 'vitest'
import { createOutbox, flushQueue } from './outbox'

describe('outbox', () => {
  it('flush retries on failure, then succeeds', async () => {
    const ob = createOutbox()
    await ob.enqueue({ id: '1', body: { foo: 'bar' } })

    const post = vi
      .fn()
      .mockRejectedValueOnce(new Error('net'))
      .mockResolvedValueOnce({ ok: true })

    await flushQueue(ob, { post: async (_url, body) => (await post(body), { ok: true }) })
    expect(post).toHaveBeenCalledTimes(2)
    expect(await ob.size()).toBe(0)
  })
})


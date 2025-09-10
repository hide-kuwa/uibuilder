import { describe, it, expect, vi } from 'vitest'
import { createOutbox } from './outbox'
import { flushQueue } from './outbox'
import { flushQueueSafe } from './flushSafe'

describe('flushQueueSafe single-flight', () => {
  it('two concurrent flushes do not double-send', async () => {
    const ob = createOutbox()
    await ob.enqueue({ id: '1', body: { a: 1 } })
    await ob.enqueue({ id: '2', body: { b: 2 } })

    const post = vi.fn().mockImplementation(async () => ({ ok: true }))
    await Promise.all([
      flushQueueSafe(ob, { post, flushQueue }),
      flushQueueSafe(ob, { post, flushQueue }),
    ])

    expect(post).toHaveBeenCalledTimes(2)
    expect(await ob.size()).toBe(0)
  })
})


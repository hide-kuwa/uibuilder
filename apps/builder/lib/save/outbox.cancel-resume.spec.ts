import { describe, it, expect } from 'vitest'
import { createCancelToken, flushQueueCancellable } from './outbox'

describe('outbox flush: cancel & resume (append-only)', () => {
  it('stops on cancel and can resume later', async () => {
    const items = [1, 2, 3]
    const seen: number[] = []
    const token = createCancelToken()
    await flushQueueCancellable(items, async (x) => {
      seen.push(x)
      if (x === 1) token.cancelled = true
    }, token)
    expect(seen).toEqual([1])
    token.cancelled = false
    await flushQueueCancellable(items.slice(1), async (x) => seen.push(x), token)
    expect(seen).toEqual([1, 2, 3])
  })
})


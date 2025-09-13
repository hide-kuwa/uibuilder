import { describe, it, expect, vi } from 'vitest'
import { rafBatch } from '@/lib/perf/rafBatch'

describe('rafBatch', () => {
  it('coalesces multiple calls into one per frame', async () => {
    vi.useFakeTimers()
    const spy = vi.fn()
    const fn = rafBatch(spy)
    fn(1); fn(2); fn(3)
    expect(spy).not.toHaveBeenCalled()
    // advance one frame (~16ms)
    vi.advanceTimersByTime(16)
    // Let microtasks flush
    await Promise.resolve()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(3)
    vi.useRealTimers()
  })
})


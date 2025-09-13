export function rafBatch<T extends any[]>(fn: (...args: T) => void) {
  let scheduled = false
  let lastArgs: T | null = null
  return (...args: T) => {
    lastArgs = args
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      const a = lastArgs as T
      lastArgs = null
      fn(...a)
    })
  }
}

export function rafThrottle<T extends any[]>(fn: (...args: T) => void) {
  // Alias for rafBatch for readability in some contexts
  return rafBatch(fn)
}


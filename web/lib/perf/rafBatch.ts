type AnyFn = (...args: any[]) => void

export function rafBatch<T extends AnyFn>(fn: T) {
  let scheduled = false
  let lastArgs: Parameters<T>
  return (...args: Parameters<T>) => {
    lastArgs = args
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      fn(...lastArgs!)
    })
  }
}

export function rafThrottle<T extends AnyFn>(fn: T) {
  let ticking = false
  return (...args: Parameters<T>) => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      fn(...args)
    })
  }
}

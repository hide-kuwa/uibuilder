export type RetryPolicy = { base: number; factor: number; cap: number }

export function nextDelay(attempt: number, policy: RetryPolicy): number {
  const { base, factor, cap } = policy
  const n = Math.max(1, Math.floor(attempt))
  const val = base * Math.pow(factor, n - 1)
  return Math.min(cap, Math.floor(val))
}

// append-only
export function withJitter(ms: number, opt: { jitter?: number } = {}) {
  const j = Math.max(0, Math.min(1, opt.jitter ?? 0))
  if (j === 0) return ms
  const delta = ms * j
  const low = ms - delta,
    high = ms + delta
  return Math.round(low + Math.random() * (high - low))
}


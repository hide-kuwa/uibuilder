export type RetryPolicy = { base: number; factor: number; cap: number }

export function nextDelay(attempt: number, policy: RetryPolicy): number {
  const { base, factor, cap } = policy
  const n = Math.max(1, Math.floor(attempt))
  const val = base * Math.pow(factor, n - 1)
  return Math.min(cap, Math.floor(val))
}


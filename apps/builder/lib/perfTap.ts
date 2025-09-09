export function percentile(arr: number[], p: number): number {
  if (!Array.isArray(arr) || arr.length === 0) return 0
  const a = [...arr].sort((x, y) => x - y)
  const i = Math.max(0, Math.min(a.length - 1, Math.ceil((p / 100) * a.length) - 1))
  return a[i]
}


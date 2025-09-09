export function calc8pxFit(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) return 100
  const aligned = values.filter((v) => Number.isFinite(v) && Math.abs(v % 8) === 0).length
  return Math.round((aligned / values.length) * 100)
}


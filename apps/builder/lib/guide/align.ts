export function isAligned(values: number[], opts: { tol: number }): boolean {
  if (!values.length) return true
  const tol = Math.max(0, opts.tol ?? 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return Math.abs(max - min) <= tol
}


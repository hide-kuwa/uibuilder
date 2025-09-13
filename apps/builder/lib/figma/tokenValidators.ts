export function isColorLike(v: unknown): boolean {
  if (typeof v !== 'string') return false
  const s = v.trim()
  return (
    /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s) ||
    /^rgb(a)?\(/i.test(s) ||
    /^hsl(a)?\(/i.test(s)
  )
}

export function isPxLike(v: unknown): boolean {
  if (typeof v === 'number') return true
  if (typeof v !== 'string') return false
  const s = v.trim()
  return /^-?\d+(\.\d+)?px$/.test(s) || /^-?\d+(\.\d+)?$/.test(s)
}

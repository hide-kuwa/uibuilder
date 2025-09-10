export function deepMerge(a: any, b: any): any {
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b]
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const out: any = { ...a }
    for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k])
    return out
  }
  return b === undefined ? a : b
}


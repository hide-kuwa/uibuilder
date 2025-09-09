export function envMerge<T extends object, U extends object>(mock: T, live: U) {
  const out: any = typeof structuredClone === 'function' ? structuredClone(mock) : JSON.parse(JSON.stringify(mock))
  const merge = (a: any, b: any) => {
    for (const k of Object.keys(b)) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) {
        a[k] = merge(a[k] ?? {}, b[k])
      } else {
        a[k] = b[k]
      }
    }
    return a
  }
  return merge(out, live)
}


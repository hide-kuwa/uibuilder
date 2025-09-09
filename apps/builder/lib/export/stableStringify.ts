function isPlainObject(v: any): v is Record<string, any> {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

function stableify(v: any): any {
  if (Array.isArray(v)) return v.map(stableify)
  if (isPlainObject(v)) {
    const out: Record<string, any> = {}
    for (const k of Object.keys(v).sort()) out[k] = stableify(v[k])
    return out
  }
  return v
}

export function stableStringify(v: any): string {
  return JSON.stringify(stableify(v))
}


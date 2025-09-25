function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function stableify(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableify)
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value).sort()) out[key] = stableify(value[key])
    return out
  }
  return value
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(stableify(value))
}

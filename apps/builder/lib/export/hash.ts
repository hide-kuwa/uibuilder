import crypto from 'node:crypto'

function stableify(obj: any): any {
  const seen = new WeakSet()
  const walk = (x: any): any => {
    if (x && typeof x === 'object') {
      if (seen.has(x)) return null
      seen.add(x)
      if (Array.isArray(x)) return x.map((v) => walk(v))
      const keys = Object.keys(x).sort()
      const out: any = {}
      for (const k of keys) out[k] = walk(x[k])
      return out
    }
    if (typeof x === 'number') return Number.isFinite(x) ? Number(x.toFixed(6)) : null
    return x
  }
  return walk(obj)
}

function stableStringify(obj: any): string {
  return JSON.stringify(stableify(obj))
}

export function contentHash(obj: any): string {
  return crypto.createHash('sha256').update(stableStringify(obj)).digest('hex')
}

// append-only
export function contentHashBytes(bytes: Uint8Array): string {
  const hex = (x: number) => x.toString(16).padStart(2, '0')
  const s = Array.from(bytes).map(hex).join('')
  return contentHash(s)
}


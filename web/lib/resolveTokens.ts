import { useDesignTokens } from '@/store/designTokensStore'

function getByPath(obj: any, path: string) {
  if (!path) return obj
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

export function resolveTokenRefs(input: any): any {
  const tokens = useDesignTokens.getState().getAll?.() || {}
  const walk = (v: any): any => {
    if (typeof v === 'string' && v.startsWith('token:')) {
      const path = v.slice(6)
      const val = getByPath(tokens, path)
      return val === undefined ? v : val
    }
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const out: any = {}
      for (const k of Object.keys(v)) out[k] = walk(v[k])
      return out
    }
    return v
  }
  return walk(input)
}

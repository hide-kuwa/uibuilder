import { useDataSources, getByPath } from '@/store/dataBindingStore'

type Bind = { source: string; path: string; fallback?: any; transform?: string }

export function resolveBinding(input: any): any {
  const walk = (v: any): any => {
    if (!v) return v
    if (v && typeof v === 'object' && '$bind' in v && v.$bind && typeof v.$bind === 'object') {
      const b = v.$bind as Bind
      const src = useDataSources.getState().getSource(b.source)
      const raw = getByPath(src, b.path)
      const val = raw === undefined || raw === null ? b.fallback : raw
      return applyTransform(val, b.transform)
    }
    if (Array.isArray(v)) return v.map(walk)
    if (typeof v === 'object') {
      const out: any = {}
      for (const k of Object.keys(v)) out[k] = walk(v[k])
      return out
    }
    return v
  }
  return walk(input)
}

function applyTransform(v: any, t?: string): any {
  if (!t) return v
  if (t === 'upper' && typeof v === 'string') return v.toUpperCase()
  if (t === 'lower' && typeof v === 'string') return v.toLowerCase()
  if (t === 'stringify') return JSON.stringify(v)
  if (t.startsWith('prefix:') && typeof v === 'string') return t.slice(7) + v
  if (t.startsWith('suffix:') && typeof v === 'string') return v + t.slice(7)
  return v
}

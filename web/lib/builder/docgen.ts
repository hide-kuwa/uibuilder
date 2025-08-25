export type DocgenProp = {
  name: string
  type: {
    name: 'string' | 'number' | 'boolean' | 'enum' | 'union' | 'any'
    raw?: string
    value?: Array<{ value: string }>
  }
  required?: boolean
  defaultValue?: { value: string }
}

export type DocgenMetaItem = {
  displayName: string
  importPath: string
  exportName?: string
  props?: DocgenProp[]
}

export type DocgenMeta = DocgenMetaItem[]

let cache: DocgenMeta | null = null

export async function loadDocgenMeta(): Promise<DocgenMeta> {
  if (cache) return cache
  try {
    const res = await fetch('/component-meta.json')
    const json = (await res.json()) as DocgenMeta
    cache = json
    return json
  } catch {
    cache = []
    return []
  }
}

export function parseValue(raw?: string): unknown {
  if (raw == null) return undefined
  const v = raw.trim()
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1)
  }
  return v
}

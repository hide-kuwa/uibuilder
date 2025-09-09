// apps/builder/lib/export/generate.ts
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

function stableStringify(obj: any): string {
  const seen = new WeakSet()
  const stringify = (x: any): any => {
    if (x && typeof x === 'object') {
      if (seen.has(x)) return null
      seen.add(x)
      if (Array.isArray(x)) return x.map((v) => stringify(v))
      const keys = Object.keys(x).sort()
      const out: any = {}
      for (const k of keys) out[k] = stringify(x[k])
      return out
    }
    if (typeof x === 'number') return Number.isFinite(x) ? Number(x.toFixed(6)) : null
    return x
  }
  return JSON.stringify(stringify(obj))
}

export async function generateExport(slug: string) {
  const file = path.join(process.cwd(), 'public', 'pages', `${slug}.json`)
  const raw = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
  const tree = Array.isArray(raw?.tree) ? raw.tree : Array.isArray(raw) ? raw : []
  const tsx = `// generated stub for ${slug}\nexport default ${JSON.stringify(tree, null, 2)}\n`
  const tokens: string[] = []
  const manifest = { id: slug, generatedAt: new Date().toISOString(), nodes: Array.isArray(tree) ? tree.length : 0 }
  const base = { tsx, manifest, tokens }
  const contentHash = crypto.createHash('sha256').update(stableStringify(base)).digest('hex')
  return { ...base, contentHash }
}

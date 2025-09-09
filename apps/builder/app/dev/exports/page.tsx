// apps/builder/app/dev/exports/page.tsx
import fs from 'node:fs'
import path from 'node:path'
import JSZip from 'jszip'

type Manifest = {
  id?: string
  title?: string
  generatedAt?: string
  contentHash?: string
  assets?: string[]
  tags?: string[]
  slug?: string
}

async function readManifestFromZip(absZipPath: string): Promise<Manifest | null> {
  try {
    const buf = fs.readFileSync(absZipPath)
    const zip = await JSZip.loadAsync(buf)
    const mf = zip.file('manifest.json')
    if (!mf) return null
    const txt = await mf.async('string')
    const json = JSON.parse(txt)
    return json as Manifest
  } catch {
    return null
  }
}

function listZipFiles(dir: string): Array<{ name: string; abs: string; mtimeMs: number }> {
  try {
    const ents = fs.readdirSync(dir, { withFileTypes: true })
    const out: Array<{ name: string; abs: string; mtimeMs: number }> = []
    for (const ent of ents) {
      if (!ent.isFile()) continue
      if (!ent.name.toLowerCase().endsWith('.zip')) continue
      const abs = path.join(dir, ent.name)
      const st = fs.statSync(abs)
      out.push({ name: ent.name, abs, mtimeMs: st.mtimeMs })
    }
    // newest first
    out.sort((a, b) => b.mtimeMs - a.mtimeMs)
    return out
  } catch {
    return []
  }
}

export default async function Page() {
  const pubDir = path.join(process.cwd(), 'public', 'exports')
  const files = listZipFiles(pubDir)

  const rows = await Promise.all(
    files.map(async (f) => {
      const manifest = await readManifestFromZip(f.abs)
      const base = path.basename(f.name, '.zip')
      const parts = base.split('--')
      const slug = parts[0] || base
      const hashFromName = parts[1] || ''
      const mtime = new Date(f.mtimeMs)
      const contentHash = manifest?.contentHash || hashFromName
      const tags = Array.isArray(manifest?.tags) ? (manifest!.tags as string[]) : []
      return {
        name: f.name,
        href: `/exports/${f.name}`,
        slug,
        contentHash,
        tags,
        mtime,
      }
    })
  )

  return (
    <main className="p-4 space-y-3">
      <h1 className="text-lg font-semibold">Exports</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-600">No exports yet</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-4 border rounded p-2">
              <div className="w-40 text-xs font-mono" title={r.contentHash}>{(r.contentHash || '').slice(0, 10) || '-'}</div>
              <div className="flex-1 text-xs text-gray-800 truncate" title={(r.tags || []).join(', ')}>
                {(r.tags || []).join(', ') || '-'}
              </div>
              <div className="w-56 text-xs text-gray-700 truncate" title={r.slug}>{r.slug}</div>
              <div className="w-52 text-xs text-gray-600" title={r.mtime.toISOString()}>
                {r.mtime.toLocaleString()}
              </div>
              <a className="text-xs underline text-blue-600 hover:text-blue-800" href={r.href}>Download</a>
              {r.contentHash ? (
                <a className="text-xs underline text-blue-600 hover:text-blue-800" href={`/audit?hash=${encodeURIComponent(r.contentHash)}`}>
                  Audit
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}


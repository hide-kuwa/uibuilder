import { contentHash } from './hash'
import { stableStringify } from './stableStringify'

export type ZipEntry = { path: string; data: unknown }
export type ZipManifest = { path: string; size: number; hash: string }[]

export function buildZipManifest(files: ZipEntry[]): ZipManifest {
  const entries = files.map((f) => {
    const s = stableStringify(f.data)
    return { path: f.path, size: s.length, hash: contentHash(f.data as any) }
  })
  return entries.sort((a, b) => a.path.localeCompare(b.path))
}

// append-only: last-wins de-dup variant (keeps original API intact)
export function buildZipManifestUnique(files: ZipEntry[]): ZipManifest {
  const byPath = new Map<string, unknown>()
  for (const f of files) byPath.set(f.path, f.data) // last-wins
  const dedup = [...byPath.entries()].map(([path, data]) => ({ path, data }))
  return buildZipManifest(dedup)
}


import { stableStringify } from './stableStringify'
import { contentHash } from './hash'

export type ZipEntry = { path: string; data: unknown }
export type ZipManifest = { path: string; size: number; hash: string }[]

export function buildZipManifest(files: ZipEntry[]): ZipManifest {
  const entries = files.map((f) => {
    const s = stableStringify(f.data)
    return { path: f.path, size: s.length, hash: contentHash(f.data as any) }
  })
  return entries.sort((a, b) => a.path.localeCompare(b.path))
}


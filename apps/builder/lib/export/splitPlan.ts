export type Part = { path: string; size: number }
export function planZipSplit(files: Part[], limit: number): Part[][] {
  const out: Part[][] = []
  let cur: Part[] = []
  let curSize = 0
  for (const f of files) {
    if (f.size > limit) {
      if (cur.length) {
        out.push(cur)
        cur = []
        curSize = 0
      }
      out.push([f])
      continue
    }
    if (curSize + f.size > limit) {
      out.push(cur)
      cur = [f]
      curSize = f.size
    } else {
      cur.push(f)
      curSize += f.size
    }
  }
  if (cur.length) out.push(cur)
  return out
}

// append-only: naming & manifest helpers
export const partName = (i: number, bytes: number) => `p${String(i + 1).padStart(2, '0')}-${bytes}b`

export function toSplitManifest(parts: { size: number }[]) {
  const named = parts.map((p, i) => ({ name: partName(i, p.size), size: p.size }))
  const totalSize = named.reduce((a, b) => a + b.size, 0)
  return { parts: named, totalSize }
}

export type PerfEvent = { label: string; ms: number; t: number }

export function percentile(arr: number[], p: number): number {
  if (!Array.isArray(arr) || arr.length === 0) return 0
  const a = [...arr].sort((x, y) => x - y)
  const i = Math.max(0, Math.min(a.length - 1, Math.ceil((p / 100) * a.length) - 1))
  return a[i]
}

export function summarizeP95() {
  const w: any = (globalThis as any).window
  const list: Array<{ label: string; ms: number; t?: number }> = (w && w.__perf) || []
  const by: Record<string, number[]> = {}
  for (const r of list) {
    if (!r || typeof r.ms !== 'number' || !Number.isFinite(r.ms)) continue
    ;(by[r.label] ??= []).push(r.ms)
  }
  const rows = Object.entries(by).map(([label, arr]) => ({
    label,
    count: arr.length,
    p50: percentile(arr, 50),
    p95: percentile(arr, 95),
    max: Math.max(...arr),
  }))
  return rows
}

export function exportPerfCSV(): string {
  const rows = summarizeP95()
  const header = 'label,count,p50,p95,max'
  return [header, ...rows.map((r) => [r.label, r.count, r.p50, r.p95, r.max].join(','))].join('\n')
}

// append-only: stable CSV generator for arbitrary rows
export function toCsv(rows: Array<Record<string, any>>, header?: string[]): string {
  if (!rows || rows.length === 0) return (header && header.length ? header.join(',') : '')
  const headers = header && header.length ? header : Object.keys(rows[0])
  const esc = (v: any) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))]
  return lines.join('\n')
}

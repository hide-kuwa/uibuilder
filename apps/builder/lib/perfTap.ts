export type PerfEvent = { label: string; ms: number; t: number }

export function percentile(values: number[], p: number) {
  if (!values || values.length === 0) return 0
  const arr = [...values].sort((a, b) => a - b)
  const idx = Math.max(0, Math.min(arr.length - 1, Math.ceil((p / 100) * arr.length) - 1))
  return arr[idx]
}

export function summarizeP95() {
  const w: any = (globalThis as any).window
  const list: PerfEvent[] = (w && w.__perf) || []
  const by: Record<string, number[]> = {}
  for (const e of list) (by[e.label] ??= []).push(e.ms)
  return Object.entries(by).map(([label, list]) => ({
    label,
    count: list.length,
    p50: percentile(list, 50),
    p95: percentile(list, 95),
    max: Math.max(...list),
  }))
}

export function exportPerfCSV(): string {
  const rows = summarizeP95()
  const header = 'label,count,p50,p95,max'
  return [header, ...rows.map((r) => [r.label, r.count, r.p50, r.p95, r.max].join('\n'))].join('\n')
}


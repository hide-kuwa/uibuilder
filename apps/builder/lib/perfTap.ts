// apps/builder/lib/perfTap.ts
// append-only: クライアントで perf イベントを横取り → P95 集計
export type PerfEvent = { label: string; ms: number; t: number }

declare global {
  interface Window {
    __perf?: PerfEvent[]
    logEvent?: (name: string, payload: any) => void
    __origLogEvent__?: typeof window.logEvent
  }
}

/** window.logEvent('perf', {label, ms}) を横取りして蓄積 */
export function installPerfTap() {
  if (typeof window === 'undefined') return
  if (!window.__perf) window.__perf = []
  if (!window.__origLogEvent__ && window.logEvent) window.__origLogEvent__ = window.logEvent

  const orig = window.logEvent
  window.logEvent = (name: string, payload: any) => {
    try {
      if (name === 'perf' && payload?.label && typeof payload.ms === 'number') {
        window.__perf!.push({ label: payload.label, ms: payload.ms, t: Date.now() })
      }
    } catch {}
    orig?.(name, payload)
  }
}

export function percentile(values: number[], p: number) {
  if (values.length === 0) return 0
  const arr = [...values].sort((a, b) => a - b)
  const idx = Math.max(0, Math.min(arr.length - 1, Math.ceil((p / 100) * arr.length) - 1))
  return arr[idx]
}

export function summarizeP95() {
  if (typeof window === 'undefined' || !window.__perf) return [] as Array<{ label: string; count: number; p50: number; p95: number; max: number }>
  const by: Record<string, number[]> = {}
  for (const e of window.__perf!) (by[e.label] ??= []).push(e.ms)
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
  return [header, ...rows.map((r) => [r.label, r.count, r.p50, r.p95, r.max].join(','))].join('\n')
}


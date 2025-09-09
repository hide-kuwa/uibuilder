// apps/builder/lib/utils/telemetry.ts
export function logEvent(event: string, payload?: any) {
  try {
    if (typeof window !== 'undefined' && (window as any).__telemetry?.log) {
      ;(window as any).__telemetry.log(event, payload)
      return
    }
  } catch {}
  try { console.info(`[telemetry:${event}]`, payload) } catch {}
}


// apps/builder/lib/utils/measure.ts
export async function measure<T>(name: string, fn: () => Promise<T> | T) {
  const t0 = performance.now()
  try {
    return await fn()
  } finally {
    const dt = Math.round(performance.now() - t0)
    const log = (globalThis as any).logEvent ?? ((e: string, p: any) => console.info(e, p))
    try { log('perf', { name, ms: dt, at: Date.now() }) } catch {}
  }
}


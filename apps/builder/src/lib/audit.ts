// append-only audit shim: 後でここをPOST送信に差し替えるだけで全呼び出しが切り替わる
export function audit(op: string, payload: any) {
  // eslint-disable-next-line no-console
  console.info('[audit]', { op, ...payload });
}

// --- append-only: POST audit helper ---
export function auditPost(op: string, payload: any) {
  try {
    const body = JSON.stringify({ op, ...payload })
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' })
      ;(navigator as any).sendBeacon('/api/audit', blob)
    } else {
      fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    }
  } catch {}
}
// --- /append-only ---

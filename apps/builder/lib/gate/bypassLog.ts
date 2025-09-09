export async function postBypassLog(
  fetcher: typeof fetch,
  payload: { slug: string; score: number; user?: string }
) {
  const body = {
    action: 'gate-approve',
    slug: payload.slug,
    score: payload.score,
    user: payload.user || 'unknown',
    ts: new Date().toISOString(),
  }
  const res = await fetcher('/api/audit-log', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res as any
}


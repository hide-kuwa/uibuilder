export function buildBypassPayload({ slug, score, user }: { slug: string; score: number; user: string }) {
  return { action: 'gate-approve', slug, score, user, ts: new Date().toISOString() }
}


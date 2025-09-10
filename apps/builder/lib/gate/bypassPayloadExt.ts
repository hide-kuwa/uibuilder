import { buildBypassPayload } from './bypassPayload'

export function buildBypassPayloadExt(
  base: { slug: string; score: number; user: string },
  meta?: { version?: string; client?: string; session?: string }
) {
  return { ...buildBypassPayload(base), ...(meta ?? {}) }
}


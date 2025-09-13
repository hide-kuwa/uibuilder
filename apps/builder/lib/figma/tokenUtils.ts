import type { TokenRef } from '../figma/model'

export function resolveTokenOrString(
  v: TokenRef | string | undefined,
  tokens?: Record<string, string | number>
): string | undefined {
  if (!v) return undefined
  if (typeof v === 'string') return v
  // support both legacy { $token } and new { token, fallback }
  const key = (v as any).token ?? (v as any).$token
  const fallback = (v as any).fallback as string | undefined
  if (!key) return undefined
  const hit = tokens && tokens[key]
  if (hit != null) return String(hit)
  return `var(--${key}${fallback ? `, ${fallback}` : ''})`
}


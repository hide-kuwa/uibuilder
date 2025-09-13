import type { Shadow, Num } from '@/lib/style/selectionToCss'

const val = (n?: Num): string => {
  if (n == null) return '0'
  if (typeof n === 'number') return `${n}px`
  if (typeof n === 'string') return n
  return `var(--${n.token}${n.fallback ? `, ${n.fallback}` : ''})`
}

export function encodeShadow(s: Shadow): string {
  const parts = [s.inset ? 'inset' : '', val(s.x), val(s.y), val(s.blur ?? 0), val(s.spread ?? 0), s.color ?? 'currentColor']
  return parts.filter(Boolean).join(' ')
}

export function encodeShadows(list: Shadow[]): string {
  return list.map(encodeShadow).join(', ')
}

// Minimal decoder (best-effort): expects "[inset] x y [blur] [spread] color"
export function decodeShadow(str: string): Shadow | null {
  try {
    const parts = str.trim().split(/\s+/)
    let i = 0
    const inset = parts[i] === 'inset' ? (i++, true) : false
    const x = parts[i++]
    const y = parts[i++]
    const blur = parts[i]
    let b: string | undefined
    let sp: string | undefined
    if (blur) { b = blur; i++ }
    const spread = parts[i]
    if (spread && /px|rem|em|%|var\(/.test(spread)) { sp = spread; i++ }
    const color = parts.slice(i).join(' ') || undefined
    const toNum = (s?: string): Num | undefined => s ? (s.startsWith('var(') ? s : (Number(s) ? Number(s) : s)) as any : undefined
    return { inset, x: toNum(x)!, y: toNum(y)!, blur: toNum(b), spread: toNum(sp), color }
  } catch { return null }
}


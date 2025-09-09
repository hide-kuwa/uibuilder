// apps/builder/lib/guide/color.ts

type RGB = { r: number; g: number; b: number }

const clamp = (v: number, min = 0, max = 255) => Math.max(min, Math.min(max, v))

function parseHex(s: string): RGB | null {
  const m = s.trim().toLowerCase()
  if (!m.startsWith('#')) return null
  const hex = m.slice(1)
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    return { r, g, b }
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return { r, g, b }
  }
  return null
}

function parseRgb(s: string): RGB | null {
  const m = s.trim().match(/^rgb\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)$/i)
  if (!m) return null
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
}

function toHex({ r, g, b }: RGB): string {
  const h = (n: number) => clamp(Math.round(n)).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function parseColor(s: string): RGB {
  return parseHex(s) || parseRgb(s) || { r: 0, g: 0, b: 0 }
}

function srgbToLinear(v: number): number {
  v = v / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(rgb: RGB): number {
  const R = srgbToLinear(rgb.r)
  const G = srgbToLinear(rgb.g)
  const B = srgbToLinear(rgb.b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export function contrastRatioCSS(fg: string, bg: string): number {
  return contrastRatio(parseColor(fg), parseColor(bg))
}

export function contrastRatio(fg: RGB, bg: RGB): number {
  const L1 = relativeLuminance(fg)
  const L2 = relativeLuminance(bg)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

function isLight(rgb: RGB): boolean {
  return relativeLuminance(rgb) > 0.5
}

function lighten(rgb: RGB, step: number): RGB {
  // move towards white by step*255
  return {
    r: clamp(rgb.r + step * 255),
    g: clamp(rgb.g + step * 255),
    b: clamp(rgb.b + step * 255),
  }
}

function darken(rgb: RGB, step: number): RGB {
  return {
    r: clamp(rgb.r - step * 255),
    g: clamp(rgb.g - step * 255),
    b: clamp(rgb.b - step * 255),
  }
}

/**
 * Adjusts colors toward WCAG AA ratio. Prefers shifting fg; slightly nudges bg if stuck/worsening.
 */
export function ensureAAColorPair(fg: string, bg: string, required = 4.5): { fg: string; bg: string } {
  let F = parseColor(fg)
  let B = parseColor(bg)
  let bestF = F
  let bestB = B
  let best = contrastRatio(F, B)
  if (best >= required) return { fg: toHex(F), bg: toHex(B) }
  const maxIter = 16
  const step = 0.06
  for (let i = 0; i < maxIter; i++) {
    // try shifting foreground first
    const prev = contrastRatio(F, B)
    F = isLight(F) ? darken(F, step) : lighten(F, step)
    let cur = contrastRatio(F, B)
    if (cur < prev) {
      // foreground move made it worse; nudge background in opposite direction
      B = isLight(B) ? lighten(B, 0.04) : darken(B, 0.04)
      cur = contrastRatio(F, B)
    }
    if (cur > best) {
      best = cur
      bestF = F
      bestB = B
      if (best >= required) break
    }
  }
  return { fg: toHex(bestF), bg: toHex(bestB) }
}


// Lightweight text layout helper (MVP)
// - Provides a named export `layoutText` used by editorStore.
// - Safe on server: falls back to a rough width estimate when `document` is not available.
export type LayoutResult = {
  lines: string[]
  width: number
  height: number
  lineHeight: number
}

type StyleLike = {
  fontSize?: number
  lineHeight?: number
  fontFamily?: string
  fontWeight?: number | string
  letterSpacing?: number
}

function makeFont(style: StyleLike) {
  const fontSize = style.fontSize ?? 14
  const fontFamily = style.fontFamily ?? 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto'
  const fontWeight = style.fontWeight ?? 400
  return { css: `${fontWeight} ${fontSize}px ${fontFamily}`, fontSize }
}

export function layoutText(
  text: string,
  style: StyleLike = {},
  maxWidth?: number,
): LayoutResult {
  const { css, fontSize } = makeFont(style)
  const lineH = Math.round(style.lineHeight ?? fontSize * 1.4)
  const letter = style.letterSpacing ?? 0

  // Try real measure with canvas when in browser
  let ctx: CanvasRenderingContext2D | null = null
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas')
    ctx = c.getContext('2d')
    if (ctx) ctx.font = css
  }

  const measure = (s: string) => {
    if (!s) return 0
    if (ctx) {
      // letter-spacing compensation
      return ctx.measureText(s).width + letter * Math.max(0, s.length - 1)
    }
    // server-side fallback: rough estimate
    return s.length * (fontSize * 0.6) + letter * Math.max(0, s.length - 1)
  }

  // Split into lines (preserve hard breaks)
  const hardLines = String(text ?? '').split('\n')
  const lines: string[] = []

  if (!maxWidth || !isFinite(maxWidth) || maxWidth <= 0) {
    // No wrapping
    lines.push(...hardLines)
  } else {
    // Greedy word wrap per hard line
    for (const hard of hardLines) {
      const words = hard.split(/\s+/)
      let cur = ''
      for (const w of words) {
        const cand = cur ? cur + ' ' + w : w
        if (measure(cand) <= maxWidth || cur === '') {
          cur = cand
        } else {
          lines.push(cur)
          cur = w
        }
      }
      if (cur) lines.push(cur)
      if (hard === '' && words.length === 1) lines.push('') // preserve blank lines
    }
  }

  const width = lines.reduce((m, s) => Math.max(m, measure(s)), 0)
  const height = Math.max(1, lines.length) * lineH
  return { lines, width, height, lineHeight: lineH }
}

// also provide default export for robustness
export default layoutText


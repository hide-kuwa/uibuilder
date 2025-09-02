let styleEl: HTMLStyleElement | null = null
const ensureSheet = () => {
  if (typeof document === 'undefined') return null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.setAttribute('data-interactive', '1')
    document.head.appendChild(styleEl)
  }
  return styleEl
}

/** ユニーククラス名を発行し、トリガに応じた CSS を返す */
export function buildInteractiveClass(id: string, opts: {
  transitionMs: number
  easing: string
  hover?: { scale?: number, bg?: string, shadow?: string, opacity?: number }
  active?: { scale?: number, bg?: string, shadow?: string, opacity?: number }
  focus?: { scale?: number, bg?: string, shadow?: string, opacity?: number }
  focusWithin?: { scale?: number, bg?: string, shadow?: string, opacity?: number }
  groupHover?: { scale?: number, bg?: string, shadow?: string, opacity?: number }
}) {
  const cls = `ix-${id}`
  const lines: string[] = []
  const base = `.\\${cls}{transition:${opts.transitionMs}ms ${opts.easing};}`
  lines.push(base)
  const rule = (pseudo: string, v?: any) => {
    if (!v) return
    const t: string[] = []
    if (v.scale != null) t.push(`transform:scale(${v.scale});`)
    if (v.bg) t.push(`background:${v.bg};`)
    if (v.shadow) t.push(`box-shadow:${shadow(v.shadow)};`)
    if (v.opacity != null) t.push(`opacity:${v.opacity};`)
    if (!t.length) return
    lines.push(`${pseudo}{${t.join('')}}`)
  }
  const shadow = (lvl: string) => {
    // 最小実装（Tailwind近似）
    if (lvl === 'xl') return '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    if (lvl === 'lg') return '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
    return '0 1px 2px 0 rgb(0 0 0 / 0.05)'
  }
  rule(`.\\${cls}:hover`, opts.hover)
  rule(`.\\${cls}:active`, opts.active)
  rule(`.\\${cls}:focus`, opts.focus)
  rule(`.\\${cls}:focus-within`, opts.focusWithin)
  rule(`.group:hover .\\${cls}`, opts.groupHover)

  const sheet = ensureSheet()
  if (sheet) sheet.textContent += '\n' + lines.join('\n')
  return cls
}

export function removeInteractiveRules() {
  if (styleEl) { styleEl.remove(); styleEl = null }
}

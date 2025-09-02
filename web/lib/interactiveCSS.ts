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

export type StateStyle = {
  scale?: number
  rotateDeg?: number
  tx?: number
  ty?: number
  bg?: string
  shadow?: string
  opacity?: number
  cursor?: string
}

export function buildInteractiveClass(
  id: string,
  opts: {
    transitionMs: number
    easing: string
    hover?: StateStyle
    active?: StateStyle
    focus?: StateStyle
    focusWithin?: StateStyle
    groupHover?: StateStyle
  }
) {
  const cls = `ix-${id}`
  const lines: string[] = []

  // ベース：トランジション＆描画ヒント
  lines.push(`.${css(cls)}{transition:${opts.transitionMs}ms ${opts.easing};will-change:transform,background,opacity,box-shadow;}`)

  const toShadow = (lvl?: string) => {
    if (!lvl) return ''
    if (lvl === 'xl') return '0 20px 25px -5px rgb(0 0 0 / .1),0 8px 10px -6px rgb(0 0 0 / .1)'
    if (lvl === 'lg') return '0 10px 15px -3px rgb(0 0 0 / .1),0 4px 6px -4px rgb(0 0 0 / .1)'
    if (lvl === 'md') return '0 4px 6px -1px rgb(0 0 0 / .1),0 2px 4px -2px rgb(0 0 0 / .1)'
    return '0 1px 2px 0 rgb(0 0 0 / .05)'
  }

  const rule = (sel: string, v?: StateStyle) => {
    if (!v) return
    const cssParts: string[] = []
    // ★ transform を合成
    const t: string[] = []
    if (v.tx || v.ty) t.push(`translate(${v.tx || 0}px, ${v.ty || 0}px)`)
    if (v.rotateDeg)  t.push(`rotate(${v.rotateDeg}deg)`)
    if (v.scale != null) t.push(`scale(${v.scale})`)
    if (t.length) cssParts.push(`transform:${t.join(' ')}; transform-origin:center;`)

    if (v.bg) cssParts.push(`background:${v.bg};`)
    if (v.shadow) cssParts.push(`box-shadow:${toShadow(v.shadow)};`)
    if (v.opacity != null) cssParts.push(`opacity:${v.opacity};`)
    if (v.cursor) cssParts.push(`cursor:${v.cursor};`)
    if (cssParts.length) lines.push(`${sel}{${cssParts.join('')}}`)
  }

  rule(`.${css(cls)}:hover`, opts.hover)
  rule(`.${css(cls)}:active`, opts.active)
  rule(`.${css(cls)}:focus`, opts.focus)
  rule(`.${css(cls)}:focus-within`, opts.focusWithin)
  rule(`.group:hover .${css(cls)}`, opts.groupHover)

  const sheet = ensureSheet()
  if (sheet) sheet.textContent += '\n' + lines.join('\n')
  return cls
}

const css = (c: string) => c.replace(/([^a-zA-Z0-9_-])/g, '\\$1')

export function removeInteractiveRules() {
  if (styleEl) { styleEl.remove(); styleEl = null }
}

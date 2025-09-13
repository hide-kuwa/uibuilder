import type { Node, GradientFill } from './model'

function gradientToCss(fill: GradientFill): string {
  const stops = fill.stops.map((st) => `${st.color} ${st.offset * 100}%`).join(', ')
  return fill.type === 'linear'
    ? `linear-gradient(${fill.angle ?? 0}deg, ${stops})`
    : `radial-gradient(${stops})`
}

export function buildCss(node: Node): string {
  const s = node.style ?? {}
  const lines: string[] = []

  const bg = (() => {
    if (!s.fill) return undefined
    if (typeof s.fill === 'string') return s.fill
    return gradientToCss(s.fill)
  })()
  if (bg) lines.push(`background: ${bg};`)

  if (s.stroke || typeof s.strokeWidth === 'number') {
    const width = s.strokeWidth ?? 0
    const color = s.stroke ?? 'transparent'
    lines.push(`border: ${width}px solid ${color};`)
  }

  if (s.radius != null) {
    const radius =
      typeof s.radius === 'number'
        ? `${s.radius}px`
        : `${s.radius.tl}px ${s.radius.tr}px ${s.radius.br}px ${s.radius.bl}px`
    lines.push(`border-radius: ${radius};`)
  }

  if (s.opacity != null) {
    lines.push(`opacity: ${s.opacity};`)
  }

  if (s.shadows && s.shadows.length) {
    const shadowStr = s.shadows
      .map((sh) => `${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`)
      .join(', ')
    lines.push(`box-shadow: ${shadowStr};`)
  }

  if (s.mixBlendMode) lines.push(`mix-blend-mode: ${s.mixBlendMode};`)
  if (s.filter) lines.push(`filter: ${s.filter};`)
  if (s.backdropFilter) lines.push(`backdrop-filter: ${s.backdropFilter};`)
  if (s.backgroundImage) lines.push(`background-image: ${s.backgroundImage};`)
  if (s.backgroundSize) lines.push(`background-size: ${s.backgroundSize};`)
  if (s.backgroundPosition) lines.push(`background-position: ${s.backgroundPosition};`)

  const transforms: string[] = []
  if (s.rotateDeg) transforms.push(`rotate(${s.rotateDeg}deg)`)
  if (s.skewXDeg) transforms.push(`skewX(${s.skewXDeg}deg)`)
  if (s.skewYDeg) transforms.push(`skewY(${s.skewYDeg}deg)`)
  if (s.scaleX != null || s.scaleY != null) {
    transforms.push(`scale(${s.scaleX ?? 1}, ${s.scaleY ?? 1})`)
  }
  if (transforms.length) {
    lines.push(`transform: ${transforms.join(' ')};`)
  }

  const transition = node.motion?.transition
    ?.map(
      (t) =>
        `${t.property} ${t.durationMs}ms ${t.easing ?? 'ease'} ${t.delayMs ?? 0}ms`
    )
    .join(', ')
  if (transition) lines.push(`transition: ${transition};`)

  return lines.join('\n')
}

export default buildCss

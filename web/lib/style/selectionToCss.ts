export type TokenRef = { token: string; fallback?: string }
export type Num = number | TokenRef | string
export type Radius = number | TokenRef | { tl: Num; tr: Num; br: Num; bl: Num }
export type Shadow = { x: Num; y: Num; blur?: Num; spread?: Num; color?: string; inset?: boolean }

export type StyleLike = {
  id?: string
  fill?: Num
  stroke?: Num
  strokeWidth?: Num
  opacity?: Num
  radius?: Radius
  shadows?: Shadow[]
}

const v = (n?: Num): string | undefined => {
  if (n == null) return undefined
  if (typeof n === 'number') return `${n}px`
  if (typeof n === 'string') return n
  return `var(--${n.token}${n.fallback ? `, ${n.fallback}` : ''})`
}

const radiusDecl = (r?: Radius): string[] => {
  if (r == null) return []
  if (typeof r === 'number' || typeof r === 'string' || (typeof r === 'object' && 'token' in (r as any))) {
    return [`border-radius: ${v(r as Num)};`]
  }
  const R = r as { tl: Num; tr: Num; br: Num; bl: Num }
  return [`border-radius: ${v(R.tl)} ${v(R.tr)} ${v(R.br)} ${v(R.bl)};`]
}

const shadowItem = (s: Shadow) =>
  `${s.inset ? 'inset ' : ''}${v(s.x)} ${v(s.y)} ${s.blur ? v(s.blur) : '0'} ${s.spread ? v(s.spread) : '0'} ${s.color ?? 'currentColor'}`

export function selectionToCss(nodes: StyleLike[]): string {
  return nodes
    .map((n) => {
      const lines: string[] = []
      // Gradient-aware fill handling
      if (n.fill != null) {
        const gcss = tryGradientCss(n.fill as any)
        if (gcss) lines.push(`background: ${gcss};`)
        else lines.push(`background: ${v(n.fill as Num)};`)
      }
      if (n.stroke != null) lines.push(`border-color: ${v(n.stroke)};`)
      if (n.strokeWidth != null) lines.push(`border-width: ${v(n.strokeWidth)};`)
      if (n.opacity != null) lines.push(`opacity: ${v(n.opacity)};`)
      radiusDecl(n.radius).forEach((l) => lines.push(l))
      if (n.shadows?.length) lines.push(`box-shadow: ${n.shadows.map(shadowItem).join(', ')};`)
      const name = n.id ? `/* ${n.id} */\n` : ''
      return `${name}${lines.join('\n')}`
    })
    .join('\n\n')
}

// Gradient helpers (local types; UI uses gradientCodec types but we keep this file self-contained)
type ColorVal = string | { token: string; fallback?: string }
type GradientStop = { pos: number; color: ColorVal }
type LinearGradient = { type: 'linear'; angle?: Num; stops: GradientStop[] }
type RadialGradient = {
  type: 'radial'
  shape?: 'ellipse'|'circle'
  size?: 'closest-side'|'closest-corner'|'farthest-side'|'farthest-corner'
  stops: GradientStop[]
}
type Gradient = LinearGradient | RadialGradient

function isGradient(x: any): x is Gradient { return x && (x.type === 'linear' || x.type === 'radial') }
const vDeg = (n?: Num): string | undefined => {
  if (n == null) return undefined
  if (typeof n === 'number') return `${n}deg`
  if (typeof n === 'string') return n
  return `var(--${n.token}${n.fallback ? `, ${n.fallback}` : ''})`
}
const vColor = (c?: ColorVal) => {
  if (c == null) return undefined
  if (typeof c === 'string') return c
  return `var(--${c.token}${c.fallback ? `, ${c.fallback}` : ''})`
}
function gradientCss(g: Gradient) {
  const stops = (g.stops ?? []).slice().sort((a,b)=>a.pos-b.pos)
    .map(s => `${vColor(s.color) ?? '#000'} ${(s.pos*100).toFixed(1)}%`).join(', ')
  if (g.type === 'linear') {
    const ang = vDeg(g.angle) ?? '180deg'
    return `linear-gradient(${ang}, ${stops})`
  }
  const shape = g.shape ?? 'ellipse'
  const size = g.size ?? 'farthest-corner'
  return `radial-gradient(${shape} ${size}, ${stops})`
}
function tryGradientCss(x: any): string | null {
  try { return isGradient(x) ? gradientCss(x) : null } catch { return null }
}

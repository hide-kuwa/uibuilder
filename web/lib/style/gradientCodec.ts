export type TokenRef = { token: string; fallback?: string }
export type ColorVal = string | TokenRef
export type NumPxOrToken = number | string | TokenRef

export type GradientStop = { pos: number; color: ColorVal } // pos: 0..1
export type LinearGradient = { type: 'linear'; angle?: NumPxOrToken; stops: GradientStop[] }
export type RadialGradient = {
  type: 'radial'
  shape?: 'ellipse' | 'circle'
  size?: 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner'
  stops: GradientStop[]
}
export type Gradient = LinearGradient | RadialGradient

export function clamp01(x: number) { return Math.max(0, Math.min(1, x)) }
export function normalizeStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].map(s => ({ ...s, pos: clamp01(s.pos ?? 0) })).sort((a,b)=>a.pos-b.pos)
}


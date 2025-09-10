type M = { contrast: 'bad' | 'ok' | 'good'; a11y: number; grid: number }
export function scoreCalc(m: M): number {
  const base = m.contrast === 'bad' ? 60 : m.contrast === 'ok' ? 70 : 80
  return Math.max(0, Math.min(100, base + m.a11y + m.grid))
}


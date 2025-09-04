import type { XY } from '@/stores/canvas'

export function snapToGrid(xy: XY, grid = 20, threshold = 6): XY {
  const snap = (v: number) => {
    const g = Math.round(v / grid) * grid
    return Math.abs(g - v) <= threshold ? g : v
  }
  const nx = snap(xy.x)
  const ny = snap(xy.y)
  return { x: nx, y: ny }
}

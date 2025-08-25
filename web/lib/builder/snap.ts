import type { Elm } from '@/store/builderStore'

export type SnapPoints = {
  x: { left: number[]; center: number[]; right: number[] }
  y: { top: number[]; middle: number[]; bottom: number[] }
}

export function collectSnapPoints(elements: Elm[], exceptId?: string): SnapPoints {
  const points: SnapPoints = {
    x: { left: [], center: [600], right: [] },
    y: { top: [], middle: [360], bottom: [] },
  }
  elements.forEach((el) => {
    if (el.id === exceptId || el.visible === false) return
    points.x.left.push(el.x)
    points.x.center.push(el.x + el.w / 2)
    points.x.right.push(el.x + el.w)
    points.y.top.push(el.y)
    points.y.middle.push(el.y + el.h / 2)
    points.y.bottom.push(el.y + el.h)
  })
  return points
}

export type Rect = { x: number; y: number; w: number; h: number }
export type GuideLine = { axis: 'x' | 'y'; pos: number }

const GRID = 8
const SNAP_THRESHOLD = 6

export function snapRect(
  rect: Rect,
  points: SnapPoints,
  opts: { threshold?: number; mode?: 'move' | 'resize' } = {},
): { rect: Rect; guides: GuideLine[] } {
  const threshold = opts.threshold ?? SNAP_THRESHOLD
  const mode = opts.mode ?? 'move'
  let { x, y, w, h } = rect
  x = Math.round(x / GRID) * GRID
  y = Math.round(y / GRID) * GRID
  w = Math.round(w / GRID) * GRID
  h = Math.round(h / GRID) * GRID

  const left = x
  const right = x + w
  const cx = x + w / 2
  const top = y
  const bottom = y + h
  const cy = y + h / 2

  const nearest = (arr: number[], value: number) => {
    let best: { diff: number; pos: number } | null = null
    for (const p of arr) {
      const diff = p - value
      const d = Math.abs(diff)
      if (d <= threshold && (!best || d < Math.abs(best.diff))) {
        best = { diff, pos: p }
      }
    }
    return best
  }

  const dxLeft = nearest(points.x.left, left)
  const dxRight = nearest(points.x.right, right)
  const dxCenter = nearest(points.x.center, cx)
  const dyTop = nearest(points.y.top, top)
  const dyBottom = nearest(points.y.bottom, bottom)
  const dyCenter = nearest(points.y.middle, cy)

  let guideX: number | null = null
  let guideY: number | null = null

  if (mode === 'move') {
    const diffX = [dxLeft, dxRight, dxCenter].reduce<
      { diff: number; pos: number } | null
    >((best, cur) => (cur && (!best || Math.abs(cur.diff) < Math.abs(best.diff)) ? cur : best), null)
    const diffY = [dyTop, dyBottom, dyCenter].reduce<
      { diff: number; pos: number } | null
    >((best, cur) => (cur && (!best || Math.abs(cur.diff) < Math.abs(best.diff)) ? cur : best), null)
    if (diffX) {
      x += diffX.diff
      guideX = diffX.pos
    }
    if (diffY) {
      y += diffY.diff
      guideY = diffY.pos
    }
  } else {
    if (
      dxLeft && (!dxRight || Math.abs(dxLeft.diff) <= Math.abs(dxRight.diff)) &&
      (!dxCenter || Math.abs(dxLeft.diff) <= Math.abs(dxCenter.diff))
    ) {
      x += dxLeft.diff
      w = right - x
      guideX = dxLeft.pos
    } else if (dxRight && (!dxCenter || Math.abs(dxRight.diff) <= Math.abs(dxCenter.diff))) {
      w += dxRight.diff
      guideX = dxRight.pos
    } else if (dxCenter) {
      x += dxCenter.diff
      guideX = dxCenter.pos
    }
    if (
      dyTop && (!dyBottom || Math.abs(dyTop.diff) <= Math.abs(dyBottom.diff)) &&
      (!dyCenter || Math.abs(dyTop.diff) <= Math.abs(dyCenter.diff))
    ) {
      y += dyTop.diff
      h = bottom - y
      guideY = dyTop.pos
    } else if (dyBottom && (!dyCenter || Math.abs(dyBottom.diff) <= Math.abs(dyCenter.diff))) {
      h += dyBottom.diff
      guideY = dyBottom.pos
    } else if (dyCenter) {
      y += dyCenter.diff
      guideY = dyCenter.pos
    }
  }

  const guides: GuideLine[] = []
  if (guideX !== null) guides.push({ axis: 'x', pos: guideX })
  if (guideY !== null) guides.push({ axis: 'y', pos: guideY })
  return { rect: { x, y, w, h }, guides }
}


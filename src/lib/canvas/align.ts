export type Rect = { x: number; y: number; w: number; h: number }
export type GuideLine = { axis: 'x' | 'y'; pos: number }

export type SnapPoints = {
  x: { left: number[]; center: number[]; right: number[] }
  y: { top: number[]; middle: number[]; bottom: number[] }
}

// Collect snap candidate points from existing rectangles.
// `exceptId` allows skipping a node when collecting points.
export function collectSnapPoints(
  nodes: { id: string; x: number; y: number; w: number; h: number; visible?: boolean }[],
  exceptId?: string,
  opts: { x?: number[]; y?: number[] } = {},
): SnapPoints {
  const points: SnapPoints = {
    x: { left: [], center: [], right: [] },
    y: { top: [], middle: [], bottom: [] },
  }
  nodes.forEach((n) => {
    if (n.id === exceptId || n.visible === false) return
    points.x.left.push(n.x)
    points.x.center.push(n.x + n.w / 2)
    points.x.right.push(n.x + n.w)
    points.y.top.push(n.y)
    points.y.middle.push(n.y + n.h / 2)
    points.y.bottom.push(n.y + n.h)
  })
  // allow additional custom snap points (grid lines, slot boundaries etc.)
  opts.x?.forEach((p) => {
    points.x.left.push(p)
    points.x.center.push(p)
    points.x.right.push(p)
  })
  opts.y?.forEach((p) => {
    points.y.top.push(p)
    points.y.middle.push(p)
    points.y.bottom.push(p)
  })
  return points
}

// Snap a rectangle to collected points and grid. Mode "move" snaps the position,
// "resize" adjusts width/height.
export function snapRect(
  rect: Rect,
  points: SnapPoints,
  opts: { threshold?: number; mode?: 'move' | 'resize'; grid?: number } = {},
): { rect: Rect; guides: GuideLine[] } {
  const threshold = opts.threshold ?? 6
  const mode = opts.mode ?? 'move'
  const grid = opts.grid
  let { x, y, w, h } = rect
  if (grid && grid > 0) {
    x = Math.round(x / grid) * grid
    y = Math.round(y / grid) * grid
    w = Math.round(w / grid) * grid
    h = Math.round(h / grid) * grid
  }

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
    if (diffX) { x += diffX.diff; guideX = diffX.pos }
    if (diffY) { y += diffY.diff; guideY = diffY.pos }
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

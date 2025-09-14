import { zoomAt } from '@/lib/canvas/zoomMath'

it('keeps pointer anchored while zooming', () => {
  const s = { zoom: 1, ox: 0, oy: 0 }
  const p = { x: 200, y: 100 }
  const next = zoomAt(s, -120, p.x, p.y)
  expect(next.zoom).toBeGreaterThan(1)
  expect(next.ox).not.toBe(0)
  expect(next.oy).not.toBe(0)
})


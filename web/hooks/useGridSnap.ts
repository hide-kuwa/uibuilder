import { useMemo } from 'react'
import { useGridStore } from '@/store/gridStore'
import { useGuidesStore } from '@/store/guidesStore' // snapPx を流用

export type Rect = { x: number; y: number; w: number; h: number }
export type GridActive = { axis: 'x'|'y'; at: number }
export type SnapResult = { rect: Rect; snapped: boolean; active: GridActive[] }

/** グリッドへ最小移動で吸着（平行移動の簡易版） */
export function useGridSnap(
  draftRect: Rect,
  mode: 'move' | 'resize',
  zoom: number
): SnapResult {
  const { snapGrid, pitch, offsetX, offsetY } = useGridStore()
  const { snapPx } = useGuidesStore((s) => ({ snapPx: s.snapPx }))
  const thresholdWorld = snapPx / Math.max(zoom, 0.01)

  return useMemo(() => {
    if (!snapGrid) return { rect: draftRect, snapped: false, active: [] }

    const roundTo = (v: number, step: number, offset: number) => {
      const t = (v - offset) / step
      return Math.round(t) * step + offset
    }

    let dx = 0, dy = 0
    const nx = roundTo(draftRect.x, pitch, offsetX)
    const ny = roundTo(draftRect.y, pitch, offsetY)

    if (Math.abs(nx - draftRect.x) <= thresholdWorld) dx = nx - draftRect.x
    if (Math.abs(ny - draftRect.y) <= thresholdWorld) dy = ny - draftRect.y

    if (dx === 0 && dy === 0) return { rect: draftRect, snapped: false, active: [] }

    const rect = { ...draftRect, x: draftRect.x + dx, y: draftRect.y + dy }
    const active: GridActive[] = []
    if (dx) active.push({ axis: 'x', at: rect.x })
    if (dy) active.push({ axis: 'y', at: rect.y })
    return { rect, snapped: true, active }
  }, [snapGrid, draftRect, pitch, offsetX, offsetY, thresholdWorld])
}


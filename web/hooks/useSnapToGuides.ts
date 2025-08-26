import { useMemo } from 'react'
import { useGuidesStore } from '@/store/guidesStore'

export type Rect = { x: number; y: number; w: number; h: number }
export type SnapResult = {
  rect: Rect
  snapped: boolean
  active: { axis: 'x'|'y'; at: number }[]
}

/**
 * @param draftRect 操作中の矩形（ワールドpx）
 * @param mode 'move' | 'resize'
 * @param zoom 現在のズーム。画面px→ワールドpx換算に使用
 * @returns スナップ適用後のRect/アクティブガイド
 */
export const useSnapToGuides = (
  draftRect: Rect,
  mode: 'move' | 'resize',
  zoom: number
): SnapResult => {
  const { guides, visible, snapPx } = useGuidesStore((s) => ({
    guides: s.guides,
    visible: s.visible,
    snapPx: s.snapPx,
  }))
  const thresholdWorld = snapPx / Math.max(zoom, 0.01)

  return useMemo(() => {
    if (!visible || guides.length === 0) {
      return { rect: draftRect, snapped: false, active: [] }
    }

    const candidatesX = [draftRect.x, draftRect.x + draftRect.w / 2, draftRect.x + draftRect.w]
    const candidatesY = [draftRect.y, draftRect.y + draftRect.h / 2, draftRect.y + draftRect.h]

    let dx = 0, dy = 0
    let ax: { axis:'x'|'y'; at:number } | null = null
    let ay: { axis:'x'|'y'; at:number } | null = null

    // 最小差分を探す
    let minX = thresholdWorld + 1
    let minY = thresholdWorld + 1

    for (const g of guides) {
      if (g.axis === 'x') {
        for (const c of candidatesX) {
          const diff = g.pos - (c + dx)
          const ad = Math.abs(diff)
          if (ad <= thresholdWorld && ad < minX) {
            minX = ad
            dx = diff
            ax = { axis: 'x', at: g.pos }
          }
        }
      } else {
        for (const c of candidatesY) {
          const diff = g.pos - (c + dy)
          const ad = Math.abs(diff)
          if (ad <= thresholdWorld && ad < minY) {
            minY = ad
            dy = diff
            ay = { axis: 'y', at: g.pos }
          }
        }
      }
    }

    if (dx === 0 && dy === 0) {
      return { rect: draftRect, snapped: false, active: [] }
    }

    // move/resize どちらでもドラフト矩形を平行移動で合わせる簡易版
    // （resize で片辺だけ合わせたい場合は、呼び出し側で draftRect の生成段階で
    //   固定辺を維持するようにしてください）
    const rect = { ...draftRect, x: draftRect.x + dx, y: draftRect.y + dy }
    const active = [ax, ay].filter(Boolean) as {axis:'x'|'y'; at:number}[]

    return { rect, snapped: true, active }
  }, [draftRect, visible, guides, thresholdWorld])
}

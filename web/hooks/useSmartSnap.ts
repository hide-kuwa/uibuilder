import { useMemo } from 'react'
import { useGuidesStore } from '@/store/guidesStore'

export type Rect = { x: number; y: number; w: number; h: number }
export type SmartGuide = { axis:'x'|'y'|'w'|'h'; at:number; kind:'edge'|'center'|'equal'; refId?:string }
export type SnapResult = { rect: Rect; snapped: boolean; active: SmartGuide[] }

/** 他ノードの bbox からエッジ/センター/同幅・同高のスマートガイドを作り、最小移動で吸着 */
export function useSmartSnap(
  draftRect: Rect,
  mode: 'move' | 'resize',
  zoom: number,
  others: Array<Rect & { id?: string }>
): SnapResult {
  const { smartEnabled, snapPx, smartSnapPx } = useGuidesStore((s) => ({
    smartEnabled: s.smartEnabled,
    snapPx: s.snapPx,
    smartSnapPx: s.smartSnapPx,
  }))
  const thresholdWorld = (smartSnapPx ?? snapPx) / Math.max(zoom, 0.01)

  return useMemo(() => {
    if (!smartEnabled || others.length === 0) {
      return { rect: draftRect, snapped: false, active: [] }
    }

    const L = (r: Rect) => r.x
    const R = (r: Rect) => r.x + r.w
    const T = (r: Rect) => r.y
    const B = (r: Rect) => r.y + r.h
    const CX = (r: Rect) => r.x + r.w / 2
    const CY = (r: Rect) => r.y + r.h / 2

    const candX = [ {val:L(draftRect), kind:'edge'}, {val:CX(draftRect), kind:'center'}, {val:R(draftRect), kind:'edge'} ] as const
    const candY = [ {val:T(draftRect), kind:'edge'}, {val:CY(draftRect), kind:'center'}, {val:B(draftRect), kind:'edge'} ] as const

    let bestDx = 0, bestDy = 0
    let minX = thresholdWorld + 1, minY = thresholdWorld + 1
    let active: SmartGuide[] = []

    for (const o of others) {
      // Xライン
      const xTargets = [ {val:L(o), kind:'edge'}, {val:CX(o), kind:'center'}, {val:R(o), kind:'edge'} ] as const
      for (const c of candX) for (const t of xTargets) {
        const d = t.val - (c.val + bestDx)
        const ad = Math.abs(d)
        if (ad <= thresholdWorld && ad < minX) {
          minX = ad
          bestDx = d
        }
      }
      // Yライン
      const yTargets = [ {val:T(o), kind:'edge'}, {val:CY(o), kind:'center'}, {val:B(o), kind:'edge'} ] as const
      for (const c of candY) for (const t of yTargets) {
        const d = t.val - (c.val + bestDy)
        const ad = Math.abs(d)
        if (ad <= thresholdWorld && ad < minY) {
          minY = ad
          bestDy = d
        }
      }
      // 同幅/同高（equal）
      if (Math.abs(o.w - draftRect.w) <= thresholdWorld) {
        active.push({ axis:'w', at:o.w, kind:'equal', refId:o.id })
      }
      if (Math.abs(o.h - draftRect.h) <= thresholdWorld) {
        active.push({ axis:'h', at:o.h, kind:'equal', refId:o.id })
      }
    }

    if (minX <= thresholdWorld || minY <= thresholdWorld || active.length) {
      const rect = { ...draftRect, x: draftRect.x + bestDx, y: draftRect.y + bestDy }
      // 実際に吸着したX/Yラインを active に反映（簡易）
      if (minX <= thresholdWorld) active.push({ axis:'x', at: CX({x:rect.x, y:0, w:0, h:0}), kind:'center' })
      if (minY <= thresholdWorld) active.push({ axis:'y', at: CY({x:0, y:rect.y, w:0, h:0}), kind:'center' })
      return { rect, snapped: true, active }
    }
    return { rect: draftRect, snapped: false, active: [] }
  }, [draftRect, others, smartEnabled, thresholdWorld])
}


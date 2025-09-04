import { useCanvasStore } from '@/stores/canvas'

export function computeSnapWithGuides(
  id: string,
  proposed: { x: number; y: number },
  size: { w: number; h: number },
  threshold = 6
): { x: number; y: number; vxs: number[]; hys: number[] } {
  const st = useCanvasStore.getState()
  const posMap = st.nodePos
  const sizeMap = st.nodeSize
  const me = { x: proposed.x, y: proposed.y, w: size.w, h: size.h }

  const pickRect = (nid: string) => {
    const p = posMap[nid] ?? { x: 0, y: 0 }
    const s = sizeMap[nid] ?? { w: 160, h: 96 }
    return { x: p.x, y: p.y, w: s.w, h: s.h }
  }

  const vTargets: number[] = [] // snap to x (left/center/right)
  const hTargets: number[] = [] // snap to y (top/middle/bottom)

  // 端/中心を列挙
  const vx = (r: any) => [r.x, r.x + r.w / 2, r.x + r.w]
  const hy = (r: any) => [r.y, r.y + r.h / 2, r.y + r.h]

  // 自分以外のノードを対象に
  for (const nid of Object.keys(posMap)) {
    if (nid === id) continue
    const r = pickRect(nid)
    vTargets.push(...vx(r))
    hTargets.push(...hy(r))
  }

  // 近いターゲットを探してスナップ
  const myV = vx(me)
  const myH = hy(me)

  let snapX = proposed.x
  let snapY = proposed.y
  const vGuides: number[] = []
  const hGuides: number[] = []

  // x
  for (const target of vTargets) {
    for (let i = 0; i < myV.length; i++) {
      const cur = myV[i] + (proposed.x - me.x) // proposed との差分考慮不要だが分かりやすく
      const delta = target - cur
      if (Math.abs(delta) <= threshold) {
        // 左(0)/中心(1)/右(2)ごとに補正
        const offset = [0, me.w/2, me.w][i]
        snapX = target - offset
        vGuides.push(target)
      }
    }
  }
  // y
  for (const target of hTargets) {
    for (let i = 0; i < myH.length; i++) {
      const cur = myH[i] + (proposed.y - me.y)
      const delta = target - cur
      if (Math.abs(delta) <= threshold) {
        const offset = [0, me.h/2, me.h][i]
        snapY = target - offset
        hGuides.push(target)
      }
    }
  }

  // 同一座標の重複を潰す
  const uniq = (arr: number[]) => Array.from(new Set(arr.map(n => Math.round(n))))
  return { x: snapX, y: snapY, vxs: uniq(vGuides), hys: uniq(hGuides) }
}

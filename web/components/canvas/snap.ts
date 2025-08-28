import type { R } from './RectsStore'
import { useGridStore } from '@/store/gridStore'
import { useGuidesStore } from '@/store/guidesStore'

export type Guide = { type:'v'|'h'; pos:number; from:number; to:number }

export function getSmartSnap(target:R, others:R[]){
  const { snapGrid, pitch, offsetX, offsetY } = useGridStore.getState()
  const { snapPx } = useGuidesStore.getState()
  const threshold = snapPx

  // ▼ グリッド候補
  let gdx = 0, gdy = 0
  if (snapGrid) {
    const roundTo = (v:number, step:number, offset:number) => {
      const t = (v - offset) / step
      return Math.round(t) * step + offset
    }
    const nx = roundTo(target.x, pitch, offsetX)
    const ny = roundTo(target.y, pitch, offsetY)
    if (Math.abs(nx - target.x) <= threshold) gdx = nx - target.x
    if (Math.abs(ny - target.y) <= threshold) gdy = ny - target.y
  }
  const gridDist = Math.abs(gdx) + Math.abs(gdy)

  // ▼ スマートガイド候補
  let sdx = 0, sdy = 0
  const guides:Guide[] = []
  const tCenterX = target.x + target.w/2
  const tCenterY = target.y + target.h/2
  const candidatesX:number[] = [], candidatesY:number[] = []
  others.forEach(o=>{
    candidatesX.push(o.x, o.x+o.w, o.x+o.w/2)
    candidatesY.push(o.y, o.y+o.h, o.y+o.h/2)
  })
  const best = (arr:number[], val:number)=> {
    let d=Infinity, p=val; for(const v of arr){ const dd=Math.abs(v-val); if(dd<d){d=dd;p=v} }
    return {d,p}
  }
  const bx1 = best(candidatesX, target.x)
  const bx2 = best(candidatesX, target.x+target.w)
  const bxc = best(candidatesX, tCenterX)
  const by1 = best(candidatesY, target.y)
  const by2 = best(candidatesY, target.y+target.h)
  const byc = best(candidatesY, tCenterY)
  if(bx1.d<threshold){ sdx = (bx1.p - target.x); guides.push({type:'v',pos:bx1.p,from:target.y-2000,to:target.y+target.h+2000}) }
  else if(bx2.d<threshold){ sdx = (bx2.p - (target.x+target.w)); guides.push({type:'v',pos:bx2.p,from:target.y-2000,to:target.y+target.h+2000}) }
  else if(bxc.d<threshold){ sdx = (bxc.p - tCenterX); guides.push({type:'v',pos:bxc.p,from:target.y-2000,to:target.y+target.h+2000}) }
  if(by1.d<threshold){ sdy = (by1.p - target.y); guides.push({type:'h',pos:by1.p,from:target.x-2000,to:target.x+target.w+2000}) }
  else if(by2.d<threshold){ sdy = (by2.p - (target.y+target.h)); guides.push({type:'h',pos:by2.p,from:target.x-2000,to:target.x+target.w+2000}) }
  else if(byc.d<threshold){ sdy = (byc.p - tCenterY); guides.push({type:'h',pos:byc.p,from:target.x-2000,to:target.x+target.w+2000}) }
  const smartDist = Math.abs(sdx) + Math.abs(sdy)

  if (smartDist && smartDist < gridDist) {
    return {dx: sdx, dy: sdy, guides}
  }
  return {dx: gdx, dy: gdy, guides: []}
}

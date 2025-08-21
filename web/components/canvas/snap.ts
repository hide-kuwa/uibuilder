import type { R } from './RectsStore'
export type Guide = { type:'v'|'h'; pos:number; from:number; to:number }
export function getSmartSnap(target:R, others:R[], grid=8, tol=6){
  // 1) grid snap
  const gdx = Math.round(target.x/grid)*grid - target.x
  const gdy = Math.round(target.y/grid)*grid - target.y
  let dx=gdx, dy=gdy
  const guides:Guide[]=[]
  const tCenterX = target.x + target.w/2
  const tCenterY = target.y + target.h/2
  const candidatesX:number[] = [], candidatesY:number[] = []
  others.forEach(o=>{
    candidatesX.push(o.x, o.x+o.w, o.x+o.w/2)
    candidatesY.push(o.y, o.y+o.h, o.y+o.h/2)
  })
  // 2) edge/center snap (closest within tol)
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
  if(bx1.d<tol){ dx = (bx1.p - target.x); guides.push({type:'v',pos:bx1.p,from:target.y-2000,to:target.y+target.h+2000}) }
  else if(bx2.d<tol){ dx = (bx2.p - (target.x+target.w)); guides.push({type:'v',pos:bx2.p,from:target.y-2000,to:target.y+target.h+2000}) }
  else if(bxc.d<tol){ dx = (bxc.p - tCenterX); guides.push({type:'v',pos:bxc.p,from:target.y-2000,to:target.y+target.h+2000}) }
  if(by1.d<tol){ dy = (by1.p - target.y); guides.push({type:'h',pos:by1.p,from:target.x-2000,to:target.x+target.w+2000}) }
  else if(by2.d<tol){ dy = (by2.p - (target.y+target.h)); guides.push({type:'h',pos:by2.p,from:target.x-2000,to:target.x+target.w+2000}) }
  else if(byc.d<tol){ dy = (byc.p - tCenterY); guides.push({type:'h',pos:byc.p,from:target.x-2000,to:target.x+target.w+2000}) }
  return {dx,dy,guides}
}

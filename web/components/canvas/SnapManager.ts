export type Rect={x:number;y:number;w:number;h:number}
export function getSnapDelta(target:Rect, siblings:Rect[], grid=8){
  // まずはグリッドにのみ吸着（シンプル版）
  const dx = Math.round(target.x / grid)*grid - target.x
  const dy = Math.round(target.y / grid)*grid - target.y
  return {dx,dy}
}

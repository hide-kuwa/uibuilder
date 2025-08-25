import type { WorldRect, Camera } from '@/lib/render/tiler'

export function drawScene(
  ctx: CanvasRenderingContext2D,
  tileRect: WorldRect,
  cam: Camera,
  dpr: number,
  tree: any[],
) {
  drawGrid(ctx, tileRect)
  try {
    traverse(tree, (n: any) => {
      const t = String(n?.type ?? '')
      const id = n?.id
      const x = Number(n?.style?.left ?? n?.props?.x ?? 0)
      const y = Number(n?.style?.top ?? n?.props?.y ?? 0)
      const w = Number(n?.style?.width ?? n?.props?.w ?? 120)
      const h = Number(n?.style?.height ?? n?.props?.h ?? 60)
      if (!aabbIntersect({ x, y, w, h }, tileRect)) return
      ctx.save()
      ctx.translate(x, y)
      ctx.fillStyle = t === 'frame' ? '#1f2937' : t === 'text' ? '#0ea5e9' : '#334155'
      ctx.strokeStyle = '#475569'
      ctx.lineWidth = 1
      ctx.fillRect(0, 0, w, h)
      ctx.strokeRect(0, 0, w, h)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '12px ui-sans-serif, system-ui'
      ctx.fillText(`${t}:${n?.name ?? id}`, 6, 16)
      ctx.restore()
    })
  } catch {}
}

function drawGrid(ctx: CanvasRenderingContext2D, r: WorldRect) {
  const step = 64
  const x0 = Math.floor(r.x / step) * step
  const y0 = Math.floor(r.y / step) * step
  ctx.save()
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'
  ctx.lineWidth = 1
  for (let x = x0; x < r.x + r.w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke()
  }
  for (let y = y0; y < r.y + r.h; y += step) {
    ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(14,165,233,0.4)'
  ctx.strokeRect(r.x, r.y, r.w, r.h)
  ctx.restore()
}
function traverse(nodes: any[], fn: (n: any) => void) {
  for (const n of nodes ?? []) {
    fn(n)
    if (n?.children) traverse(n.children, fn)
  }
}
function aabbIntersect(a: {x:number;y:number;w:number;h:number}, b: {x:number;y:number;w:number;h:number}) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export interface Rect { x:number; y:number; w:number; h:number }
export function normalizeCrop(rect:Rect, natural:{w:number;h:number}):Rect {
  const x = Math.max(0, Math.min(rect.x, natural.w));
  const y = Math.max(0, Math.min(rect.y, natural.h));
  const w = Math.max(1, Math.min(rect.w, natural.w - x));
  const h = Math.max(1, Math.min(rect.h, natural.h - y));
  return { x, y, w, h };
}
export function moveCrop(rect:Rect, dx:number, dy:number, natural:{w:number;h:number}):Rect {
  return normalizeCrop({ x: rect.x + dx, y: rect.y + dy, w: rect.w, h: rect.h }, natural);
}
export function resizeCrop(rect:Rect, handle:'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw', dx:number, dy:number, opts:{center?:boolean;keepAspect?:boolean}={}, natural:{w:number;h:number}):Rect {
  let { x, y, w, h } = rect;
  let cx = 0, cy = 0;
  if (opts.center) { cx = dx/2; cy = dy/2; }
  if (handle.includes('w')) { x += dx; w -= dx; }
  if (handle.includes('e')) { w += dx; }
  if (handle.includes('n')) { y += dy; h -= dy; }
  if (handle.includes('s')) { h += dy; }
  if (opts.center) { x -= cx; y -= cy; w += cx*2; h += cy*2; }
  return normalizeCrop({ x, y, w, h }, natural);
}
export function worldToImage(pt:{x:number;y:number}, node:any){
  const { x: nx, y: ny, w, h } = node.props;
  const crop = node.props.crop || { x:0, y:0, w:node.meta?.w||w, h:node.meta?.h||h };
  const scaleX = crop.w / w;
  const scaleY = crop.h / h;
  return { x: (pt.x - nx) * scaleX + crop.x, y: (pt.y - ny) * scaleY + crop.y };
}
export function imageToWorld(pt:{x:number;y:number}, node:any){
  const { x: nx, y: ny, w, h } = node.props;
  const crop = node.props.crop || { x:0, y:0, w:node.meta?.w||w, h:node.meta?.h||h };
  const scaleX = w / crop.w;
  const scaleY = h / crop.h;
  return { x: (pt.x - crop.x) * scaleX + nx, y: (pt.y - crop.y) * scaleY + ny };
}

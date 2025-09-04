import type { ActionDef, WhenFlags } from '@/types/presets-ui'

// 未指定 when 対策：アクションで when が空なら「click」を既定に。
export function getEffectiveWhen(a: ActionDef, fallback?: WhenFlags): WhenFlags {
  const w: WhenFlags = (a.when ?? fallback ?? {}) as WhenFlags
  const hasAny = !!(w.click || w.doubleClick || w.mount || w.inView || w.delayMs)
  return hasAny ? w : ({ click: true } as WhenFlags)
}
let jsonLogic: any = null
export const ensureJsonLogic = async () => {
  if (jsonLogic) return jsonLogic
  try { jsonLogic = (await import('json-logic-js')).default } catch { jsonLogic = { apply: () => true } }
  return jsonLogic
}
const truthy = async (rule: any, data: any) => {
  if (!rule) return true
  const jl = await ensureJsonLogic()
  try { return !!jl.apply(rule, data) } catch { return false }
}
const withThrottle = <T extends (...a:any[])=>any>(fn:T, ms?:number|null) => {
  if (!ms) return fn
  let last = 0; return ((...args:any[]) => { const now=Date.now(); if(now-last>=ms){ last=now; fn(...args) } }) as T
}
const withDebounce = <T extends (...a:any[])=>any>(fn:T, ms?:number|null) => {
  if (!ms) return fn
  let t:any=null; return ((...args:any[]) => { clearTimeout(t); t=setTimeout(()=>fn(...args), ms) }) as T
}

export type RuntimeCtx = {
  el: HTMLElement
  data?: any // 必要なら将来データ注入
  emit?: (event:string, payload?:any)=>void
  navigate?: (url:string)=>void
}

export async function runAction(a: ActionDef, ctx: RuntimeCtx) {
  if (!(await truthy(a.if, ctx.data))) return
  const exec = async () => {
    if (a.type === 'openUrl') {
      const url = a.params?.url as string
      if (url) window.open(url, '_blank', 'noopener')
    } else if (a.type === 'copyToClipboard') {
      const text = a.params?.text ?? ''
      try { await navigator.clipboard?.writeText(String(text)) } catch {}
    } else if (a.type === 'emit') {
      ctx.emit?.(a.params?.event ?? 'event', a.params?.payload)
    } else if (a.type === 'navigate') {
      ctx.navigate?.(a.params?.to ?? '/')
    } else if (a.type === 'toggleVar') {
      // 将来: Zustandの外部ストアに橋渡し
      (window as any).__vars = (window as any).__vars || {}
      const k = a.params?.key ?? 'flag'
      ;(window as any).__vars[k] = !(window as any).__vars[k]
    }
  }
  const wrapped = withThrottle(withDebounce(exec, a.debounceMs), a.throttleMs)
  await wrapped()
}

export function bindWhen(
  el: HTMLElement,
  a: ActionDef,
  ctx: RuntimeCtx,
  fallback?: WhenFlags,
) {
  const w = getEffectiveWhen(a, fallback)
  const subs: Array<() => void> = []
  if (w.click) {
    const h = () => runAction(a, ctx)
    el.addEventListener('click', h); subs.push(()=>el.removeEventListener('click', h))
  }
  if (w.doubleClick) {
    const h = () => runAction(a, ctx)
    el.addEventListener('dblclick', h); subs.push(()=>el.removeEventListener('dblclick', h))
  }
  if (w.mount) {
    let id = requestAnimationFrame(()=>runAction(a, ctx)); subs.push(()=>cancelAnimationFrame(id))
  }
  if (w.delayMs && w.delayMs > 0) {
    const t = setTimeout(()=>runAction(a, ctx), w.delayMs); subs.push(()=>clearTimeout(t))
  }
  if (w.inView) {
    const io = new IntersectionObserver(([e])=>{ if(e.isIntersecting) runAction(a, ctx) }, { rootMargin:'0px 0px -10% 0px' })
    io.observe(el); subs.push(()=>io.disconnect())
  }
  return () => subs.forEach(f=>f())
}

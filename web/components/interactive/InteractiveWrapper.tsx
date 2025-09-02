'use client'
import React, { useEffect, useMemo, useRef } from 'react'
import { buildInteractiveClass } from '@/lib/interactiveCSS'
import { bindWhen, type RuntimeCtx } from '@/lib/interactiveActions'
import type { PresetDraft } from '@/types/presets-ui'
import { useRouter } from 'next/navigation'

export default function InteractiveWrapper({ draft, children }:{ draft: PresetDraft; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 1) Triggers → ユニーククラス作成
  const cls = useMemo(()=>{
    const id = Math.random().toString(36).slice(2,8)
    const t = draft.triggers
    const to = (eff?: any) => {
      if (!eff) return undefined
      const o:any = {}
      if (eff.scale?.scale) o.scale = eff.scale.scale
      if (eff.bgColor?.color) o.bg = eff.bgColor.color
      if (eff.shadow?.level) o.shadow = eff.shadow.level
      if (eff.opacity?.opacity != null) o.opacity = eff.opacity.opacity
      return o
    }
    // draft.effects は汎用配列なので kind を寄せて取り出す（最小）
    const pack = (kind:string) => draft.effects.find(e=>e.kind===kind)?.value
    const base = {
      transitionMs: t.transitionMs, easing: t.easing,
      hover: t.hover ? { scale: pack('scale')?.scale, bg: pack('bgColor')?.color, shadow: pack('shadow')?.level, opacity: pack('opacity')?.opacity } : undefined,
      active: t.active ? { scale: pack('scale')?.scale, bg: pack('bgColor')?.color, shadow: pack('shadow')?.level, opacity: pack('opacity')?.opacity } : undefined,
      focus: t.focus ? { scale: pack('scale')?.scale, bg: pack('bgColor')?.color, shadow: pack('shadow')?.level, opacity: pack('opacity')?.opacity } : undefined,
      focusWithin: t.focusWithin ? { scale: pack('scale')?.scale, bg: pack('bgColor')?.color, shadow: pack('shadow')?.level, opacity: pack('opacity')?.opacity } : undefined,
      groupHover: t.groupHover ? { scale: pack('scale')?.scale, bg: pack('bgColor')?.color, shadow: pack('shadow')?.level, opacity: pack('opacity')?.opacity } : undefined,
    }
    return buildInteractiveClass(id, base as any)
  }, [draft])

  // 2) When → Action バインド
  useEffect(()=>{
    const el = ref.current; if(!el) return
    const cleaners = draft.actions.map(a => bindWhen(
      el,
      a,
      { el, data:{}, emit:(ev,p)=>window.dispatchEvent(new CustomEvent(ev,{detail:p})), navigate:(u)=>router.push(u) } as RuntimeCtx,
      // 後方互換：もし a.when が空なら draft.when を使う
      (draft as any).when
    ))
    return () => cleaners.forEach(c=>c())
  }, [draft])

  return <div ref={ref} className={cls}>{children}</div>
}

'use client'
import React, { useEffect, useMemo, useRef, useId } from 'react'
import { buildInteractiveClass } from '@/lib/interactiveCSS'
import { bindWhen, type RuntimeCtx } from '@/lib/interactiveActions'
import type { PresetDraft } from '@/types/presets-ui'
import { useRouter } from 'next/navigation'
import { runMotionEffects } from '@/lib/runMotion'

export default function InteractiveWrapper({ draft, children }:{ draft: PresetDraft; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const id = useId()
  const motion = (draft as any)?.motion ?? (draft as any)?.effects?.motion

  // 1) Triggers → ユニーククラス作成
  const cls = useMemo(() => {
    const t = draft.triggers
    // draft.effects は汎用配列なので kind を寄せて取り出す（最小）
    const pack = (kind: string) => (draft.effects as any[]).find(e => e.kind === kind)?.value
    const base = {
      transitionMs: t.transitionMs,
      easing: t.easing,
      hover: t.hover
        ? {
            scale: pack('scale')?.scale,
            rotateDeg: pack('rotate')?.deg,
            tx: pack('translate')?.x,
            ty: pack('translate')?.y,
            bg: pack('bgColor')?.color,
            shadow: pack('shadow')?.level,
            opacity: pack('opacity')?.opacity,
            cursor: pack('cursor')?.cursor,
          }
        : undefined,
      active: t.active
        ? {
            scale: pack('scale')?.scale,
            rotateDeg: pack('rotate')?.deg,
            tx: pack('translate')?.x,
            ty: pack('translate')?.y,
            bg: pack('bgColor')?.color,
            shadow: pack('shadow')?.level,
            opacity: pack('opacity')?.opacity,
            cursor: pack('cursor')?.cursor,
          }
        : undefined,
      focus: t.focus
        ? {
            scale: pack('scale')?.scale,
            rotateDeg: pack('rotate')?.deg,
            tx: pack('translate')?.x,
            ty: pack('translate')?.y,
            bg: pack('bgColor')?.color,
            shadow: pack('shadow')?.level,
            opacity: pack('opacity')?.opacity,
            cursor: pack('cursor')?.cursor,
          }
        : undefined,
      focusWithin: t.focusWithin
        ? {
            scale: pack('scale')?.scale,
            rotateDeg: pack('rotate')?.deg,
            tx: pack('translate')?.x,
            ty: pack('translate')?.y,
            bg: pack('bgColor')?.color,
            shadow: pack('shadow')?.level,
            opacity: pack('opacity')?.opacity,
            cursor: pack('cursor')?.cursor,
          }
        : undefined,
      groupHover: t.groupHover
        ? {
            scale: pack('scale')?.scale,
            rotateDeg: pack('rotate')?.deg,
            tx: pack('translate')?.x,
            ty: pack('translate')?.y,
            bg: pack('bgColor')?.color,
            shadow: pack('shadow')?.level,
            opacity: pack('opacity')?.opacity,
            cursor: pack('cursor')?.cursor,
          }
        : undefined,
    }
    return buildInteractiveClass(id, base as any)
  }, [draft, id])

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

  // mount
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // ↓ 一時的に mount トリガーを止めたい場合はコメントアウト
    // queueMicrotask(() => runMotionEffects(motion, 'mount', el))
  }, [])

  return (
    <div
      ref={ref}
      className={cls}
      onClick={(e) => {
        runMotionEffects(motion, 'click', e.currentTarget as HTMLElement)
      }}
      onDoubleClick={(e) => {
        runMotionEffects(motion, 'doubleClick', e.currentTarget as HTMLElement)
      }}
    >
      {children}
    </div>
  )
}

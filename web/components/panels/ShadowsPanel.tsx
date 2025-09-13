'use client'
import { t } from '@/lib/i18n/i18n'
import { useArrayField } from '@/hooks/useArrayField'
import ShadowRow from './shadows/ShadowRow'
import type { Shadow } from '@/lib/style/selectionToCss'
import { selectionToCss } from '@/lib/style/selectionToCss'
import React, { useMemo } from 'react'

const empty: Shadow = { x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,.16)' }

export default function ShadowsPanel({ initial = [] as Shadow[], onApply }:{
  initial?: Shadow[], onApply?: (shadows: Shadow[])=>void
}) {
  const { items, setItems, add, remove, clone, move } = useArrayField<Shadow>(initial)
  const previewCss = useMemo(() => selectionToCss([{ shadows: items }]), [items])
  const shadowDecl = useMemo(() => previewCss.match(/box-shadow:[^;]+;/)?.[0]?.split(':')[1] ?? '', [previewCss])

  const apply = () => {
    if (onApply) onApply(items)
    else {
      try {
        // @ts-expect-error runtime bridge
        (window as any).__mut?.applyStyle?.({ shadows: items })
      } catch {}
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Shadows</div>
        <div className="flex gap-2">
          <button className="btn btn-xs" onClick={()=>add(empty)} aria-label={t('add')}>+ {t('add')}</button>
          <button className="btn btn-xs" onClick={apply} aria-label={t('apply')}>{t('apply')}</button>
        </div>
      </div>
      <div role="list" aria-label="shadows">
        {items.map((it, i)=> (
          <div role="listitem" key={i}>
            <ShadowRow
              value={it}
              onChange={(v)=>setItems(arr=>{ const n=[...arr]; n[i]=v; return n })}
              onRemove={()=>remove(i)}
              onClone={()=>clone(i)}
              onMove={(dir)=>move(i, dir)}
            />
          </div>
        ))}
      </div>
      <div className="rounded border p-3 bg-neutral-900/20">
        <div className="w-[120px] h-[60px] rounded bg-white" style={{ boxShadow: shadowDecl as any }} />
      </div>
    </div>
  )
}


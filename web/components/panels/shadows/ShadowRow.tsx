'use client'
import { t } from '@/lib/i18n/i18n'
import type { Num, Shadow } from '@/lib/style/selectionToCss'
import { useMemo, useState } from 'react'

export default function ShadowRow({ value, onChange, onRemove, onClone, onMove }:{
  value: Shadow; onChange: (v: Shadow)=>void; onRemove: ()=>void; onClone: ()=>void; onMove: (dir:-1|1)=>void;
}) {
  const initialMode: 'px'|'token' = typeof value.x === 'number' || typeof value.x === 'string' ? 'px' : 'token'
  const [mode, setMode] = useState<'px'|'token'>(initialMode)
  const set = <K extends keyof Shadow>(k: K, v: Shadow[K]) => onChange({ ...value, [k]: v })

  const tokenOf = (n?: Num) => typeof n === 'object' && n && 'token' in n ? (n as any).token as string : ''
  const fallbackOf = (n?: Num) => typeof n === 'object' && n && 'fallback' in n ? (n as any).fallback as string : ''
  const numOf = (n?: Num) => typeof n === 'number' ? n : (typeof n === 'string' ? Number(n.replace(/px$/,'')) || 0 : 0)

  const numInput = (label: string, k: keyof Shadow & ('x'|'y'|'blur'|'spread')) => (
    mode === 'px'
      ? <input aria-label={label} type="number" className="w-16 rounded bg-neutral-900 px-1"
               value={numOf(value[k])}
               onChange={e=>set(k, Number(e.target.value) as Num)} />
      : <div className="flex gap-1 items-center">
          <input aria-label={`${label} token`} className="w-28 rounded bg-neutral-900 px-1" placeholder="token"
                 value={tokenOf(value[k])}
                 onChange={e=>set(k, { token: e.target.value, fallback: fallbackOf(value[k]) } as any)} />
          <input aria-label={`${label} fallback`} className="w-20 rounded bg-neutral-900 px-1" placeholder="fallback"
                 value={fallbackOf(value[k])}
                 onChange={e=>set(k, { token: tokenOf(value[k]), fallback: e.target.value } as any)} />
        </div>
  )

  return (
    <div role="group" className="flex flex-wrap items-center gap-2 py-1">
      <select aria-label="mode" value={mode} onChange={e=>setMode(e.target.value as any)} className="h-7 rounded bg-neutral-900 px-1">
        <option value="px">px</option><option value="token">token</option>
      </select>
      {numInput('x','x')}{numInput('y','y')}{numInput('blur','blur')}{numInput('spread','spread')}
      <input aria-label={t('color')} className="w-28 rounded bg-neutral-900 px-1" value={value.color ?? ''} onChange={e=>set('color', e.target.value)} />
      <label className="inline-flex items-center gap-1">
        <input type="checkbox" checked={!!value.inset} onChange={e=>set('inset', e.target.checked)} />
        {t('inset')}
      </label>
      <div className="ml-auto flex items-center gap-1">
        <button aria-label={t('duplicate')} onClick={onClone} className="btn btn-xs">⧉</button>
        <button aria-label={t('moveUp')} onClick={()=>onMove(-1)} className="btn btn-xs">↑</button>
        <button aria-label={t('moveDown')} onClick={()=>onMove(1)} className="btn btn-xs">↓</button>
        <button aria-label={t('remove')} onClick={onRemove} className="btn btn-xs">✕</button>
      </div>
    </div>
  )
}


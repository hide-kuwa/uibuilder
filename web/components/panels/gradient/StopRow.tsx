'use client'
import { useState } from 'react'
import type { GradientStop, TokenRef } from '@/lib/style/gradientCodec'

export default function StopRow({ value, onChange, onClone, onRemove }:{
  value: GradientStop; onChange:(v:GradientStop)=>void; onClone:()=>void; onRemove:()=>void
}) {
  const [mode, setMode] = useState<'color'|'token'>(typeof value.color === 'string' ? 'color':'token')
  const set = <K extends keyof GradientStop>(k:K, v:GradientStop[K]) => onChange({ ...value, [k]: v })
  return (
    <div className="flex items-center gap-2" role="group">
      <input aria-label="position" type="number" min={0} max={100}
        value={Math.round((value.pos??0)*100)}
        onChange={(e)=>set('pos', Math.max(0,Math.min(100,Number(e.target.value)))/100)} className="w-16 rounded bg-neutral-900 px-1" />
      <select aria-label="mode" value={mode} onChange={(e)=>setMode(e.target.value as any)} className="h-7 rounded bg-neutral-900 px-1">
        <option value="color">color</option><option value="token">token</option>
      </select>
      {mode==='color' ? (
        <input aria-label="color" type="text" className="w-28 rounded bg-neutral-900 px-1"
          value={typeof value.color === 'string' ? value.color : ''}
          onChange={(e)=>set('color', e.target.value)} placeholder="#000 / rgba(...) / currentColor" />
      ) : (
        <div className="flex gap-1">
          <input aria-label="token" className="w-28 rounded bg-neutral-900 px-1" placeholder="token"
            onChange={(e)=>set('color', { token: e.target.value } as TokenRef)} />
          <input aria-label="fallback" className="w-24 rounded bg-neutral-900 px-1" placeholder="fallback"
            onChange={(e)=>set('color', { ...(value.color as TokenRef), fallback: e.target.value })} />
        </div>
      )}
      <button aria-label="duplicate" onClick={onClone} className="btn btn-xs">⧉</button>
      <button aria-label="remove" onClick={onRemove} className="btn btn-xs">✕</button>
    </div>
  )
}


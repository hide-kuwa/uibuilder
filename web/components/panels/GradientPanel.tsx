'use client'
import { useState, useMemo } from 'react'
import type { Gradient, GradientStop } from '@/lib/style/gradientCodec'
import StopRow from './gradient/StopRow'
import { selectionToCss } from '@/lib/style/selectionToCss'
import { disambiguateStops } from '@/lib/style/gradientCodec'

const DEFAULT: Gradient = {
  type: 'linear', angle: 180,
  stops: [{ pos:0, color:'#00000000' }, { pos:1, color:'rgba(0,0,0,.2)' }]
}

export default function GradientPanel({ initial, onApply }:{
  initial?: Gradient | null
  onApply?: (g: Gradient)=>void
}) {
  const [g, setG] = useState<Gradient>(initial ?? DEFAULT)
  const bgCss = useMemo(()=> selectionToCss([{ fill: g }])
    .match(/background:[^;]+;/)?.[0]?.split(':')[1] ?? '', [g])
  const addStop = () => setG(s => ({ ...s, stops: [...s.stops, { pos: .5, color: '#000' }] }))
  const setStop = (i:number, v:GradientStop) => setG(s => { const a=[...s.stops]; a[i]=v; return { ...s, stops:a } })
  const cloneStop = (i:number) => setG(s => { const a=[...s.stops]; a.splice(i+1,0,structuredClone(a[i])); return { ...s, stops:a } })
  const removeStop = (i:number) => setG(s => ({ ...s, stops: s.stops.filter((_,j)=>j!==i) }))
  const moveType = (t:'linear'|'radial') => setG(s => t==='linear'? { type:'linear', angle: (s as any).angle ?? 180, stops: s.stops } :
                                                         { type:'radial', shape:'ellipse', size:'farthest-corner', stops: s.stops })

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select aria-label="type" value={g.type} onChange={(e)=>moveType(e.target.value as any)} className="h-7 rounded bg-neutral-900 px-1">
          <option value="linear">linear</option>
          <option value="radial">radial</option>
        </select>
        {g.type==='linear' && (
          <label className="flex items-center gap-1">
            <span>angle</span>
            <input type="number" className="w-20 rounded bg-neutral-900 px-1" value={(g as any).angle ?? 180}
              onChange={(e)=>setG(s=>({ ...(s as any), angle: Number(e.target.value) }))} />
          </label>
        )}
        {g.type==='radial' && (
          <>
            <select aria-label="shape" value={(g as any).shape ?? 'ellipse'} className="h-7 rounded bg-neutral-900 px-1"
              onChange={(e)=>setG(s=>({ ...(s as any), shape: e.target.value as any }))}>
              <option value="ellipse">ellipse</option><option value="circle">circle</option>
            </select>
            <select aria-label="size" value={(g as any).size ?? 'farthest-corner'} className="h-7 rounded bg-neutral-900 px-1"
              onChange={(e)=>setG(s=>({ ...(s as any), size: e.target.value as any }))}>
              <option value="closest-side">closest-side</option>
              <option value="closest-corner">closest-corner</option>
              <option value="farthest-side">farthest-side</option>
              <option value="farthest-corner">farthest-corner</option>
            </select>
          </>
        )}
        <div className="ml-auto flex gap-2">
          <button className="btn btn-xs" onClick={addStop}>+ Add stop</button>
          <button className="btn btn-xs" onClick={()=> { const norm = { ...g, stops: disambiguateStops(g.stops) }; onApply?.(norm) }}>Apply</button>
        </div>
      </div>

      <div role="list" className="space-y-1">
        {g.stops.map((st,i)=>(
          <div role="listitem" key={i}>
            <StopRow value={st}
              onChange={(v)=>setStop(i,v)}
              onClone={()=>cloneStop(i)}
              onRemove={()=>removeStop(i)}
            />
          </div>
        ))}
      </div>

      <div className="rounded border p-3 bg-neutral-900/20">
        <div className="w-[120px] h-[60px] rounded" style={{ background: bgCss as any }} />
      </div>
    </div>
  )
}

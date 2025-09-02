'use client'
import { usePresetDraft } from '@/store/presetDraftStore'
import { CardFieldset } from './_ui/Field'
import React, { useState } from 'react'

const DEFAULT_SWATCHES = [
  '#004cff',
  '#38bdf8',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#ec4899',
  '#111827',
  '#334155',
  '#e5e7eb',
]

const recentKey = 'actions-recent-colors'
const loadRecents = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(recentKey) || '[]')
  } catch {
    return []
  }
}
const pushRecent = (hex: string) => {
  try {
    const arr = [hex, ...loadRecents().filter(x => x !== hex)].slice(0, 8)
    localStorage.setItem(recentKey, JSON.stringify(arr))
  } catch {}
}

const ALL_EFFECTS = ['scale','bgColor','shadow','opacity','cursor','translate','rotate'] as const
type Kind = typeof ALL_EFFECTS[number]

export default function EffectsCard(){
  const draft = usePresetDraft(s=>s.draft)
  const addEffect = usePresetDraft(s=>s.addEffect)
  const update = usePresetDraft(s=>s.updateEffect)
  const remove = usePresetDraft(s=>s.removeEffect)
  const [kind, setKind] = useState<Kind>('scale')

  const onAdd = () => addEffect({ kind, value: defaultValue(kind) })

  return (
    <CardFieldset title="Effects (visual)">
      {/* 上：セレクト + Add（元のUI構成） */}
      <div className="flex items-center gap-2 mb-2">
        <select className="border rounded px-2 py-1 text-xs" value={kind} onChange={e=>setKind(e.target.value as Kind)}>
          {ALL_EFFECTS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="px-2 py-1 border rounded text-xs" onClick={onAdd}>+ Add</button>
      </div>

      {/* 下：各エフェクトの詳細行（削除しない！） */}
      <div className="space-y-2">
        {draft.effects.map((e,i)=>(
          <div key={i} className="border rounded p-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">{e.kind}</div>
              <button className="text-xs opacity-70 hover:opacity-100" onClick={()=>remove(i)}>remove</button>
            </div>

            {/* 各詳細エディタ（元の項目を維持） */}
            {e.kind==='scale' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <label>scale <input className="border rounded px-2 py-1 w-20 ml-1"
                  type="number" step="0.01"
                  value={e.value?.scale ?? 1}
                  onChange={ev=>update(i,{ value:{ ...e.value, scale:+ev.target.value }})}/></label>
              </div>
            )}

            {e.kind==='bgColor' && (
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1">
                    bg
                    <input
                      className="border rounded px-2 py-1 w-28 ml-1 bg-muted text-foreground"
                      type="text"
                      value={e.value?.color ?? '#004cff'}
                      onChange={(ev)=>update(i,{ value:{ ...e.value, color:ev.target.value }})}
                      onBlur={(ev)=>pushRecent(ev.target.value)}
                    />
                  </label>
                  <input
                    type="color"
                    className="h-7 w-10 cursor-pointer"
                    value={e.value?.color ?? '#004cff'}
                    onChange={(ev)=>{ update(i,{ value:{ ...e.value, color:ev.target.value }}); pushRecent(ev.target.value); }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {[...new Set([...loadRecents(), ...DEFAULT_SWATCHES])].slice(0,12).map(hex=>(
                    <button key={hex} type="button"
                      className="h-6 w-6 rounded border" style={{ background: hex }} title={hex}
                      onClick={()=>{ update(i,{ value:{ ...e.value, color:hex }}); pushRecent(hex); }}
                    />
                  ))}
                </div>
              </div>
            )}

            {e.kind==='shadow' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <label>shadow
                  <select className="border rounded px-2 py-1 w-24 ml-1"
                    value={e.value?.level ?? 'xl'}
                    onChange={ev=>update(i,{ value:{ ...e.value, level:ev.target.value }})}>
                    <option value="sm">sm</option><option value="md">md</option><option value="lg">lg</option><option value="xl">xl</option>
                  </select>
                </label>
              </div>
            )}

            {e.kind==='opacity' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <label>opacity <input className="border rounded px-2 py-1 w-20 ml-1"
                  type="number" step="0.05" min="0" max="1"
                  value={e.value?.opacity ?? 0.9}
                  onChange={ev=>update(i,{ value:{ ...e.value, opacity:+ev.target.value }})}/></label>
              </div>
            )}

            {e.kind==='cursor' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <label>cursor
                  <select className="border rounded px-2 py-1 w-28 ml-1"
                    value={e.value?.cursor ?? 'pointer'}
                    onChange={ev=>update(i,{ value:{ ...e.value, cursor:ev.target.value }})}>
                    <option>pointer</option><option>default</option><option>crosshair</option><option>move</option>
                  </select>
                </label>
              </div>
            )}

            {e.kind==='translate' && (
              <div className="mt-2 flex items-center gap-3 text-xs">
                <label>x(px) <input className="border rounded px-2 py-1 w-20 ml-1" type="number"
                  value={e.value?.x ?? 0}
                  onChange={ev=>update(i,{ value:{ ...e.value, x:+ev.target.value }})}/></label>
                <label>y(px) <input className="border rounded px-2 py-1 w-20 ml-1" type="number"
                  value={e.value?.y ?? 0}
                  onChange={ev=>update(i,{ value:{ ...e.value, y:+ev.target.value }})}/></label>
              </div>
            )}

            {e.kind==='rotate' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <label>deg <input className="border rounded px-2 py-1 w-20 ml-1" type="number"
                  value={e.value?.deg ?? 0}
                  onChange={ev=>update(i,{ value:{ ...e.value, deg:+ev.target.value }})}/></label>
              </div>
            )}
          </div>
        ))}
      </div>
    </CardFieldset>
  )
}

function defaultValue(kind:Kind){
  switch(kind){
    case 'scale': return { scale:1 }
    case 'bgColor': return { color:'#004cff' }
    case 'shadow': return { level:'xl' }
    case 'opacity': return { opacity:0.9 }
    case 'cursor': return { cursor:'pointer' }
    case 'translate': return { x:0, y:0 }
    case 'rotate': return { deg:0 }
  }
}


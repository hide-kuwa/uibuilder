'use client'
import React, { useMemo } from 'react'
import { getDef } from '@/lib/registry.ts'
import type { PropertyDef } from '@/types/propertySchema'

type Props = {
  componentKey: string
  propValues: Record<string, any> | undefined
  onChange: (id: string, v: any) => void
}

function Control({ def, value, onChange }: { def: PropertyDef; value: any; onChange: (v:any)=>void }) {
  if (def.kind === 'string') return <input className="w-full border p-1 rounded" placeholder={def.placeholder} value={value ?? ''} onChange={(e)=>onChange(e.target.value)} />
  if (def.kind === 'number') return <input type="number" className="w-full border p-1 rounded" value={value ?? ''} onChange={(e)=>onChange(e.target.value === '' ? undefined : Number(e.target.value))} min={def.min} max={def.max} step={def.step ?? 1} />
  if (def.kind === 'boolean') return <input type="checkbox" checked={!!value} onChange={(e)=>onChange(e.target.checked)} />
  if (def.kind === 'select') return (
    <select className="w-full border p-1 rounded" value={value ?? ''} onChange={(e)=>onChange(e.target.value)}>
      {(def.options ?? []).map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
  if (def.kind === 'multiselect') return (
    <select multiple className="w-full border p-1 rounded" value={Array.isArray(value)?value:[]} onChange={(e)=>onChange(Array.from(e.target.selectedOptions).map(o=>o.value))}>
      {(def.options ?? []).map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
  if (def.kind === 'color') return <input type="color" value={value ?? '#000000'} onChange={(e)=>onChange(e.target.value)} />
  return null
}

export function AutoPropertyPanel({ componentKey, propValues, onChange }: Props) {
  const meta = getDef(componentKey as any).meta
  const groups = useMemo(() => {
    const map = new Map<string, PropertyDef[]>()
    meta.propertySchema.forEach(d => {
      const g = d.group ?? 'General'
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(d)
    })
    return Array.from(map.entries())
  }, [meta])

  return (
    <div className="space-y-4 p-2">
      {groups.map(([g, defs]) => (
        <div key={g} className="space-y-2">
          <div className="text-xs font-semibold text-gray-500">{g}</div>
          {defs.map(def => {
            const v = propValues?.[def.id] ?? def.default
            return (
              <div key={def.id} className="grid grid-cols-3 gap-2 items-center">
                <label className="text-sm col-span-1">{def.label}</label>
                <div className="col-span-2">
                  <Control def={def} value={v} onChange={(nv)=>onChange(def.id, nv)} />
                  {def.bindable && (
                    <details className="mt-1">
                      <summary className="text-[11px] cursor-pointer">Bind</summary>
                      <div className="flex gap-1">
                        <select defaultValue="data" onChange={(e)=>onChange(def.id, { source: e.target.value, path: '' })} className="border p-1 rounded">
                          <option value="data">data</option>
                        </select>
                        <input className="flex-1 border p-1 rounded" placeholder="path e.g. user.name" value={typeof v==='object'&&v? v.path ?? '' : ''} onChange={(e)=>onChange(def.id, { source: 'data', path: e.target.value })} />
                        <button className="border px-2 rounded" onClick={()=>onChange(def.id, def.default)}>Reset</button>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

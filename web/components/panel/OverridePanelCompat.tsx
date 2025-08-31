'use client'
import React from 'react'
import type { OverrideOp } from '@/types/instanceLike'

export function OverridePanelCompat({ value, onChange }: { value?: OverrideOp[]; onChange:(v:OverrideOp[])=>void }) {
  const list = value ?? []
  function add(op: OverrideOp) { onChange([...(list||[]), op]) }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-500">Overrides</div>
        <div className="flex gap-1">
          <button className="border rounded px-2 h-7" onClick={()=>add({ op:'setProp', path:'className', value:'' })}>+ setProp</button>
          <button className="border rounded px-2 h-7" onClick={()=>add({ op:'mergeStyle', value:{} })}>+ style</button>
          <button className="border rounded px-2 h-7" onClick={()=>add({ op:'appendClass', value:'' })}>+ class</button>
        </div>
      </div>
      <div className="space-y-2">
        {list.length===0 ? <div className="text-xs text-gray-500">No overrides</div> : list.map((op,i)=>(
          <div key={i} className="grid grid-cols-5 gap-2 items-center">
            <select className="border p-1 rounded text-sm" value={op.op} onChange={(e)=>{
              const t = e.target.value as OverrideOp['op']
              const next: OverrideOp = t==='setProp' ? { op:'setProp', path:'', value:'' } : t==='mergeStyle' ? { op:'mergeStyle', value:{} } : { op:'appendClass', value:'' }
              onChange(list.map((x,idx)=> idx===i ? next : x))
            }}>
              <option value="setProp">setProp</option>
              <option value="mergeStyle">mergeStyle</option>
              <option value="appendClass">appendClass</option>
            </select>
            {op.op==='setProp' && (
              <>
                <input className="col-span-2 border p-1 rounded text-sm" placeholder="path" value={(op as any).path||''} onChange={(e)=>onChange(list.map((x,idx)=> idx===i ? { ...op, path:e.target.value } : x))} />
                <input className="col-span-2 border p-1 rounded text-sm" placeholder="value (json)" defaultValue={JSON.stringify((op as any).value ?? '')} onBlur={(e)=>{
                  try { onChange(list.map((x,idx)=> idx===i ? { ...op, value: JSON.parse(e.target.value) } : x)) } catch {}
                }} />
              </>
            )}
            {op.op==='mergeStyle' && (
              <input className="col-span-4 border p-1 rounded text-sm" placeholder='{"background":"#000"}' defaultValue={JSON.stringify((op as any).value||{})} onBlur={(e)=>{
                try { onChange(list.map((x,idx)=> idx===i ? { ...op, value: JSON.parse(e.target.value) } : x)) } catch {}
              }} />
            )}
            {op.op==='appendClass' && (
              <input className="col-span-4 border p-1 rounded text-sm" placeholder="class names" value={(op as any).value||''} onChange={(e)=>onChange(list.map((x,idx)=> idx===i ? { ...op, value:e.target.value } : x))} />
            )}
            <button className="border rounded px-2 h-7" onClick={()=>onChange(list.filter((_,idx)=>idx!==i))}>Del</button>
          </div>
        ))}
      </div>
    </div>
  )
}

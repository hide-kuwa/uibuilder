'use client'
import React from 'react'
import { getDef } from '@/lib/registry'

export function VariantPanelCompat({ componentKey, value, onChange }: { componentKey: string; value?: string|null; onChange:(v:string|null)=>void }) {
  const def = getDef(componentKey as any) as any
  const list = def?.variants ?? []
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-gray-500">Variant</div>
      <select className="w-full border p-1 rounded text-sm" value={value ?? ''} onChange={(e)=>onChange(e.target.value || null)}>
        <option value="">(none)</option>
        {list.map((v:any)=><option key={v.id} value={v.id}>{v.label}</option>)}
      </select>
    </div>
  )
}

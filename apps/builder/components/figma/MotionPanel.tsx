'use client'
import { useMemo } from 'react'
import { useFigmaStore } from '../../lib/figma/store'

const presets = ['fadeIn','fadeOut','slideInUp','slideInDown','slideInLeft','slideInRight','scaleIn','pop','flipY','staggerChildren'] as const
const triggers = ['appear','enter','exit','hover','press','focus','loop','scroll'] as const

export default function MotionPanel() {
  const selected = useFigmaStore((s)=>s.selectedNode) as any
  const setNodeMotion = useFigmaStore((s)=>s.setNodeMotion)
  const motion = useMemo(()=> (selected?.motion ?? {}), [selected])
  if (!selected) return null
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wider text-gray-400">Motion (v0)</div>
      <label className="flex items-center justify-between py-1 text-sm">
        <span className="text-gray-500">Preset</span>
        <select className="w-36 rounded border border-gray-200 px-2 py-1 text-sm"
          value={motion.preset ?? ''}
          onChange={(e)=>setNodeMotion(selected.id,{ preset: (e.target.value||undefined) as any })}
        >
          <option value="">(none)</option>
          {presets.map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <label className="flex items-center justify-between py-1 text-sm">
        <span className="text-gray-500">Trigger</span>
        <select className="w-36 rounded border border-gray-200 px-2 py-1 text-sm"
          value={motion.trigger ?? ''}
          onChange={(e)=>setNodeMotion(selected.id,{ trigger: (e.target.value||undefined) as any })}
        >
          <option value="">(none)</option>
          {triggers.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label className="flex items-center justify-between py-1 text-sm">
        <span className="text-gray-500">Duration(ms)</span>
        <input type="number" className="w-36 rounded border border-gray-200 px-2 py-1 text-right"
          value={Number((motion.options?.duration as any) ?? 0)}
          onChange={(e)=>setNodeMotion(selected.id,{ options: { ...(motion.options??{}), duration: Number(e.target.value)||0 } })}
        />
      </label>
    </div>
  )
}


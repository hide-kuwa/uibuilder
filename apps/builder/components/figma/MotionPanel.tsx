'use client'
import { useMemo } from 'react'
import { useFigmaStore } from '../../lib/figma/store'
import type { NodeMotion } from '../../lib/figma/model'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <div className="w-40">{children}</div>
    </label>
  )
}

export default function MotionPanel() {
  const n = useFigmaStore((s) => s.selectedNode)
  const setNodeMotion = useFigmaStore((s) => s.setNodeMotion)

  const motion = (n as any)?.motion as NodeMotion | undefined
  const preset = motion?.preset ?? 'fadeIn'
  const trigger = motion?.trigger ?? 'appear'
  const duration = typeof motion?.options?.duration === 'number' ? motion?.options?.duration : undefined
  const distance = typeof motion?.options?.distance === 'number' ? motion?.options?.distance : undefined
  const engine = motion?.engine ?? 'framer'

  const presets = useMemo(() => ['fadeIn','fadeOut','slideInUp','slideInDown','slideInLeft','slideInRight','scaleIn','pop','flipY','staggerChildren'], [])
  const triggers = useMemo(() => ['appear','enter','exit','hover','press','focus','loop','scroll'], [])
  const engines = useMemo(() => ['framer','anime'], [])

  if (!n) return null

  return (
    <div className="mt-4">
      <div className="text-xs uppercase tracking-wider text-gray-400">Motion (v0)</div>
      <Row label="Preset">
        <select className="w-full border rounded px-2 py-1 text-sm"
          value={preset}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setNodeMotion(n.id, { preset: e.currentTarget.value as any })}>
          {presets.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Row>
      <Row label="Trigger">
        <select className="w-full border rounded px-2 py-1 text-sm"
          value={trigger}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setNodeMotion(n.id, { trigger: e.currentTarget.value as any })}>
          {triggers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Row>
      <Row label="Engine">
        <select className="w-full border rounded px-2 py-1 text-sm"
          value={engine}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setNodeMotion(n.id, { engine: e.currentTarget.value as any })}>
          {engines.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Row>
      <Row label="Duration(ms)">
        <input type="number" className="w-full border rounded px-2 py-1 text-right"
          value={duration ?? 280}
          onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setNodeMotion(n.id, { options: { duration: Number(e.currentTarget.value) }})}/>
      </Row>
      <Row label="Distance(px)">
        <input type="number" className="w-full border rounded px-2 py-1 text-right"
          value={distance ?? 24}
          onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setNodeMotion(n.id, { options: { distance: Number(e.currentTarget.value) }})}/>
      </Row>
      <div className="text-xs text-gray-400 mt-1">※ 再生は後続PR。Reduced Motionは既定で尊重。</div>
    </div>
  )
}

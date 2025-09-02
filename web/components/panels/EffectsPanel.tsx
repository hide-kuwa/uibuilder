'use client'
import { useState } from 'react'
import type { Action, AnimePresetKey } from '@/types/actions'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
      <div className="mb-2 text-xs uppercase tracking-wider text-white/60">{title}</div>
      {children}
    </div>
  )
}

/** ここが新規：Motion (anime.js) */
function AnimePane({ onAdd, defaultTarget }: { onAdd: (a: Action) => void; defaultTarget?: string }) {
  const [preset, setPreset] = useState<AnimePresetKey>('fadeIn')
  const [duration, setDuration] = useState(300)
  const [easing, setEasing] = useState('easeInOutQuad')
  const [delay, setDelay] = useState(0)

  const add = () =>
    onAdd({
      type: 'anime',
      preset,
      target: defaultTarget ? { type: 'nodeId', value: defaultTarget } : undefined,
      options: { duration, easing, delay },
    })

  return (
    <div className="td-form-scope space-y-2">
      <label className="block text-xs text-white/70">Preset</label>
      <select
        className="w-full"
        value={preset}
        onChange={(e) => setPreset(e.target.value as AnimePresetKey)}
      >
        {['fadeIn','fadeOut','slideInUp','slideInRight','slideInDown','slideInLeft','scaleIn','scaleOut','rotateIn','rotateOut','pulse','shake']
          .map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-white/70">Duration(ms)</label>
          <input className="w-full" type="number" value={duration} onChange={(e)=>setDuration(+e.target.value || 0)} />
        </div>
        <div>
          <label className="block text-xs text-white/70">Delay(ms)</label>
          <input className="w-full" type="number" value={delay} onChange={(e)=>setDelay(+e.target.value || 0)} />
        </div>
        <div>
          <label className="block text-xs text-white/70">Easing</label>
          <input className="w-full" value={easing} onChange={(e)=>setEasing(e.target.value)} placeholder="easeInOutQuad" />
        </div>
      </div>

      <button onClick={add} className="h-9 w-full rounded-xl bg-white/10 text-sm hover:bg-white/15">
        Add action
      </button>
    </div>
  )
}

/** 既存の visual 側はそのまま（例としてダミーのプレースホルダー） */
function EffectsVisualPane() {
  return <div className="text-white/60">（既存の Effects UI をここに）</div>
}

/** 親：2カラム配置 */
export default function EffectsPanel({
  onAddAction,
  selectedNodeId,
}: {
  onAddAction: (a: Action) => void
  selectedNodeId?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Section title="Effects (visual)">
        <EffectsVisualPane />
      </Section>

      <Section title="Motion (anime.js)">
        <AnimePane onAdd={onAddAction} defaultTarget={selectedNodeId} />
      </Section>
    </div>
  )
}

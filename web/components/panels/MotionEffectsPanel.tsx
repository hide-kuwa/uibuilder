'use client'
import type { MotionEffect, AnimePresetKey, MotionEvent } from '@/types/motion'

const PRESETS: AnimePresetKey[] = [
  'fadeIn','fadeOut',
  'slideInUp','slideInRight','slideInDown','slideInLeft',
  'scaleIn','scaleOut',
  'rotateIn','rotateOut',
  'pulse','shake'
]
const EVENTS: MotionEvent[] = ['click','doubleClick','mount','inView']

function rid() { return Math.random().toString(36).slice(2, 9) }

export default function MotionEffectsPanel({
  value,
  onChange,
  defaultTargetNodeId,
  className,
}: {
  value: MotionEffect[]
  onChange: (next: MotionEffect[]) => void
  defaultTargetNodeId?: string
  className?: string
}) {
  const list = value ?? []

  const add = () => {
    const eff: MotionEffect = {
      id: rid(),
      preset: 'fadeIn',
      runWhen: ['click'],
      target: defaultTargetNodeId ? { type: 'nodeId', value: defaultTargetNodeId } : undefined,
      options: { duration: 300, easing: 'easeInOutQuad' }
    }
    onChange([...list, eff])
  }

  const del = (id: string) => onChange(list.filter(e => e.id !== id))
  const patch = (id: string, part: Partial<MotionEffect>) =>
    onChange(list.map(e => e.id === id ? { ...e, ...part } : e))
  const patchOpt = (id: string, part: Partial<NonNullable<MotionEffect['options']>>) =>
    onChange(list.map(e => e.id === id ? { ...e, options: { ...(e.options ?? {}), ...part } } : e))

  return (
    <div className={`td-form-scope space-y-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white/80">Motion (anime.js)</div>
        <button onClick={add} className="h-8 rounded-lg bg-white/10 px-3 text-sm hover:bg-white/15">+ Add</button>
      </div>

      {list.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/60">
          まだ効果がありません。「+ Add」で追加してください。
        </div>
      )}

      {list.map((eff, i) => (
        <div key={eff.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs text-white/70">effect #{i + 1}</div>
            <button onClick={() => del(eff.id)} className="text-xs text-red-300/80 hover:text-red-200">remove</button>
          </div>

          {/* 行1: Preset / Duration / Delay */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-white/70">preset</label>
              <select
                className="w-full"
                value={eff.preset}
                onChange={(e) => patch(eff.id, { preset: e.target.value as AnimePresetKey })}
              >
                {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/70">duration(ms)</label>
              <input
                className="w-full"
                type="number"
                value={eff.options?.duration ?? 300}
                onChange={(e) => patchOpt(eff.id, { duration: +e.target.value || 0 })}
              />
            </div>
            <div>
              <label className="block text-xs text-white/70">delay(ms)</label>
              <input
                className="w-full"
                type="number"
                value={eff.options?.delay ?? 0}
                onChange={(e) => patchOpt(eff.id, { delay: +e.target.value || 0 })}
              />
            </div>
          </div>

          {/* 行2: easing / loop / direction */}
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-white/70">easing</label>
              <input
                className="w-full"
                placeholder="easeInOutQuad"
                value={eff.options?.easing ?? 'easeInOutQuad'}
                onChange={(e) => patchOpt(eff.id, { easing: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-white/70">loop</label>
              <input
                className="w-full"
                placeholder="false / true / 回数"
                value={String(eff.options?.loop ?? 'false')}
                onChange={(e) => {
                  const v = e.target.value.trim()
                  patchOpt(eff.id, v === 'true' ? { loop: true } : v === 'false' ? { loop: false } : { loop: Number(v) || 0 })
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-white/70">direction</label>
              <select
                className="w-full"
                value={eff.options?.direction ?? 'normal'}
                onChange={(e) => patchOpt(eff.id, { direction: e.target.value as any })}
              >
                {['normal','reverse','alternate'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* 行3: Run when */}
          <div className="mt-2">
            <div className="mb-1 text-xs text-white/70">run when</div>
            <div className="flex flex-wrap gap-3">
              {EVENTS.map(ev => {
                const checked = eff.runWhen.includes(ev)
                return (
                  <label key={ev} className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? eff.runWhen.filter(x => x !== ev)
                          : [...eff.runWhen, ev]
                        patch(eff.id, { runWhen: next })
                      }}
                    />
                    <span className="text-white/80">{ev}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

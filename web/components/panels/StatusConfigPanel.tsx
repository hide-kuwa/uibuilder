'use client'
import { useStatusConfig } from '@/stores/statusConfig'
import type { AnyStatus } from '@/types/status'
import { MOTION_PRESETS } from '@/lib/motion-presets'

const LABEL: Record<AnyStatus, string> = {
  visited: '行った',
  living: '住んでる',
  notVisited: '行ってない',
  want: '行きたい(ブースト)',
  hasPhoto: '写真あり(ブースト)',
}

export default function StatusConfigPanel() {
  const { config, setStyle, reset } = useStatusConfig()
  const keys = Object.keys(config) as AnyStatus[]

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">Status settings</div>
        <button className="text-xs text-red-500" onClick={reset}>Reset</button>
      </div>

      <div className="space-y-4">
        {keys.map((k) => {
          const s = config[k]
          return (
            <div key={k} className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium">{LABEL[k]}</div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-gray-500">
                  <div className="mb-1">color</div>
                  <input type="color" value={s.color} onChange={(e) => setStyle(k, { color: e.target.value })} />
                </label>

                <label className="text-xs text-gray-500">
                  <div className="mb-1">base preset</div>
                  <select
                    className="w-full"
                    value={s.motionPreset ?? ''}
                    onChange={(e) => setStyle(k, { motionPreset: e.target.value || undefined })}
                  >
                    <option value="">(none)</option>
                    {Object.keys(MOTION_PRESETS).map(p => (
                      <option key={p} value={p}>{MOTION_PRESETS[p].name}</option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-gray-500">
                  <div className="mb-1">base strength</div>
                  <input type="range" min={0} max={100}
                    value={s.motionStrength ?? 0}
                    onChange={(e)=> setStyle(k, { motionStrength: Number(e.target.value) })}/>
                </label>

                <label className="text-xs text-gray-500">
                  <div className="mb-1">hover preset</div>
                  <select
                    className="w-full"
                    value={s.hoverPreset ?? ''}
                    onChange={(e) => setStyle(k, { hoverPreset: e.target.value || undefined })}
                  >
                    <option value="">(none)</option>
                    {Object.keys(MOTION_PRESETS).map(p => (
                      <option key={p} value={p}>{MOTION_PRESETS[p].name}</option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-gray-500">
                  <div className="mb-1">hover strength</div>
                  <input type="range" min={0} max={100}
                    value={s.hoverStrength ?? 0}
                    onChange={(e)=> setStyle(k, { hoverStrength: Number(e.target.value) })}/>
                </label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

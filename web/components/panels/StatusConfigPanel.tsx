'use client'
import { useBuilderStore } from '@/stores/builder'
import type { BaseStatus, Overlay, MotionPresetId, StatusConfig } from '@/types/status'

const BASES: BaseStatus[] = ['visited','resident','notVisited']
const OVERS: Overlay[] = ['want','hasPhotos']
const EFFECTS: MotionPresetId[] = ['none','pulse-glow','bounce','float','trail','arc-zoom-fade','shuffle-cards']

export default function StatusConfigPanel() {
  const cfg = useBuilderStore(s=> s.statusConfig)
  const setCfg = useBuilderStore(s=> s.setStatusConfig)

  const setBaseColor = (k: BaseStatus, color: string) =>
    setCfg(prev => ({ ...prev, base: { ...prev.base, [k]: { ...prev.base[k], color } } }))
  const setBaseEffects = (k: BaseStatus, arr: MotionPresetId[]) =>
    setCfg(prev => ({ ...prev, base: { ...prev.base, [k]: { ...prev.base[k], effects: arr } } }))

  const setOv = (k: Overlay, patch: Partial<StatusConfig['overlay'][Overlay]>) =>
    setCfg(prev => ({ ...prev, overlay: { ...prev.overlay, [k]: { ...prev.overlay[k], ...patch } } }))

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-4">
      <h3 className="text-sm font-semibold">ステータス設定</h3>

      <section>
        <div className="mb-2 text-xs font-medium text-gray-500">基底（ベース）</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {BASES.map(k => (
            <div key={k} className="rounded-lg border p-3">
              <div className="mb-2 text-xs">{k}</div>
              <input type="color" value={cfg.base[k].color} onChange={(e)=> setBaseColor(k, e.target.value)} />
              <div className="mt-2 text-xs text-gray-500">エフェクト</div>
              <select
                multiple
                className="mt-1 w-full rounded border px-2 py-1 text-xs"
                value={cfg.base[k].effects}
                onChange={(e)=> {
                  const arr = Array.from(e.currentTarget.selectedOptions).map(o => o.value as MotionPresetId)
                  setBaseEffects(k, arr)
                }}
              >
                {EFFECTS.map(id => <option key={id} value={id}>{id}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 text-xs font-medium text-gray-500">オーバーレイ（重ね効果）</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {OVERS.map(k => (
            <div key={k} className="rounded-lg border p-3">
              <div className="mb-2 text-xs">{k}</div>
              <label className="block text-xs">
                カラー
                <input type="color" className="ml-2 align-middle" value={cfg.overlay[k].color}
                  onChange={(e)=> setOv(k, { color: e.target.value })}/>
              </label>
              <label className="mt-2 block text-xs">
                優先度
                <input type="number" className="ml-2 w-20 rounded border px-1 py-0.5 text-xs"
                  value={cfg.overlay[k].priority}
                  onChange={(e)=> setOv(k, { priority: Number(e.target.value) })}/>
              </label>
              <label className="mt-2 block text-xs">
                モード
                <select className="ml-2 rounded border px-1 py-0.5 text-xs"
                  value={cfg.overlay[k].mode}
                  onChange={(e)=> setOv(k, { mode: e.target.value as any })}>
                  <option value="blend">blend</option>
                  <option value="override">override</option>
                  <option value="glow">glow</option>
                </select>
              </label>
              <div className="mt-2 text-xs text-gray-500">エフェクト</div>
              <select
                multiple
                className="mt-1 w-full rounded border px-2 py-1 text-xs"
                value={cfg.overlay[k].effects}
                onChange={(e)=> {
                  const arr = Array.from(e.currentTarget.selectedOptions).map(o => o.value) as MotionPresetId[]
                  setOv(k, { effects: arr })
                }}
              >
                {EFFECTS.map(id => <option key={id} value={id}>{id}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center gap-3">
        <label className="text-xs">
          合成色モード
          <select className="ml-2 rounded border px-2 py-1 text-xs"
            value={cfg.compose.colorMode}
            onChange={(e)=> setCfg(p=> ({ ...p, compose: { ...p.compose, colorMode: e.target.value as any } }))}>
            <option value="blend">blend</option>
            <option value="override">override</option>
          </select>
        </label>
        <label className="text-xs">
          適用順
          <select className="ml-2 rounded border px-2 py-1 text-xs"
            value={cfg.compose.order}
            onChange={(e)=> setCfg(p=> ({ ...p, compose: { ...p.compose, order: e.target.value as any } }))}>
            <option value="priority">priority（優先度順）</option>
            <option value="fixed">fixed（チェック順）</option>
          </select>
        </label>
      </section>
    </div>
  )
}

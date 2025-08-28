'use client'
import React, { useMemo } from 'react'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { defaultEffect } from '@/types/interactions'
import type { Effect, InteractionPreset, Trigger } from '@/types/interactions'
import { buildPresetCss } from '@/lib/interactionCss'
import { emitApply } from '@/lib/presetChannel'

const ALL_TRIGGERS: Trigger[] = ['hover','active','focus','focusWithin','groupHover']
const EFFECT_OPTIONS: Effect['kind'][] = ['bgColor','textColor','borderColor','shadow','scale','opacity','translate','rotate','outline','cursor']

export default function ActionDesignerPage() {
  const { presets, selectedId, add, update, remove, duplicate, select, import: importPresets, export: exportPresets } = useInteractionRegistry()

  const onNew = () => add({ name:'New Preset', triggers:['hover'], effects:[], transitionMs:120, easing:'cubic-bezier(.2,.8,.2,1)' })
  const sel = presets.find(p => p.id === selectedId)

  const css = useMemo(() => sel ? buildPresetCss('preview-node', sel) : '', [sel])

  return (
    <div className="h-full flex bg-neutral-950 text-neutral-100">
      {/* 左：一覧 */}
      <div className="w-72 border-r border-neutral-800 p-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-neutral-800 rounded" onClick={onNew}>＋ 新規</button>
          <label className="px-2 py-1 bg-neutral-800 rounded cursor-pointer">
            Import
            <input type="file" accept="application/json" hidden onChange={async (e)=>{
              const f = e.target.files?.[0]; if (!f) return
              const text = await f.text()
              try { importPresets(JSON.parse(text)) } catch {}
            }} />
          </label>
          <button className="px-2 py-1 bg-neutral-800 rounded" onClick={()=>{
            const blob = new Blob([exportPresets()], { type:'application/json' })
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'action-presets.json'; a.click()
          }}>Export</button>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto">
          {presets.map(p => (
            <div key={p.id}
              className={`p-2 rounded cursor-pointer mb-1 ${p.id===selectedId?'bg-neutral-800':'hover:bg-neutral-900'}`}
              onClick={()=>select(p.id)}
            >
              <div className="text-sm">{p.name}</div>
              <div className="text-[11px] text-neutral-400">{p.triggers.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 右：編集＋プレビュー */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4">
        {/* エディタ */}
        <div className="border border-neutral-800 rounded p-3">
          {!sel ? (
            <div className="text-neutral-400 text-sm">左の「＋ 新規」から作成してね。</div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <input
                  className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
                  value={sel.name}
                  onChange={(e)=>update(sel.id, { name:e.target.value })}
                />
                <button className="px-2 py-1 bg-neutral-800 rounded" onClick={()=>duplicate(sel.id)}>Duplicate</button>
                <button className="px-2 py-1 bg-red-600/80 rounded" onClick={()=>remove(sel.id)}>Delete</button>
                <div className="ml-auto text-[12px] text-neutral-400">updated {new Date(sel.updatedAt).toLocaleString()}</div>
              </div>

              {sel && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Apply to selection on Editor:</span>
                  <button className="px-2 py-1 bg-sky-600/80 rounded text-sm" onClick={()=>emitApply(sel.id, 'replace')}>Replace</button>
                  <button className="px-2 py-1 bg-neutral-800 rounded text-sm" onClick={()=>emitApply(sel.id, 'append')}>Append</button>
                  <button className="px-2 py-1 bg-rose-700/80 rounded text-sm" onClick={()=>emitApply(sel.id, 'remove')}>Remove</button>
                </div>
              )}

              {/* Trigger */}
              <div className="mt-3 text-xs text-neutral-300">Triggers</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {ALL_TRIGGERS.map(t => {
                  const on = sel.triggers.includes(t)
                  return (
                    <label key={t} className={`px-2 py-[6px] rounded border ${on?'border-sky-500 bg-sky-500/10':'border-neutral-700'}`}>
                      <input type="checkbox" className="mr-1" checked={on}
                        onChange={(e)=>{
                          const next = on ? sel.triggers.filter(x=>x!==t) : [...sel.triggers, t]
                          update(sel.id, { triggers: next })
                        }} />
                      {t}
                    </label>
                  )
                })}
              </div>

              {/* Transition */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-neutral-300">transition</span>
                <input type="number" min={0} step={10}
                  className="w-20 bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
                  value={sel.transitionMs ?? 120}
                  onChange={(e)=>update(sel.id, { transitionMs: parseInt(e.target.value||'0',10) })}
                />
                <span>ms</span>
                <input
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
                  value={sel.easing ?? 'cubic-bezier(.2,.8,.2,1)'}
                  onChange={(e)=>update(sel.id, { easing: e.target.value })}
                  placeholder="e.g. ease-in-out or cubic-bezier(...)"
                />
              </div>

              {/* Effects */}
              <div className="mt-3 text-xs text-neutral-300">Effects</div>
              <EffectEditor preset={sel} onChange={(fx)=>update(sel.id, { effects: fx })} />
            </>
          )}
        </div>

        {/* プレビュー */}
        <div className="border border-neutral-800 rounded p-3">
          <div className="text-xs text-neutral-400 mb-2">Preview（必要なら親に .group を付けて Group Hover も確認）</div>
          <div className="group p-6 bg-neutral-900 rounded-lg inline-block">
            <div data-node-id="preview-node" className="w-64 h-32 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-100 flex items-center justify-center">
              Hover me
            </div>
          </div>
          {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
        </div>
      </div>
    </div>
  )
}

function EffectEditor({ preset, onChange }:{ preset: InteractionPreset; onChange:(e:Effect[])=>void }) {
  const fx = preset.effects || []
  const [pick, setPick] = React.useState<Effect['kind']>('scale')
  const add = () => onChange([...(fx), defaultEffect(pick)])
  const rm = (i:number) => onChange(fx.filter((_,idx)=>idx!==i))
  const patch = (i:number, k:keyof Effect, v:any) => {
    const next = fx.slice(); next[i] = { ...next[i], [k]: v } as Effect; onChange(next)
  }
  return (
    <>
      <div className="flex items-center gap-2 mt-1">
        <select className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
          value={pick} onChange={(e)=>setPick(e.target.value as any)}>
          {EFFECT_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="px-2 py-1 bg-neutral-800 rounded" onClick={add}>＋ Add</button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {fx.map((ef,i)=>(
          <div key={i} className="p-2 rounded bg-neutral-900 border border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-neutral-300">{ef.kind}</div>
              <button className="text-[11px] text-red-300" onClick={()=>rm(i)}>remove</button>
            </div>
            {/* 簡易編集UI（必要十分） */}
            {ef.kind==='bgColor'    && <ColorRow v={ef.value} set={(v)=>patch(i,'value',v)} label="bg" />}
            {ef.kind==='textColor'  && <ColorRow v={ef.value} set={(v)=>patch(i,'value',v)} label="text" />}
            {ef.kind==='borderColor'&& <ColorRow v={ef.value} set={(v)=>patch(i,'value',v)} label="border" />}
            {ef.kind==='shadow'     && <SelectRow v={ef.value} set={(v)=>patch(i,'value',v)} opts={['sm','md','lg','xl']} label="shadow" />}
            {ef.kind==='scale'      && <NumRow v={ef.value} set={(v)=>patch(i,'value',v)} min={0.5} max={2} step={0.01} label="scale" />}
            {ef.kind==='opacity'    && <NumRow v={ef.value} set={(v)=>patch(i,'value',v)} min={0} max={1} step={0.05} label="opacity" />}
            {ef.kind==='translate'  && <div className="flex gap-2">
              <NumRow v={ef.x ?? 0} set={(v)=>patch(i,'x',v)} min={-200} max={200} step={1} label="x(px)" />
              <NumRow v={ef.y ?? 0} set={(v)=>patch(i,'y',v)} min={-200} max={200} step={1} label="y(px)" />
            </div>}
            {ef.kind==='rotate'     && <NumRow v={ef.deg} set={(v)=>patch(i,'deg',v)} min={-45} max={45} step={1} label="deg" />}
            {ef.kind==='outline'    && <div className="flex gap-2">
              <ColorRow v={ef.color} set={(v)=>patch(i,'color',v)} label="color" />
              <NumRow v={ef.width} set={(v)=>patch(i,'width',v)} min={0} max={8} step={1} label="width" />
              <SelectRow v={ef.style ?? 'solid'} set={(v)=>patch(i,'style',v as any)} opts={['solid','dashed','dotted']} label="style" />
            </div>}
            {ef.kind==='cursor'     && <SelectRow v={ef.value} set={(v)=>patch(i,'value',v as any)} opts={['default','pointer','move','grab','text']} label="cursor" />}
          </div>
        ))}
      </div>
    </>
  )
}

function ColorRow({v,set,label}:{v:string; set:(x:string)=>void; label:string}) {
  return <div className="flex items-center gap-2 text-xs">
    <span className="w-14 text-neutral-400">{label}</span>
    <input type="color" value={v} onChange={(e)=>set(e.target.value)} className="h-6 w-10 bg-transparent border border-neutral-700 rounded" />
    <input value={v} onChange={(e)=>set(e.target.value)} className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1" />
  </div>
}
function NumRow({v,set,label,min,max,step}:{v:number; set:(x:number)=>void; label:string; min:number; max:number; step:number}) {
  return <div className="flex items-center gap-2 text-xs">
    <span className="w-14 text-neutral-400">{label}</span>
    <input type="number" min={min} max={max} step={step} value={v}
      onChange={(e)=>set(parseFloat(e.target.value))}
      className="w-24 bg-neutral-900 border border-neutral-700 rounded px-2 py-1" />
  </div>
}
function SelectRow({v,set,label,opts}:{v:string; set:(x:string)=>void; label:string; opts:string[]}) {
  return <div className="flex items-center gap-2 text-xs">
    <span className="w-14 text-neutral-400">{label}</span>
    <select value={v} onChange={(e)=>set(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1">
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
}

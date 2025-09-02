'use client'
import { usePresetDraft } from '@/store/presetDraftStore'
import Toggle from './_ui/Toggle'
import { CardFieldset } from './_ui/Field'

export default function TriggersCard(){
  const t = usePresetDraft(s=>s.draft.triggers)
  const set = usePresetDraft(s=>s.setTriggers)
  return (
    <CardFieldset title="Triggers (CSS states)">
      <div className="flex flex-wrap gap-2 mb-3">
        <Toggle checked={t.hover} onChange={v=>set({hover:v})} label="hover"/>
        <Toggle checked={t.active} onChange={v=>set({active:v})} label="active"/>
        <Toggle checked={t.focus} onChange={v=>set({focus:v})} label="focus"/>
        <Toggle checked={t.focusWithin} onChange={v=>set({focusWithin:v})} label="focusWithin"/>
        <Toggle checked={t.groupHover} onChange={v=>set({groupHover:v})} label="groupHover"/>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <label className="flex items-center gap-1">transition
          <input className="border rounded px-2 py-1 w-20 ml-1" type="number" value={t.transitionMs} onChange={e=>set({transitionMs:+e.target.value})}/> ms
        </label>
        <input className="border rounded px-2 py-1 w-[260px]" placeholder="easing (cubic-bezier...)" value={t.easing} onChange={e=>set({easing:e.target.value})}/>
      </div>
    </CardFieldset>
  )
}

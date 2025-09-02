'use client'
import { create } from 'zustand'
import type { PresetDraft, ActionDef, Effect, TriggerState } from '@/types/presets-ui'

const defaultTriggers: TriggerState = {
  hover:true, active:false, focus:false, focusWithin:false, groupHover:false,
  transitionMs:120, easing:'cubic-bezier(2,.8,2,1)',
}

export const usePresetDraft = create<{
  draft: PresetDraft
  setName:(v:string)=>void
  setTriggers:(p:Partial<TriggerState>)=>void
  addEffect:(e:Effect)=>void
  updateEffect:(idx:number, e:Partial<Effect>)=>void
  removeEffect:(idx:number)=>void
  addAction:(a:ActionDef)=>void
  updateAction:(idx:number, a:Partial<ActionDef>)=>void
  removeAction:(idx:number)=>void
}>((set)=>({
  draft: {
    name:'New Preset',
    triggers: defaultTriggers,
    effects: [{ kind:'scale', value:{ scale:1.09 } }, { kind:'bgColor', value:{ color:'#004cff' } }, { kind:'shadow', value:{ level:'xl' } }, { kind:'opacity', value:{ opacity:0.9 } }],
    actions: [{
      type:'openUrl',
      params:{ url:'' },
      if:null,
      throttleMs:null,
      debounceMs:null,
      when:{ click:true, doubleClick:true, mount:false, inView:false, delayMs:null }
    }],
  },
  setName:(v)=>set(s=>({ draft:{ ...s.draft, name:v }})),
  setTriggers:(p)=>set(s=>({ draft:{ ...s.draft, triggers:{ ...s.draft.triggers, ...p }}})),
  addEffect:(e)=>set(s=>({ draft:{ ...s.draft, effects:[...s.draft.effects, e]}})),
  updateEffect:(i,e)=>set(s=>{ const arr=[...s.draft.effects]; arr[i]={ ...arr[i], ...e }; return { draft:{ ...s.draft, effects:arr }}}),
  removeEffect:(i)=>set(s=>{ const arr=[...s.draft.effects]; arr.splice(i,1); return { draft:{ ...s.draft, effects:arr }}}),
  addAction:(a)=>set(s=>({ draft:{ ...s.draft, actions:[...s.draft.actions, a]}})),
  updateAction:(i,a)=>set(s=>{ const arr=[...s.draft.actions]; arr[i]={ ...arr[i], ...a }; return { draft:{ ...s.draft, actions:arr }}}),
  removeAction:(i)=>set(s=>{ const arr=[...s.draft.actions]; arr.splice(i,1); return { draft:{ ...s.draft, actions:arr }}}),
}))

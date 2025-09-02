'use client'
import { usePresetDraft } from '@/store/presetDraftStore'
import Toggle from './_ui/Toggle'
import { CardFieldset } from './_ui/Field'

export default function ActionsCard(){
  const actions = usePresetDraft(s=>s.draft.actions)
  const update = usePresetDraft(s=>s.updateAction)
  const remove = usePresetDraft(s=>s.removeAction)
  const add = usePresetDraft(s=>s.addAction)

  const addOpenUrl = () => add({
    type:'openUrl',
    params:{ url:'' },
    if:null, throttleMs:null, debounceMs:null,
    when:{ click:false, doubleClick:false, mount:false, inView:false, delayMs:null }
  })

  return (
    <CardFieldset title="Actions (run on events)">
      <div className="space-y-3">
        {actions.map((a,i)=>(
          <div key={i} className="border rounded p-2">
            <div className="flex items-center justify-between">
              <select className="border rounded px-2 py-1 text-xs"
                      value={a.type}
                      onChange={e=>update(i,{ type:e.target.value as any })}>
                <option value="openUrl">openUrl</option>
                <option value="emit">emit</option>
                <option value="toggleVar">toggleVar</option>
                <option value="copyToClipboard">copyToClipboard</option>
                <option value="navigate">navigate</option>
              </select>
              <button className="text-xs text-muted-foreground" onClick={()=>remove(i)}>Del</button>
            </div>

            {/* params（最小：URLのみUI） */}
            {a.type==='openUrl' && (
              <input className="mt-2 w-full border rounded px-2 py-1 text-xs"
                     placeholder="url"
                     value={a.params?.url ?? ''}
                     onChange={e=>update(i,{ params:{ ...a.params, url:e.target.value }})}/>
            )}

            {/* If / throttle / debounce（最小） */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <textarea className="border rounded px-2 py-1 text-xs col-span-1" placeholder="If (JSON logic)"
                        value={a.if ? JSON.stringify(a.if) : ''}
                        onChange={e=>update(i,{ if:e.target.value ? JSON.parse(e.target.value) : null })}/>
              <input className="border rounded px-2 py-1 text-xs" placeholder="Throttle (ms)"
                     value={a.throttleMs ?? ''} onChange={e=>update(i,{ throttleMs:e.target.value? +e.target.value : null })}/>
              <input className="border rounded px-2 py-1 text-xs" placeholder="Debounce (ms)"
                     value={a.debounceMs ?? ''} onChange={e=>update(i,{ debounceMs:e.target.value? +e.target.value : null })}/>
            </div>

            {/* === Run when（★ 枠内末尾に移動） === */}
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs font-medium text-muted-foreground mb-1">Run when</div>
              <div className="flex flex-wrap gap-2">
                <Toggle label="click"        checked={!!a.when?.click} onChange={v=>update(i,{ when:{ ...a.when, click:v }})}/>
                <Toggle label="doubleClick"  checked={!!a.when?.doubleClick} onChange={v=>update(i,{ when:{ ...a.when, doubleClick:v }})}/>
                <Toggle label="mount"        checked={!!a.when?.mount} onChange={v=>update(i,{ when:{ ...a.when, mount:v }})}/>
                <Toggle label="inView"       checked={!!a.when?.inView} onChange={v=>update(i,{ when:{ ...a.when, inView:v }})}/>
                <div className="flex items-center gap-1 text-xs">
                  <Toggle label="delay" checked={!!a.when?.delayMs} onChange={v=>update(i,{ when:{ ...a.when, delayMs: v ? (a.when?.delayMs ?? 300) : null }})}/>
                  <input className="border rounded px-1 w-20" type="number" value={a.when?.delayMs ?? ''} placeholder="ms"
                         onChange={e=>update(i,{ when:{ ...a.when, delayMs: e.target.value? +e.target.value : null }})}/>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="px-2 py-1 border rounded text-xs" onClick={addOpenUrl}>Add action</button>
      </div>
    </CardFieldset>
  )
}

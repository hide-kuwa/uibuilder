'use client'
import { useState } from 'react'
import { usePresetDraft } from '@/store/presetDraftStore'
import { CardFieldset } from './_ui/Field'

export default function EffectsCard(){
  const effects = usePresetDraft(s=>s.draft.effects)
  const [open, setOpen] = useState(false)

  return (
    <CardFieldset title="Effects (visual)">
      {/* ピル表示（一覧） */}
      <div className="flex flex-wrap gap-2 mb-2">
        {effects.map((e,i)=>(
          <span key={i} className="text-[11px] px-2 py-1 rounded-full border">{e.kind}</span>
        ))}
        <button className="text-[11px] px-2 py-1 rounded border" onClick={()=>setOpen(v=>!v)}>
          {open ? 'Hide details' : 'Edit details'}
        </button>
      </div>

      {/* 詳細は必要時のみ展開（元よりあっさり） */}
      {open && (
        <div className="space-y-2 text-xs">
          {effects.map((e,i)=>(
            <div key={i} className="border rounded px-2 py-1">
              <div className="font-medium">{e.kind}</div>
              <div className="opacity-70">（詳細エディタは従来のまま or 後続で追加）</div>
            </div>
          ))}
        </div>
      )}
    </CardFieldset>
  )
}


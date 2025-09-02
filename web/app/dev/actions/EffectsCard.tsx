'use client'
import { usePresetDraft } from '@/store/presetDraftStore'
import { CardFieldset } from './_ui/Field'

export default function EffectsCard(){
  const effects = usePresetDraft(s=>s.draft.effects)
  // 本実装では各 Effect の編集UIを詳細化、ここでは読み取り表示と remove のみ（最小差分）
  return (
    <CardFieldset title="Effects (visual)">
      <div className="space-y-2 text-xs">
        {effects.map((e, i)=>(
          <div key={i} className="flex items-center justify-between border rounded px-2 py-1">
            <span>{e.kind}</span>
            {/* 値編集は後続。今は一覧だけ */}
          </div>
        ))}
      </div>
    </CardFieldset>
  )
}

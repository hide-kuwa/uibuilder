'use client'
import React from 'react'
import TriggersCard from './TriggersCard'
import EffectsCard from './EffectsCard'
import ActionsCard from './ActionsCard'
import { PRESETS } from '@/lib/presets'
import { useBuilderStore } from '@/store/builderStore'
import { usePresetDraft } from '@/store/presetDraftStore'

export default function DevActionsPage(){
  const placePreset = useBuilderStore(s=>s.placePreset)
  const draft = usePresetDraft(s=>s.draft)
  const applySel = useBuilderStore(s=>s.applyInteractiveToSelection)
  const applyAll = useBuilderStore(s=>s.applyInteractiveToAll)

  return (
    <div className="p-3">
      <div className="grid grid-cols-[220px,1fr,320px] gap-4">
        {/* 左：プリセット一覧（元の密度） */}
        <aside className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold">Presets</div>
          </div>
          <div className="space-y-1">
            {PRESETS.map(p=>(
              <button key={p.id} onClick={()=>placePreset(p.id)}
                className="w-full text-left px-2 py-1 rounded border hover:bg-accent text-xs">
                <div className="font-medium truncate">{p.displayName}</div>
                <div className="opacity-60 truncate">{(p as any).tags?.join(', ')}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* 中央：編集フォーム */}
        <main className="space-y-3">
          {/* Apply（上部に戻す） */}
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 border rounded bg-primary text-primary-foreground"
              onClick={()=>applySel(draft,'replace')}>Replace Selection</button>
            <button className="px-3 py-1 border rounded" onClick={()=>applySel(draft,'append')}>Append Selection</button>
            <button className="px-3 py-1 border rounded" onClick={()=>applySel(draft,'remove')}>Remove Selection</button>
            <span className="opacity-50">|</span>
            <button className="px-3 py-1 border rounded" onClick={()=>applyAll(draft,'replace')}>Replace All</button>
            <button className="px-3 py-1 border rounded" onClick={()=>applyAll(draft,'append')}>Append All</button>
            <button className="px-3 py-1 border rounded" onClick={()=>applyAll(draft,'remove')}>Remove All</button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <TriggersCard/>
            {/* ★ When は Actions 枠の中に表示（下のActionsCardで対応） */}
            <ActionsCard/>
          </div>

          {/* 詳細エディタは削らない（EffectsCardの中に残す） */}
          <EffectsCard/>
        </main>

        {/* 右：プレビュー */}
        <aside>
          <div className="text-xs font-semibold mb-2">Preview（必要なら .group を付けて Group Hover も確認）</div>
          <div className="rounded-xl border p-6 bg-muted/10">
            <div className="h-32 rounded-lg border flex items-center justify-center text-sm">Hover me</div>
          </div>
        </aside>
      </div>
    </div>
  )
}


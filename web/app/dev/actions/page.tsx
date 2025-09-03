'use client'
import React from 'react'
import TriggersCard from './TriggersCard'
import EffectsCard from './EffectsCard'
import ActionsCard from './ActionsCard'
import { PRESETS } from '@/lib/presets'
import { useBuilderStore } from '@/store/builderStore'
import { usePresetDraft } from '@/store/presetDraftStore'
import InteractiveWrapper from '@/components/interactive/InteractiveWrapper'
import MotionEffectsPanel from '@/components/panels/MotionEffectsPanel'

export default function DevActionsPage(){
  const placePreset = useBuilderStore(s=>s.placePreset)
  const draft = usePresetDraft(s=>s.draft)
  const applySel = useBuilderStore(s=>s.applyInteractiveToSelection)
  const applyAll = useBuilderStore(s=>s.applyInteractiveToAll)
  const motion = usePresetDraft(s=>s.draft.motion)
  const setMotion = usePresetDraft(s=>s.setMotion)

  return (
    <div className="dev-actions p-3">
      <div className="grid grid-cols-[220px,1fr,320px] gap-4">
        {/* 左：プリセット一覧（元の密度） */}
        <aside className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground">Presets</div>
          </div>
          <div className="space-y-1">
            {PRESETS.map(p=>(
              <button key={p.id} onClick={()=>placePreset(p.id)}
                className="w-full text-left px-2 py-1 rounded border hover:bg-accent text-xs">
                <div className="font-medium truncate">{p.displayName}</div>
                <div className="text-foreground/70 truncate">{(p as any).tags?.join(', ')}</div>
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

          <div className="grid gap-3 md:grid-cols-2">
            <section className="md:col-start-1 md:row-start-1">
              <TriggersCard/>
            </section>

            <section className="md:col-start-2 md:row-start-1">
              <ActionsCard/>
            </section>

            <section className="md:col-start-1 md:row-start-2">
              <EffectsCard/>
            </section>

            <section className="md:col-start-2 md:row-start-2">
              <div className="rounded-md border p-3">
                <MotionEffectsPanel value={motion} onChange={setMotion} />
              </div>
            </section>
          </div>
        </main>

        {/* 右：プレビュー */}
        <aside>
          <div className="text-xs font-semibold mb-2 text-foreground">Preview</div>
          <div className="rounded-xl border p-4 bg-card">
            <div className="group">{/* groupHover 用 */}
              <InteractiveWrapper draft={draft}>
                <button
                  type="button"
                  tabIndex={0}
                  className="h-32 w-full rounded-lg border flex items-center justify-center
                             text-sm bg-transparent text-foreground cursor-pointer select-none"
                  title="Hover me"
                >
                  Hover me
                </button>
              </InteractiveWrapper>
            </div>
            <p className="mt-2 text-[11px] text-foreground/70">
              （Group Hover を試すときは外側の .group にマウスを乗せてください）
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}


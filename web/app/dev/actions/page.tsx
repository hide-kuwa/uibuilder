'use client'
import React from 'react'
import TriggersCard from './TriggersCard'
import EffectsCard from './EffectsCard'
import ActionsCard from './ActionsCard'
import ApplyBar from './ApplyBar'
import { usePresetDraft } from '@/store/presetDraftStore'
import { useBuilderStore } from '@/store/builderStore'

export default function DevActionsPage(){
  const draft = usePresetDraft(s=>s.draft)
  const applySel = useBuilderStore(s=>s.applyInteractiveToSelection)
  const applyAll = useBuilderStore(s=>s.applyInteractiveToAll)

  return (
    <div className="p-4 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-3"><TriggersCard/><EffectsCard/></div>
        <div className="space-y-3"><ActionsCard/></div>
      </div>

      <ApplyBar
        onReplace={()=>applySel(draft,'replace')}
        onAppend={()=>applySel(draft,'append')}
        onRemove={()=>applySel(draft,'remove')}
        onReplaceAll={()=>applyAll(draft,'replace')}
        onAppendAll={()=>applyAll(draft,'append')}
        onRemoveAll={()=>applyAll(draft,'remove')}
      />
    </div>
  )
}

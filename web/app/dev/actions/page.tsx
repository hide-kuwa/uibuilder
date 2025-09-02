'use client'
import React from 'react'
import TriggersCard from './TriggersCard'
import EffectsCard from './EffectsCard'
import ActionsCard from './ActionsCard'
import ApplyBar from './ApplyBar'
import { usePresetDraft } from '@/store/presetDraftStore'
import { useBuilderStore } from '@/store/builderStore'

export default function DevActionsPage(){
  const name = usePresetDraft(s=>s.draft.name)
  const setName = usePresetDraft(s=>s.setName)

  // 既存の適用関数に接続（仮：ここではアラートorストアの関数呼び出し）
  const replace = ()=>{/* TODO: draft -> 実際のノードへ適用 */}
  const append  = ()=>{/* TODO */}
  const remove  = ()=>{/* TODO */}
  const replaceAll = ()=>{/* TODO */}
  const appendAll  = ()=>{/* TODO */}
  const removeAll  = ()=>{/* TODO */}

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <input className="text-lg font-bold bg-transparent outline-none" value={name} onChange={e=>setName(e.target.value)}/>
        <div className="text-[11px] opacity-70">updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-3">
          <TriggersCard/>
          <EffectsCard/>
        </div>
        <div className="space-y-3">
          <ActionsCard/>{/* ← When がこの中に入っている */}
        </div>
      </div>

      <ApplyBar
        onReplace={replace} onAppend={append} onRemove={remove}
        onReplaceAll={replaceAll} onAppendAll={appendAll} onRemoveAll={removeAll}
      />
    </div>
  )
}

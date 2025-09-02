'use client'
import React, { useEffect } from 'react'
import { usePresetsFilter } from '@/store/presetsFilterStore'
import { useWorkspace } from '@/store/workspaceStore'

function Chip({ active, onClick, children, title }: { active?: boolean; onClick?: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={[
        'h-7 px-2 rounded-full border text-xs',
        active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default function PresetsFilterBar() {
  const { activeDomains, toggleDomain, setOnly, reset, alwaysShowCommon } = usePresetsFilter()
  const { workspace } = useWorkspace()

  useEffect(() => {
    const noFilter = !activeDomains.travel && !activeDomains.accounting
    if (noFilter && workspace === 'travel') setOnly('travel')
    if (noFilter && workspace === 'accounting') setOnly('accounting')
  }, [workspace])
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground">表示</span>
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-muted" title="常に表示（common）">
        📌 共通
      </span>
      <Chip active={activeDomains.travel} onClick={() => toggleDomain('travel')} title="旅系だけ表示/非表示">
        旅
      </Chip>
      <Chip active={activeDomains.accounting} onClick={() => toggleDomain('accounting')} title="会計系だけ表示/非表示">
        会計
      </Chip>
      <Chip onClick={() => setOnly('travel')} title="旅系のみ">
        旅のみ
      </Chip>
      <Chip onClick={() => setOnly('accounting')} title="会計のみ">
        会計のみ
      </Chip>
      <Chip onClick={reset} title="すべて表示（フィルタ無効）">
        全表示
      </Chip>
      {!alwaysShowCommon && (
        <span className="text-[11px] text-warning">※共通の常時表示が無効です</span>
      )}
    </div>
  )
}

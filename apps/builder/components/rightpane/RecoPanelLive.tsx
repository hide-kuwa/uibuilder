// apps/builder/components/rightpane/RecoPanelLive.tsx
'use client'
import React from 'react'
import { RecoPanel } from '@chizu/registry'
import { projectRows } from '@chizu/ui/reco/adapter'
import { computeMatches } from '@chizu/ui/reco/match'

type Row = { id: string; amount: number; memo?: string }

declare global {
  interface Window {
    __reco?: { left?: any[]; right?: any[] }
    getRecoRows?: () => { left: any[]; right: any[] } | undefined
  }
}

function pickRows(): { left: Row[]; right: Row[] } | undefined {
  const fromFn = typeof window.getRecoRows === 'function' ? window.getRecoRows() : undefined
  const fromVar = window.__reco
  const src = fromFn ?? fromVar
  if (!src?.left || !src?.right) return undefined

  // Map your production data keys to { id, amount, memo }
  const left  = projectRows(src.left,  { id: 'id', amount: 'amount', memo: 'memo' } as any)
  const right = projectRows(src.right, { id: 'id', amount: 'amount', memo: 'memo' } as any)
  return { left, right }
}

export function RecoPanelLive() {
  const [confirmed, setConfirmed] = React.useState<{ leftId: string; rightId: string }[]>([])
  const rows = React.useMemo(pickRows, [])
  if (!rows) {
    return (
      <div className="p-3 text-sm text-gray-600">
        データ未連携です。window.__reco か window.getRecoRows() で{' '}
        {`{ left: any[]; right: any[] }`}{' '}
        を提供すると候補が表示されます。
      </div>
    )
  }

  const matches = computeMatches(rows.left as any, rows.right as any, { amountTolerance: 200 })
  return (
    <div className="p-3 space-y-3">
      <RecoPanel
        left={rows.left as any}
        right={rows.right as any}
        matches={matches as any}
        onConfirm={(pair: any) => {
          setConfirmed((prev) => [...prev, pair])
          // append-only: notify host listeners
          try {
            window.dispatchEvent(new CustomEvent('reco', { detail: pair }))
          } catch {}
          try {
            // append-only: legacy newline variant for back-compat
            window.dispatchEvent(new CustomEvent('reco\n', { detail: pair }))
          } catch {}
          try {
            window.dispatchEvent(new CustomEvent('reco:confirmed', { detail: pair }))
          } catch {}
          // append-only: optional server hook (uncomment and implement route if needed)
          // fetch('/api/reco/confirm', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(pair) }).catch(()=>{})
        }}
      />
      <div className="text-xs text-gray-700">
        <div className="font-semibold mb-1">確定済み</div>
        <ul className="list-disc list-inside">
          {confirmed.map((p, i) => (
            <li key={i}>{p.leftId} ⇔ {p.rightId}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

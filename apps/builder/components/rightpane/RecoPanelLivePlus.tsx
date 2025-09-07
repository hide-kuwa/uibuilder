// apps/builder/components/rightpane/RecoPanelLivePlus.tsx
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

function readRows(): { left: Row[]; right: Row[] } | undefined {
  const fromFn = typeof window.getRecoRows === 'function' ? window.getRecoRows() : undefined
  const fromVar = window.__reco
  const src = fromFn ?? fromVar
  if (!src?.left || !src?.right) return undefined
  const left  = projectRows(src.left,  { id: 'id', amount: 'amount', memo: 'memo' } as any)
  const right = projectRows(src.right, { id: 'id', amount: 'amount', memo: 'memo' } as any)
  return { left, right }
}

export function RecoPanelLivePlus() {
  const [confirmed, setConfirmed] = React.useState<{ leftId: string; rightId: string }[]>([])
  const [tol, setTol] = React.useState<number>(() => {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem('reco.tol') : null
    return v ? Math.max(0, Number(v) || 0) : 200
  })

  const rows = React.useMemo(readRows, [])
  if (!rows) {
    return (
      <div className="p-3 text-sm text-gray-600">
        データ未連携です。window.__reco または window.getRecoRows() をセットしてください。
      </div>
    )
  }

  const matches = computeMatches(rows.left as any, rows.right as any, { amountTolerance: tol })

  const onTolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Math.max(0, Number(e.target.value) || 0)
    setTol(n)
    try { localStorage.setItem('reco.tol', String(n)) } catch {}
    try { window.dispatchEvent(new CustomEvent('reco:tolerance', { detail: { amountTolerance: n } })) } catch {}
    console.info('[audit] reco.tolerance.changed', { amountTolerance: n })
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <label htmlFor="reco-tol" className="text-gray-700">許容差額</label>
        <input
          id="reco-tol"
          type="number"
          min={0}
          step={1}
          value={tol}
          onChange={onTolChange}
          className="border rounded px-2 py-1 w-28"
        />
        <span className="text-gray-500">（円）</span>
      </div>

      <RecoPanel
        left={rows.left as any}
        right={rows.right as any}
        matches={matches as any}
        onConfirm={(pair: any) => {
          setConfirmed((prev) => [...prev, pair])
          try { window.dispatchEvent(new CustomEvent('reco', { detail: pair })) } catch {}
          try { window.dispatchEvent(new CustomEvent('reco\n', { detail: pair })) } catch {}
          try { window.dispatchEvent(new CustomEvent('reco:confirmed', { detail: pair })) } catch {}
          // fetch('/api/reco/confirm', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(pair) })
          console.info('[audit] reco.confirmed', pair)
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

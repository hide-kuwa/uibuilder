'use client'
import React from 'react'

export default function ChangeGate({ score, onConfirm, onCancel }: { score: number; onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [checked, setChecked] = React.useState(false)
  const [reason, setReason] = React.useState('')
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded shadow p-4 w-[420px]">
        <div className="font-semibold mb-1">Low Score Gate</div>
        <div className="text-sm text-gray-700">Current score is {score}. This is below the recommended threshold (70).</div>
        <div className="mt-2 text-xs text-gray-600">If you understand the risks, you can proceed by providing a reason.</div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <span>I understand and want to proceed</span>
        </label>
        <textarea className="mt-2 w-full border rounded px-2 py-1 text-sm" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-3 flex items-center gap-2 justify-end">
          <button className="underline text-gray-600" onClick={onCancel}>Cancel</button>
          <button className={`underline ${!checked ? 'opacity-60 pointer-events-none' : ''}`} onClick={() => onConfirm(reason)}>Proceed</button>
        </div>
      </div>
    </div>
  )
}


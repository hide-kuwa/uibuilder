'use client'
import React, { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import {
  loadLatestSnapshot,
  hasAnySnapshot,
  markSessionAlive,
  clearSessionAlive,
  wasPreviousSessionCrashed,
} from '@/lib/persist/snapshot'

export default function RecoveryPrompt() {
  const restoreFromSnapshot = useEditorStore((s) => s.restoreFromSnapshot)
  const [open, setOpen] = useState(false)
  const [ts, setTs] = useState<number | null>(null)

  useEffect(() => {
    markSessionAlive()
    const onUnload = () => clearSessionAlive()
    window.addEventListener('pagehide', onUnload)
    window.addEventListener('beforeunload', onUnload)
    ;(async () => {
      const crashed = wasPreviousSessionCrashed()
      const has = await hasAnySnapshot()
      if (crashed && has) {
        const latest = await loadLatestSnapshot()
        if (latest) {
          setTs(latest.ts)
          setOpen(true)
        }
      }
    })()
    return () => {
      window.removeEventListener('pagehide', onUnload)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [])

  if (!open) return null
  const dateStr = ts ? new Date(ts).toLocaleString() : ''

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-black/40">
      <div className="w-[420px] max-w-[92vw] rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl p-4">
        <div className="text-sm font-semibold mb-1">前回の編集内容を復旧しますか？</div>
        <div className="text-xs text-zinc-300 mb-4">
          アプリが異常終了した可能性があります。直近のスナップショット
          {dateStr && <span>（{dateStr}）</span>}
          から復旧できます。
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700"
            onClick={() => setOpen(false)}
          >
            今回はスキップ
          </button>
          <button
            className="px-3 py-1.5 rounded bg-sky-600 border border-sky-500 text-sm hover:bg-sky-500"
            onClick={async () => {
              const latest = await loadLatestSnapshot()
              if (latest) {
                restoreFromSnapshot(latest.doc)
              }
              setOpen(false)
            }}
          >
            復旧する
          </button>
        </div>
      </div>
    </div>
  )
}


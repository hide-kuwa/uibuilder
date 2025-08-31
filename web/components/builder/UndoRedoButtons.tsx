'use client'
import React from 'react'
import { useHistoryStore } from '@/store/historyStore'

export default function UndoRedoButtons() {
  const undo = useHistoryStore((s) => s.undo)
  const redo = useHistoryStore((s) => s.redo)
  const counts = useHistoryStore((s) => s.getCounts())
  return (
    <div className="flex items-center gap-2">
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={counts.past===0} onClick={undo}>Undo ({counts.past})</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={counts.future===0} onClick={redo}>Redo ({counts.future})</button>
    </div>
  )
}


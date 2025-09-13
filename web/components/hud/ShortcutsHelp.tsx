'use client'
import React from 'react'

export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const items = [
    ['Arrow', 'Move 1px'],
    ['Shift+Arrow', 'Move 10px'],
    ['Ctrl/Cmd+D', 'Duplicate'],
    ['Ctrl/Cmd+G', 'Group'],
    ['Ctrl/Cmd+Shift+G', 'Ungroup'],
    ['Ctrl/Cmd+]', 'Bring Forward'],
    ['Ctrl/Cmd+[', 'Send Backward'],
  ]
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-zinc-200 p-4 rounded border border-zinc-700 w-64 text-sm">
        <h2 className="text-base font-semibold mb-2">Shortcuts</h2>
        <ul className="space-y-1">
          {items.map(([k, v]) => (
            <li key={k} className="flex justify-between"><span className="font-mono">{k}</span><span>{v}</span></li>
          ))}
        </ul>
        <button
          className="mt-3 px-2 py-1 border border-zinc-600 rounded bg-zinc-800 hover:bg-zinc-700 w-full"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

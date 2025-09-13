'use client'

import React from 'react'

export default function KeyboardHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/50 z-[999]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-[640px] max-w-[90vw] rounded-2xl p-6 bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold mb-3">Keyboard Shortcuts</div>
        <ul className="grid grid-cols-2 gap-2 text-sm opacity-90">
          <li>
            <kbd>Alt</kbd> + Drag … Duplicate (snap, ghost)
          </li>
          <li>
            <kbd>←↑→↓</kbd> … Nudge
          </li>
          <li>
            <kbd>Shift</kbd> + Nudge … 10px
          </li>
          <li>
            <kbd>Ctrl/Cmd</kbd> + <kbd>C</kbd> … Copy
          </li>
          <li>
            <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> … Copy CSS
          </li>
          <li>
            <kbd>Ctrl/Cmd</kbd> + <kbd>?</kbd> … This help
          </li>
          {/* ほか：整列/ズーム/テーマ切替 等 */}
        </ul>
        <div className="mt-4 text-right">
          <button className="btn" onClick={onClose}>
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}


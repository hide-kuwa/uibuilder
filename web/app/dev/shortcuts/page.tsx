'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useBuilderStore } from '@/stores/builder'
import { useCanvasStore } from '@/stores/canvas'

export default function DevShortcutsPage() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const allNodeIds = useBuilderStore.getState().nodes.map((n) => n.id)
      const canvasStore = useCanvasStore.getState()
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        useBuilderStore.getState().undo?.()
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        useBuilderStore.getState().redo?.()
      } else if (e.key === 'p') {
        e.preventDefault()
        useBuilderStore.getState().publishAll()
      } else if (e.key === 'a') {
        e.preventDefault()
        canvasStore.setSelectedIds(allNodeIds)
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [])

  const shortcuts = [
    { combo: 'Ctrl + Z', desc: 'Undo' },
    { combo: 'Ctrl + Y', desc: 'Redo' },
    { combo: 'P', desc: 'Publish All' },
    { combo: 'A', desc: 'Select All Nodes' },
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/shortcuts</h1>
        <Link href="/dev/pages" className="text-sm underline">
          /dev/pages
        </Link>
      </div>
      <ul className="list-disc pl-5 space-y-2">
        {shortcuts.map((s) => (
          <li key={s.combo}>
            <span className="font-mono">{s.combo}</span>: {s.desc}
          </li>
        ))}
      </ul>
    </div>
  )
}


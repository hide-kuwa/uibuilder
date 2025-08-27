'use client'
import React, { useEffect } from 'react'
import { useEditorUIStore } from '@/store/editorUIStore'

export function OutlineToggles() {
  const { showOutline, setShowOutline, outlineMode, setOutlineMode } = useEditorUIStore()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'o') {
        if (e.altKey) {
          setOutlineMode((m) => (m === 'selection' ? 'hover' : m === 'hover' ? 'all' : 'selection'))
        } else {
          setShowOutline((v) => !v)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOutlineMode, setShowOutline])

  return (
    <div className="flex items-center gap-2 text-xs">
      <label className="flex items-center gap-1">
        <input type="checkbox" checked={showOutline} onChange={(e) => setShowOutline(e.target.checked)} />
        Outline
      </label>
      <select
        value={outlineMode}
        onChange={(e) => setOutlineMode(e.target.value as any)}
        className="bg-neutral-800 text-neutral-100 rounded px-1 py-[2px]"
        title="Outline Mode"
      >
        <option value="selection">Selection</option>
        <option value="hover">Hover</option>
        <option value="all">All</option>
      </select>
    </div>
  )
}

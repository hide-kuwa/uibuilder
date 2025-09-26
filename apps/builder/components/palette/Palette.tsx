'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRegistryStore } from '@/store/registry'
import type { PaletteItem } from '@/lib/registry/types'
import { startPaletteDrag } from '@/lib/dnd/paletteToCanvas'

const FALLBACK: PaletteItem[] = [
  { id: 'button', label: 'Button', icon: '•', hint: 'Clickable button' },
  { id: 'frame', label: 'Frame', icon: '□', hint: 'Container frame' },
  { id: 'image', label: 'Image', icon: '◎', hint: 'Image node' },
  { id: 'text', label: 'Text', icon: 'T', hint: 'Text node' },
]

export function Palette() {
  const [q, setQ] = useState('')
  const items = useRegistryStore((s) => s.items)
  const hydrate = useRegistryStore((s) => s.ensureHydratedOnce)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const base = items && items.length > 0 ? items : FALLBACK
  const list = useMemo(() => {
    const key = q.trim().toLowerCase()
    if (!key) return base
    return base.filter((it) =>
      it.id.toLowerCase().includes(key) || it.label.toLowerCase().includes(key)
    )
  }, [base, q])

  return (
    <div className="flex flex-col gap-2 p-2">
      <input
        placeholder="Search components..."
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        className="mb-2 rounded border px-2 py-1 text-sm"
        data-testid="palette-search"
      />
      {list.map((it: PaletteItem) => (
        <button
          key={it.id}
          data-testid={`palette-item-${it.id}`}
          draggable
          onDragStart={(ev) => startPaletteDrag(ev as any, it.id)}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-left hover:bg-accent"
          title={it.hint ?? it.label}
        >
          <span className="w-5 text-center">{it.icon ?? '?'}</span>
          <span className="text-sm">{it.label}</span>
        </button>
      ))}
      {list.length === 0 && (
        <div className="text-sm text-muted-foreground">No components found.</div>
      )}
    </div>
  )
}

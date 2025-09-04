'use client'

import { useState } from 'react'
import type { NestedMenuItem } from '../../lib/router/scanRoutes'

export interface MenuEditorProps {
  value: NestedMenuItem[]
  onChange?: (items: NestedMenuItem[]) => void
}

function EditorNode({
  item,
  depth,
  update,
}: {
  item: NestedMenuItem
  depth: number
  update: (n: NestedMenuItem) => void
}) {
  const [label, setLabel] = useState(item.label)
  const [hidden, setHidden] = useState(!!item.hidden)
  const [children, setChildren] = useState(item.children ?? [])

  const handleChildChange = (idx: number, child: NestedMenuItem) => {
    const next = children.slice()
    next[idx] = child
    setChildren(next)
    update({ ...item, label, hidden, children: next })
  }

  return (
    <div style={{ marginLeft: depth * 12 }} className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          className="border px-1 text-sm flex-1 rounded"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value)
            update({ ...item, label: e.target.value, hidden, children })
          }}
        />
        <label className="text-xs flex items-center gap-1">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => {
              setHidden(e.target.checked)
              update({ ...item, label, hidden: e.target.checked, children })
            }}
          />
          hidden
        </label>
      </div>

      {children.map((c, i) => (
        <EditorNode
          key={c.id}
          item={c}
          depth={depth + 1}
          update={(n) => handleChildChange(i, n)}
        />
      ))}
    </div>
  )
}

export default function MenuEditor({ value, onChange }: MenuEditorProps) {
  const [items, setItems] = useState(value)

  const handleUpdate = (idx: number, item: NestedMenuItem) => {
    const next = items.slice()
    next[idx] = item
    setItems(next)
    onChange?.(next)
  }

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <EditorNode
          key={it.id}
          item={it}
          depth={0}
          update={(n) => handleUpdate(i, n)}
        />
      ))}
    </div>
  )
}

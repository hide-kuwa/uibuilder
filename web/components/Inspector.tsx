'use client'
import React, { useMemo } from 'react'
import { useEditorActions, useEditorState, ComponentNode } from './store'
import AutoPropsEditor from './AutoPropsEditor'

const NumberField: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-6">{label}</span>
      <input
        type="number"
        className="border rounded px-2 py-1 w-full"
        value={Number.isFinite(value) ? value : 0}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
    </label>
  )
}

export default function Inspector() {
  const { tree, selectedIds, selectedComponentId } = useEditorState()
  const { setLayout, setProp, groupSelected, ungroup } = useEditorActions()
  const node = useMemo<ComponentNode | null>(() => {
    const stack: ComponentNode[] = [...tree]
    while (stack.length) {
      const n = stack.shift()!
      if (n.id === selectedComponentId) return n
      if (n.children) stack.push(...n.children)
    }
    return null
  }, [tree, selectedComponentId])

  if (!node) return <div className="p-3 text-sm text-gray-500">No selection</div>

  const l = node.layout || { x: 40, y: 40, w: 320, h: 180 }

  return (
    <div className="p-3 space-y-4">
      <div className="flex gap-2">
        {selectedIds.length > 1 && (
          <button className="px-2 py-1 border rounded text-sm" onClick={groupSelected}>Group</button>
        )}
        {selectedIds.length === 1 && node.type === 'Group' && (
          <button className="px-2 py-1 border rounded text-sm" onClick={() => ungroup(node.id)}>
            Ungroup
          </button>
        )}
      </div>
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500">Position & Size</div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={l.x} onChange={v => setLayout(node.id, { ...l, x: v })} />
          <NumberField label="Y" value={l.y} onChange={v => setLayout(node.id, { ...l, y: v })} />
          <NumberField label="W" value={l.w} onChange={v => setLayout(node.id, { ...l, w: Math.max(1, v) })} />
          <NumberField label="H" value={l.h} onChange={v => setLayout(node.id, { ...l, h: Math.max(1, v) })} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500">Props</div>
        <AutoPropsEditor
          selectedComponentType={node.type}
          selectedProps={node.props || {}}
          onChange={next => {
            Object.entries(next).forEach(([k, v]) => setProp(node.id, k, v))
          }}
        />
      </div>
      {node.userCode && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500">User Code</div>
          {Object.entries(node.userCode).map(([k, code]) => (
            <div key={k}>
              <div className="text-xs text-gray-500">{k}</div>
              <pre className="text-xs bg-gray-100 dark:bg-zinc-900 border border-zinc-800 rounded px-2 py-1 overflow-auto">
                {code}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


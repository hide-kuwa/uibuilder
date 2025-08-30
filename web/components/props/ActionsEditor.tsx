'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editorStore'

type NodeAction = {
  trigger: 'click' | 'hover' | 'mount'
  type: 'openUrl' | 'emitEvent' | 'setProp' | 'navigate'
  payload?: any
}

export default function ActionsEditor({ nodeId }: { nodeId: string }) {
  const updateNode = useEditorStore((s) => s.updateNode)
  const node = useEditorStore((s) => s.tree.find((n) => n.id === nodeId)) as any
  const actions: NodeAction[] = (node?.props?.actions as NodeAction[]) || []

  const setActions = (next: NodeAction[]) => {
    updateNode(nodeId, { props: { ...(node?.props || {}), actions: next } })
  }

  const addAction = () => {
    setActions([
      ...actions,
      { trigger: 'click', type: 'openUrl', payload: {} },
    ])
  }

  const updateAction = (idx: number, next: NodeAction) => {
    const arr = [...actions]
    arr[idx] = next
    setActions(arr)
  }

  const removeAction = (idx: number) => {
    const arr = [...actions]
    arr.splice(idx, 1)
    setActions(arr)
  }

  return (
    <div className="space-y-2">
      {actions.map((a, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 border border-neutral-700 rounded p-2"
        >
          <div className="flex gap-2 items-center">
            <select
              value={a.trigger}
              onChange={(e) =>
                updateAction(i, { ...a, trigger: e.target.value as any })
              }
              className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
            >
              <option value="click">click</option>
              <option value="hover">hover</option>
              <option value="mount">mount</option>
            </select>
            <select
              value={a.type}
              onChange={(e) => updateAction(i, { ...a, type: e.target.value as any })}
              className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
            >
              <option value="openUrl">openUrl</option>
              <option value="navigate">navigate</option>
              <option value="emitEvent">emitEvent</option>
              <option value="setProp">setProp</option>
            </select>
            <button
              type="button"
              className="ml-auto px-2 py-1 bg-neutral-800 rounded text-xs"
              onClick={() => removeAction(i)}
            >
              Del
            </button>
          </div>
          <textarea
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs font-mono"
            value={JSON.stringify(a.payload ?? {}, null, 2)}
            onChange={(e) => {
              try {
                updateAction(i, {
                  ...a,
                  payload: JSON.parse(e.target.value || '{}'),
                })
              } catch {
                /* ignore */
              }
            }}
            rows={3}
          />
        </div>
      ))}
      <button
        type="button"
        className="px-2 py-1 bg-neutral-800 rounded text-xs"
        onClick={addAction}
      >
        Add action
      </button>
    </div>
  )
}


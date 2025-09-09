'use client'
import React from 'react'
import { useBuilderStore } from '@/stores/builder'
import { useEnvStore } from '@/stores/env'
import type { BindingSource } from '@/types/binding'
import { resolvePropsWithBindings } from '@/lib/binding/resolve'

export default function DataPanel() {
  const { selectedNodeId, getBindingsForNode, setBinding } = useBuilderStore()
  const mode = useEnvStore((s) => s.mode)
  const [propId, setPropId] = React.useState('text')
  const [kind, setKind] = React.useState<'local' | 'global'>('local')
  const [path, setPath] = React.useState('')
  const [testOut, setTestOut] = React.useState<string>('')
  const [repeatPath, setRepeatPath] = React.useState('list.items')
  const [repeatKey, setRepeatKey] = React.useState('id')

  const onAdd = () => {
    if (!selectedNodeId || !propId) return
    const PATH_OK = /^[a-zA-Z0-9_.\[\]-]+$/
    if (!PATH_OK.test(path)) {
      setTestOut('Invalid binding path')
      return
    }
    const src: BindingSource = { kind, path }
    setBinding(selectedNodeId, propId, src)
  }

  const onClear = () => {
    if (!selectedNodeId || !propId) return
    setBinding(selectedNodeId, propId, undefined)
  }

  const onTest = async () => {
    try {
      const PATH_OK = /^[a-zA-Z0-9_.\[\]-]+$/
      if (!PATH_OK.test(path)) { setTestOut('Invalid binding path'); return }
      const nodeId = selectedNodeId || 'node'
      const b = getBindingsForNode(nodeId)
      const props: Record<string, any> = { [propId]: '(preview)' }
      const out = await resolvePropsWithBindings(nodeId, props, b, mode)
      setTestOut(String(out[propId]))
    } catch (e) {
      setTestOut(String(e instanceof Error ? e.message : e))
    }
  }

  const current = selectedNodeId ? getBindingsForNode(selectedNodeId) : {}

  return (
    <div className="p-2 space-y-2 text-sm">
      <div className="text-xs opacity-70">Data Binding</div>
      <div className="grid grid-cols-2 gap-2 items-center">
        <label className="text-xs">Prop</label>
        <input value={propId} onChange={(e) => setPropId(e.target.value)} className="border rounded px-2 py-1 text-xs" />
        <label className="text-xs">Kind</label>
        <select value={kind} onChange={(e) => setKind(e.target.value as any)} className="border rounded px-2 py-1 text-xs">
          <option value="local">local</option>
          <option value="global">global</option>
        </select>
        <label className="text-xs">Path</label>
        <input value={path} onChange={(e) => setPath(e.target.value)} placeholder="user.name" className="border rounded px-2 py-1 text-xs" />
      </div>
      <div className="flex gap-2">
        <button className="underline" onClick={onAdd}>Apply</button>
        <button className="underline text-gray-600" onClick={onClear}>Clear</button>
        <button className="underline text-blue-600" onClick={onTest}>Test</button>
      </div>
      <div className="text-[11px] opacity-70">Preview: <span className="font-mono">{testOut}</span></div>
      <div className="mt-2">
        <div className="text-xs opacity-70">Current</div>
        <pre className="bg-gray-50 rounded p-2 text-[11px] whitespace-pre-wrap">{JSON.stringify(current, null, 2)}</pre>
      </div>

      <div className="pt-2 border-t">
        <div className="text-xs opacity-70">Repeat (wrap selected node)</div>
        <div className="grid grid-cols-2 gap-2 items-center">
          <label className="text-xs">dataPath</label>
          <input value={repeatPath} onChange={(e) => setRepeatPath(e.target.value)} className="border rounded px-2 py-1 text-xs" placeholder="list.items" />
          <label className="text-xs">itemKey</label>
          <input value={repeatKey} onChange={(e) => setRepeatKey(e.target.value)} className="border rounded px-2 py-1 text-xs" placeholder="id" />
        </div>
        <div className="flex gap-2 mt-1">
          <button
            className="underline"
            onClick={() => {
              if (!selectedNodeId) return
              try {
                window.dispatchEvent(
                  new CustomEvent('builder:wrapRepeat', { detail: { nodeId: selectedNodeId, dataPath: repeatPath, itemKey: repeatKey || undefined } })
                )
              } catch {}
            }}
          >
            Wrap with Repeat
          </button>
          <button
            className="underline text-gray-600"
            onClick={() => {
              if (!selectedNodeId) return
              try { window.dispatchEvent(new CustomEvent('builder:unwrapRepeat', { detail: { nodeId: selectedNodeId } })) } catch {}
            }}
          >
            Unwrap
          </button>
        </div>
      </div>
    </div>
  )
}

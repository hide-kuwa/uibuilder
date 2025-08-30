'use client'

import { useBindingStore } from '@/store/bindingStore'
import { useState } from 'react'

export default function RightInspectorBindings() {
  const sources = useBindingStore((s) => s.sources)
  const addSource = useBindingStore((s) => s.addSource)
  const updateSource = useBindingStore((s) => s.updateSource)
  const removeSource = useBindingStore((s) => s.removeSource)

  const [kind, setKind] = useState<'const' | 'json' | 'expr'>('const')
  const [value, setValue] = useState('')

  const handleAdd = () => {
    let val: any = value
    if (kind === 'json') {
      try { val = JSON.parse(value) } catch { /* ignore */ }
    }
    addSource(kind, val)
    setValue('')
  }

  return (
    <div className="p-2 space-y-2 text-xs">
      <div className="flex space-x-2">
        <select
          className="bg-gray-700 text-white p-1"
          value={kind}
          onChange={(e) => setKind(e.target.value as any)}
        >
          <option value="const">const</option>
          <option value="json">json</option>
          <option value="expr">expr</option>
        </select>
        <input
          className="flex-1 bg-gray-700 text-white p-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          className="bg-gray-600 px-2"
          onClick={handleAdd}
        >
          add
        </button>
      </div>
      {sources.map((s) => (
        <div key={s.id} className="border border-gray-700 p-1 space-y-1">
          <div className="flex space-x-2 items-center">
            <span className="text-gray-400">{s.id}</span>
            <select
              className="bg-gray-700 text-white p-1 flex-1"
              value={s.kind}
              onChange={(e) => updateSource(s.id, { kind: e.target.value as any })}
            >
              <option value="const">const</option>
              <option value="json">json</option>
              <option value="expr">expr</option>
            </select>
            <button
              className="text-red-400"
              onClick={() => removeSource(s.id)}
            >
              x
            </button>
          </div>
          <textarea
            className="w-full bg-gray-700 text-white p-1"
            rows={3}
            value={typeof s.value === 'string' ? s.value : JSON.stringify(s.value, null, 2)}
            onChange={(e) => {
              let v: any = e.target.value
              if (s.kind === 'json') {
                try { v = JSON.parse(e.target.value) } catch { /* ignore */ }
              }
              updateSource(s.id, { value: v })
            }}
          />
        </div>
      ))}
    </div>
  )
}


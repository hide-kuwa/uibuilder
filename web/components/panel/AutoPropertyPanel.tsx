"use client"
import React, { useMemo, useState } from 'react'
import { getDef } from '@/lib/registry'
import { useDesignTokens } from '@/store/designTokensStore'
import { useDataSources, listPaths } from '@/store/dataBindingStore'

type Field = { id: string; type: string; label?: string; options?: string[]; default?: any }

function BindEditor({ value, onChange }: { value?: any; onChange: (v:any)=>void }) {
  const sources = useDataSources(s => s.sources)
  const names = Object.keys(sources)
  const initial = value && value.$bind ? value.$bind : { source: names[0] || '', path: '', fallback: '', transform: '' }
  const [src, setSrc] = useState<string>(initial.source || names[0] || '')
  const [path, setPath] = useState<string>(initial.path || '')
  const [fallback, setFallback] = useState<string>(initial.fallback ?? '')
  const [transform, setTransform] = useState<string>(initial.transform || '')
  const paths = useMemo(() => listPaths(sources[src] || {}, 300), [src, sources])
  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        className="border rounded h-8 px-2 text-sm"
        value={src}
        onChange={e => setSrc(e.target.value)}
      >
        {names.length === 0 ? <option value="">(no sources)</option> : names.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <input
        list="bind-paths"
        className="border rounded h-8 px-2 text-sm"
        value={path}
        onChange={e => setPath(e.target.value)}
        placeholder="user.name"
      />
      <datalist id="bind-paths">
        {paths.map(p => <option key={p} value={p} />)}
      </datalist>
      <input
        className="border rounded h-8 px-2 text-sm"
        value={fallback}
        onChange={e => setFallback(e.target.value)}
        placeholder="fallback"
      />
      <select
        className="border rounded h-8 px-2 text-sm col-span-2"
        value={transform}
        onChange={e => setTransform(e.target.value)}
      >
        <option value="">no transform</option>
        <option value="upper">upper</option>
        <option value="lower">lower</option>
        <option value="stringify">stringify</option>
      </select>
      <button
        className="border rounded h-8 px-2 text-sm col-span-2"
        onClick={() => onChange({ $bind: { source: src, path, fallback, transform: transform || undefined } })}
      >
        Apply Binding
      </button>
    </div>
  )
}

function FieldRow({ label, children, bindable, value, onBindChange }: { label: string; children: React.ReactNode; bindable: boolean; value?: any; onBindChange: (v:any)=>void }) {
  const isBound = value && typeof value === 'object' && '$bind' in value
  const [mode, setMode] = useState<'value'|'bind'>(isBound ? 'bind' : 'value')
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="text-xs opacity-70">{label}</div>
        {bindable ? (
          <div className="ml-auto flex items-center gap-1">
            <button className="border rounded h-6 px-2 text-xs" onClick={() => setMode(mode === 'value' ? 'bind' : 'value')}>{mode === 'value' ? 'Bind' : 'Value'}</button>
          </div>
        ) : null}
      </div>
      {mode === 'bind' ? children : children}
    </div>
  )
}

export function AutoPropertyPanel({ componentKey, propValues, onChange }: { componentKey: string; propValues?: Record<string, any>; onChange: (k: string, v: any) => void }) {
  const def = getDef(componentKey as any) as any
  const fields: Field[] = def?.meta?.propertySchema || []
  const tokens = useDesignTokens(s => s.tokens)

  function tokenOptions(group: 'color' | 'radius' | 'space' | 'fontSize') {
    return Object.keys(tokens[group] || {}).map(k => `${group}.${k}`)
  }

  function renderEditor(f: Field, val: any) {
    const isBound = val && typeof val === 'object' && '$bind' in val
    const bindable = true
    if (isBound) {
      return <BindEditor value={val} onChange={v => onChange(f.id, v)} />
    }
    if (f.type === 'string') {
      return <input className="w-full border rounded h-8 px-2 text-sm" value={val ?? ''} onChange={e => onChange(f.id, e.target.value)} />
    }
    if (f.type === 'number') {
      return <input type="number" className="w-full border rounded h-8 px-2 text-sm" value={val ?? 0} onChange={e => onChange(f.id, parseFloat(e.target.value || '0'))} />
    }
    if (f.type === 'enum') {
      return (
        <select className="w-full border rounded h-8 px-2 text-sm" value={val ?? ''} onChange={e => onChange(f.id, e.target.value)}>
          {(f.options || []).map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      )
    }
    if (f.type === 'colorToken') {
      const opts = tokenOptions('color')
      return (
        <select className="w-full border rounded h-8 px-2 text-sm" value={val ?? ''} onChange={e => onChange(f.id, 'token:' + e.target.value)}>
          {opts.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      )
    }
    if (f.type === 'radiusToken') {
      const opts = tokenOptions('radius')
      return (
        <select className="w-full border rounded h-8 px-2 text-sm" value={val ?? ''} onChange={e => onChange(f.id, 'token:' + e.target.value)}>
          {opts.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      )
    }
    if (f.type === 'spaceToken') {
      const opts = tokenOptions('space')
      return (
        <select className="w-full border rounded h-8 px-2 text-sm" value={val ?? ''} onChange={e => onChange(f.id, 'token:' + e.target.value)}>
          {opts.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      )
    }
    if (f.type === 'fontSizeToken') {
      const opts = tokenOptions('fontSize')
      return (
        <select className="w-full border rounded h-8 px-2 text-sm" value={val ?? ''} onChange={e => onChange(f.id, 'token:' + e.target.value)}>
          {opts.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      )
    }
    return <input className="w-full border rounded h-8 px-2 text-sm" value={val ?? ''} onChange={e => onChange(f.id, e.target.value)} />
  }

  return (
    <div className="space-y-3">
      {fields.map((f) => {
        const val = propValues?.[f.id] ?? f.default
        const isBound = val && typeof val === 'object' && '$bind' in val
        return (
          <div key={f.id}>
            <div className="flex items-center mb-1">
              <div className="text-xs opacity-70">{f.label || f.id}</div>
              <div className="ml-auto">
                <button className="border rounded h-6 px-2 text-xs" onClick={() => {
                  if (isBound) onChange(f.id, f.default)
                  else onChange(f.id, { $bind: { source: 'project', path: '', fallback: '' } })
                }}>{isBound ? 'Value' : 'Bind'}</button>
              </div>
            </div>
            {renderEditor(f, val)}
          </div>
        )
      })}
    </div>
  )
}


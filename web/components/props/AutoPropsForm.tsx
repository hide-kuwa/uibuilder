'use client'
import * as React from 'react'
import type { UISchema, UIPrimitive } from '@/types/schema'

type Props = {
  value: any
  schema: UISchema
  onChange: (patch: any) => void
}

/** Merge helper (deep merge for plain objects) */
function merge(a: any, b: any) {
  if (Array.isArray(a) || Array.isArray(b) || typeof a !== 'object' || typeof b !== 'object' || !a || !b) return b
  const out: any = { ...a }
  for (const k of Object.keys(b)) out[k] = merge(a[k], b[k])
  return out
}

export default function AutoPropsForm({ value, schema, onChange }: Props) {
  const renderField = (key: string, prim: UIPrimitive, current: any) => {
    const title = prim.title ?? key
    if (prim.kind === 'string') {
      if (prim.format === 'color') {
        return (
          <label key={key} className="block text-xs mb-1">
            {title}
            <input
              type="color"
              className="w-full bg-gray-700 ml-1 p-1"
              value={current ?? prim.default ?? '#000000'}
              onChange={(e) => onChange(merge(value, { [key]: e.target.value }))}
            />
          </label>
        )
      }
      return (
        <label key={key} className="block text-xs mb-1">
          {title}
          {prim.multiline ? (
            <textarea
              className="w-full bg-gray-700 ml-1 p-1"
              placeholder={prim.placeholder}
              value={current ?? prim.default ?? ''}
              onChange={(e) => onChange(merge(value, { [key]: e.target.value }))}
            />
          ) : (
            <input
              type={prim.format === 'url' ? 'url' : 'text'}
              className="w-full bg-gray-700 ml-1 p-1"
              placeholder={prim.placeholder}
              value={current ?? prim.default ?? ''}
              onChange={(e) => onChange(merge(value, { [key]: e.target.value }))}
            />
          )}
        </label>
      )
    }
    if (prim.kind === 'number') {
      return (
        <label key={key} className="block text-xs mb-1">
          {title}
          <input
            type="number"
            className="w-full bg-gray-700 ml-1 p-1"
            value={current ?? prim.default ?? 0}
            min={prim.min}
            max={prim.max}
            step={prim.step ?? 1}
            onChange={(e) => onChange(merge(value, { [key]: Number(e.target.value) }))}
          />
        </label>
      )
    }
    if (prim.kind === 'boolean') {
      return (
        <label key={key} className="flex items-center text-xs mb-1 gap-2">
          <input
            type="checkbox"
            checked={!!(current ?? prim.default ?? false)}
            onChange={(e) => onChange(merge(value, { [key]: e.target.checked }))}
          />
          {title}
        </label>
      )
    }
    if (prim.kind === 'enum') {
      return (
        <label key={key} className="block text-xs mb-1">
          {title}
          <select
            className="w-full bg-gray-700 ml-1 p-1"
            value={current ?? prim.default ?? prim.options[0]?.value ?? ''}
            onChange={(e) => onChange(merge(value, { [key]: e.target.value }))}
          >
            {prim.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      )
    }
    if (prim.kind === 'object') {
      const obj = current ?? {}
      return (
        <fieldset key={key} className="border border-gray-700 rounded p-2 mb-2">
          <legend className="text-[11px] opacity-80">{title}</legend>
          {Object.entries(prim.properties).map(([subKey, subSchema]) =>
            renderField(`${key}.${subKey}`, subSchema as UIPrimitive, obj[subKey])
          )}
        </fieldset>
      )
    }
    return null
  }

  // flatten path 'a.b' => nested patch
  const setByPath = React.useCallback((path: string, v: any) => {
    const segs = path.split('.')
    let patch: any = {}
    let cur = patch
    segs.forEach((s, i) => {
      if (i === segs.length - 1) cur[s] = v
      else { cur[s] = {}; cur = cur[s] }
    })
    onChange(merge(value, patch))
  }, [onChange, value])

  // small wrapper to adapt renderField to nested set
  const onChangeWrapper = (path: string) => (patch: any) => {
    // patch has only leaf updated; compute delta value at path
    const leaf = path.includes('.') ? path.split('.').pop()! : path
    const val = (patch as any)[leaf]
    setByPath(path, val)
  }

  // Note: for simplicity we call renderField with top-level keys; nested object keys are handled via path.
  if (schema.kind === 'object') {
    const obj = value ?? {}
    return (
      <div className="space-y-1">
        {Object.entries(schema.properties).map(([key, s]) =>
          renderField(key, s as UIPrimitive, obj[key])
        )}
      </div>
    )
  }
  // Fallback (single primitive)
  return <div>{renderField('value', schema as UIPrimitive, value)}</div>
}

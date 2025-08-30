'use client'
import React from 'react'

export type FieldSchema = {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'color'
  options?: any[]
}

export type NormalizedSchema = Record<string, FieldSchema>

function parseSchema(schema: any): NormalizedSchema {
  // zod
  if (schema && schema._def && (schema._def.shape || schema._def.shapeFn)) {
    const shape = typeof schema._def.shape === 'function' ? schema._def.shape() : schema._def.shape || schema._def.shapeFn?.()
    const out: NormalizedSchema = {}
    for (const key in shape) {
      const f = shape[key]
      const tn = f?._def?.typeName
      if (tn === 'ZodString') out[key] = { type: 'string' }
      else if (tn === 'ZodNumber') out[key] = { type: 'number' }
      else if (tn === 'ZodBoolean') out[key] = { type: 'boolean' }
      else if (tn === 'ZodEnum') out[key] = { type: 'enum', options: f?._def?.values }
      else out[key] = { type: 'string' }
    }
    return out
  }
  // JSON schema
  if (schema && schema.properties) {
    const out: NormalizedSchema = {}
    for (const key in schema.properties) {
      const p: any = schema.properties[key]
      if (p.type === 'string') {
        if (p.enum) out[key] = { type: 'enum', options: p.enum }
        else if (p.format === 'color') out[key] = { type: 'color' }
        else out[key] = { type: 'string' }
      } else if (p.type === 'number' || p.type === 'integer') {
        out[key] = { type: 'number' }
      } else if (p.type === 'boolean') {
        out[key] = { type: 'boolean' }
      }
    }
    return out
  }
  return {}
}

export interface AutoPropsFormProps {
  nodeId: string
  schema: any
  value: any
  onChange: (patch: any) => void
}

export default function AutoPropsForm({ nodeId, schema, value, onChange }: AutoPropsFormProps) {
  const fields = React.useMemo(() => parseSchema(schema), [schema])
  const [form, setForm] = React.useState(() => ({ ...(value || {}) }))

  React.useEffect(() => {
    setForm({ ...(value || {}) })
  }, [value])

  const debounced = React.useRef<any>()
  const emitChange = React.useCallback((patch: any) => {
    if (debounced.current) clearTimeout(debounced.current)
    debounced.current = setTimeout(() => {
      onChange(patch)
    }, 150)
  }, [onChange])

  const handleField = (key: string, v: any) => {
    const next = { ...form, [key]: v }
    setForm(next)
    emitChange({ [key]: v })
  }

  return (
    <div className="space-y-2">
      {Object.entries(fields).map(([key, fs]) => {
        const val = form?.[key]
        if (fs.type === 'boolean') {
          return (
            <label key={key} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={Boolean(val)}
                onChange={(e) => handleField(key, e.target.checked)}
              />
              {key}
            </label>
          )
        }
        if (fs.type === 'number') {
          return (
            <label key={key} className="block text-xs">
              {key}
              <input
                type="number"
                className="w-full bg-gray-700 ml-1 p-1 text-white"
                value={val ?? ''}
                onChange={(e) => handleField(key, Number(e.target.value))}
              />
            </label>
          )
        }
        if (fs.type === 'enum') {
          return (
            <label key={key} className="block text-xs">
              {key}
              <select
                className="w-full bg-gray-700 ml-1 p-1 text-white"
                value={val ?? ''}
                onChange={(e) => handleField(key, e.target.value)}
              >
                <option value="" />
                {fs.options?.map((o) => (
                  <option key={String(o)} value={String(o)}>
                    {String(o)}
                  </option>
                ))}
              </select>
            </label>
          )
        }
        if (fs.type === 'color') {
          return (
            <label key={key} className="block text-xs">
              {key}
              <input
                type="color"
                className="w-full bg-gray-700 ml-1 p-1 text-white"
                value={val ?? '#000000'}
                onChange={(e) => handleField(key, e.target.value)}
              />
            </label>
          )
        }
        // string fallback
        return (
          <label key={key} className="block text-xs">
            {key}
            <input
              type="text"
              className="w-full bg-gray-700 ml-1 p-1 text-white"
              value={val ?? ''}
              onChange={(e) => handleField(key, e.target.value)}
            />
          </label>
        )
      })}
    </div>
  )
}


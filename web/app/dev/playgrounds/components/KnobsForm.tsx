'use client'

import { z, ZodFirstPartyTypeKind, ZodTypeAny } from 'zod'

interface KnobsFormProps {
  schema: z.ZodObject<any>
  values: Record<string, any>
  onChange: (v: Record<string, any>) => void
}

function renderField(name: string, field: ZodTypeAny, value: any, onFieldChange: (v: any) => void) {
  const kind: ZodFirstPartyTypeKind = (field as any)._def.typeName

  switch (kind) {
    case z.ZodFirstPartyTypeKind.ZodString:
      return (
        <div key={name} className="space-y-1">
          <label className="block text-xs" htmlFor={name}>{name}</label>
          <input
            id={name}
            className="w-full border rounded px-2 py-1"
            value={value ?? ''}
            onChange={(e) => onFieldChange(e.target.value)}
          />
        </div>
      )
    case z.ZodFirstPartyTypeKind.ZodNumber:
      return (
        <div key={name} className="space-y-1">
          <label className="block text-xs" htmlFor={name}>{name}</label>
          <input
            type="number"
            id={name}
            className="w-full border rounded px-2 py-1"
            value={value ?? ''}
            onChange={(e) => {
              const val = e.target.value
              onFieldChange(val === '' ? undefined : Number(val))
            }}
          />
        </div>
      )
    case z.ZodFirstPartyTypeKind.ZodBoolean:
      return (
        <div key={name} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={name}
            checked={!!value}
            onChange={(e) => onFieldChange(e.target.checked)}
          />
          <label htmlFor={name} className="text-xs">{name}</label>
        </div>
      )
    case z.ZodFirstPartyTypeKind.ZodEnum:
      return (
        <div key={name} className="space-y-1">
          <label className="block text-xs" htmlFor={name}>{name}</label>
          <select
            id={name}
            className="w-full border rounded px-2 py-1"
            value={value ?? ''}
            onChange={(e) => onFieldChange(e.target.value)}
          >
            {(field as any)._def.values.map((v: string) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      )
    default:
      return null
  }
}

export function KnobsForm({ schema, values, onChange }: KnobsFormProps) {
  const shape = schema.shape
  return (
    <div className="space-y-4">
      {Object.entries(shape).map(([name, field]) =>
        renderField(name, field, values[name], (v) => onChange({ ...values, [name]: v }))
      )}
    </div>
  )
}

export default KnobsForm


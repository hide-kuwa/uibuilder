'use client'

import useSWR from 'swr'
import type { ComponentNode } from '@chizu/types'
import * as REG from '@chizu/registry'
import { jsonFetcher } from '../utils'

type PropsEditorProps = {
  node: ComponentNode
  onChange: (key: string, value: any) => void
}

export function PropsEditor({ node, onChange }: PropsEditorProps) {
  const schema: any = (REG as any).getSchema?.(node.type)
  if (!schema?.properties) {
    return <div>Propsなし</div>
  }

  const { data: hoverList } = useSWR<{
    items: Array<{ id: string; name: string }>
  }>('/api/hover', jsonFetcher)
  const options = hoverList?.items ?? []

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {Object.entries(schema.properties).map(([key, spec]: any) => {
        if (key === 'hoverPresetId') {
          const val = (node.props as any)?.[key] ?? spec.default ?? ''
          return (
            <div key={key}>
              <div style={{ fontSize: 12, color: '#666' }}>{spec.title || key}</div>
              <select
                value={val}
                onChange={(event) => onChange(key, (event.target as HTMLSelectElement).value)}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
              >
                <option value="">未選択</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.id} {option.name ?? ''}
                  </option>
                ))}
              </select>
            </div>
          )
        }

        if (key === 'hoverPresetIds') {
          const val: string[] = (node.props as any)?.[key] ?? spec.default ?? []
          return (
            <div key={key}>
              <div style={{ fontSize: 12, color: '#666' }}>{spec.title || key}</div>
              <select
                multiple
                value={val}
                onChange={(event) => {
                  const selected = Array.from((event.currentTarget as HTMLSelectElement).selectedOptions).map(
                    (option) => option.value,
                  )
                  onChange(key, selected)
                }}
                size={Math.min(6, Math.max(3, options.length))}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
              >
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.id} {option.name ?? ''}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>選択順の後ろ側が上書きされます</div>
            </div>
          )
        }

        return (
          <div key={key}>
            <div style={{ fontSize: 12, color: '#666' }}>{spec.title || key}</div>
            <input
              value={(node.props as any)?.[key] ?? spec.default ?? ''}
              onChange={(event) => onChange(key, (event.target as HTMLInputElement).value)}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
            />
          </div>
        )
      })}
    </div>
  )
}

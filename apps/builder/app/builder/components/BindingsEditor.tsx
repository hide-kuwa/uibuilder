'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import useSWR from 'swr'
import type { ComponentNode, Page } from '@chizu/types'
import * as REG from '@chizu/registry'
import { AutosaveMountHashed } from '@/components/AutosaveMountHashed'
import { ApplyLastSnippetButton } from '@/components/bindings/ApplyLastSnippetButton'
import { PREVIEW_API } from '../constants'
import { jsonFetcher } from '../utils'

const PREVIEW_PAGE = { prefCode: '13' }

type BindingInput = { scope: 'page' | 'api'; path: string }

type BindingsEditorProps = {
  node: ComponentNode
  pageRoot: Page
  onChange: (next: ComponentNode) => void
}

export function BindingsEditor({ node, pageRoot, onChange }: BindingsEditorProps) {
  const schema: any = REG.getSchema(node.type)
  const propKeys: string[] = Object.keys(schema?.properties ?? {})
  const currentBindings = node.bindings ?? {}

  const { data: dataSources } = useSWR<{
    items: Array<{ key: string; url: string; ttlSec?: number }>
  }>('/api/ds', jsonFetcher)
  const apiKeys = useMemo(() => (dataSources?.items ?? []).map((item) => item.key), [dataSources])

  const isMetaMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('meta') === '1'
  const lastBindingPropKey = (node.meta as any)?.lastBindingProp as string | undefined

  const initialProp =
    lastBindingPropKey ||
    Object.keys(currentBindings)[0] ||
    propKeys[0] ||
    ''

  const [targetProp, setTargetProp] = useState<string>(initialProp)
  const currentBinding = currentBindings[targetProp]

  const [rows, setRows] = useState<BindingInput[]>(
    currentBinding?.inputs?.length
      ? currentBinding.inputs.map((input: any) => ({ scope: input.scope, path: input.path }))
      : [{ scope: 'page', path: 'prefCode' }],
  )
  const [expr, setExpr] = useState<string>(currentBinding?.formula?.expr ?? '`値: ${$0}`')
  const [suggestIdx, setSuggestIdx] = useState<number>(-1)

  const addRow = () => setRows((prev) => [...prev, { scope: 'page', path: '' }])
  const deleteRow = (index: number) => setRows((prev) => prev.filter((_, idx) => idx !== index))
  const moveRow = (index: number, direction: -1 | 1) =>
    setRows((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  const patchRow = (index: number, patch: Partial<BindingInput>) =>
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, ...patch } : row)))

  const inputsPreview = useMemo(
    () =>
      rows.map((row) => {
        if (row.scope === 'page') {
          return row.path.split('.').reduce((acc: any, key) => acc?.[key], PREVIEW_PAGE)
        }
        return row.path.split('.').reduce((acc: any, key) => acc?.[key], PREVIEW_API)
      }),
    [rows],
  )

  const previewValue = useMemo(() => {
    try {
      if (typeof expr !== 'string' || expr.length > 500) return '(式が長すぎます)'
      // eslint-disable-next-line no-new-func
      const fn = new Function(...inputsPreview.map((_, index) => `$${index}`), `return (${expr})`)
      return String(fn(...inputsPreview))
    } catch {
      return '(式エラー)'
    }
  }, [expr, inputsPreview])

  const activeApiKey = rows.find((row) => row.scope === 'api')?.path.split('.')?.[0] ?? ''
  const { data: preview } = useSWR(
    activeApiKey ? `/api/ds-preview?key=${encodeURIComponent(activeApiKey)}` : null,
    jsonFetcher,
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    const binding = node.bindings?.[targetProp] as any
    setRows(
      binding?.inputs?.length
        ? binding.inputs.map((input: any) => ({ scope: input.scope, path: input.path }))
        : [{ scope: 'page', path: 'prefCode' }],
    )
    setExpr(binding?.formula?.expr ?? '`値: ${$0}`')
  }, [targetProp, node.bindings])

  const apply = () => {
    const nextBindings = {
      ...(node.bindings ?? {}),
      [targetProp]: {
        inputs: rows.map((row) => ({ scope: row.scope, path: row.path })),
        formula: { expr },
      },
    }
    onChange({
      ...node,
      bindings: nextBindings,
      meta: node.meta,
    })
  }

  const remove = () => {
    const copy = { ...(node.bindings ?? {}) }
    delete copy[targetProp]
    onChange({
      ...node,
      bindings: Object.keys(copy).length ? copy : undefined,
      meta: node.meta,
    })
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div>
        <div style={{ fontSize: 12, color: '#666' }}>prop</div>
        <select
          value={targetProp}
          onChange={(event) => setTargetProp((event.target as HTMLSelectElement).value)}
          style={{ width: '100%' }}
        >
          {propKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>inputs</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((row, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#666' }}>${index}</span>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
              <select
                value={row.scope}
                onChange={(event) => patchRow(index, { scope: (event.target as HTMLSelectElement).value as 'page' | 'api' })}
              >
                <option value="page">page</option>
                <option value="api">api</option>
              </select>

              {row.scope === 'api' ? (
                <ApiPathInput
                  value={row.path}
                  onChange={(path) => patchRow(index, { path })}
                  apiKeys={apiKeys}
                  preview={preview?.data}
                  suggestIdx={suggestIdx}
                  onSuggestIdxChange={setSuggestIdx}
                />
              ) : (
                <PagePathInput
                  value={row.path}
                  onChange={(path) => patchRow(index, { path })}
                  pageRoot={pageRoot}
                  suggestIdx={suggestIdx}
                  onSuggestIdxChange={setSuggestIdx}
                />
              )}
            </div>

            <RowControls onDelete={() => deleteRow(index)} onMoveUp={() => moveRow(index, -1)} onMoveDown={() => moveRow(index, 1)} />
          </div>
        ))}
      </div>

      <button onClick={addRow} style={{ width: '100%', padding: 6, border: '1px dashed #bbb', borderRadius: 8 }}>行を追加</button>

      {(() => {
        if (!preview?.data || !activeApiKey) return null
        const base = dottedGet(preview.data, activeApiKey)
        if (!base) return null
        return (
          <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 10, background: '#fafafa', fontFamily: 'ui-monospace, Menlo, monospace' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>API preview ({activeApiKey})</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{pretty(base)}</pre>
          </div>
        )
      })()}

      <div>
        <div style={{ fontSize: 12, color: '#666' }}>expr</div>
        <textarea
          value={expr}
          onChange={(event) => setExpr((event.target as HTMLTextAreaElement).value)}
          rows={3}
          style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, fontFamily: 'monospace' }}
          onFocus={() => {
            ;(window as any).__setBindingFormula = (value: string) => setExpr(value)
          }}
          onBlur={() => {
            if ((window as any).__setBindingFormula) (window as any).__setBindingFormula = undefined
          }}
          onKeyDown={(event) => {
            if ((event as any).nativeEvent?.isComposing) return
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
              const data = (window as any).__bindingsInsert
              if (data?.formula) setExpr(data.formula)
            }
          }}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          title="Ctrl()+Enter で最後の挿入を適用"
        />
        <div style={{ marginTop: 6 }}>
          <ApplyLastSnippetButton onApply={(formula) => setExpr(formula)} />
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
          使い方例: <code>{'名前: '}</code>、<code>{'人口: '}</code>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#666' }}>preview</div>
      <div style={{ padding: '8px 10px', border: '1px dashed #ccc', borderRadius: 8, background: '#fafafa' }}>{previewValue}</div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={apply} style={{ padding: '6px 10px', borderRadius: 8, background: '#111', color: '#fff' }}>
          適用
        </button>
        <button onClick={remove} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
          解除
        </button>
      </div>

      {!isMetaMode && <AutosaveMountHashed page={pageRoot} debounceMs={800} />}
    </div>
  )
}

type SuggestProps = {
  value: string
  onChange: (next: string) => void
  suggestIdx: number
  onSuggestIdxChange: Dispatch<SetStateAction<number>>
}

type ApiPathInputProps = SuggestProps & {
  apiKeys: string[]
  preview: any
}

function ApiPathInput({ value, onChange, apiKeys, preview, suggestIdx, onSuggestIdxChange }: ApiPathInputProps) {
  const { parent, token } = splitPathForSuggest(value)
  const parentObj = getParentObject(preview, parent)
  const allKeys = listKeysForSuggest(parentObj)
  const suggestions = token ? allKeys.filter((key) => key.toLowerCase().startsWith(token.toLowerCase())) : allKeys

  return (
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8 }}>
      <input
        value={value}
        onChange={(event) => {
          onSuggestIdxChange(-1)
          onChange((event.target as HTMLInputElement).value)
        }}
        onKeyDown={(event) => {
          if (!preview || !suggestions.length) return
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            onSuggestIdxChange((prev) => Math.min(suggestions.length - 1, prev + 1))
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            onSuggestIdxChange((prev) => Math.max(-1, prev - 1))
          }
          if (event.key === 'Tab' || event.key === 'Enter') {
            const pick = suggestions[Math.max(0, suggestIdx)]
            if (pick) {
              event.preventDefault()
              const newPath = parent ? `${parent}.${pick}` : pick
              onChange(newPath)
              onSuggestIdxChange(-1)
            }
          }
          if (event.key === 'Escape') {
            onSuggestIdxChange(-1)
          }
        }}
        placeholder="prefStats または prefStats.13.name など"
      />
      <select
        value={value.split('.')[0] || ''}
        onChange={(event) => {
          const base = (event.target as HTMLSelectElement).value
          const rest = value.includes('.') ? value.split('.').slice(1).join('.') : ''
          onChange(rest ? `${base}.${rest}` : base)
        }}
      >
        <option value="">未選択</option>
        {apiKeys.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <SuggestList
        suggestions={suggestions}
        activeIndex={suggestIdx}
        onHighlight={onSuggestIdxChange}
        onPick={(key) => {
          const newPath = parent ? `${parent}.${key}` : key
          onChange(newPath)
          onSuggestIdxChange(-1)
        }}
      />
    </div>
  )
}

type PagePathInputProps = SuggestProps & {
  pageRoot: Page
}

function PagePathInput({ value, onChange, pageRoot, suggestIdx, onSuggestIdxChange }: PagePathInputProps) {
  const pageSuggestRoot = useMemo(
    () => ({
      ...pageRoot,
      prefCode: (pageRoot as any)?.prefCode ?? '',
    }),
    [pageRoot],
  )

  const { parent, token } = splitPathForSuggest(value)
  const parentObj = getParentObject(pageSuggestRoot, parent)
  const allKeys = listKeysForSuggest(parentObj)
  const suggestions = token ? allKeys.filter((key) => key.toLowerCase().startsWith(token.toLowerCase())) : allKeys


  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={(event) => {
          onSuggestIdxChange(-1)
          onChange((event.target as HTMLInputElement).value)
        }}
        onKeyDown={(event) => {
          if (!suggestions.length) return
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            onSuggestIdxChange((prev) => Math.min(suggestions.length - 1, prev + 1))
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            onSuggestIdxChange((prev) => Math.max(-1, prev - 1))
          }
          if (event.key === 'Tab' || event.key === 'Enter') {
            const pick = suggestions[Math.max(0, suggestIdx)]
            if (pick) {
              event.preventDefault()
              const newPath = parent ? `${parent}.${pick}` : pick
              onChange(newPath)
              onSuggestIdxChange(-1)
            }
          }
          if (event.key === 'Escape') {
            onSuggestIdxChange(-1)
          }
        }}
        placeholder="prefCode または任意の page.* パス"
      />
      <SuggestList
        suggestions={suggestions}
        activeIndex={suggestIdx}
        onHighlight={onSuggestIdxChange}
        onPick={(key) => {
          const newPath = parent ? `${parent}.${key}` : key
          onChange(newPath)
          onSuggestIdxChange(-1)
        }}
      />
    </div>
  )
}

function RowControls({ onDelete, onMoveUp, onMoveDown }: { onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button onClick={onMoveUp} style={{ padding: '4px 8px' }}>
        ↑
      </button>
      <button onClick={onMoveDown} style={{ padding: '4px 8px' }}>
        ↓
      </button>
      <button onClick={onDelete} style={{ padding: '4px 8px', color: '#c00' }}>
        ×
      </button>
    </div>
  )
}

type SuggestListProps = {
  suggestions: string[]
  activeIndex: number
  onPick: (key: string) => void
  onHighlight: Dispatch<SetStateAction<number>>
}

function SuggestList({ suggestions, activeIndex, onPick, onHighlight }: SuggestListProps) {
  if (!suggestions.length) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 5,
        border: '1px solid #ddd',
        background: '#fff',
        borderRadius: 8,
        marginTop: 4,
        maxHeight: 160,
        overflow: 'auto',
        boxShadow: '0 6px 20px rgba(0,0,0,.08)',
        fontFamily: 'ui-monospace, Menlo, monospace',
      }}
    >
      {suggestions.map((key, index) => (
        <div
          key={key}
          onMouseDown={(event) => {
            event.preventDefault()
            onPick(key)
          }}
          onMouseEnter={() => onHighlight(index)}
          style={{ padding: '6px 10px', background: index === activeIndex ? '#eef' : '#fff', cursor: 'pointer' }}
        >
          {key}
        </div>
      ))}
    </div>
  )
}

function dottedGet(obj: any, path: string) {
  if (!path) return obj
  return path.split('.').reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), obj)
}

function pretty(value: any, limit = 250) {
  try {
    const text = JSON.stringify(value, null, 2) ?? 'null'
    return text.length > limit ? `${text.slice(0, limit)}\n…` : text
  } catch {
    return String(value)
  }
}

function splitPathForSuggest(path: string): { parent: string; token: string } {
  const safe = String(path || '')
  const hasTrailingDot = safe.endsWith('.')
  const trimmed = hasTrailingDot ? safe.slice(0, -1) : safe
  const parts = trimmed.split('.').filter(Boolean)
  let parent = parts.slice(0, -1).join('.')
  let token = parts.length ? parts[parts.length - 1] : ''
  if (hasTrailingDot) {
    parent = trimmed
    token = ''
  }
  return { parent, token }
}

function getParentObject(root: any, parentPath: string) {
  if (!parentPath) return root
  return parentPath.split('.').reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), root)
}

function listKeysForSuggest(obj: any): string[] {
  if (obj == null) return []
  if (Array.isArray(obj)) {
    const limit = Math.min(obj.length, 20)
    const indices = Array.from({ length: limit }, (_, index) => String(index))
    return ['length', ...indices]
  }
  if (typeof obj === 'object') {
    try {
      return Object.keys(obj)
    } catch {
      return []
    }
  }
  return []
}




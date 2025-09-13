'use client'
import React from 'react'
import { useFigmaStore } from '../lib/figma/store'
import ColorInput from './ui/ColorInput'
import { isColorLike, isPxLike } from '../lib/figma/tokenValidators'

type TokenEntry = { key: string; value: any }

export default function ThemePanel() {
  const tokens = useFigmaStore((s) => s.doc.tokens || {})

  const setToken = (name: string, value: string | number) => {
    useFigmaStore.setState((s) => ({
      doc: {
        ...s.doc,
        tokens: { ...(s.doc.tokens || {}), [name]: value },
      },
    }))
  }

  const grouped = React.useMemo(() => {
    const g: Record<string, TokenEntry[]> = {}
    Object.entries(tokens).forEach(([full, value]) => {
      const [prefix, ...rest] = full.split('.')
      const key = rest.join('.')
      ;(g[prefix] || (g[prefix] = [])).push({ key, value })
    })
    return g
  }, [tokens])

  const renderToken = (group: string, key: string, value: any) => {
    const fullKey = `${group}.${key}`
    const warn =
      group === 'color'
        ? !isColorLike(String(value))
        : group === 'radius' || group === 'stroke'
        ? !isPxLike(value)
        : false
    return (
      <div key={key} className="flex items-center space-x-2 py-1">
        <label className="w-24 capitalize">{key}</label>
        {group === 'color' ? (
          <ColorInput value={String(value)} onChange={(v) => setToken(fullKey, v)} />
        ) : group === 'shadow' ? (
          <>
            <input
              type="text"
              className="border rounded px-1 py-0.5 flex-1"
              value={String(value)}
              onChange={(e) => setToken(fullKey, e.target.value)}
            />
            <div className="w-6 h-6 border rounded" style={{ boxShadow: String(value) }} />
          </>
        ) : (
          <input
            type="text"
            className="border rounded px-1 py-0.5 flex-1"
            value={String(value)}
            onChange={(e) => setToken(fullKey, e.target.value)}
          />
        )}
        {warn && <span className="text-xs text-orange-600">!</span>}
      </div>
    )
  }

  const colorPins = ['base', 'main', 'accent']

  return (
    <div className="p-4 space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Color</div>
        {colorPins.map((p) => renderToken('color', p, tokens[`color.${p}`] ?? ''))}
        {grouped.color
          ?.filter((t) => !colorPins.includes(t.key))
          .map((t) => renderToken('color', t.key, t.value))}
      </div>
      {(['radius', 'stroke', 'shadow', 'font', 'opacity', 'blend'] as const).map(
        (g) =>
          grouped[g] && (
            <div key={g}>
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">{g}</div>
              {grouped[g]!.map((t) => renderToken(g, t.key, t.value))}
            </div>
          )
      )}
    </div>
  )
}

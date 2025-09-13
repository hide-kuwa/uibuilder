'use client'
import React, { useState, useEffect } from 'react'
import { useFigmaStore } from '../../lib/figma/store'
import type { Shadow } from '../../lib/figma/model'
import { buildCss } from '../../lib/figma/css'
import toast from '../../lib/toast'

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40 border rounded px-2 py-1 text-right"
      />
    </label>
  )
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-40 border rounded px-2 py-1 text-right"
      />
    </label>
  )
}

const ColorInput = TextInput

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40"
      />
    </label>
  )
}

export default function RightPanel() {
  const selected = useFigmaStore((s) => s.selectedNode)
  const updateNode = useFigmaStore((s) => s.updateNode)
  const updateNodeStyle = useFigmaStore((s) => s.updateNodeStyle)
  const pushShadow = useFigmaStore((s) => s.pushShadow)
  const removeShadowAt = useFigmaStore((s) => s.removeShadowAt)
  const setNodeMotion = useFigmaStore((s) => s.setNodeMotion)

  const [linkedRadius, setLinkedRadius] = useState(true)
  useEffect(() => {
    setLinkedRadius(typeof selected?.style?.radius !== 'object')
  }, [selected?.id])

  if (!selected) {
    return (
      <div className="p-4 text-sm text-gray-500">
        <div className="font-semibold text-gray-700 mb-2">Properties</div>
        <p>No selection</p>
      </div>
    )
  }

  const radiusObj = (() => {
    const r = selected.style?.radius
    if (typeof r === 'number' || r == null) {
      return { tl: r ?? 0, tr: r ?? 0, br: r ?? 0, bl: r ?? 0 }
    }
    return r
  })()

  const transition = selected.motion?.transition?.[0] || {
    property: '',
    durationMs: 0,
    easing: 'ease',
    delayMs: 0,
  }

  const updateShadow = (idx: number, patch: Partial<Shadow>) => {
    const shadows = selected.style?.shadows ? [...selected.style.shadows] : []
    const base = shadows[idx] || { x: 0, y: 0, blur: 0, spread: 0, color: '#000000' }
    shadows[idx] = { ...base, ...patch }
    updateNodeStyle(selected.id, { shadows })
  }

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(buildCss(selected))
      toast.success('Copied CSS')
    } catch {
      toast.error('Failed to copy CSS')
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
          Selection
        </div>
      <div className="text-sm font-medium text-gray-800">
        {selected.name || selected.type}{' '}
        <span className="text-gray-400">({selected.type})</span>
      </div>
      <button className="mt-2 border rounded px-1 text-xs" onClick={copyCss}>
        Copy CSS
      </button>
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          Position
        </div>
        <NumberInput label="X" value={selected.x} onChange={(n) => updateNode(selected.id, { x: n })} />
        <NumberInput label="Y" value={selected.y} onChange={(n) => updateNode(selected.id, { y: n })} />
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          Size
        </div>
        <NumberInput label="W" value={selected.width} onChange={(n) => updateNode(selected.id, { width: n })} />
        <NumberInput label="H" value={selected.height} onChange={(n) => updateNode(selected.id, { height: n })} />
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">Style</div>
        <ColorInput label="Fill" value={typeof selected.style?.fill === 'string' ? selected.style?.fill : ''} onChange={(v) => updateNodeStyle(selected.id, { fill: v })} />
        <ColorInput label="Stroke" value={selected.style?.stroke} onChange={(v) => updateNodeStyle(selected.id, { stroke: v })} />
        <NumberInput label="Stroke W" value={selected.style?.strokeWidth ?? 0} onChange={(v) => updateNodeStyle(selected.id, { strokeWidth: v })} />
        <div className="flex items-center justify-between py-1 text-sm">
          <span className="text-gray-500">Radius</span>
          <div className="flex items-center space-x-1">
            {linkedRadius ? (
              <input
                type="number"
                value={radiusObj.tl}
                onChange={(e) => updateNodeStyle(selected.id, { radius: Number(e.target.value) })}
                className="w-20 border rounded px-2 py-1 text-right"
              />
            ) : (
              <>
                {(['tl', 'tr', 'br', 'bl'] as const).map((k) => (
                  <input
                    key={k}
                    type="number"
                    value={radiusObj[k]}
                    onChange={(e) =>
                      updateNodeStyle(selected.id, { radius: { ...radiusObj, [k]: Number(e.target.value) } })
                    }
                    className="w-16 border rounded px-1 py-1 text-right"
                  />
                ))}
              </>
            )}
            <button
              className="border rounded px-1 text-xs"
              onClick={() => {
                if (linkedRadius) {
                  updateNodeStyle(selected.id, { radius: { tl: radiusObj.tl, tr: radiusObj.tl, br: radiusObj.tl, bl: radiusObj.tl } })
                } else {
                  updateNodeStyle(selected.id, { radius: radiusObj.tl })
                }
                setLinkedRadius(!linkedRadius)
              }}
            >
              {linkedRadius ? '↔' : '⤢'}
            </button>
          </div>
        </div>
        <Slider label="Opacity" value={selected.style?.opacity ?? 1} min={0} max={1} step={0.01} onChange={(v) => updateNodeStyle(selected.id, { opacity: v })} />
        <div className="space-y-1">
          <div className="flex items-center justify-between py-1 text-sm">
            <span className="text-gray-500">Shadows</span>
            <button className="border rounded px-1 text-xs" onClick={() => pushShadow(selected.id)}>
              + Add
            </button>
          </div>
          {(selected.style?.shadows ?? []).map((sh, i) => (
            <div key={i} className="flex items-center space-x-1">
              <input
                type="number"
                className="w-12 border rounded px-1 py-1 text-right"
                value={sh.x}
                onChange={(e) => updateShadow(i, { x: Number(e.target.value) })}
              />
              <input
                type="number"
                className="w-12 border rounded px-1 py-1 text-right"
                value={sh.y}
                onChange={(e) => updateShadow(i, { y: Number(e.target.value) })}
              />
              <input
                type="number"
                className="w-12 border rounded px-1 py-1 text-right"
                value={sh.blur}
                onChange={(e) => updateShadow(i, { blur: Number(e.target.value) })}
              />
              <input
                type="number"
                className="w-12 border rounded px-1 py-1 text-right"
                value={sh.spread}
                onChange={(e) => updateShadow(i, { spread: Number(e.target.value) })}
              />
              <input
                type="text"
                className="w-20 border rounded px-1 py-1 text-right"
                value={sh.color}
                onChange={(e) => updateShadow(i, { color: e.target.value })}
              />
              <button className="border rounded px-1 text-xs" onClick={() => removeShadowAt(selected.id, i)}>
                -
              </button>
            </div>
          ))}
        </div>
        <TextInput label="Blend" value={selected.style?.mixBlendMode} onChange={(v) => updateNodeStyle(selected.id, { mixBlendMode: v as any })} />
        <TextInput label="Filter" value={selected.style?.filter} onChange={(v) => updateNodeStyle(selected.id, { filter: v })} />
        <TextInput label="Backdrop" value={selected.style?.backdropFilter} onChange={(v) => updateNodeStyle(selected.id, { backdropFilter: v })} />
        <TextInput label="Bg Image" value={selected.style?.backgroundImage} onChange={(v) => updateNodeStyle(selected.id, { backgroundImage: v })} />
        <TextInput label="Bg Size" value={selected.style?.backgroundSize} onChange={(v) => updateNodeStyle(selected.id, { backgroundSize: v })} />
        <TextInput label="Bg Position" value={selected.style?.backgroundPosition} onChange={(v) => updateNodeStyle(selected.id, { backgroundPosition: v })} />
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">Motion</div>
        <TextInput
          label="Property"
          value={transition.property}
          onChange={(v) => setNodeMotion(selected.id, { transition: [{ ...transition, property: v }] })}
        />
        <NumberInput
          label="Duration"
          value={transition.durationMs}
          onChange={(v) => setNodeMotion(selected.id, { transition: [{ ...transition, durationMs: v }] })}
        />
        <NumberInput
          label="Delay"
          value={transition.delayMs ?? 0}
          onChange={(v) => setNodeMotion(selected.id, { transition: [{ ...transition, delayMs: v }] })}
        />
        <TextInput
          label="Easing"
          value={transition.easing ?? ''}
          onChange={(v) => setNodeMotion(selected.id, { transition: [{ ...transition, easing: v }] })}
        />
      </div>
    </div>
  )
}

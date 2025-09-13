'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useFigmaStore } from '../../lib/figma/store'
import type { Shadow, GradientFill } from '../../lib/figma/model'
import { buildCss } from '../../lib/figma/css'
import toast from '../../lib/toast'
import { alignSelected, distributeSelected } from '../../lib/figma/alignActions'
function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const startX = useRef(0)
  const startVal = useRef(0)
  const dragging = useRef(false)

  const startScrub = (e: React.MouseEvent) => {
    e.preventDefault()
    startX.current = e.clientX
    startVal.current = value
    dragging.current = true

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const dx = ev.clientX - startX.current
      const step = ev.shiftKey ? 10 : 1
      const delta = Math.round(dx / 5) * step
      onChange(startVal.current + delta)
    }

    const onUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(value + (e.shiftKey ? 10 : 1))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(value - (e.shiftKey ? 10 : 1))
    } else if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span
        className="text-gray-500 cursor-ew-resize select-none"
        onMouseDown={startScrub}
      >
        {label}
      </span>
      <div className="flex items-center w-40">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={onKeyDown}
          className="flex-1 border rounded px-2 py-1 text-right"
        />
        <span
          className="ml-1 cursor-ew-resize text-gray-400 select-none"
          onMouseDown={startScrub}
        >
          ↔
        </span>
      </div>
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

function gradientToCss(g: GradientFill): string {
  const stops = g.stops.map((st) => `${st.color} ${st.offset * 100}%`).join(', ')
  return g.type === 'linear'
    ? `linear-gradient(${g.angle ?? 0}deg, ${stops})`
    : `radial-gradient(${stops})`
}

function parseGradient(str?: string): GradientFill | null {
  if (!str) return null
  const lin = str.match(/^linear-gradient\(([-0-9.]+)deg,\s*(.+)\)$/)
  if (lin) {
    const angle = parseFloat(lin[1])
    const stops = lin[2].split(/,\s*/).map((s) => {
      const [color, offset] = s.trim().split(/\s+/)
      return { color, offset: parseFloat(offset) / 100 }
    })
    return { type: 'linear', angle, stops }
  }
  const rad = str.match(/^radial-gradient\((.+)\)$/)
  if (rad) {
    const stops = rad[1].split(/,\s*/).map((s) => {
      const [color, offset] = s.trim().split(/\s+/)
      return { color, offset: parseFloat(offset) / 100 }
    })
    return { type: 'radial', stops }
  }
  return null
}

function GradientEditor({
  value,
  onChange,
}: {
  value?: string
  onChange: (v: string) => void
}) {
  const fallback: GradientFill = {
    type: 'linear',
    angle: 0,
    stops: [
      { color: '#ff0000', offset: 0 },
      { color: '#0000ff', offset: 1 },
    ],
  }
  const [grad, setGrad] = useState<GradientFill>(() => parseGradient(value) ?? fallback)
  useEffect(() => {
    const parsed = parseGradient(value)
    if (parsed) setGrad(parsed)
  }, [value])
  const css = gradientToCss(grad)
  const update = (patch: Partial<GradientFill>) => {
    const g = { ...grad, ...patch }
    setGrad(g)
    onChange(gradientToCss(g))
  }
  const updateStop = (idx: number, patch: Partial<GradientFill['stops'][number]>) => {
    const stops = grad.stops.map((st, i) => (i === idx ? { ...st, ...patch } : st))
    update({ stops })
  }
  const addStop = () => update({ stops: [...grad.stops, { color: '#000000', offset: 0.5 }] })
  const removeStop = (idx: number) => update({ stops: grad.stops.filter((_, i) => i !== idx) })
  return (
    <div className="py-1 text-sm space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-gray-500">Fill</span>
        <div className="flex items-center space-x-1">
          <div className="w-8 h-5 border" style={{ background: css }} />
          <select
            value={grad.type}
            onChange={(e) => update({ type: e.target.value as 'linear' | 'radial' })}
            className="border rounded px-1 text-xs"
          >
            <option value="linear">linear</option>
            <option value="radial">radial</option>
          </select>
        </div>
      </div>
      {grad.type === 'linear' && (
        <NumberInput label="Angle" value={grad.angle ?? 0} onChange={(v) => update({ angle: v })} />
      )}
      <div className="space-y-1">
        {grad.stops.map((st, i) => (
          <div key={i} className="flex items-center space-x-1">
            <input
              type="color"
              value={st.color}
              onChange={(e) => updateStop(i, { color: e.target.value })}
            />
            <input
              type="number"
              min={0}
              max={100}
              value={Math.round(st.offset * 100)}
              onChange={(e) => updateStop(i, { offset: Number(e.target.value) / 100 })}
              className="w-16 border rounded px-1 py-1 text-right"
            />
            <button className="border rounded px-1 text-xs" onClick={() => removeStop(i)}>
              -
            </button>
          </div>
        ))}
        <button className="border rounded px-1 text-xs" onClick={addStop}>
          + Stop
        </button>
      </div>
    </div>
  )
}

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
  const selectedIds = useFigmaStore((s) => s.selectedIds)
  const selected = useFigmaStore((s) => s.selectedNode)
  const updateNode = useFigmaStore((s) => s.updateNode)
  const updateNodeStyle = useFigmaStore((s) => s.updateNodeStyle)
  const pushShadow = useFigmaStore((s) => s.pushShadow)
  const removeShadowAt = useFigmaStore((s) => s.removeShadowAt)
  const moveShadow = useFigmaStore((s) => s.moveShadow)
  const setNodeMotion = useFigmaStore((s) => s.setNodeMotion)

  const [linkedRadius, setLinkedRadius] = useState(true)
  useEffect(() => {
    setLinkedRadius(typeof selected?.style?.radius !== 'object')
  }, [selected?.id])

  if (!selectedIds.length) {
    return (
      <div className="p-4 text-sm text-gray-500">
        <div className="font-semibold text-gray-700 mb-2">Properties</div>
        <p>No selection</p>
      </div>
    )
  }

  if (selectedIds.length > 1) {
    const canDist = selectedIds.length >= 3
    return (
      <div className="p-4 space-y-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Align</div>
          <div className="flex flex-wrap gap-1">
            <button className="border rounded px-2 h-7" onClick={() => alignSelected('left')}>L</button>
            <button className="border rounded px-2 h-7" onClick={() => alignSelected('center')}>HC</button>
            <button className="border rounded px-2 h-7" onClick={() => alignSelected('right')}>R</button>
            <div className="w-[6px]" />
            <button className="border rounded px-2 h-7" onClick={() => alignSelected('top')}>T</button>
            <button className="border rounded px-2 h-7" onClick={() => alignSelected('middle')}>VC</button>
            <button className="border rounded px-2 h-7" onClick={() => alignSelected('bottom')}>B</button>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Distribute</div>
          <div className="flex flex-wrap gap-1">
            <button
              className="border rounded px-2 h-7 disabled:opacity-50"
              disabled={!canDist}
              onClick={() => distributeSelected('horizontal')}
            >
              H
            </button>
            <button
              className="border rounded px-2 h-7 disabled:opacity-50"
              disabled={!canDist}
              onClick={() => distributeSelected('vertical')}
            >
              V
            </button>
          </div>
        </div>
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
    const base =
      shadows[idx] || {
        x: 0,
        y: 4,
        blur: 12,
        spread: 0,
        color: 'rgba(0,0,0,0.1)',
      }
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
        <NumberInput
          label="W"
          value={selected.width}
          onChange={(n) => updateNode(selected.id, { width: Math.max(1, n) })}
        />
        <NumberInput
          label="H"
          value={selected.height}
          onChange={(n) => updateNode(selected.id, { height: Math.max(1, n) })}
        />
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">Transform</div>
        <NumberInput
          label="Rotate"
          value={selected.style?.rotateDeg ?? 0}
          onChange={(v) => updateNodeStyle(selected.id, { rotateDeg: v })}
        />
        <NumberInput
          label="ScaleX"
          value={selected.style?.scaleX ?? 1}
          onChange={(v) => updateNodeStyle(selected.id, { scaleX: v })}
        />
        <NumberInput
          label="ScaleY"
          value={selected.style?.scaleY ?? 1}
          onChange={(v) => updateNodeStyle(selected.id, { scaleY: v })}
        />
        <NumberInput
          label="SkewX"
          value={selected.style?.skewXDeg ?? 0}
          onChange={(v) => updateNodeStyle(selected.id, { skewXDeg: v })}
        />
        <NumberInput
          label="SkewY"
          value={selected.style?.skewYDeg ?? 0}
          onChange={(v) => updateNodeStyle(selected.id, { skewYDeg: v })}
        />
        <label className="flex items-center justify-between py-1 text-sm">
          <span className="text-gray-500">Origin</span>
          <select
            className="w-40 border rounded px-2 py-1 text-sm"
            value={selected.style?.transformOrigin ?? 'TL'}
            onChange={(e) =>
              updateNodeStyle(selected.id, {
                transformOrigin: e.target.value as any,
              })
            }
          >
            {['TL', 'TC', 'TR', 'CL', 'C', 'CR', 'BL', 'BC', 'BR'].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">Style</div>
        <GradientEditor
          value={typeof selected.style?.fill === 'string' ? selected.style?.fill : undefined}
          onChange={(v) => updateNodeStyle(selected.id, { fill: v })}
        />
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
              + Add Shadow
            </button>
          </div>
          {(selected.style?.shadows ?? []).map((sh, i, arr) => (
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
              <div className="flex items-center space-x-1">
                <button
                  className="border rounded px-1 text-xs"
                  disabled={i === 0}
                  onClick={() => moveShadow(selected.id, i, i - 1)}
                >
                  ↑
                </button>
                <button
                  className="border rounded px-1 text-xs"
                  disabled={i === arr.length - 1}
                  onClick={() => moveShadow(selected.id, i, i + 1)}
                >
                  ↓
                </button>
                <button
                  className="border rounded px-1 text-xs"
                  onClick={() => removeShadowAt(selected.id, i)}
                >
                  -
                </button>
              </div>
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

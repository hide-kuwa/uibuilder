'use client'
import React from 'react'
import type { Effect } from '@/types/interactions'
import { defaultEffect } from '@/types/interactions'

type Props = {
  value: Effect[] | undefined
  onChange: (next: Effect[]) => void
  transitionMs?: number
  onChangeTransition?: (ms: number) => void
}

const OPTIONS: { key: Effect['kind']; label: string }[] = [
  { key: 'bgColor', label: '背景色' },
  { key: 'textColor', label: '文字色' },
  { key: 'borderColor', label: '枠線色' },
  { key: 'shadow', label: 'シャドウ' },
  { key: 'scale', label: '拡大縮小' },
  { key: 'opacity', label: '透明度' },
  { key: 'translate', label: '移動（px）' },
  { key: 'rotate', label: '回転（deg）' },
  { key: 'outline', label: 'アウトライン' },
  { key: 'cursor', label: 'カーソル' },
]

export function HoverEffectsSection({ value, onChange, transitionMs = 120, onChangeTransition }: Props) {
  const effects = value ?? []
  const [pick, setPick] = React.useState<Effect['kind']>('scale')

  const add = () => onChange([...(effects), defaultEffect(pick)])
  const remove = (i: number) => onChange(effects.filter((_, idx) => idx !== i))
  const patch = <K extends keyof Effect>(i: number, key: K, v: any) => {
    const next = effects.slice()
    next[i] = { ...next[i], [key]: v } as Effect
    onChange(next)
  }

  return (
    <div className="mt-3 rounded border border-neutral-700 p-2">
      <div className="mb-2 text-xs font-semibold text-neutral-300">Hover（ホバー時の見た目）</div>

      <div className="flex items-center gap-2 mb-2">
        <select
          className="bg-neutral-800 text-neutral-100 rounded px-2 py-1 text-xs"
          value={pick}
          onChange={(e) => setPick(e.target.value as any)}
        >
          {OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          className="px-2 py-1 rounded bg-neutral-700 text-xs hover:bg-neutral-600"
          onClick={add}
        >
          追加
        </button>

        <div className="ml-auto flex items-center gap-1 text-xs">
          <span>transition</span>
          <input
            type="number"
            min={0}
            step={10}
            value={transitionMs}
            onChange={(e) => onChangeTransition?.(parseInt(e.target.value || '0', 10))}
            className="w-16 bg-neutral-800 rounded px-1 py-[2px]"
          />
          <span>ms</span>
        </div>
      </div>

      {!effects.length && (
        <div className="text-[11px] text-neutral-400">（追加してね）</div>
      )}

      <div className="flex flex-col gap-2">
        {effects.map((ef, i) => (
          <div key={i} className="rounded bg-neutral-900/60 p-2 border border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-neutral-300">
                {OPTIONS.find((o) => o.key === ef.kind)?.label}
              </div>
              <button
                className="text-[10px] text-red-300 hover:text-red-200"
                onClick={() => remove(i)}
              >
                削除
              </button>
            </div>

            {ef.kind === 'bgColor' && (
              <ColorRow label="背景色" value={ef.value} onChange={(v) => patch(i, 'value', v)} />
            )}
            {ef.kind === 'textColor' && (
              <ColorRow label="文字色" value={ef.value} onChange={(v) => patch(i, 'value', v)} />
            )}
            {ef.kind === 'borderColor' && (
              <ColorRow label="枠線色" value={ef.value} onChange={(v) => patch(i, 'value', v)} />
            )}
            {ef.kind === 'shadow' && (
              <SelectRow
                label="シャドウ"
                value={ef.value}
                options={['sm', 'md', 'lg', 'xl']}
                onChange={(v) => patch(i, 'value', v)}
              />
            )}
            {ef.kind === 'scale' && (
              <NumRow
                label="倍率"
                min={0.5}
                max={2}
                step={0.01}
                value={ef.value}
                onChange={(v) => patch(i, 'value', v)}
              />
            )}
            {ef.kind === 'opacity' && (
              <NumRow
                label="不透明度"
                min={0}
                max={1}
                step={0.05}
                value={ef.value}
                onChange={(v) => patch(i, 'value', v)}
              />
            )}
            {ef.kind === 'translate' && (
              <div className="flex gap-2">
                <NumRow
                  label="x(px)"
                  min={-200}
                  max={200}
                  step={1}
                  value={ef.x ?? 0}
                  onChange={(v) => patch(i, 'x', v)}
                />
                <NumRow
                  label="y(px)"
                  min={-200}
                  max={200}
                  step={1}
                  value={ef.y ?? 0}
                  onChange={(v) => patch(i, 'y', v)}
                />
              </div>
            )}
            {ef.kind === 'rotate' && (
              <NumRow
                label="角度(deg)"
                min={-45}
                max={45}
                step={1}
                value={ef.deg}
                onChange={(v) => patch(i, 'deg', v)}
              />
            )}
            {ef.kind === 'outline' && (
              <div className="flex flex-wrap items-center gap-2">
                <ColorRow label="色" value={ef.color} onChange={(v) => patch(i, 'color', v)} />
                <NumRow
                  label="太さ(px)"
                  min={0}
                  max={8}
                  step={1}
                  value={ef.width}
                  onChange={(v) => patch(i, 'width', v)}
                />
                <SelectRow
                  label="スタイル"
                  value={ef.style ?? 'solid'}
                  options={['solid', 'dashed', 'dotted']}
                  onChange={(v) => patch(i, 'style', v as any)}
                />
              </div>
            )}
            {ef.kind === 'cursor' && (
              <SelectRow
                label="カーソル"
                value={ef.value}
                options={['default', 'pointer', 'move', 'grab', 'text']}
                onChange={(v) => patch(i, 'value', v as any)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-neutral-400">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-10 bg-transparent border border-neutral-700 rounded"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-neutral-800 rounded px-2 py-[2px]"
      />
    </div>
  )
}
function NumRow({
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
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-neutral-400">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-24 bg-neutral-800 rounded px-2 py-[2px]"
      />
    </div>
  )
}
function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-neutral-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-800 rounded px-2 py-[2px]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

'use client'

import * as React from 'react'
import type {
  ActionPreset,
  BehaviorTrigger,
  Effect,
  Trigger,
} from '@/lib/actions/types'
import { defaultEffect } from '@/lib/actions/types'
import { useActionsStore } from '@/stores/actions'

type EditorAction =
  | 'replaceSelection'
  | 'appendSelection'
  | 'removeSelection'
  | 'replaceAll'
  | 'appendAll'
  | 'setProjectDefault'
  | 'addToDefaults'

type Props = {
  preset?: ActionPreset
  onAction?: (action: EditorAction, preset: ActionPreset) => void
}

const VISUAL_TRIGGERS: Trigger[] = [
  'hover',
  'active',
  'focus',
  'focusWithin',
  'groupHover',
]

const BEHAVIOR_TRIGGERS: BehaviorTrigger[] = ['click', 'inView']

const EFFECT_OPTIONS: Effect['kind'][] = [
  'scale',
  'bgColor',
  'cursor',
  'translate',
  'rotate',
]

type CursorValue = Extract<Effect, { kind: 'cursor' }>['value']
const CURSOR_VALUES: CursorValue[] = [
  'pointer',
  'default',
  'move',
  'grab',
  'text',
]

const ACTION_BUTTONS: { key: EditorAction; label: string }[] = [
  { key: 'replaceSelection', label: 'Replace Selection' },
  { key: 'appendSelection', label: 'Append Selection' },
  { key: 'removeSelection', label: 'Remove Selection' },
  { key: 'replaceAll', label: 'Replace All' },
  { key: 'appendAll', label: 'Append All' },
  { key: 'setProjectDefault', label: 'Set as Project Default' },
  { key: 'addToDefaults', label: 'Add to Defaults' },
]

export function ActionPresetEditor({ preset, onAction }: Props) {
  const update = useActionsStore((state) => state.update)
  const [effectKind, setEffectKind] = React.useState<Effect['kind']>('scale')
  const [tagInput, setTagInput] = React.useState('')

  React.useEffect(() => {
    if (!preset) {
      setTagInput('')
      return
    }
    setTagInput((preset.tags ?? []).join(', '))
  }, [preset?.id, preset?.tags])

  const emitAction = (action: EditorAction) => {
    if (!preset) return
    if (onAction) onAction(action, preset)
    else console.log(`[actions:${action}]`, preset)
  }

  const toggleVisual = (trigger: Trigger) => {
    if (!preset) return
    const current = preset.triggers ?? []
    const next = current.includes(trigger)
      ? current.filter((item) => item !== trigger)
      : [...current, trigger]
    update(preset.id, { triggers: next })
  }

  const toggleBehavior = (trigger: BehaviorTrigger) => {
    if (!preset) return
    const current = preset.when ?? []
    const next = current.includes(trigger)
      ? current.filter((item) => item !== trigger)
      : [...current, trigger]
    update(preset.id, { when: next })
  }

  const handleEffectChange = (index: number, nextEffect: Effect) => {
    if (!preset) return
    const next = preset.effects.map((effect, idx) => (idx === index ? nextEffect : effect))
    update(preset.id, { effects: next })
  }

  const handleRemoveEffect = (index: number) => {
    if (!preset) return
    const next = preset.effects.filter((_, idx) => idx !== index)
    update(preset.id, { effects: next })
  }

  const handleAddEffect = () => {
    if (!preset) return
    const effect = defaultEffect(effectKind)
    const next = [...preset.effects, effect]
    update(preset.id, { effects: next })
  }

  if (!preset) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-950 text-sm text-neutral-400">
        Select a preset to edit.
      </div>
    )
  }

  const when = preset.when ?? []

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-6">
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {ACTION_BUTTONS.map((action) => (
            <button
              key={action.key}
              type="button"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-200 transition hover:border-sky-500 hover:text-white"
              onClick={() => emitAction(action.key)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <label className="block text-xs font-medium text-neutral-300">
          Name
          <input
            type="text"
            value={preset.name}
            onChange={(event) => update(preset.id, { name: event.target.value })}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-sky-500 focus:outline-none"
          />
        </label>
        <label className="block text-xs font-medium text-neutral-300">
          Description
          <textarea
            value={preset.description ?? ''}
            onChange={(event) => update(preset.id, { description: event.target.value || undefined })}
            className="mt-1 h-20 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-sky-500 focus:outline-none"
          />
        </label>
        <label className="block text-xs font-medium text-neutral-300">
          Tags (comma separated)
          <input
            type="text"
            value={tagInput}
            onChange={(event) => {
              const value = event.target.value
              setTagInput(value)
              const tags = value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
              update(preset.id, { tags })
            }}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-sky-500 focus:outline-none"
            placeholder="marketing, hero, hover"
          />
        </label>
        <div className="text-[11px] text-neutral-500">
          Updated {new Date(preset.updatedAt).toLocaleString()}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Triggers
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {VISUAL_TRIGGERS.map((trigger) => {
            const active = preset.triggers.includes(trigger)
            return (
              <button
                key={trigger}
                type="button"
                className={`rounded-md border px-3 py-1 ${
                  active
                    ? 'border-sky-400 bg-sky-500/10 text-sky-100'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500'
                }`}
                onClick={() => toggleVisual(trigger)}
              >
                {trigger}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {BEHAVIOR_TRIGGERS.map((trigger) => {
            const active = when.includes(trigger)
            return (
              <button
                key={trigger}
                type="button"
                className={`rounded-md border px-3 py-1 ${
                  active
                    ? 'border-amber-400 bg-amber-500/10 text-amber-100'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500'
                }`}
                onClick={() => toggleBehavior(trigger)}
              >
                {trigger}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2">
            <span>Transition</span>
            <input
              type="number"
              min={0}
              value={preset.transitionMs ?? ''}
              onChange={(event) =>
                update(preset.id, {
                  transitionMs: event.target.value
                    ? Number.parseInt(event.target.value, 10)
                    : undefined,
                })
              }
              className="w-20 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
            />
            <span>ms</span>
          </label>
          <label className="flex-1">
            <span className="mr-2">Easing</span>
            <input
              type="text"
              value={preset.easing ?? ''}
              onChange={(event) => update(preset.id, { easing: event.target.value || undefined })}
              placeholder="cubic-bezier(.2,.8,.2,1)"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Effects
          </div>
          <div className="flex items-center gap-2 text-xs">
            <select
              value={effectKind}
              onChange={(event) => setEffectKind(event.target.value as Effect['kind'])}
              className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
            >
              {EFFECT_OPTIONS.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddEffect}
              className="rounded border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs hover:border-sky-500 hover:text-white"
            >
              + Add
            </button>
          </div>
        </div>
        {preset.effects.length === 0 ? (
          <div className="rounded border border-dashed border-neutral-700 bg-neutral-950/60 p-4 text-center text-xs text-neutral-500">
            No effects yet. Add an effect to define the visual behavior.
          </div>
        ) : (
          <div className="space-y-3">
            {preset.effects.map((effect, index) => (
              <div key={index} className="rounded-md border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  <span>{effect.kind}</span>
                  <button
                    type="button"
                    className="text-[11px] text-rose-400 hover:text-rose-200"
                    onClick={() => handleRemoveEffect(index)}
                  >
                    Remove
                  </button>
                </div>

                {effect.kind === 'scale' && (
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-2">
                      scale
                      <input
                        type="number"
                        step="0.01"
                        value={effect.value}
                        onChange={(event) =>
                          handleEffectChange(index, {
                            kind: 'scale',
                            value: Number.parseFloat(event.target.value || '0'),
                          })
                        }
                        className="w-24 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
                      />
                    </label>
                  </div>
                )}

                {effect.kind === 'bgColor' && (
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-2">
                      color
                      <input
                        type="text"
                        value={effect.value}
                        onChange={(event) =>
                          handleEffectChange(index, {
                            kind: 'bgColor',
                            value: event.target.value,
                          })
                        }
                        className="w-32 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
                        placeholder="#0f172a"
                      />
                    </label>
                    <input
                      type="color"
                      value={effect.value}
                      onChange={(event) =>
                        handleEffectChange(index, {
                          kind: 'bgColor',
                          value: event.target.value,
                        })
                      }
                      className="h-8 w-12 cursor-pointer rounded border border-neutral-700 bg-neutral-900"
                    />
                  </div>
                )}

                {effect.kind === 'cursor' && (
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-2">
                      cursor
                      <select
                        value={effect.value}
                        onChange={(event) =>
                          handleEffectChange(index, {
                            kind: 'cursor',
                            value: event.target.value as (typeof CURSOR_VALUES)[number],
                          })
                        }
                        className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
                      >
                        {CURSOR_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                {effect.kind === 'translate' && (
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2">
                      x
                      <input
                        type="number"
                        value={effect.x ?? 0}
                        onChange={(event) =>
                          handleEffectChange(index, {
                            kind: 'translate',
                            x: Number.parseFloat(event.target.value || '0'),
                            y: effect.y,
                          })
                        }
                        className="w-20 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      y
                      <input
                        type="number"
                        value={effect.y ?? 0}
                        onChange={(event) =>
                          handleEffectChange(index, {
                            kind: 'translate',
                            x: effect.x,
                            y: Number.parseFloat(event.target.value || '0'),
                          })
                        }
                        className="w-20 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
                      />
                    </label>
                  </div>
                )}

                {effect.kind === 'rotate' && (
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-2">
                      deg
                      <input
                        type="number"
                        value={effect.deg}
                        onChange={(event) =>
                          handleEffectChange(index, {
                            kind: 'rotate',
                            deg: Number.parseFloat(event.target.value || '0'),
                          })
                        }
                        className="w-24 rounded border border-neutral-700 bg-neutral-900 px-2 py-1"
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}



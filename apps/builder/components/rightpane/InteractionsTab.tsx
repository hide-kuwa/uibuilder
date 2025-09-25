'use client'

import * as React from 'react'
import type { InteractionPreset } from '@/types/interactions'
import {
  type ApplyMode,
  type ActionRule,
  type BehaviorTrigger,
  type ActionTarget,
} from '@/lib/actions/apply'
import { useSelectionStore } from '@/stores/selection'

type PresetWithActions = InteractionPreset & {
  actions?: ActionRule['actions']
  when?: BehaviorTrigger[]
}

const APPLY_MODES: ApplyMode[] = ['replace', 'append', 'remove']
const TRIGGERS: BehaviorTrigger[] = ['click', 'doubleClick', 'mount', 'delay', 'inView']
const TARGETS: ActionTarget[] = ['self', 'group', 'descendants']

async function loadPresets(): Promise<PresetWithActions[]> {
  const tryFetch = async (url: string) => {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      const json = await res.json()
      if (Array.isArray(json)) return json as PresetWithActions[]
      if (Array.isArray(json?.presets)) return json.presets as PresetWithActions[]
      return null
    } catch {
      return null
    }
  }
  const candidates = [
    '/api/dev/actions/presets?format=json',
    '/dev/actions.json',
    '/api/interaction-presets',
  ]
  for (const url of candidates) {
    const found = await tryFetch(url)
    if (found?.length) return found
  }
  if (typeof window !== 'undefined') {
    const globalPresets = (window as any).__actionPresets
    if (Array.isArray(globalPresets)) return globalPresets as PresetWithActions[]
  }
  return []
}

function ruleKey(rule: ActionRule, index: number) {
  return rule.id || `${rule.presetId ?? 'rule'}-${index}`
}

function NodeSummary({ nodes }: { nodes: { id: string; name?: string }[] }) {
  if (!nodes.length) return null
  if (nodes.length === 1) {
    const node = nodes[0]
    return (
      <div className="text-xs text-neutral-500">
        Editing <span className="font-semibold text-neutral-200">{node.name || node.id}</span>
      </div>
    )
  }
  return (
    <div className="text-xs text-neutral-500">
      {nodes.length} nodes selected
    </div>
  )
}

function RuleRow({
  rule,
  index,
  onUpdate,
  onRemove,
}: {
  rule: ActionRule
  index: number
  onUpdate: (patch: Partial<ActionRule>) => void
  onRemove: () => void
}) {
  return (
    <div className="border border-neutral-800 rounded p-2 space-y-2 bg-neutral-900">
      <div className="flex items-center gap-2">
        <input
          value={rule.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Rule name"
          className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-rose-300 hover:text-rose-200"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wide text-neutral-500">Trigger</span>
          <select
            className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1"
            value={rule.trigger}
            onChange={(e) => onUpdate({ trigger: e.target.value as BehaviorTrigger })}
          >
            {TRIGGERS.map((tr) => (
              <option key={tr} value={tr}>
                {tr}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wide text-neutral-500">Target</span>
          <select
            className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1"
            value={rule.target}
            onChange={(e) => onUpdate({ target: e.target.value as ActionTarget })}
          >
            {TARGETS.map((tgt) => (
              <option key={tgt} value={tgt}>
                {tgt}
              </option>
            ))}
          </select>
        </label>
      </div>
      {rule.presetName && (
        <div className="text-[11px] text-neutral-500">
          From preset: <span className="font-mono text-neutral-300">{rule.presetName}</span>
        </div>
      )}
      <div className="text-[11px] text-neutral-500">
        Actions: {rule.actions?.length ?? 0}
      </div>
    </div>
  )
}

export default function InteractionsTab(): JSX.Element {
  const nodes = useSelectionStore((s) => s.nodes)
  const applyPreset = useSelectionStore((s) => s.applyPreset)
  const addEmptyRule = useSelectionStore((s) => s.addEmptyRule)
  const updateRule = useSelectionStore((s) => s.updateRule)
  const removeRule = useSelectionStore((s) => s.removeRule)

  const [presets, setPresets] = React.useState<PresetWithActions[]>([])
  const [loadingPresets, setLoadingPresets] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [addingPreset, setAddingPreset] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<string>('')
  const [applyMode, setApplyMode] = React.useState<ApplyMode>('append')

  React.useEffect(() => {
    let mounted = true
    setLoadingPresets(true)
    ;(async () => {
      const list = await loadPresets()
      if (!mounted) return
      if (!list.length) setError('No presets available. Create presets in /dev/actions.')
      else setError(null)
      setPresets(list)
      setLoadingPresets(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleApplyPreset = () => {
    if (!selectedPreset) return
    const preset = presets.find((p) => p.id === selectedPreset)
    if (!preset) return
    applyPreset(preset, applyMode)
    setAddingPreset(false)
    setSelectedPreset('')
  }

  if (!nodes.length) {
    return <div className="p-3 text-sm text-neutral-500">Select a node to manage interactions.</div>
  }

  const primary = nodes[0]
  const rules: ActionRule[] = primary.actionRules ?? []

  return (
    <div className="p-3 space-y-3 text-sm text-neutral-200">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">Interactions</div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-2 py-1 text-xs bg-neutral-800 rounded hover:bg-neutral-700"
            onClick={() => setAddingPreset((v) => !v)}
          >
            + Add
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs bg-neutral-800 rounded hover:bg-neutral-700"
            onClick={() => addEmptyRule(primary.id)}
          >
            + Empty
          </button>
        </div>
      </div>

      <NodeSummary nodes={nodes} />

      {addingPreset && (
        <div className="border border-neutral-800 rounded p-2 bg-neutral-900 space-y-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400">
              Preset
              <select
                className="mt-1 w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                disabled={loadingPresets}
              >
                <option value="">Select preset</option>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-neutral-400">
              Mode
              <select
                className="mt-1 w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1"
                value={applyMode}
                onChange={(e) => setApplyMode(e.target.value as ApplyMode)}
              >
                {APPLY_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-2 py-1 text-xs bg-blue-600 rounded text-white disabled:opacity-60"
              onClick={handleApplyPreset}
              disabled={!selectedPreset}
            >
              Apply
            </button>
            <button
              type="button"
              className="px-2 py-1 text-xs bg-neutral-800 rounded"
              onClick={() => setAddingPreset(false)}
            >
              Cancel
            </button>
          </div>
          {error && <div className="text-[11px] text-amber-400">{error}</div>}
        </div>
      )}

      <div className="space-y-2">
          {rules.length ? (
            rules.map((rule, index) => (
              <RuleRow
                key={ruleKey(rule, index)}
                rule={rule}
                index={index}
                onUpdate={(patch) => updateRule(primary.id, rule.id, patch)}
                onRemove={() => removeRule(primary.id, rule.id)}
              />
            ))
          ) : (
          <div className="text-xs text-neutral-500">No interaction rules configured.</div>
        )}
      </div>

      <div className="text-[11px] text-neutral-500">
        Presets are managed from <a className="underline" href="/dev/actions">/dev/actions</a>.
      </div>
    </div>
  )
}


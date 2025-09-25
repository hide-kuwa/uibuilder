'use client'

import * as React from 'react'
import type { ActionPreset } from '@/lib/actions/types'
import { ActionEngine } from '@/lib/actions/engine'

const PREVIEW_NODE_ID = 'action-preview-node'

type Props = {
  preset?: ActionPreset
}

export function ActionPreview({ preset }: Props) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const bindingRef = React.useRef<ReturnType<typeof ActionEngine.bind> | null>(null)
  const [groupEnabled, setGroupEnabled] = React.useState(false)

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const binding = ActionEngine.bind(root, {
      nodeId: PREVIEW_NODE_ID,
      presets: preset ? [preset] : [],
    })
    bindingRef.current = binding
    return () => {
      binding.destroy()
      if (bindingRef.current === binding) bindingRef.current = null
    }
  }, [])

  React.useEffect(() => {
    bindingRef.current?.update(preset ? [preset] : [])
  }, [preset])

  const hasGroupHover = React.useMemo(
    () => (preset?.triggers ?? []).includes('groupHover'),
    [preset?.triggers],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Preview
        </h2>
        <label className="flex items-center gap-2 text-xs text-neutral-400">
          <input
            type="checkbox"
            checked={groupEnabled}
            onChange={(event) => setGroupEnabled(event.target.checked)}
            className="h-3 w-3 rounded border border-neutral-600 bg-neutral-900"
          />
          <span>.group wrapper</span>
        </label>
      </div>
      <div ref={rootRef} className="relative flex-1 overflow-hidden px-4 py-6">
        <div className={`mx-auto max-w-sm transition ${groupEnabled ? 'group' : ''}`}>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-inner">
            <div
              data-node-id={PREVIEW_NODE_ID}
              className="flex flex-col items-center justify-center gap-4 rounded-lg border border-neutral-800 bg-neutral-950 px-6 py-10 text-center text-sm text-neutral-200"
            >
              <span className="text-lg font-semibold text-white">Hover me</span>
              <p className="max-w-[220px] text-xs text-neutral-400">
                {hasGroupHover
                  ? 'With group hover enabled, try hovering the surrounding card as well.'
                  : 'Hover this element to preview the preset.'}
              </p>
              <button
                type="button"
                className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-1 text-xs text-neutral-300 hover:border-neutral-500"
              >
                Secondary action
              </button>
            </div>
          </div>
        </div>
      </div>
      {preset ? (
        <div className="border-t border-neutral-800 px-4 py-3 text-[11px] text-neutral-400">
          <div className="flex flex-wrap gap-2">
            {(preset.triggers ?? []).map((trigger) => (
              <span key={trigger} className="rounded bg-neutral-800 px-2 py-[1px]">
                {trigger}
              </span>
            ))}
            {(preset.when ?? []).map((trigger) => (
              <span key={`when-${trigger}`} className="rounded bg-neutral-800 px-2 py-[1px]">
                {trigger}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

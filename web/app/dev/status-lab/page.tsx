'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useBuilderStore } from '@/stores/builder'
import type { BaseKind, OverlayKind, ComposeMode } from '@/types/status'
import { computeBgColor, buildMotionFromStatus } from '@/lib/status-engine'
import { runMotionEffects } from '@/lib/runMotion'

export default function StatusLabPage() {
  const cfg = useBuilderStore((s) => s.statusConfig)
  const setStatusConfig = useBuilderStore((s) => s.setStatusConfig)

  const [base, setBase] = useState<BaseKind>('visited')
  const [overlays, setOverlays] = useState<OverlayKind[]>([])

  const status = { base, overlays }
  const { bg, filter } = computeBgColor(status, cfg)
  const motion = buildMotionFromStatus(status, cfg)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !motion) return
    runMotionEffects(
      [
        {
          id: 'glow',
          preset: 'pulse',
          runWhen: ['mount'],
          options: { loop: true, ...motion },
        },
      ],
      'mount',
      ref.current,
    )
  }, [motion])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Status Lab</h1>
        <Link href="/dev/pages" className="text-sm underline">
          ← /dev/pages
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Controls */}
        <div className="space-y-6">
          {/* Base selection */}
          <section>
            <div className="mb-1 text-xs text-zinc-500">Base</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(cfg.base).map(([k, v]) => (
                <label key={k} className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="base"
                    value={k}
                    checked={base === k}
                    onChange={() => setBase(k as BaseKind)}
                  />
                  {v.label}
                </label>
              ))}
            </div>
          </section>

          {/* Overlay selection */}
          <section>
            <div className="mb-1 text-xs text-zinc-500">Overlays</div>
            <div className="flex flex-wrap gap-2">
              {cfg.overlays.map((o) => (
                <label key={o.key} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={overlays.includes(o.key)}
                    onChange={(e) =>
                      setOverlays((prev) =>
                        e.target.checked
                          ? [...prev, o.key]
                          : prev.filter((k) => k !== o.key),
                      )
                    }
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </section>

          {/* Compose order */}
          <section>
            <label className="mb-1 block text-xs text-zinc-500">compose.order</label>
            <select
              value={cfg.compose.order}
              onChange={(e) =>
                setStatusConfig((draft) => {
                  draft.compose.order = e.target.value as 'priority' | 'as-is'
                })
              }
              className="rounded border px-2 py-1 text-sm"
            >
              <option value="priority">priority</option>
              <option value="as-is">as-is</option>
            </select>
          </section>

          {/* Overlay config editing */}
          <section>
            <div className="mb-1 text-xs text-zinc-500">Overlay config</div>
            <div className="space-y-2">
              {cfg.overlays.map((o, idx) => (
                <div key={o.key} className="flex items-center gap-2 text-sm">
                  <div className="w-16">{o.label}</div>
                  <input
                    type="number"
                    value={o.priority}
                    onChange={(e) =>
                      setStatusConfig((draft) => {
                        draft.overlays[idx].priority = Number(e.target.value)
                      })
                    }
                    className="w-16 rounded border px-1"
                  />
                  <select
                    value={o.mode}
                    onChange={(e) =>
                      setStatusConfig((draft) => {
                        draft.overlays[idx].mode = e.target.value as ComposeMode
                      })
                    }
                    className="rounded border px-2 py-1"
                  >
                    <option value="blend">blend</option>
                    <option value="override">override</option>
                    <option value="glow">glow</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center">
          <div
            ref={ref}
            className="flex h-40 w-40 items-center justify-center rounded-xl border text-sm shadow"
            style={{ background: bg, filter }}
          >
            <div className="text-center leading-tight text-white drop-shadow">
              <div>{base}</div>
              {overlays.length > 0 && (
                <div className="text-xs">{overlays.join(', ')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


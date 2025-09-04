'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { MOTION_PRESETS } from '@/lib/motion-presets'

type Props = {
  /** 現在のプリセットキー */
  preset: string
  /** 現在の強度 0..100 */
  strength: number
  /** 更新時に呼ばれる（即時反映） */
  onUpdate: (next: { preset?: string; strength?: number }) => void
  /** Motion Lab へ飛ぶ際のクエリに使う */
  openLabHref?: string
}

export default function PresetsSidebar({
  preset,
  strength,
  onUpdate,
  openLabHref,
}: Props) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const entries = Object.entries(MOTION_PRESETS)
    if (!q.trim()) return entries
    const s = q.trim().toLowerCase()
    return entries.filter(([key, def]) =>
      key.toLowerCase().includes(s) || def.name.toLowerCase().includes(s),
    )
  }, [q])

  useEffect(() => {
    // 型の都合で外からの変更に追従するだけなら特に処理不要
  }, [preset, strength])

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-3 text-sm font-medium text-gray-700">Presets</div>

      <input
        className="mb-3 w-full rounded-md border px-3 py-2 text-sm"
        placeholder="Search presets..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mb-4 space-y-1">
        {list.map(([key, def]) => {
          const active = key === preset
          return (
            <button
              key={key}
              onClick={() => onUpdate({ preset: key })}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                active ? 'border-indigo-300 bg-indigo-50' : 'hover:bg-black/5'
              }`}
              title={def.name}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{def.name}</span>
                {active && <span className="text-[10px] text-indigo-600">selected</span>}
              </div>
            </button>
          )
        })}
        {list.length === 0 && (
          <div className="rounded-md border border-dashed p-3 text-xs text-gray-500">
            No results
          </div>
        )}
      </div>

      <div className="mb-1 text-xs text-gray-500">Strength: {strength}</div>
      <input
        type="range"
        min={0}
        max={100}
        value={strength}
        onChange={(e) => onUpdate({ strength: Number(e.target.value) })}
        className="w-full"
      />

      <div className="mt-4 flex gap-2">
        <a
          href={openLabHref ?? `/dev/motion?p=${encodeURIComponent(preset)}&s=${strength}`}
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
        >
          Open in Motion Lab
        </a>
      </div>
    </div>
  )
}


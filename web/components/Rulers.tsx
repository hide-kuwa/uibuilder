'use client'
import React from 'react'
import { useGuidesStore } from '@/store/guidesStore'

export function Rulers({ width, height }: { width: number; height: number }) {
  const { unit, setUnit, baseRemPx } = useGuidesStore((s) => ({
    unit: s.unit,
    setUnit: s.setUnit,
    baseRemPx: s.baseRemPx,
  }))

  const ticksX = getTicks(width, unit, baseRemPx)
  const ticksY = getTicks(height, unit, baseRemPx)

  return (
    <div className="absolute top-0 left-0 select-none">
      {/* 水平ルーラー */}
      <div className="relative h-6 w-full bg-neutral-900/70 text-neutral-200">
        <select
          className="absolute left-1 top-1 h-4 text-[10px] bg-neutral-800 rounded px-1"
          value={unit}
          onChange={(e) => setUnit(e.target.value as any)}
          title="unit"
        >
          <option value="px">px</option>
          <option value="%">%</option>
          <option value="rem">rem</option>
        </select>
        <svg className="absolute left-0 top-0" width={width} height={24}>
          {ticksX.map((t) => (
            <g key={t.px}>
              <line x1={t.px} y1={0} x2={t.px} y2={t.long ? 16 : 10} stroke="rgba(255,255,255,.5)" />
              {t.label != null && (
                <text x={t.px + 2} y={20} fontSize={10} fill="white">{t.label}</text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* 垂直ルーラー */}
      <div className="absolute top-0 left-0 w-6 h-full bg-neutral-900/70 text-neutral-200">
        <svg className="absolute left-0 top-0" width={24} height={height}>
          {ticksY.map((t) => (
            <g key={t.px}>
              <line x1={0} y1={t.px} x2={t.long ? 16 : 10} y2={t.px} stroke="rgba(255,255,255,.5)" />
              {t.label != null && (
                <text x={2} y={t.px - 2} fontSize={10} fill="white" transform={`rotate(-90, 8, ${t.px - 2})`}>
                  {t.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

function getTicks(lenPx: number, unit: 'px'|'%'|'rem', baseRemPx: number) {
  const ticks: { px: number; long: boolean; label?: string|number }[] = []

  if (unit === 'px') {
    // ズームに合わせた刻み幅にしたければ外から渡して調整
    const step = pickStepPx(lenPx)
    for (let x = 0; x <= lenPx; x += step/5) {
      const isLong = Math.round(x * 5) % step === 0
      ticks.push({ px: x, long: isLong, label: isLong ? Math.round(x) : undefined })
    }
  } else if (unit === '%') {
    for (let p = 0; p <= 100; p += 1) {
      const x = (p / 100) * lenPx
      const isLong = p % 10 === 0
      ticks.push({ px: x, long: isLong, label: isLong ? p : undefined })
    }
  } else { // rem
    const stepRem = 1
    const stepPx = baseRemPx * stepRem
    for (let r = 0, x = 0; x <= lenPx; r += stepRem, x += stepPx) {
      const isLong = r % 5 === 0
      ticks.push({ px: x, long: isLong, label: isLong ? r : undefined })
    }
  }

  return ticks
}

function pickStepPx(lenPx: number) {
  if (lenPx <= 800) return 100
  if (lenPx <= 1600) return 200
  return 400
}

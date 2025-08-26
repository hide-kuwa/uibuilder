'use client'
import React from 'react'
import { useHudStore } from '@/store/hudStore'

type Props = {
  /** カンバスを包む要素の ref（サイズ & マウス位置の基準に使う） */
  containerRef: React.RefObject<HTMLElement>
  /** カンバスのパン量（ピクセル）。未対応なら 0 のままでOK */
  offset?: { x: number; y: number }
  /** ルーラーの太さ(px) */
  thickness?: number
}

function chooseStep(pxPerUnit: number) {
  // ラベルが詰まらないように目盛間隔を自動調整
  // 候補（px）: 5, 10, 20, 50, 100, 200, 500
  const candidates = [5, 10, 20, 50, 100, 200, 500]
  // 100〜140px くらいでラベルが見やすい
  const target = 120
  let best = candidates[0]
  let bestDiff = Infinity
  for (const c of candidates) {
    const diff = Math.abs(c * pxPerUnit - target)
    if (diff < bestDiff) {
      best = c
      bestDiff = diff
    }
  }
  return best
}

export function RulersOverlay({ containerRef, offset, thickness = 24 }: Props) {
  const show = useHudStore((s) => s.showRulers)
  const zoom = useHudStore((s) => s.zoom)
  const snap = useHudStore((s) => s.snapToPixel)
  const [size, setSize] = React.useState({ w: 0, h: 0 })
  const [mouse, setMouse] = React.useState<{ x: number; y: number } | null>(null)

  const offX = offset?.x ?? 0
  const offY = offset?.y ?? 0

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // サイズ追従
    const ro = new (window as any).ResizeObserver((entries: any[]) => {
      const r = entries[0].contentRect
      setSize({ w: Math.ceil(r.width), h: Math.ceil(r.height) })
    })
    ro.observe(el)
    // マウス座標（コンテナ基準）
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setMouse(null)
      } else {
        setMouse({
          x: snap ? Math.round(x) : x,
          y: snap ? Math.round(y) : y,
        })
      }
    }
    const onLeave = () => setMouse(null)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      ro.disconnect()
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [containerRef, snap])
  if (!show) return null

  // ズームに応じた px/px（= zoom）。単位は px 固定。
  const pxPerUnit = zoom
  const major = chooseStep(1) // ここは 1px 単位。major は chooseStep(1)→候補から最適を返す
  const majorStep = Math.max(major, 5)
  const minorStep = majorStep / 5

  // オフセット（パン）を考慮して 0 始点をずらす
  const startX = -((offX * zoom) % majorStep)
  const startY = -((offY * zoom) % majorStep)

  const ticksX: { x: number; label?: string }[] = []
  for (let x = startX; x <= size.w; x += minorStep) {
    const isMajor = Math.abs((x - startX) % majorStep) < 0.5
    const worldX = Math.round((x + offX * zoom) / zoom)
    ticksX.push({
      x,
      label: isMajor ? `${worldX}` : undefined,
    })
  }

  const ticksY: { y: number; label?: string }[] = []
  for (let y = startY; y <= size.h; y += minorStep) {
    const isMajor = Math.abs((y - startY) % majorStep) < 0.5
    const worldY = Math.round((y + offY * zoom) / zoom)
    ticksY.push({
      y,
      label: isMajor ? `${worldY}` : undefined,
    })
  }
  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {/* 角の箱 */}
      <div
        className="absolute top-0 left-0 bg-[#0b1220] border-b border-r border-[#1f2937]"
        style={{ width: thickness, height: thickness }}
      />

      {/* 上ルーラー */}
      <div
        className="absolute top-0 left-0 right-0 bg-[#0b1220] border-b border-[#1f2937]"
        style={{ height: thickness, paddingLeft: thickness }}
      >
        <svg width="100%" height={thickness}>
          {ticksX.map((t, i) => {
            const isMajor = t.label != null
            const y1 = thickness
            const y2 = isMajor ? 6 : 12
            return (
              <g key={i} transform={`translate(${t.x},0)`}>
                <line
                  x1={0}
                  y1={y1}
                  x2={0}
                  y2={y2}
                  stroke="rgba(148,163,184,0.6)"
                  shapeRendering="crispEdges"
                />
                {t.label && (
                  <text
                    x={2}
                    y={thickness - 4}
                    fontSize="10"
                    fill="rgba(203,213,225,0.9)"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* 左ルーラー */}
      <div
        className="absolute top-0 left-0 bottom-0 bg-[#0b1220] border-r border-[#1f2937]"
        style={{ width: thickness, paddingTop: thickness }}
      >
        <svg width={thickness} height="100%">
          {ticksY.map((t, i) => {
            const isMajor = t.label != null
            const x1 = thickness
            const x2 = isMajor ? 6 : 12
            return (
              <g key={i} transform={`translate(0,${t.y})`}>
                <line
                  x1={x1}
                  y1={0}
                  x2={x2}
                  y2={0}
                  stroke="rgba(148,163,184,0.6)"
                  shapeRendering="crispEdges"
                />
                {t.label && (
                  <text
                    x={2}
                    y={-2}
                    fontSize="10"
                    fill="rgba(203,213,225,0.9)"
                    transform="rotate(-90 8,0)"
                  >
                    {t.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      {/* クロスヘア */}
      {mouse && (
        <>
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: Math.max(mouse.x + thickness, thickness),
              width: 1,
              background: 'rgba(14,165,233,0.55)',
            }}
          />
          <div
            className="absolute left-0 right-0"
            style={{
              top: Math.max(mouse.y + thickness, thickness),
              height: 1,
              background: 'rgba(14,165,233,0.55)',
            }}
          />
        </>
      )}
    </div>
  )
}

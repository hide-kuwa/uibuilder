'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useBuilderStore } from '@/stores/builder'

export default function TooltipLabPage() {
  const getMapNodes = useBuilderStore((s) => s.getMapNodes)
  const nodes = getMapNodes(true)
  const cfg = useBuilderStore((s) => s.statusConfig)
  const getStatus = useBuilderStore((s) => s.getNodeStatus)

  const containerRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null)

  const showTip = (id: string, x: number, y: number) => {
    setTip({ id, x, y })
  }

  const hideTip = () => setTip(null)

  const handleMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    showTip(id, x, y)
  }

  const handleClick = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setTip((prev) => (prev && prev.id === id ? null : { id, x, y }))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tooltip Lab</h1>
        <Link href="/dev/pages" className="text-sm underline">
          ← /dev/pages
        </Link>
      </div>
      <div ref={containerRef} className="relative h-[500px] border rounded-md">
        {nodes.map((n, i) => (
          <div
            key={n.id}
            className="absolute w-24 h-16 p-2 text-xs rounded border shadow-sm bg-white flex items-center justify-center"
            style={{ left: (i % 4) * 120 + 20, top: Math.floor(i / 4) * 100 + 20 }}
            onMouseEnter={(e) => handleMove(n.id, e)}
            onMouseLeave={hideTip}
            onMouseMove={(e) => tip?.id === n.id && handleMove(n.id, e)}
            onClick={(e) => handleClick(n.id, e)}
          >
            {n.name ?? n.id}
          </div>
        ))}
        {tip && (() => {
          const status = getStatus(tip.id)
          const base = cfg.base[status.base]
          return (
            <div
              className="pointer-events-none absolute z-10 border rounded bg-white text-xs shadow p-2"
              style={{ left: tip.x, top: tip.y, transform: 'translate(8px, 8px)' }}
            >
              <div className="font-semibold">Base: {base.label}</div>
              {status.overlays.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {status.overlays.map((k) => {
                    const oc = cfg.overlays.find((o) => o.key === k)
                    return (
                      <li key={k}>
                        {oc?.label ?? k} (p{oc?.priority}, {oc?.mode})
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}


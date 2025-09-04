'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ZoomPanCanvas from '@/components/canvas/ZoomPanCanvas'
import { useBuilderStore } from '@/stores/builder'
import { computeBgColor, buildMotionFromStatus } from '@/lib/status-engine'
import type { BaseKind, OverlayKind, NodeStatus, StatusConfig } from '@/types/status'
import { animate } from 'animejs'

// reuse MapNode type from map page
interface MapNode {
  id: string
  name?: string
  x?: number
  y?: number
  w?: number
  h?: number
}

const BASE_OPTIONS: { key: BaseKind | 'all'; label: string }[] = [
  { key: 'visited', label: 'visited' },
  { key: 'live', label: 'resident' },
  { key: 'notVisited', label: 'notVisited' },
  { key: 'all', label: 'all' },
]

const OVERLAY_OPTIONS: { key: OverlayKind; label: string }[] = [
  { key: 'want', label: 'want' },
  { key: 'photo', label: 'hasPhotos' },
]

function NodeCard({
  node,
  status,
  cfg,
  faded,
  hidden,
}: {
  node: MapNode
  status: NodeStatus
  cfg: StatusConfig
  faded: boolean
  hidden: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { bg, filter } = computeBgColor(status, cfg)
  const motion = buildMotionFromStatus(node.id, status, cfg)

  useEffect(() => {
    if (!ref.current || !motion) return
    const inst = animate({ targets: ref.current, ...motion })
    return () => inst.pause()
  }, [motion])

  return (
    <div
      ref={ref}
      className={`rounded-xl p-4 border text-sm shadow-sm transition-opacity ${
        faded ? 'opacity-30' : ''
      } ${hidden ? 'hidden' : ''}`}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: node.w,
        height: node.h,
        background: bg,
        filter,
      }}
    >
      <div className="font-semibold">{node.name ?? node.id}</div>
      <div className="opacity-70 text-xs">id: {node.id}</div>
    </div>
  )
}

export default function MapLabPage() {
  const getMapNodes = useBuilderStore((s) => s.getMapNodes)
  const getNodeStatus = useBuilderStore((s) => s.getNodeStatus)
  const cfg = useBuilderStore((s) => s.statusConfig)
  const nodes = getMapNodes(true)

  const [keyword, setKeyword] = useState('')
  const [base, setBase] = useState<BaseKind | 'all'>('all')
  const [want, setWant] = useState(false)
  const [photo, setPhoto] = useState(false)
  const [semiTransparent, setSemiTransparent] = useState(false)

  const kw = keyword.trim().toLowerCase()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Map Lab</h1>
        <Link href="/dev/pages" className="text-sm underline">
          ← /dev/pages
        </Link>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="keyword"
          className="w-full rounded border px-2 py-1 text-sm"
        />

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {BASE_OPTIONS.map((b) => (
            <label key={b.key} className="flex items-center gap-1">
              <input
                type="radio"
                name="base"
                value={b.key}
                checked={base === b.key}
                onChange={() => setBase(b.key as BaseKind | 'all')}
              />
              {b.label}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {OVERLAY_OPTIONS.map((o) => (
            <label key={o.key} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={o.key === 'want' ? want : photo}
                onChange={(e) =>
                  o.key === 'want'
                    ? setWant(e.target.checked)
                    : setPhoto(e.target.checked)
                }
              />
              {o.label}
            </label>
          ))}
        </div>

        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={semiTransparent}
            onChange={(e) => setSemiTransparent(e.target.checked)}
          />
          半透明表示
        </label>
      </div>

      <ZoomPanCanvas className="w-full h-[1000px]">
        {nodes.map((n) => {
          const status = getNodeStatus(n.id)
          const matchesKeyword =
            kw === '' ||
            n.name?.toLowerCase().includes(kw) ||
            n.id.toLowerCase().includes(kw)
          const matchesBase = base === 'all' || status.base === base
          const matchesOverlay =
            (!want || status.overlays.includes('want')) &&
            (!photo || status.overlays.includes('photo'))
          const matched = matchesKeyword && matchesBase && matchesOverlay
          return (
            <NodeCard
              key={n.id}
              node={n}
              status={status}
              cfg={cfg}
              faded={!matched && semiTransparent}
              hidden={!matched && !semiTransparent}
            />
          )
        })}
      </ZoomPanCanvas>
    </div>
  )
}


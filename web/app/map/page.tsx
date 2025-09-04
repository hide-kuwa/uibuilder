'use client'
import { usePublishStore } from '@/stores/publish'
import { buildMotionFromStatus, computeBgColor } from '@/lib/status-engine'
import { runMotionEffects } from '@/lib/runMotion'

export default function MapPage() {
  const { schema } = usePublishStore()
  const nodes = schema?.nodes ?? []

  return (
    <div className="p-4">
      <div className="mb-3 text-sm text-gray-600">Published nodes: {nodes.length}</div>
      <div className="relative grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {nodes.map((n: any) => {
          const statusEff = buildMotionFromStatus(n.id, n.status ?? { base:'notVisited', overlays:[] })
          const bg = computeBgColor(n.status ?? { base:'notVisited', overlays:[] })
          return (
            <div
              key={n.id}
              data-node-id={n.id}
              className="h-28 rounded-xl border p-3 text-sm"
              style={{ backgroundColor: bg }}
              onMouseEnter={(e)=> runMotionEffects(statusEff.hoverEnter, 'hoverEnter', e.currentTarget as HTMLElement)}
              onMouseLeave={(e)=> runMotionEffects(statusEff.hoverLeave, 'hoverLeave', e.currentTarget as HTMLElement)}
              ref={(el)=>{ if (el) queueMicrotask(()=> runMotionEffects(statusEff.mount, 'mount', el!)) }}
            >
              {n.title ?? n.prefecture ?? n.id}
            </div>
          )
        })}
      </div>
    </div>
  )
}

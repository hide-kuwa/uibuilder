'use client'
import { useCanvasStore } from '@/stores/canvas'

export default function SmartGuides() {
  const vxs = useCanvasStore(s => s.guidesV)
  const hys = useCanvasStore(s => s.guidesH)

  return (
    <div className="pointer-events-none absolute inset-0">
      {vxs.map((x, i) => (
        <div key={`v${i}`} className="absolute bg-indigo-400/60" style={{ left: x, top: 0, width: 1, height: '200vh' }} />
      ))}
      {hys.map((y, i) => (
        <div key={`h${i}`} className="absolute bg-indigo-400/60" style={{ top: y, left: 0, height: 1, width: '200vw' }} />
      ))}
    </div>
  )
}

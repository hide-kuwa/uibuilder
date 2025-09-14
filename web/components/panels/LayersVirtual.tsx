'use client'
import { useMemo, useRef, useState, useEffect } from 'react'

const ROW_H = 28
const OVERSCAN = 8

export default function LayersVirtual({ rows }: { rows: { id: string; name?: string }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(320)
  const [top, setTop] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => setTop(el.scrollTop)
    const ro = new ResizeObserver(() => setH(el.clientHeight))
    el.addEventListener('scroll', onScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', onScroll); ro.disconnect() }
  }, [])

  const total = rows.length
  const start = Math.max(0, Math.floor(top / ROW_H) - OVERSCAN)
  const end = Math.min(total, Math.ceil((top + h) / ROW_H) + OVERSCAN)
  const slice = useMemo(() => rows.slice(start, end), [rows, start, end])

  return (
    <div ref={ref} className="h-[320px] overflow-auto relative">
      <div style={{ height: total * ROW_H }}>
        <div style={{ transform: `translateY(${start * ROW_H}px)` }}>
          {slice.map((r, i) => (
            <div key={r.id} className="h-[28px] flex items-center px-2">
              {r.name ?? r.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


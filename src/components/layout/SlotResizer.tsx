import React from 'react'

const GRID_SIZE = 8

function snap(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

export interface SlotResizerProps {
  axis: 'x' | 'y'
  value: number
  onChange: (value: number) => void
  className?: string
}

export const SlotResizer: React.FC<SlotResizerProps> = ({
  axis,
  value,
  onChange,
  className,
}) => {
  const startRef = React.useRef<{ start: number; initial: number } | null>(null)

  const onMouseDown = (e: React.MouseEvent) => {
    startRef.current = {
      start: axis === 'x' ? e.clientX : e.clientY,
      initial: value,
    }

    const handleMove = (ev: MouseEvent) => {
      if (!startRef.current) return
      const delta =
        axis === 'x'
          ? ev.clientX - startRef.current.start
          : ev.clientY - startRef.current.start
      const next = snap(startRef.current.initial + delta)
      onChange(next)
    }

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      startRef.current = null
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const style: React.CSSProperties = {
    cursor: axis === 'x' ? 'col-resize' : 'row-resize',
  }

  return <div className={className} style={style} onMouseDown={onMouseDown} />
}

export default SlotResizer

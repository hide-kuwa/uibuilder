'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { useEditorState, useEditorActions, ComponentNode } from './store'

const useKey = (handler: (e: KeyboardEvent) => void) => {
  useEffect(() => {
    const f = (e: KeyboardEvent) => handler(e)
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [handler])
}

const Toolbar: React.FC<{
  zoom: number
  onReset: () => void
  hover: boolean
  setHover: (v: boolean) => void
}> = ({ zoom, onReset, hover, setHover }) => {
  return (
    <div className="flex items-center gap-2 p-2 border-b bg-white sticky top-0 z-10">
      <div className="text-sm">{Math.round(zoom * 100)}%</div>
      <button className="px-2 py-1 border rounded" onClick={onReset}>Reset</button>
      <label className="flex items-center gap-1 text-sm">
        <input type="checkbox" checked={hover} onChange={e => setHover(e.target.checked)} />
        Hover preview
      </label>
    </div>
  )
}

const NodeBox: React.FC<{
  node: ComponentNode
  selected: boolean
  onSelect: () => void
  onChangeLayout: (layout: { x: number; y: number; w: number; h: number }) => void
}> = ({ node, selected, onSelect, onChangeLayout }) => {
  const l = node.layout || { x: 40, y: 40, w: 320, h: 180 }
  const Comp: any = node.type
  return (
    <Rnd
      size={{ width: l.w, height: l.h }}
      position={{ x: l.x, y: l.y }}
      onDragStop={(_, d) => onChangeLayout({ x: d.x, y: d.y, w: l.w, h: l.h })}
      onResizeStop={(_, __, ref, ___, pos) =>
        onChangeLayout({ x: pos.x, y: pos.y, w: ref.offsetWidth, h: ref.offsetHeight })
      }
      bounds="parent"
      enableResizing
      onMouseDown={onSelect}
      className={selected ? 'outline outline-2 outline-blue-500' : ''}
    >
      {React.createElement(Comp, node.props || {})}
    </Rnd>
  )
}

const CanvasFree: React.FC = () => {
  const { tree, selectedComponentId, hoverPreview } = useEditorState()
  const { selectComponent, setLayout, undo, redo, setHoverPreview } = useEditorActions()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panning = useRef(false)

  const handleKey = useCallback((e: KeyboardEvent) => {
    const z = e.ctrlKey || e.metaKey
    if (z && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if (z && e.key.toLowerCase() === 'z' && e.shiftKey) {
      e.preventDefault()
      redo()
    } else if (e.code === 'Space') {
      panning.current = true
    }
  }, [undo, redo])

  useKey(handleKey)
  useEffect(() => {
    const up = () => { panning.current = false }
    window.addEventListener('keyup', up)
    return () => window.removeEventListener('keyup', up)
  }, [])

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const next = Math.min(3, Math.max(0.25, zoom + (-e.deltaY / 1000)))
      setZoom(next)
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (panning.current) {
      const sx = e.clientX
      const sy = e.clientY
      const start = { ...pan }
      const move = (ev: MouseEvent) => {
        const dx = ev.clientX - sx
        const dy = ev.clientY - sy
        setPan({ x: start.x + dx, y: start.y + dy })
      }
      const up = () => {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    } else {
      selectComponent(null)
    }
  }

  const styled = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: '0 0'
  } as React.CSSProperties

  return (
    <div className="h-full w-full flex flex-col">
      <Toolbar zoom={zoom} onReset={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} hover={hoverPreview} setHover={setHoverPreview} />
      <div className="flex-1 bg-[conic-gradient(at_10px_10px,#f3f4f6_90deg,white_0_180deg,#f3f4f6_0_270deg,white_0)] bg-[length:20px_20px] overflow-hidden" onWheel={onWheel} onMouseDown={onMouseDown}>
        <div className="relative min-h-[2000px] min-w-[2000px]" style={styled}>
          {tree.map(node => (
            <NodeBox
              key={node.id}
              node={{ ...node, layout: node.layout || { x: 40, y: 40, w: 320, h: 180 } }}
              selected={selectedComponentId === node.id}
              onSelect={() => selectComponent(node.id)}
              onChangeLayout={layout => setLayout(node.id, layout)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CanvasFree


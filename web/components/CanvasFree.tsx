'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { useEditorState, useEditorActions, ComponentNode } from './store'

type Rect = { x: number; y: number; w: number; h: number }
type Guide = { orientation: 'v' | 'h'; pos: number }

const snapRect = (
  rect: Rect,
  others: Rect[],
  shift: boolean,
  mode: 'move' | 'resize'
): { rect: Rect; guides: Guide[] } => {
  if (shift) return { rect, guides: [] }
  let { x, y, w, h } = rect
  x = Math.round(x / 8) * 8
  y = Math.round(y / 8) * 8
  w = Math.round(w / 8) * 8
  h = Math.round(h / 8) * 8
  const threshold = 6
  let guideX: number | null = null
  let guideY: number | null = null
  let dxLeft: { diff: number; pos: number } | null = null
  let dxRight: { diff: number; pos: number } | null = null
  let dxCenter: { diff: number; pos: number } | null = null
  let dyTop: { diff: number; pos: number } | null = null
  let dyBottom: { diff: number; pos: number } | null = null
  let dyCenter: { diff: number; pos: number } | null = null
  const left = x
  const right = x + w
  const top = y
  const bottom = y + h
  const cx = x + w / 2
  const cy = y + h / 2
  for (const o of others) {
    const oL = o.x
    const oR = o.x + o.w
    const oT = o.y
    const oB = o.y + o.h
    const oCX = o.x + o.w / 2
    const oCY = o.y + o.h / 2
    const candidatesX = [
      { type: 'left', diff: oL - left, pos: oL },
      { type: 'left', diff: oR - left, pos: oR },
      { type: 'right', diff: oL - right, pos: oL },
      { type: 'right', diff: oR - right, pos: oR },
      { type: 'center', diff: oCX - cx, pos: oCX }
    ]
    for (const c of candidatesX) {
      const d = Math.abs(c.diff)
      if (d <= threshold) {
        if (c.type === 'left' && (!dxLeft || d < Math.abs(dxLeft.diff))) dxLeft = { diff: c.diff, pos: c.pos }
        if (c.type === 'right' && (!dxRight || d < Math.abs(dxRight.diff))) dxRight = { diff: c.diff, pos: c.pos }
        if (c.type === 'center' && (!dxCenter || d < Math.abs(dxCenter.diff))) dxCenter = { diff: c.diff, pos: c.pos }
      }
    }
    const candidatesY = [
      { type: 'top', diff: oT - top, pos: oT },
      { type: 'top', diff: oB - top, pos: oB },
      { type: 'bottom', diff: oT - bottom, pos: oT },
      { type: 'bottom', diff: oB - bottom, pos: oB },
      { type: 'center', diff: oCY - cy, pos: oCY }
    ]
    for (const c of candidatesY) {
      const d = Math.abs(c.diff)
      if (d <= threshold) {
        if (c.type === 'top' && (!dyTop || d < Math.abs(dyTop.diff))) dyTop = { diff: c.diff, pos: c.pos }
        if (c.type === 'bottom' && (!dyBottom || d < Math.abs(dyBottom.diff))) dyBottom = { diff: c.diff, pos: c.pos }
        if (c.type === 'center' && (!dyCenter || d < Math.abs(dyCenter.diff))) dyCenter = { diff: c.diff, pos: c.pos }
      }
    }
  }
  if (mode === 'move') {
    const diffX = dxLeft || dxRight || dxCenter
    const diffY = dyTop || dyBottom || dyCenter
    if (diffX) {
      x += diffX.diff
      guideX = diffX.pos
    }
    if (diffY) {
      y += diffY.diff
      guideY = diffY.pos
    }
  } else {
    if (dxLeft && (!dxRight || Math.abs(dxLeft.diff) <= Math.abs(dxRight.diff)) && (!dxCenter || Math.abs(dxLeft.diff) <= Math.abs(dxCenter.diff))) {
      x += dxLeft.diff
      w = right - x
      guideX = dxLeft.pos
    } else if (dxRight && (!dxCenter || Math.abs(dxRight.diff) <= Math.abs(dxCenter.diff))) {
      w += dxRight.diff
      guideX = dxRight.pos
    } else if (dxCenter) {
      x += dxCenter.diff
      guideX = dxCenter.pos
    }
    if (dyTop && (!dyBottom || Math.abs(dyTop.diff) <= Math.abs(dyBottom.diff)) && (!dyCenter || Math.abs(dyTop.diff) <= Math.abs(dyCenter.diff))) {
      y += dyTop.diff
      h = bottom - y
      guideY = dyTop.pos
    } else if (dyBottom && (!dyCenter || Math.abs(dyBottom.diff) <= Math.abs(dyCenter.diff))) {
      h += dyBottom.diff
      guideY = dyBottom.pos
    } else if (dyCenter) {
      y += dyCenter.diff
      guideY = dyCenter.pos
    }
  }
  const guides: Guide[] = []
  if (guideX !== null) guides.push({ orientation: 'v', pos: guideX })
  if (guideY !== null) guides.push({ orientation: 'h', pos: guideY })
  return { rect: { x, y, w, h }, guides }
}

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
  others: Rect[]
  setGuides: (g: Guide[]) => void
}> = ({ node, selected, onSelect, onChangeLayout, others, setGuides }) => {
  const l = node.layout || { x: 40, y: 40, w: 320, h: 180 }
  const Comp: any = node.type
  const [temp, setTemp] = useState<Rect | null>(null)
  const current = temp || l
  return (
    <Rnd
      size={{ width: current.w, height: current.h }}
      position={{ x: current.x, y: current.y }}
      onDrag={(e, d) => {
        const { rect, guides } = snapRect({ x: d.x, y: d.y, w: l.w, h: l.h }, others, e.shiftKey, 'move')
        setTemp(rect)
        setGuides(guides)
      }}
      onDragStop={(e, d) => {
        const { rect } = snapRect(temp || { x: d.x, y: d.y, w: l.w, h: l.h }, others, e.shiftKey, 'move')
        setTemp(null)
        setGuides([])
        onChangeLayout(rect)
      }}
      onResize={(e, __, ref, ___, pos) => {
        const { rect, guides } = snapRect(
          { x: pos.x, y: pos.y, w: ref.offsetWidth, h: ref.offsetHeight },
          others,
          e.shiftKey,
          'resize'
        )
        setTemp(rect)
        setGuides(guides)
      }}
      onResizeStop={(e, __, ref, ___, pos) => {
        const { rect } = snapRect(
          temp || { x: pos.x, y: pos.y, w: ref.offsetWidth, h: ref.offsetHeight },
          others,
          e.shiftKey,
          'resize'
        )
        setTemp(null)
        setGuides([])
        onChangeLayout(rect)
      }}
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
  const {
    selectComponent,
    setLayout,
    undo,
    redo,
    setHoverPreview,
    addComponent,
    deleteComponent,
    duplicateComponent
  } = useEditorActions()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panning = useRef(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState<{ x: number; y: number } | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const treeRef = useRef<ComponentNode[]>(tree)
  useEffect(() => { treeRef.current = tree }, [tree])

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      const z = e.ctrlKey || e.metaKey
      if (selectedComponentId) {
        const step = e.shiftKey ? 10 : 1
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault()
          const find = (nodes: ComponentNode[], id: string): ComponentNode | null => {
            for (const n of nodes) {
              if (n.id === id) return n
              if (n.children) {
                const r = find(n.children, id)
                if (r) return r
              }
            }
            return null
          }
          const node = find(treeRef.current, selectedComponentId)
          if (!node) return
          const l = node.layout || { x: 40, y: 40, w: 320, h: 180 }
          let { x, y } = l
          if (e.key === 'ArrowUp') y -= step
          if (e.key === 'ArrowDown') y += step
          if (e.key === 'ArrowLeft') x -= step
          if (e.key === 'ArrowRight') x += step
          setLayout(selectedComponentId, { ...l, x, y })
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          deleteComponent(selectedComponentId)
        } else if (z && e.key.toLowerCase() === 'd') {
          e.preventDefault()
          const id = selectedComponentId
          duplicateComponent(id)
          setTimeout(() => {
            const prefix = `${id}_copy_`
            const findCopy = (nodes: ComponentNode[]): ComponentNode | null => {
              for (const n of nodes) {
                if (n.id.startsWith(prefix)) return n
                if (n.children) {
                  const r = findCopy(n.children)
                  if (r) return r
                }
              }
              return null
            }
            const newNode = findCopy(treeRef.current)
            if (newNode) {
              const l = newNode.layout || { x: 40, y: 40, w: 320, h: 180 }
              setLayout(newNode.id, { ...l, x: l.x + 10, y: l.y + 10 })
              selectComponent(newNode.id)
            }
          }, 0)
        }
      }
      if (z && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (z && e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      } else if (e.code === 'Space') {
        panning.current = true
      }
    },
    [selectedComponentId, undo, redo, setLayout, deleteComponent, duplicateComponent, selectComponent]
  )

  useKey(handleKey)
  useEffect(() => {
    const up = () => { panning.current = false }
    window.addEventListener('keyup', up)
    return () => window.removeEventListener('keyup', up)
  }, [])

  const clientToCanvas = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const x = (clientX - rect.left - pan.x) / zoom
    const y = (clientY - rect.top - pan.y) / zoom
    return { x, y }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('text/plain')
    if (!type) return
    const pt = clientToCanvas(e.clientX, e.clientY)
    const id = addComponent(type)
    setLayout(id, { x: pt.x, y: pt.y, w: 320, h: 180 })
    setHighlight(pt)
  }

  useEffect(() => {
    if (highlight) {
      const t = setTimeout(() => setHighlight(null), 300)
      return () => clearTimeout(t)
    }
  }, [highlight])

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
      <div
        ref={canvasRef}
        className="flex-1 bg-[conic-gradient(at_10px_10px,#f3f4f6_90deg,white_0_180deg,#f3f4f6_0_270deg,white_0)] bg-[length:20px_20px] overflow-hidden"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="relative min-h-[2000px] min-w-[2000px]" style={styled}>
          {highlight && (
            <div
              className="absolute pointer-events-none bg-blue-200 opacity-50"
              style={{ left: highlight.x, top: highlight.y, width: 320, height: 180 }}
            />
          )}
          {tree.map(node => (
            <NodeBox
              key={node.id}
              node={{ ...node, layout: node.layout || { x: 40, y: 40, w: 320, h: 180 } }}
              selected={selectedComponentId === node.id}
              onSelect={() => selectComponent(node.id)}
              onChangeLayout={layout => setLayout(node.id, layout)}
              others={tree
                .filter(n => n.id !== node.id)
                .map(n => n.layout || { x: 40, y: 40, w: 320, h: 180 })}
              setGuides={setGuides}
            />
          ))}
          {guides.map((g, i) => (
            <div
              key={i}
              className="absolute pointer-events-none bg-pink-400/60"
              style={
                g.orientation === 'v'
                  ? { left: g.pos, top: 0, bottom: 0, width: 1 }
                  : { top: g.pos, left: 0, right: 0, height: 1 }
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CanvasFree


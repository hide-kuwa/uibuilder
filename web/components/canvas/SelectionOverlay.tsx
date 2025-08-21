'use client'
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useEditorState, useEditorActions } from '../store'
import { useNodeBounds } from './useNodeBounds'

const GRID = 8
const snap = (v:number)=> Math.round(v/GRID)*GRID

interface GuideLine { x?:number,y?:number,x1?:number,x2?:number,y1?:number,y2?:number }

type DragState = { dx:number, dy:number }

type ResizeState = { dir:string, startX:number, startY:number, startW:number, startH:number, startLeft:number, startTop:number }

export default function SelectionOverlay() {
  const { selectedComponentId } = useEditorState()
  const { setProp } = useEditorActions() as any
  const { rectFor, siblingRects } = useNodeBounds()
  const rect = selectedComponentId ? rectFor(selectedComponentId) : null
  const overlayRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState|null>(null)
  const [resize, setResize] = useState<ResizeState|null>(null)

  // convert rect/sibling rects to container relative
  const containerRect = overlayRef.current?.getBoundingClientRect()
  const relRect = rect && containerRect ? {
    ...rect,
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    right: rect.right - containerRect.left,
    bottom: rect.bottom - containerRect.top
  } : rect

  const siblings = useMemo(()=>{
    if(!selectedComponentId) return [] as DOMRect[]
    const sibs = siblingRects(selectedComponentId)
    if(containerRect) return sibs.map(r=>({
      left:r.left-containerRect.left,
      top:r.top-containerRect.top,
      right:r.right-containerRect.left,
      bottom:r.bottom-containerRect.top,
      width:r.width,
      height:r.height
    } as DOMRect))
    return sibs
  },[selectedComponentId, siblingRects, containerRect])

  // guides
  const guides = useMemo<GuideLine[]>(() => {
    if (!relRect || !selectedComponentId) return []
    const g:GuideLine[] = []
    const near = (a:number,b:number)=> Math.abs(a-b)<=4
    for (const r of siblings) {
      if (near(relRect.left, r.left)) g.push({x: r.left, y1: Math.min(relRect.top,r.top), y2: Math.max(relRect.bottom,r.bottom)})
      if (near(relRect.right, r.right)) g.push({x: r.right, y1: Math.min(relRect.top,r.top), y2: Math.max(relRect.bottom,r.bottom)})
      if (near(relRect.top, r.top)) g.push({y: r.top, x1: Math.min(relRect.left,r.left), x2: Math.max(relRect.right,r.right)})
      if (near(relRect.bottom, r.bottom)) g.push({y: r.bottom, x1: Math.min(relRect.left,r.left), x2: Math.max(relRect.right,r.right)})
      const cx1=(relRect.left+relRect.right)/2, cx2=(r.left+r.right)/2
      const cy1=(relRect.top+relRect.bottom)/2, cy2=(r.top+r.bottom)/2
      if (near(cx1,cx2)) g.push({x: cx2, y1: Math.min(relRect.top,r.top), y2: Math.max(relRect.bottom,r.bottom)})
      if (near(cy1,cy2)) g.push({y: cy2, x1: Math.min(relRect.left,r.left), x2: Math.max(relRect.right,r.right)})
    }
    return g
  }, [relRect, siblings, selectedComponentId])

  // keyboard move
  useEffect(()=>{
    if(!selectedComponentId || !relRect) return
    const handler = (e:KeyboardEvent) => {
      const map:{[k:string]:[number,number]} = {
        ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]
      }
      if(!(e.key in map)) return
      e.preventDefault()
      const mult = e.shiftKey ? 10 : 1
      const [dx,dy]=map[e.key].map(v=>v*mult) as [number,number]
      const left = snap(relRect.left + dx)
      const top = snap(relRect.top + dy)
      setProp(selectedComponentId, 'style', { ...(rect?.style||{}), position:'absolute', left, top })
    }
    window.addEventListener('keydown', handler)
    return ()=> window.removeEventListener('keydown', handler)
  },[selectedComponentId, relRect, rect, setProp])

  const startDrag = (e:React.MouseEvent) => {
    if(!relRect) return
    e.stopPropagation()
    setDrag({dx: e.clientX - relRect.left - (containerRect?.left||0), dy: e.clientY - relRect.top - (containerRect?.top||0)})
  }

  const startResize = (dir:string)=>(e:React.MouseEvent)=>{
    if(!relRect) return
    e.stopPropagation()
    setResize({
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startW: relRect.width,
      startH: relRect.height,
      startLeft: relRect.left,
      startTop: relRect.top
    })
  }

  const onMouseMove = useCallback((ev:MouseEvent)=>{
    if(drag && selectedComponentId){
      const left = snap(ev.clientX - drag.dx - (containerRect?.left||0))
      const top  = snap(ev.clientY - drag.dy - (containerRect?.top||0))
      setProp(selectedComponentId, 'style', { ...(rect?.style||{}), position:'absolute', left, top })
    } else if(resize && selectedComponentId){
      let {startX,startY,startW,startH,startLeft,startTop,dir}=resize
      let dx = ev.clientX - startX
      let dy = ev.clientY - startY
      let left=startLeft, top=startTop, width=startW, height=startH
      if(dir.includes('e')) width = snap(startW + dx)
      if(dir.includes('s')) height = snap(startH + dy)
      if(dir.includes('w')){ width = snap(startW - dx); left = snap(startLeft + dx) }
      if(dir.includes('n')){ height = snap(startH - dy); top = snap(startTop + dy) }
      setProp(selectedComponentId, 'style', { ...(rect?.style||{}), position:'absolute', left, top, width, height })
    }
  },[drag, resize, selectedComponentId, rect, setProp, containerRect])

  const stopAll = useCallback(()=>{
    setDrag(null); setResize(null)
  },[])

  useEffect(()=>{
    if(drag||resize){
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', stopAll)
      return ()=>{ window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', stopAll) }
    }
  },[drag, resize, onMouseMove, stopAll])

  if (!relRect) return null

  const handlePos = [
    {dir:'nw', style:{left:relRect.left, top:relRect.top}},
    {dir:'n', style:{left:relRect.left+relRect.width/2, top:relRect.top}},
    {dir:'ne', style:{left:relRect.right, top:relRect.top}},
    {dir:'e', style:{left:relRect.right, top:relRect.top+relRect.height/2}},
    {dir:'se', style:{left:relRect.right, top:relRect.bottom}},
    {dir:'s', style:{left:relRect.left+relRect.width/2, top:relRect.bottom}},
    {dir:'sw', style:{left:relRect.left, top:relRect.bottom}},
    {dir:'w', style:{left:relRect.left, top:relRect.top+relRect.height/2}}
  ]

  return (
    <div className="pointer-events-none absolute inset-0 z-20" ref={overlayRef}>
      <div
        className="pointer-events-auto border-2 border-blue-500"
        style={{position:'absolute', left:relRect.left, top:relRect.top, width:relRect.width, height:relRect.height}}
        onMouseDown={startDrag}
      />
      {handlePos.map(h=> (
        <div key={h.dir} className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full pointer-events-auto" style={{left:h.style.left-4, top:h.style.top-4, cursor:h.dir+'-resize'}} onMouseDown={startResize(h.dir)} />
      ))}
      {guides.map((g,i)=> g.x!=null
        ? <div key={i} className="absolute w-px bg-red-500/60" style={{left:g.x, top:g.y1, height:(g.y2!-g.y1!)}}/>
        : <div key={i} className="absolute h-px bg-red-500/60" style={{top:g.y, left:g.x1, width:(g.x2!-g.x1!)}}/>
      )}
    </div>
  )
}

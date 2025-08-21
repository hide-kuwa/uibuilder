'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorState, useEditorActions } from '../store'
import { useRects } from './RectsStore'
import { getSmartSnap, Guide } from './snap'

const GRID = 8
const snap = (v:number)=> Math.round(v/GRID)*GRID

type DragState = { dx:number, dy:number }

type ResizeState = { dir:string, startX:number, startY:number, startW:number, startH:number, startLeft:number, startTop:number }

function findNode(nodes:any[], id:string):any|null{
  for(const n of nodes){
    if(n.id===id) return n
    if(n.children){ const f=findNode(n.children,id); if(f) return f }
  }
  return null
}

export default function SelectionOverlay({setGuides}:{setGuides:(g:Guide[])=>void}) {
  const { selectedComponentId, tree } = useEditorState()
  const { setProp } = useEditorActions() as any
  const { rects } = useRects()
  const rect = selectedComponentId ? rects[selectedComponentId] : null
  const node = selectedComponentId ? findNode(tree, selectedComponentId) : null
  const siblings = selectedComponentId ? Object.entries(rects).filter(([id])=>id!==selectedComponentId).map(([,r])=>r) : []
  const overlayRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState|null>(null)
  const [resize, setResize] = useState<ResizeState|null>(null)
  const style = node?.props?.style || {}

  const containerRect = overlayRef.current?.getBoundingClientRect()

  // keyboard move
  useEffect(()=>{
    if(!selectedComponentId || !rect) return
    const handler = (e:KeyboardEvent) => {
      const map:{[k:string]:[number,number]} = {
        ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]
      }
      if(!(e.key in map)) return
      e.preventDefault()
      const mult = e.shiftKey ? 10 : 1
      const [dx,dy]=map[e.key].map(v=>v*mult) as [number,number]
      const left = snap((rect.x||0) + dx)
      const top = snap((rect.y||0) + dy)
      setProp(selectedComponentId, 'style', { ...style, position:'absolute', left, top })
    }
    window.addEventListener('keydown', handler)
    return ()=> window.removeEventListener('keydown', handler)
  },[selectedComponentId, rect, style, setProp])

  const startDrag = (e:React.MouseEvent) => {
    if(!rect) return
    e.stopPropagation()
    setDrag({dx: e.clientX - rect.x - (containerRect?.left||0), dy: e.clientY - rect.y - (containerRect?.top||0)})
  }

  const startResize = (dir:string)=>(e:React.MouseEvent)=>{
    if(!rect) return
    e.stopPropagation()
    setResize({
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.w,
      startH: rect.h,
      startLeft: rect.x,
      startTop: rect.y
    })
  }

  const onMouseMove = useCallback((ev:MouseEvent)=>{
    if(drag && selectedComponentId && rect){
      let left = ev.clientX - drag.dx - (containerRect?.left||0)
      let top  = ev.clientY - drag.dy - (containerRect?.top||0)
      const {dx,dy,guides} = getSmartSnap({x:left,y:top,w:rect.w,h:rect.h}, siblings)
      left += dx; top += dy
      setGuides(guides)
      setProp(selectedComponentId, 'style', { ...style, position:'absolute', left, top })
    } else if(resize && selectedComponentId){
      let {startX,startY,startW,startH,startLeft,startTop,dir}=resize
      let dx = ev.clientX - startX
      let dy = ev.clientY - startY
      let left=startLeft, top=startTop, width=startW, height=startH
      if(dir.includes('e')) width = snap(startW + dx)
      if(dir.includes('s')) height = snap(startH + dy)
      if(dir.includes('w')){ width = snap(startW - dx); left = snap(startLeft + dx) }
      if(dir.includes('n')){ height = snap(startH - dy); top = snap(startTop + dy) }
      setProp(selectedComponentId, 'style', { ...style, position:'absolute', left, top, width, height })
    }
  },[drag, resize, selectedComponentId, rect, setProp, containerRect, siblings, setGuides, style])

  const stopAll = useCallback(()=>{
    setDrag(null); setResize(null); setGuides([])
  },[setGuides])

  useEffect(()=>{
    if(drag||resize){
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', stopAll)
      return ()=>{ window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', stopAll) }
    }
  },[drag, resize, onMouseMove, stopAll])

  if (!rect) return null

  const handlePos = [
    {dir:'nw', style:{left:rect.x, top:rect.y}},
    {dir:'n', style:{left:rect.x+rect.w/2, top:rect.y}},
    {dir:'ne', style:{left:rect.x+rect.w, top:rect.y}},
    {dir:'e', style:{left:rect.x+rect.w, top:rect.y+rect.h/2}},
    {dir:'se', style:{left:rect.x+rect.w, top:rect.y+rect.h}},
    {dir:'s', style:{left:rect.x+rect.w/2, top:rect.y+rect.h}},
    {dir:'sw', style:{left:rect.x, top:rect.y+rect.h}},
    {dir:'w', style:{left:rect.x, top:rect.y+rect.h/2}}
  ]

  return (
    <div className="pointer-events-none absolute inset-0 z-20" ref={overlayRef}>
      <div
        className="pointer-events-auto border-2 border-blue-500"
        style={{position:'absolute', left:rect.x, top:rect.y, width:rect.w, height:rect.h}}
        onMouseDown={startDrag}
      />
      {handlePos.map(h=> (
        <div key={h.dir} className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full pointer-events-auto" style={{left:h.style.left-4, top:h.style.top-4, cursor:h.dir+'-resize'}} onMouseDown={startResize(h.dir)} />
      ))}
    </div>
  )
}

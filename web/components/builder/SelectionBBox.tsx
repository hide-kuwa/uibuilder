'use client'
import * as React from 'react'
import { useViewStore } from '@/store/viewStore'
import { useBuilderStore, type Elm } from '@/store/builderStore'
import { collectSnapPoints, snapRect } from '@/lib/builder/snap'

 type Handle = 'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw'

 const minW = 8, minH = 8

 function bboxOf(els: Elm[]) {
   const xs = els.map(e=>e.x), ys = els.map(e=>e.y)
   const xe = els.map(e=>e.x+e.w), ye = els.map(e=>e.y+e.h)
   const x = Math.min(...xs), y = Math.min(...ys)
   const w = Math.max(...xe) - x, h = Math.max(...ye) - y
   return { x,y,w,h }
 }

 export default function SelectionBBox() {
   const els = useBuilderStore(s=>s.elements)
   const selected = useBuilderStore(s => s.selectedIds)
   const updateMany = useBuilderStore(s=>s.updateMany)
   const beginBatch = useBuilderStore(s=>s.beginBatch)
   const endBatch = useBuilderStore(s=>s.endBatch)
   const { worldToScreen, screenToWorld } = useViewStore(s => ({ worldToScreen: s.worldToScreen, screenToWorld: s.screenToWorld, zoom: s.zoom, pan: s.pan }))

   const activeEls = React.useMemo(()=> els.filter(e => selected.includes(e.id) && (e.visible ?? true) && !e.locked), [els, selected])
   if (activeEls.length < 2) return null

   const others = React.useMemo(()=> els.filter(e => !selected.includes(e.id) && (e.visible ?? true)), [els, selected])
   const points = React.useMemo(()=> collectSnapPoints(others, null), [others])

   const box = bboxOf(activeEls)
   const s0 = worldToScreen({x:box.x, y:box.y})
   const s1 = worldToScreen({x:box.x+box.w, y:box.y+box.h})
   const style: React.CSSProperties = {
     position:'absolute',
     left: `${s0.x}px`, top: `${s0.y}px`,
     width: `${s1.x - s0.x}px`, height:`${s1.y - s0.y}px`,
     pointerEvents:'none',
   }

   const startRef = React.useRef<{
     kind: 'move'|'resize'
     handle?: Handle
     startWorld: { x:number, y:number }
     box0: { x:number, y:number, w:number, h:number }
     els0: Elm[]
     shift: boolean
     alt: boolean
   }|null>(null)

   const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
     e.stopPropagation()
     e.preventDefault()
     const target = (e.target as HTMLElement).dataset.handle as Handle | undefined
     const root = (e.currentTarget as HTMLElement).closest('[data-canvas-root]') as HTMLElement
     const rect = root.getBoundingClientRect()
     const p = screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top })
     startRef.current = {
       kind: target ? 'resize' : 'move',
       handle: target,
       startWorld: p,
       box0: box,
       els0: activeEls.map(a=>({ ...a })),
       shift: e.shiftKey,
       alt: e.altKey || e.metaKey,
     }
     ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
     beginBatch()
   }

   const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
     const st = startRef.current; if (!st) return
     const root = (e.currentTarget as HTMLElement).closest('[data-canvas-root]') as HTMLElement
     const rect = root.getBoundingClientRect()
     const p = screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top })
     let dx = p.x - st.startWorld.x
     let dy = p.y - st.startWorld.y

     if (st.kind === 'move') {
       const moved = { x: st.box0.x + dx, y: st.box0.y + dy, w: st.box0.w, h: st.box0.h }
       const { rect: snapped } = snapRect(moved, points, { mode:'move' })
       const sx = snapped.x - st.box0.x
       const sy = snapped.y - st.box0.y
       const patches = st.els0.map(el => ({ id: el.id, x: el.x + sx, y: el.y + sy }))
       updateMany(patches, false)
       return
     }

     let n = { ...st.box0 }
     const fromCenter = st.alt
     const uniform = st.shift
     const H = st.handle!
     if (H.includes('e')) n.w = Math.max(minW, st.box0.w + dx)
     if (H.includes('s')) n.h = Math.max(minH, st.box0.h + dy)
     if (H.includes('w')) { n.w = Math.max(minW, st.box0.w - dx); n.x = st.box0.x + (st.box0.w - n.w) }
     if (H.includes('n')) { n.h = Math.max(minH, st.box0.h - dy); n.y = st.box0.y + (st.box0.h - n.h) }

     if (uniform) {
       const ar = st.box0.w / Math.max(1e-6, st.box0.h)
       if (H==='e'||H==='w') n.h = n.w / ar
       else if (H==='n'||H==='s') n.w = n.h * ar
       else {
         const dw = n.w - st.box0.w
         const dh = n.h - st.box0.h
         if (Math.abs(dw) > Math.abs(dh)) n.h = n.w / ar
         else n.w = n.h * ar
         if (H==='nw'||H==='sw') n.x = st.box0.x + (st.box0.w - n.w)
         if (H==='nw'||H==='ne') n.y = st.box0.y + (st.box0.h - n.h)
       }
     }

     if (fromCenter) {
       n.x = st.box0.x + (st.box0.w - n.w)/2
       n.y = st.box0.y + (st.box0.h - n.h)/2
     }

     const { rect: snapped } = snapRect(n, points, { mode:'resize' })
     n = snapped

     const sx = n.w / st.box0.w
     const sy = n.h / st.box0.h

     const patches = st.els0.map(el => {
       const ox = el.x - st.box0.x
       const oy = el.y - st.box0.y
       const nx = n.x + ox * sx
       const ny = n.y + oy * sy
       const nw = Math.max(minW, el.w * sx)
       const nh = Math.max(minH, el.h * sy)
       return { id: el.id, x: Math.round(nx), y: Math.round(ny), w: Math.round(nw), h: Math.round(nh) }
     })
     updateMany(patches, false)
   }

   const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
     if (!startRef.current) return
     ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
     startRef.current = null
     endBatch()
   }

   return (
     <div className="absolute inset-0 pointer-events-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
       <div className="absolute border border-amber-300/80 rounded-sm" style={style}>
         {(['nw','n','ne','e','se','s','sw','w'] as Handle[]).map(h => {
           const base = 'absolute w-2 h-2 bg-amber-300 border border-black rounded-sm pointer-events-auto'
           const pos: Record<Handle,string> = {
             n:'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
             ne:'top-0 right-0 translate-x-1/2 -translate-y-1/2',
             e:'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
             se:'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
             s:'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
             sw:'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
             w:'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
             nw:'top-0 left-0 -translate-x-1/2 -translate-y-1/2'
           }
           const cursor: Record<Handle,string> = { n:'ns-resize', ne:'nesw-resize', e:'ew-resize', se:'nwse-resize', s:'ns-resize', sw:'nesw-resize', w:'ew-resize', nw:'nwse-resize' }
           return <div key={h} data-handle={h} className={`${base} ${pos[h]}`} style={{ cursor: cursor[h] }} />
         })}
       </div>
     </div>
   )
 }

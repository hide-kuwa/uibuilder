'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useEditorState, useEditorActions, ComponentNode } from './store'
import { registry } from '../lib/registry'
import SelectionOverlay from './canvas/SelectionOverlay'
import Viewport from './canvas/Viewport'
import HUDContainer from './hud/HUDContainer'
import { ViewportProvider } from './canvas/ViewportStore'
import GridOverlay from './canvas/GridOverlay'
import { Rulers } from './Rulers'
import { RectsProvider, useRects } from './canvas/RectsStore'
import SmartGuidesOverlay from './canvas/SmartGuidesOverlay'
import { GuidesOverlay } from './overlays/GuidesOverlay'
import type { Guide } from './canvas/snap'
import { OutlineOverlay } from './overlays/OutlineOverlay'

function NodeRenderer({ node }: { node: ComponentNode }) {
  const { selectComponent } = useEditorActions()
  const { setRect } = useRects()
  const ref = useRef<HTMLDivElement>(null)
  const Comp = (registry as any)[node.type] || ((p:any)=><div {...p}>{p.children}</div>)
  const style = node.props?.style || {}

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = el.closest('[data-canvas-root]') as HTMLElement | null
    const r = el.getBoundingClientRect()
    const base = root?.getBoundingClientRect()
    const x = base ? r.left - base.left : r.left
    const y = base ? r.top - base.top : r.top
    setRect(node.id, { x, y, w: r.width, h: r.height })
  })

  return (
    <div
      ref={ref}
      data-node-id={node.id}
      data-node-type={node.type}
      data-node-name={node.props?.name}
      style={{ position: 'absolute', ...style }}
      onMouseDown={e => { e.stopPropagation(); selectComponent(node.id) }}
    >
      <Comp {...node.props}>
        {node.children?.map(child => (
          <NodeRenderer key={child.id} node={child} />
        ))}
      </Comp>
    </div>
  )
}

export default function Canvas() {
  const { tree } = useEditorState()
  const [guides, setGuides] = useState<Guide[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)
  return (
    <ViewportProvider>
      <RectsProvider>
        <div className="relative h-full w-full">
          <Viewport>
            <div ref={canvasRef} data-canvas-root className="relative w-[2000px] h-[2000px]">
              {tree.map(n => (
                <NodeRenderer key={n.id} node={n} />
              ))}
              <SelectionOverlay setGuides={setGuides} />
              <OutlineOverlay canvasRef={canvasRef} />
            </div>
          </Viewport>
          <GridOverlay />
          <Rulers width={2000} height={2000} />
          <HUDContainer />
          <SmartGuidesOverlay guides={guides} />
          <GuidesOverlay width={2000} height={2000} />
        </div>
      </RectsProvider>
    </ViewportProvider>
  )
}

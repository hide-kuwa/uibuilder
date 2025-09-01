'use client'
import React, { useRef, useState } from 'react'
import { useEditorState, ComponentNode } from './store'
import SelectionOverlay from './canvas/SelectionOverlay'
import Viewport from './canvas/Viewport'
import HUDContainer from './hud/HUDContainer'
import { ViewportProvider, useViewport } from './canvas/ViewportStore'
import { GridOverlay } from '@/components/overlays/GridOverlay'
import { Rulers } from './Rulers'
import { RectsProvider } from './canvas/RectsStore'
import SmartGuidesOverlay from './canvas/SmartGuidesOverlay'
import { GuidesOverlay } from './overlays/GuidesOverlay'
import type { Guide } from './canvas/snap'
import { OutlineOverlay } from './overlays/OutlineOverlay'
import { GridToolbar } from '@/components/GridToolbar'
import { CanvasRoot } from '@/components/CanvasRoot'
import { NodeRenderer } from '@/components/NodeRenderer'
import { useUIStore } from '@/store/uiStore'

export default function Canvas() {
  const { tree } = useEditorState()
  const [guides, setGuides] = useState<Guide[]>([])
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <ViewportProvider>
      <RectsProvider>
        <CanvasInner tree={tree} guides={guides} setGuides={setGuides} canvasRef={canvasRef} />
      </RectsProvider>
    </ViewportProvider>
  )
}

function CanvasInner({
  tree,
  guides,
  setGuides,
  canvasRef,
}: {
  tree: ComponentNode[]
  guides: Guide[]
  setGuides: (g: Guide[]) => void
  canvasRef: React.RefObject<HTMLDivElement>
}) {
  const { vp } = useViewport()
  const showRulers = useUIStore((s) => s.showRulers)
  return (
    <CanvasRoot>
      <Viewport>
        <div ref={canvasRef} data-canvas-root className="relative w-[2000px] h-[2000px]">
          {tree.map((n) => (
            <NodeRenderer key={n.id} node={n} />
          ))}
          <SelectionOverlay setGuides={setGuides} />
          <OutlineOverlay canvasRef={canvasRef} />
        </div>
      </Viewport>
      <GridOverlay
        width={2000}
        height={2000}
        zoom={vp.zoom}
        worldToScreenOffset={(wx, wy) => ({ sx: wx * vp.zoom + vp.x, sy: wy * vp.zoom + vp.y })}
      />
      {showRulers && <Rulers width={2000} height={2000} canvasRef={canvasRef} />}
      <HUDContainer />
      <SmartGuidesOverlay guides={guides} />
      <GuidesOverlay width={2000} height={2000} canvasRef={canvasRef} />
      <div className="absolute top-2 left-2 z-50">
        <GridToolbar />
      </div>
    </CanvasRoot>
  )
}

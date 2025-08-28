'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useEditorState, useEditorActions, ComponentNode } from './store'
import { registry } from '../lib/registry'
import { buildCombinedCss } from '@/lib/interactionCss'
import type { Effect } from '@/types/interactions'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import SelectionOverlay from './canvas/SelectionOverlay'
import Viewport from './canvas/Viewport'
import HUDContainer from './hud/HUDContainer'
import { ViewportProvider, useViewport } from './canvas/ViewportStore'
import { GridOverlay } from '@/components/overlays/GridOverlay'
import { Rulers } from './Rulers'
import { RectsProvider, useRects } from './canvas/RectsStore'
import SmartGuidesOverlay from './canvas/SmartGuidesOverlay'
import { GuidesOverlay } from './overlays/GuidesOverlay'
import type { Guide } from './canvas/snap'
import { OutlineOverlay } from './overlays/OutlineOverlay'
import { GridToolbar } from '@/components/GridToolbar'

function NodeRenderer({ node }: { node: ComponentNode }) {
  const { selectComponent } = useEditorActions()
  const { setRect } = useRects()
  const ref = useRef<HTMLDivElement>(null)
  const Comp = (registry as any)[node.type] || ((p: any) => <div {...p}>{p.children}</div>)
  const style = node.props?.style || {}

  const { presets } = useInteractionRegistry()
  const presetIds: string[] = (node.props?.presetIds || (node.props?.presetId ? [node.props.presetId] : [])) as string[]
  const chosen = presets.filter(p => presetIds.includes(p.id))
  const inlineHover = node.props?.hoverEffects as Effect[] | undefined
  const inlineMs = node.props?.hoverTransitionMs as number | undefined
  const css = buildCombinedCss(node.id, chosen, inlineHover, inlineMs)

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
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
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
  return (
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
      <GridOverlay
        width={2000}
        height={2000}
        zoom={vp.zoom}
        worldToScreenOffset={(wx, wy) => ({ sx: wx * vp.zoom + vp.x, sy: wy * vp.zoom + vp.y })}
      />
      <Rulers width={2000} height={2000} canvasRef={canvasRef} />
      <HUDContainer />
      <SmartGuidesOverlay guides={guides} />
      <GuidesOverlay width={2000} height={2000} canvasRef={canvasRef} />
      <div className="absolute top-2 left-2 z-50">
        <GridToolbar />
      </div>
    </div>
  )
}

'use client'
import React from 'react'
import { useEditorState, useEditorActions, ComponentNode } from './store'
import { registry } from '../lib/registry'
import SelectionOverlay from './canvas/SelectionOverlay'
import Viewport from './canvas/Viewport'
import HUDContainer from './hud/HUDContainer'
import { ViewportProvider } from './canvas/ViewportStore'
import GridOverlay from './canvas/GridOverlay'
import Rulers from './canvas/Rulers'

function NodeRenderer({ node }: { node: ComponentNode }) {
  const { selectComponent } = useEditorActions()
  const Comp = (registry as any)[node.type] || ((p:any)=><div {...p}>{p.children}</div>)
  const style = node.props?.style || {}
  return (
    <div
      data-node-id={node.id}
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
  return (
    <ViewportProvider>
      <div className="relative h-full w-full">
        <Viewport>
          <div className="relative w-[2000px] h-[2000px]">
            {tree.map(n => (
              <NodeRenderer key={n.id} node={n} />
            ))}
            <SelectionOverlay />
          </div>
        </Viewport>
        <GridOverlay />
        <Rulers />
        <HUDContainer />
      </div>
    </ViewportProvider>
  )
}

'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editorStore'
import { registry } from '@/lib/registry'
import PresetStyle from '@/components/interaction/PresetStyle'

export function Canvas() {
  const tree = useEditorStore((s) => s.tree)

  const render = (node: any): React.ReactNode => {
    const Comp = (registry as any)[node.type] || ((p: any) => <div {...p}>{p.children}</div>)
    const style = node.props?.style || {}

    return (
      <div
        key={node.id}
        data-node-id={node.id}
        data-node-type={node.type}
        data-node-name={node.props?.name}
        style={{ position: 'absolute', ...style }}
      >
        <Comp {...node.props}>
          {node.children?.map((c: any) => render(c))}
        </Comp>
        {/* ここでプリセットCSSを必ず注入 */}
        <PresetStyle nodeId={node.id} />
      </div>
    )
  }

  return <div data-canvas-root>{tree.map(render)}</div>
}

export default Canvas


'use client';
import type { InstanceNode, ComponentNode } from '@/types/editor'
import { useEditorStore } from '@/store/editorStore'
import { resolveInstance } from '@/lib/override/resolve'

interface InstanceViewProps {
  node: InstanceNode;
  components?: Record<string, any>;
  render?: (node: ComponentNode, components: Record<string, any>) => React.ReactNode;
}

function defaultRender(node: ComponentNode, components: Record<string, any>): JSX.Element | null {
  if ((node as any).hidden) return null
  const style: React.CSSProperties = {
    position: 'absolute',
    left: node.props?.x || 0,
    top: node.props?.y || 0,
    width: node.props?.w || 0,
    height: node.props?.h || 0,
    transform: `rotate(${node.props?.rotation || 0}deg)`
  }
  if (node.props?.visible === false) style.display = 'none'
  return (
    <div key={node.id} style={style} className={node.props?.className}>
      {node.props?.text}
      {node.children?.map((c) => defaultRender(c, components))}
    </div>
  )
}

export default function InstanceView({ node, components, render }: InstanceViewProps) {
  const state = useEditorStore.getState()
  const resolved = resolveInstance(state as any, node)
  if (!resolved) return null
  const compMap = components || state.components
  const renderer = render || defaultRender
  return <>{renderer(resolved, compMap)}</>
}

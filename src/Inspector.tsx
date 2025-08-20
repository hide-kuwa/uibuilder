import React from 'react'
import AutoPropsEditor from './AutoPropsEditor'
import { useEditorState, useEditorActions, ComponentNode } from './store'

function findNode(nodes: ComponentNode[], id: string | null): ComponentNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const r = findNode(n.children, id)
      if (r) return r
    }
  }
  return null
}

const Inspector: React.FC = () => {
  const { tree, selectedComponentId } = useEditorState()
  const { setProp } = useEditorActions()
  const node = findNode(tree, selectedComponentId)
  if (!node) return <div className="p-2 text-sm text-gray-500">No component selected</div>
  return (
    <AutoPropsEditor
      selectedComponentType={node.type}
      selectedProps={node.props || {}}
      onChange={(next) => {
        for (const k of Object.keys(next)) setProp(node.id, k, next[k])
      }}
    />
  )
}

export default Inspector

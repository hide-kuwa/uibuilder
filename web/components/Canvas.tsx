"use client"
import { NodeIR } from '../lib/types'
import { registry } from '../lib/registry'
import { useStore } from '../lib/store'

function Renderer({ node }: { node: NodeIR }) {
  const { selectedId, select } = useStore()
  const Comp = registry[node.type] || ((p: any) => <div {...p}>{p.children}</div>)
  return (
    <div className={node.id === selectedId ? 'outline outline-blue-500' : ''} onClick={e => { e.stopPropagation(); select(node.id) }}>
      <Comp {...node.props}>
        {node.children.map(child => (
          <Renderer key={child.id} node={child} />
        ))}
      </Comp>
    </div>
  )
}

export default function Canvas() {
  const tree = useStore(s => s.tree)
  return <div className="p-4"><Renderer node={tree} /></div>
}

"use client"
import { useStore } from '../lib/store'
import { NodeIR } from '../lib/types'

function find(node: NodeIR, id: string): NodeIR | null {
  if (node.id === id) return node
  for (const c of node.children) {
    const r = find(c, id)
    if (r) return r
  }
  return null
}

export default function Inspector() {
  const { tree, selectedId, setProps, setClassName, publish } = useStore()
  const node = selectedId ? find(tree, selectedId) : null
  if (!node) return <div className="p-2">選択なし</div>
  return (
    <div className="p-2 space-y-2">
      {'text' in node.props && (
        <input className="border w-full" value={node.props.text || ''} onChange={e => setProps(node.id, { text: e.target.value })} />
      )}
      {'level' in node.props && (
        <input className="border w-full" type="number" value={node.props.level || 1} onChange={e => setProps(node.id, { level: parseInt(e.target.value) })} />
      )}
      <input className="border w-full" value={node.props.className || ''} onChange={e => setClassName(node.id, e.target.value)} placeholder="className" />
      <button className="bg-blue-600 text-white px-2 py-1" onClick={() => publish('1')}>Publish</button>
    </div>
  )
}

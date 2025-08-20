import { create } from 'zustand'
import { NodeIR } from './types'

const initial: NodeIR = { id: 'root', type: 'Section', props: { className: '' }, children: [] }

type State = {
  tree: NodeIR
  selectedId: string | null
  select: (id: string | null) => void
  setProps: (id: string, props: Record<string, any>) => void
  setClassName: (id: string, className: string) => void
  append: (type: string, props?: Record<string, any>) => void
  publish: (pageId: string) => Promise<void>
}

function update(node: NodeIR, id: string, fn: (n: NodeIR) => NodeIR): NodeIR {
  if (node.id === id) return fn(node)
  return { ...node, children: node.children.map(c => update(c, id, fn)) }
}

export const useStore = create<State>((set, get) => ({
  tree: initial,
  selectedId: null,
  select: id => set({ selectedId: id }),
  setProps: (id, props) => set({ tree: update(get().tree, id, n => ({ ...n, props: { ...n.props, ...props } })) }),
  setClassName: (id, className) => get().setProps(id, { className }),
  append: (type, props = {}) => {
    const node: NodeIR = { id: crypto.randomUUID(), type, props, children: [] }
    set(state => ({ tree: { ...state.tree, children: [...state.tree.children, node] }, selectedId: node.id }))
  },
  publish: async pageId => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000'
    const res = await fetch(`${base}/api/pages/${pageId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(get().tree)
    })
    if (res.ok) {
      const data = await res.json()
      console.log(data.version_id)
    }
  }
}))

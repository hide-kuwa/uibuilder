const newId = () => `node_${Math.random().toString(36).slice(2, 10)}`

export type NodeModel = {
  id: string
  type: string
  name?: string
  props?: Record<string, any>
  children: NodeModel[]
  meta?: { slot?: string; createdAt?: number }
}

export function createNodeFromDef(def: any, opts: { slotKey?: string } = {}): NodeModel {
  const typeId = typeof def?.id === 'string' && def.id ? def.id : 'Unknown'
  const name = typeof def?.name === 'string' ? def.name : undefined
  const defaultProps = def?.defaultProps && typeof def.defaultProps === 'object' ? def.defaultProps : {}
  return {
    id: newId(),
    type: typeId,
    name,
    props: { ...defaultProps },
    children: [],
    meta: {
      slot: opts.slotKey,
      createdAt: Date.now(),
    },
  }
}
